<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    use ApiResponse;

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $from = $validated['from'] ?? now()->subDays(30)->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $appointments = Appointment::query()
            ->with(['timeSlot:id,date', 'mentor:id,name'])
            ->whereHas('timeSlot', function ($query) use ($from, $to) {
                $query->whereBetween('date', [$from, $to]);
            })
            ->get();

        $totalAppointments = $appointments->count();
        $confirmedCount = $appointments->where('status', 'confirmed')->count();
        $cancelledCount = $appointments->where('status', 'cancelled')->count();
        $completedCount = $appointments->where('status', 'completed')->count();
        $pendingCount = $appointments->where('status', 'pending')->count();

        $topMentors = $appointments
            ->groupBy('mentor_id')
            ->map(function ($group, $mentorId) {
                $first = $group->first();

                return [
                    'mentor_id' => $mentorId,
                    'mentor_name' => optional($first?->mentor)->name,
                    'total' => $group->count(),
                ];
            })
            ->sortByDesc('total')
            ->take(5)
            ->values();

        $busiestDays = $appointments
            ->groupBy(function ($appointment) {
                return (string) optional($appointment->timeSlot)->date;
            })
            ->map(function ($group, $date) {
                return [
                    'date' => $date,
                    'total' => $group->count(),
                ];
            })
            ->sortByDesc('total')
            ->take(10)
            ->sortBy('date')
            ->values();

        return $this->success('Reports summary retrieved', [
            'total_appointments' => $totalAppointments,
            'confirmed_count' => $confirmedCount,
            'cancelled_count' => $cancelledCount,
            'completed_count' => $completedCount,
            'pending_count' => $pendingCount,
            'top_mentors' => $topMentors,
            'busiest_days' => $busiestDays,
            'from' => $from,
            'to' => $to,
        ]);
    }
}
