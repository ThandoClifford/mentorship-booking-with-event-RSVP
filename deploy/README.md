# Deploy Scripts

## Requirements on server
- /var/www/ump/shared/.env exists
- /var/www/ump/shared/storage exists and writable
- git, composer, php installed
- current symlink points to a release
- queue worker managed by supervisor/systemd

## Deploy
REPO_URL="git@github.com:ORG/REPO.git" BRANCH=main ./deploy.sh deploy

## Rollback
./deploy.sh rollback

## Notes
- Script uses a lock file to prevent concurrent deploys.
- Keeps last 5 releases by default.
- Runs `php artisan deploy:check` before switching.

## CI/CD (GitHub Actions)
Workflow file: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)

Required GitHub secrets:
- SSH_PRIVATE_KEY
- SERVER_HOST
- SERVER_USER
- REPO_SSH_URL

## Ops Templates
- Logrotate template: [logrotate/ump](logrotate/ump)
- Additional hardening notes: [HARDENING.md](HARDENING.md)
