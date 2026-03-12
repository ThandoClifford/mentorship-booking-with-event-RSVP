<?php

return [
    'backup' => [
        'name' => env('APP_NAME', 'laravel-backup'),

        'source' => [
            'files' => [
                'include' => [
                    base_path(),
                ],
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                    storage_path('framework/cache'),
                    storage_path('framework/sessions'),
                    storage_path('framework/views'),
                ],
                'follow_links' => false,
                'ignore_unreadable_directories' => false,
                'relative_path' => base_path(),
            ],

            'databases' => [
                env('DB_CONNECTION', 'mysql'),
            ],
        ],

        'database_dump_compressor' => null,

        'database_dump_file_extension' => '',

        'destination' => [
            'filename_prefix' => '',
            'disks' => explode(',', (string) env('BACKUP_DISKS', 's3-backups')),
        ],

        'temporary_directory' => storage_path('app/backup-temp'),

        'password' => env('BACKUP_ARCHIVE_PASSWORD'),

        'encryption' => 'default',

        'tries' => 1,

        'retry_delay' => 0,
    ],

    'notifications' => [
        'notifications' => [
            'Spatie\\Backup\\Notifications\\Notifications\\BackupHasFailedNotification' => ['mail'],
            'Spatie\\Backup\\Notifications\\Notifications\\UnhealthyBackupWasFoundNotification' => ['mail'],
            'Spatie\\Backup\\Notifications\\Notifications\\CleanupHasFailedNotification' => ['mail'],
            'Spatie\\Backup\\Notifications\\Notifications\\BackupWasSuccessfulNotification' => ['mail'],
            'Spatie\\Backup\\Notifications\\Notifications\\HealthyBackupWasFoundNotification' => ['mail'],
            'Spatie\\Backup\\Notifications\\Notifications\\CleanupWasSuccessfulNotification' => ['mail'],
        ],

        'notifiable' => 'Spatie\\Backup\\Notifications\\Notifiable',

        'mail' => [
            'to' => array_values(array_filter(array_map('trim', explode(',', (string) env('BACKUP_NOTIFICATION_EMAIL', ''))))),
            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                'name' => env('APP_NAME', 'Laravel'),
            ],
        ],

        'slack' => [
            'webhook_url' => (string) env('BACKUP_SLACK_WEBHOOK_URL', ''),
            'channel' => (string) env('BACKUP_SLACK_CHANNEL', ''),
            'username' => (string) env('BACKUP_SLACK_USERNAME', ''),
            'icon' => (string) env('BACKUP_SLACK_ICON', ''),
        ],

        'discord' => [
            'webhook_url' => (string) env('BACKUP_DISCORD_WEBHOOK_URL', ''),
            'username' => env('APP_NAME', 'Laravel Backup'),
            'avatar_url' => '',
        ],
    ],

    'monitor_backups' => [
        [
            'name' => env('APP_NAME', 'laravel-backup'),
            'disks' => explode(',', (string) env('BACKUP_DISKS', 's3-backups')),
            'health_checks' => [
                'Spatie\\Backup\\Tasks\\Monitor\\HealthChecks\\MaximumAgeInDays' => 1,
                'Spatie\\Backup\\Tasks\\Monitor\\HealthChecks\\MaximumStorageInMegabytes' => 5000,
            ],
        ],
    ],

    'cleanup' => [
        'strategy' => 'Spatie\\Backup\\Tasks\\Cleanup\\Strategies\\DefaultStrategy',

        'default_strategy' => [
            'keep_all_backups_for_days' => 7,
            'keep_daily_backups_for_days' => 14,
            'keep_weekly_backups_for_weeks' => 8,
            'keep_monthly_backups_for_months' => 12,
            'keep_yearly_backups_for_years' => 5,
            'delete_oldest_backups_when_using_more_megabytes_than' => 10000,
        ],
    ],
];
