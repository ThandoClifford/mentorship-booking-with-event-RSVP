# Production Hardening Add-ons

## GitHub Actions Secrets
Configure in repository settings:
- SSH_PRIVATE_KEY
- SERVER_HOST
- SERVER_USER
- REPO_SSH_URL

## Log Rotation
Copy template from [deploy/logrotate/ump](deploy/logrotate/ump) to server:
```bash
sudo cp deploy/logrotate/ump /etc/logrotate.d/ump
```

## Fail2Ban (SSH protection)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## PHP OPCache (production)
Set in php.ini:
```ini
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```
Then restart PHP-FPM:
```bash
sudo systemctl restart php8.2-fpm
```

## Horizon (optional, Redis-heavy workloads)
```bash
composer require laravel/horizon
php artisan horizon:install
```
Then run horizon under supervisor instead of queue:work.

## DB Index Audit
Run EXPLAIN plans for critical queries:
- appointments lookup/filter
- time_slots date filtering
- reports grouping queries

Add composite indexes where execution plans indicate table scans.
