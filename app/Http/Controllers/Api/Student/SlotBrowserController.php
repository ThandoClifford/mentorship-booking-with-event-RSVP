<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SlotBrowserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'mentor_id' => ['nullable', 'string'],
        ]);

        $query = TimeSlot::query()
            ->where('status', 'available')
            ->with(['mentor:id,name,email'])
            ->orderBy('date')
            ->orderBy('start_time');

        if (! empty($validated['mentor_id'])) {
            $query->where('mentor_id', $validated['mentor_id']);
        }

        if (! empty($validated['date'])) {
            $query->whereDate('date', $validated['date']);
        } else {
            $fromDate = ! empty($validated['from'])
                ? Carbon::createFromFormat('Y-m-d', $validated['from'])
                : now()->startOfDay();

            $toDate = ! empty($validated['to'])
                ? Carbon::createFromFormat('Y-m-d', $validated['to'])
                : now()->addDays(14)->endOfDay();

            $query->whereBetween('date', [
                $fromDate->toDateString(),
                $toDate->toDateString(),
            ]);
        }

        $slots = $query->get([
            'id',
            'mentor_id',
            'date',
            'start_time',
            'end_time',
            'status',
        ])->filter(function (TimeSlot $slot): bool {
            $day = strtolower(Carbon::parse((string) $slot->date)->englishDayOfWeek);

            return in_array($day, ['tuesday', 'thursday'], true);
        })->values();

        return $this->success('Available slots retrieved', $slots);
    }
}
