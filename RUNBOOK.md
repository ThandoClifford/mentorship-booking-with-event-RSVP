# UMP Mentorship Portal - Production Runbook (VPS + Redis + Supervisor)

## 1) Server Setup (Ubuntu)
### Install stack
```bash
sudo apt update && sudo apt upgrade -y

sudo apt install nginx mysql-server redis-server \
php8.2 php8.2-fpm php8.2-cli php8.2-mysql php8.2-redis \
php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip \
php8.2-bcmath unzip git supervisor -y
```

### Enable services
```bash
sudo systemctl enable nginx
sudo systemctl enable redis-server
sudo systemctl enable supervisor
```

## 2) Project Structure (Zero-Downtime Layout)
```text
/var/www/ump
    ├── releases/
    │     ├── 2026-03-01-001/
    │     ├── 2026-03-02-002/
    ├── current -> symlink to latest release
    ├── shared/
    │     ├── .env
    │     ├── storage/
```

### Create layout
```bash
sudo mkdir -p /var/www/ump/{releases,shared/storage}
sudo chown -R www-data:www-data /var/www/ump
```

## 3) Production Environment File
Create `/var/www/ump/shared/.env` from [deploy/env/.env.production.example](deploy/env/.env.production.example).

Generate APP key:
```bash
php artisan key:generate --show
```

## 4) Nginx
Use [deploy/nginx/ump.conf](deploy/nginx/ump.conf) as `/etc/nginx/sites-available/ump`.

### Enable site
```bash
sudo ln -s /etc/nginx/sites-available/ump /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5) Supervisor (Queue Worker)
Use [deploy/supervisor/ump-queue.conf](deploy/supervisor/ump-queue.conf) as `/etc/supervisor/conf.d/ump-queue.conf`.

### Reload
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ump-queue:*
```

## 6) Scheduler (Cron)
Install cron entry from [deploy/cron/ump-scheduler.cron](deploy/cron/ump-scheduler.cron):
```bash
sudo crontab -e
```

## 7) Deployment Procedure (Zero Drama)
```bash
cd /var/www/ump/releases
git clone your-repo 2026-03-03-003
cd 2026-03-03-003

composer install --no-dev --optimize-autoloader
ln -s /var/www/ump/shared/.env .env
ln -s /var/www/ump/shared/storage storage

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan optimize

sudo ln -sfn /var/www/ump/releases/2026-03-03-003 /var/www/ump/current

php artisan queue:restart
```

### Verify
- `GET /api/v1/health`
- `GET /api/v1/admin/ops`
- `GET /api/v1/admin/ops/alerts`

## 8) Backup Storage (Production)
- `config/filesystems.php` includes `s3-backups` disk.
- `config/backup.php` uses `BACKUP_DISKS` (set to `s3-backups`).
- Ensure `AWS_BACKUP_BUCKET` and AWS credentials are configured.

## 9) Production Safety Checklist
- APP_DEBUG=false
- `php artisan deploy:check` passes
- `/health` returns `db_ok: true`
- `/ops` returns metrics
- `/alerts` returns no critical alerts
- queue worker running
- `backup:list` shows at least 1 healthy backup
- reminder command tested
- `failed_jobs` empty

## Standard Restart Commands
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan queue:restart
```
