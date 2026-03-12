<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class OpsController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $appTime = now()->toIso8601String();
        $appEnv = (string) config('app.env');
        $appVersion = env('APP_VERSION');

        try {
            DB::connection()->table('users')->limit(1)->get();
        } catch (\Throwable $exception) {
            return $this->failure('Database unavailable', [
                'health' => [
                    'app_time' => $appTime,
                    'db_ok' => false,
                    'app_env' => $appEnv,
                    'app_version' => $appVersion,
                ],
            ], 503);
        }

        $today = now()->toDateString();
        $queueConnection = (string) config('queue.default');

        $bookingsToday = Appointment::query()
            ->whereHas('timeSlot', function ($query) use ($today) {
                $query->whereDate('date', $today);
            })
            ->count();

        $failedJobsCount = DB::table('failed_jobs')->count();
        $queueSize = null;

        if ($queueConnection === 'database') {
            $queueSize = DB::table('jobs')->count();
        } elseif ($queueConnection === 'redis') {
            try {
                $queueSize = (int) Redis::llen('queues:default');
            } catch (\Throwable $exception) {
                $queueSize = null;
            }
        }

        $lastFailedJobs = collect();
        try {
            $lastFailedJobs = DB::table('failed_jobs')
                ->orderByDesc('failed_at')
                ->limit(5)
                ->get(['id', 'connection', 'queue', 'failed_at', 'exception'])
                ->map(function ($job) {
                    $rawException = (string) ($job->exception ?? '');
                    $firstLine = trim(strtok($rawException, "\n"));

                    $exceptionClass = 'UnknownException';
                    if (preg_match('/^([A-Za-z0-9_\\\\]+)/', $firstLine, $matches)) {
                        $exceptionClass = $matches[1];
                    }

                    return [
                        'id' => $job->id,
                        'connection' => $job->connection,
                        'queue' => $job->queue,
                        'failed_at' => $job->failed_at,
                        'exception_class' => $exceptionClass,
                        'message_preview' => mb_substr($firstLine, 0, 120),
                    ];
                })
                ->values();
        } catch (\Throwable $exception) {
            $lastFailedJobs = collect();
        }

        $remindersSentLast24h = DB::table('appointments')
            ->where('reminder_sent_at', '>=', now()->subDay())
            ->count();

        $confirmationsSentLast24h = DB::table('appointments')
            ->where('confirmed_sent_at', '>=', now()->subDay())
            ->count();

        $cancellationsSentLast24h = DB::table('appointments')
            ->where('cancelled_sent_at', '>=', now()->subDay())
            ->count();

        $lastAudits = AuditLog::query()
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['created_at', 'actor_id', 'action', 'entity_type', 'entity_id'])
            ->values();

        return $this->success('Ops dashboard retrieved', [
            'health' => [
                'app_time' => $appTime,
                'db_ok' => true,
                'app_env' => $appEnv,
                'app_version' => $appVersion,
            ],
            'metrics' => [
                'bookings_today' => $bookingsToday,
                'failed_jobs_count' => $failedJobsCount,
                'queue_connection' => $queueConnection,
                'queue_size' => $queueSize,
            ],
            'recent_failures' => [
                'last_failed_jobs' => $lastFailedJobs,
            ],
            'reminders_status' => [
                'reminders_sent_last_24h' => $remindersSentLast24h,
                'confirmations_sent_last_24h' => $confirmationsSentLast24h,
                'cancellations_sent_last_24h' => $cancellationsSentLast24h,
            ],
            'audit_snapshot' => [
                'last_audits' => $lastAudits,
            ],
        ]);
    }
}