<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeployReadinessCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deploy:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run production deployment readiness checks';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $rows = [];
        $hasFailures = false;

        $env = (string) config('app.env');
        $debug = (bool) config('app.debug');
        $appKey = (string) config('app.key');

        $this->addResult($rows, 'PASS', 'APP_ENV detected', $env);

        if ($env === 'production' && $debug) {
            $hasFailures = true;
            $this->addResult($rows, 'FAIL', 'APP_DEBUG must be false in production', 'Set APP_DEBUG=false');
        } else {
            $this->addResult($rows, 'PASS', 'APP_DEBUG state', $debug ? 'true (non-production)' : 'false');
        }

        if (trim($appKey) === '') {
            $hasFailures = true;
            $this->addResult($rows, 'FAIL', 'APP_KEY missing', 'Run php artisan key:generate');
        } else {
            $this->addResult($rows, 'PASS', 'APP_KEY is set', 'ok');
        }

        try {
            DB::connection()->table('users')->limit(1)->get();
            $this->addResult($rows, 'PASS', 'Database connectivity', 'ok');
        } catch (\Throwable $exception) {
            $hasFailures = true;
            $this->addResult($rows, 'FAIL', 'Database connectivity', $exception->getMessage());
        }

        $queueConnection = (string) config('queue.default');
        if ($queueConnection === '') {
            $hasFailures = true;
            $this->addResult($rows, 'FAIL', 'Queue connection configured', 'Set QUEUE_CONNECTION');
        } else {
            $this->addResult($rows, 'PASS', 'Queue connection configured', $queueConnection);
        }

        $cacheStore = (string) config('cache.default');
        if ($cacheStore === '') {
            $hasFailures = true;
            $this->addResult($rows, 'FAIL', 'Cache store configured', 'Set CACHE_STORE/CACHE_DRIVER');
        } else {
            $this->addResult($rows, 'PASS', 'Cache store configured', $cacheStore);
        }

        $mailer = (string) config('mail.default');
        if ($mailer === '') {
            $hasFailures = true;
            $this->addResult($rows, 'FAIL', 'Mail driver configured', 'Set MAIL_MAILER');
        } else {
            $this->addResult($rows, 'PASS', 'Mail driver configured', $mailer);
        }

        foreach ([storage_path(), storage_path('logs'), base_path('bootstrap/cache')] as $path) {
            if (! is_writable($path)) {
                $hasFailures = true;
                $this->addResult($rows, 'FAIL', 'Writable path check', $path);
            } else {
                $this->addResult($rows, 'PASS', 'Writable path check', $path);
            }
        }

        $requiredEnvKeys = ['APP_URL', 'DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'QUEUE_CONNECTION', 'MAIL_MAILER'];
        foreach ($requiredEnvKeys as $key) {
            $value = env($key);
            if (is_null($value) || trim((string) $value) === '') {
                $hasFailures = true;
                $this->addResult($rows, 'FAIL', "Missing env: {$key}", 'Set this key in environment');
            }
        }

        $this->addResult($rows, 'WARN', 'Scheduler cron check', 'Ensure cron runs php artisan schedule:run every minute');

        $this->table(['Status', 'Check', 'Details'], $rows);

        if ($hasFailures) {
            $this->error('Deployment readiness FAILED');

            return self::FAILURE;
        }

        $this->info('Deployment readiness PASSED (warnings may remain)');

        return self::SUCCESS;
    }

    private function addResult(array &$rows, string $status, string $check, string $details): void
    {
        $rows[] = [$status, $check, $details];
    }
}
