<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class OpsAlertsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $alerts = [];
        $now = now()->toIso8601String();

        $queueThreshold = (int) env('QUEUE_ALERT_THRESHOLD', 100);

        $dbOk = true;
        try {
            DB::connection()->table('users')->limit(1)->get();
        } catch (\Throwable $exception) {
            $dbOk = false;
            $alerts[] = [
                'severity' => 'critical',
                'code' => 'DB_DOWN',
                'message' => 'Database is not reachable.',
                'details' => [
                    'error' => str($exception->getMessage())->limit(160)->toString(),
                ],
            ];
        }

        if (! $dbOk) {
            return $this->failure('Service unavailable', [
                'generated_at' => $now,
                'alert_count' => count($alerts),
                'alerts' => $alerts,
            ], 503);
        }

        $failedJobsCount = 0;
        try {
            $failedJobsCount = DB::table('failed_jobs')->count();
        } catch (\Throwable $exception) {
            // best effort
        }

        if ($failedJobsCount > 0) {
            $alerts[] = [
                'severity' => 'critical',
                'code' => 'FAILED_JOBS_PRESENT',
                'message' => 'There are failed jobs in the queue.',
                'details' => ['failed_jobs_count' => $failedJobsCount],
            ];
        }

        $queueConn = (string) config('queue.default');
        $queueSize = null;
        $queueSizeSupported = false;

        try {
            if ($queueConn === 'database') {
                $queueSizeSupported = true;
                $queueSize = DB::table('jobs')->count();

                if ($queueSize >= $queueThreshold) {
                    $alerts[] = [
                        'severity' => 'warning',
                        'code' => 'QUEUE_BACKLOG_HIGH',
                        'message' => 'Queue backlog is high.',
                        'details' => [
                            'queue_connection' => $queueConn,
                            'queue_size' => $queueSize,
                            'threshold' => $queueThreshold,
                        ],
                    ];
                }
            } elseif ($queueConn === 'redis') {
                $queueSizeSupported = true;
                $queueSize = (int) Redis::llen('queues:default');

                if ($queueSize >= $queueThreshold) {
                    $alerts[] = [
                        'severity' => 'warning',
                        'code' => 'QUEUE_BACKLOG_HIGH',
                        'message' => 'Queue backlog is high.',
                        'details' => [
                            'queue_connection' => $queueConn,
                            'queue_size' => $queueSize,
                            'threshold' => $queueThreshold,
                        ],
                    ];
                }
            }
        } catch (\Throwable $exception) {
            // best effort
        }

        try {
            $bookingsToday = Appointment::query()
                ->whereIn('status', ['confirmed', 'completed'])
                ->whereHas('timeSlot', function ($query) {
                    $query->whereDate('date', now()->toDateString());
                })
                ->count();

            $remindersSentLast24h = DB::table('appointments')
                ->whereNotNull('reminder_sent_at')
                ->where('reminder_sent_at', '>=', now()->subHours(24))
                ->count();

            if ($bookingsToday > 0 && $remindersSentLast24h === 0) {
                $alerts[] = [
                    'severity' => 'warning',
                    'code' => 'REMINDERS_NOT_SENDING',
                    'message' => 'Bookings exist but no reminders were sent in the last 24 hours.',
                    'details' => [
                        'bookings_today' => $bookingsToday,
                        'reminders_sent_last_24h' => $remindersSentLast24h,
                    ],
                ];
            }
        } catch (\Throwable $exception) {
            // best effort
        }

        $appEnv = (string) config('app.env');
        $appDebug = (bool) config('app.debug');

        if ($appEnv === 'production' && $appDebug) {
            $alerts[] = [
                'severity' => 'critical',
                'code' => 'APP_DEBUG_ENABLED',
                'message' => 'APP_DEBUG is enabled in production.',
                'details' => null,
            ];
        }

        if (! env('BACKUP_NOTIFICATION_EMAIL')) {
            $alerts[] = [
                'severity' => 'warning',
                'code' => 'BACKUP_NOTIFICATION_EMAIL_MISSING',
                'message' => 'BACKUP_NOTIFICATION_EMAIL is not set.',
                'details' => null,
            ];
        }

        if (! env('MAIL_FROM_ADDRESS')) {
            $alerts[] = [
                'severity' => 'warning',
                'code' => 'MAIL_FROM_ADDRESS_MISSING',
                'message' => 'MAIL_FROM_ADDRESS is not set.',
                'details' => null,
            ];
        }

        return $this->success('OK', [
            'generated_at' => $now,
            'queue_connection' => $queueConn,
            'queue_size_supported' => $queueSizeSupported,
            'queue_size' => $queueSize,
            'alert_count' => count($alerts),
            'alerts' => $alerts,
        ]);
    }
}
