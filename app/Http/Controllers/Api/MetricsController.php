<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    use ApiResponse;

    public function __invoke()
    {
        $today = now()->toDateString();

        $bookingsToday = Appointment::query()
            ->whereHas('timeSlot', function ($query) use ($today) {
                $query->whereDate('date', $today);
            })
            ->count();

        $failedJobsCount = DB::table('failed_jobs')->count();

        $queueSize = null;
        $queueDefault = (string) config('queue.default');

        if ($queueDefault === 'database') {
            $queueSize = DB::table('jobs')->count();
        }

        return $this->success('Metrics retrieved', [
            'bookings_today' => $bookingsToday,
            'failed_jobs_count' => $failedJobsCount,
            'queue_size' => $queueSize,
            'queue_size_supported' => $queueDefault === 'database',
            'queue_connection' => $queueDefault,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
