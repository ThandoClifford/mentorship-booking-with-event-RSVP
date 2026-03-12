#!/usr/bin/env bash
set -euo pipefail

# UMP Mentorship Portal - Zero-downtime deploy script
# Safe defaults:
# - lock file prevents concurrent deploys
# - keeps N previous releases
# - runs deploy:check before switching symlink
# - supports rollback

APP_NAME="ump"
BASE_DIR="/var/www/ump"
RELEASES_DIR="${BASE_DIR}/releases"
SHARED_DIR="${BASE_DIR}/shared"
CURRENT_LINK="${BASE_DIR}/current"
KEEP_RELEASES=5

# Repo source: use either a git URL or rsync from CI artifact
# For git deploys:
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"

# Release name
RELEASE_NAME="${RELEASE_NAME:-$(date +%Y-%m-%d-%H%M%S)}"
RELEASE_DIR="${RELEASES_DIR}/${RELEASE_NAME}"

LOCK_FILE="${BASE_DIR}/.deploy.lock"

log() { echo "[$(date +%F\ %T)] $*"; }

die() { echo "ERROR: $*" >&2; exit 1; }

acquire_lock() {
  if [[ -f "$LOCK_FILE" ]]; then
    die "Deploy lock exists at $LOCK_FILE. Another deploy may be running."
  fi
  echo "$$" > "$LOCK_FILE"
  trap 'rm -f "$LOCK_FILE"' EXIT
}

ensure_dirs() {
  [[ -d "$RELEASES_DIR" ]] || die "Missing releases dir: $RELEASES_DIR"
  [[ -d "$SHARED_DIR" ]] || die "Missing shared dir: $SHARED_DIR"
  [[ -f "${SHARED_DIR}/.env" ]] || die "Missing ${SHARED_DIR}/.env"
  [[ -d "${SHARED_DIR}/storage" ]] || die "Missing ${SHARED_DIR}/storage"
}

clone_repo() {
  [[ -n "$REPO_URL" ]] || die "REPO_URL env var is required (git URL)."
  log "Cloning repo into ${RELEASE_DIR}..."
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$RELEASE_DIR"
}

link_shared() {
  log "Linking shared .env and storage..."
  ln -sfn "${SHARED_DIR}/.env" "${RELEASE_DIR}/.env"
  rm -rf "${RELEASE_DIR}/storage"
  ln -sfn "${SHARED_DIR}/storage" "${RELEASE_DIR}/storage"
}

install_deps() {
  log "Installing composer dependencies..."
  (cd "$RELEASE_DIR" && composer install --no-dev --optimize-autoloader --no-interaction)
}

artisan_prep() {
  log "Clearing caches..."
  (cd "$RELEASE_DIR" && php artisan optimize:clear)

  log "Running deploy readiness check..."
  (cd "$RELEASE_DIR" && php artisan deploy:check)

  log "Running migrations..."
  (cd "$RELEASE_DIR" && php artisan migrate --force)

  log "Caching config/routes/events..."
  (cd "$RELEASE_DIR" && php artisan config:cache)
  (cd "$RELEASE_DIR" && php artisan route:cache)
  (cd "$RELEASE_DIR" && php artisan event:cache)

  log "Optimizing..."
  (cd "$RELEASE_DIR" && php artisan optimize)
}

switch_symlink() {
  log "Switching current symlink -> ${RELEASE_DIR}"
  ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
}

post_switch() {
  log "Restarting queue workers..."
  (cd "$CURRENT_LINK" && php artisan queue:restart) || true

  log "Warming up health endpoints..."
  # Optional: curl can be installed; ignore failure
  command -v curl >/dev/null 2>&1 && curl -fsS "http://127.0.0.1/api/v1/health" >/dev/null || true
}

cleanup_old_releases() {
  log "Cleaning up old releases (keep ${KEEP_RELEASES})..."
  mapfile -t releases < <(ls -1dt "${RELEASES_DIR}"/* 2>/dev/null || true)
  if (( ${#releases[@]} > KEEP_RELEASES )); then
    for ((i=KEEP_RELEASES; i<${#releases[@]}; i++)); do
      log "Removing ${releases[$i]}"
      rm -rf "${releases[$i]}"
    done
  fi
}

deploy() {
  acquire_lock
  ensure_dirs
  clone_repo
  link_shared
  install_deps
  artisan_prep
  switch_symlink
  post_switch
  cleanup_old_releases
  log "Deploy completed: ${RELEASE_NAME}"
}

rollback() {
  acquire_lock
  ensure_dirs

  mapfile -t releases < <(ls -1dt "${RELEASES_DIR}"/* 2>/dev/null || true)
  [[ ${#releases[@]} -ge 2 ]] || die "Not enough releases to rollback."

  local current="${releases[0]}"
  local previous="${releases[1]}"

  log "Rolling back from ${current} to ${previous}..."
  ln -sfn "$previous" "$CURRENT_LINK"

  log "Restarting queue workers after rollback..."
  (cd "$CURRENT_LINK" && php artisan queue:restart) || true

  log "Rollback complete."
}

case "${1:-deploy}" in
  deploy) deploy ;;
  rollback) rollback ;;
  *)
    echo "Usage: $0 [deploy|rollback]"
    exit 2
    ;;
esac
