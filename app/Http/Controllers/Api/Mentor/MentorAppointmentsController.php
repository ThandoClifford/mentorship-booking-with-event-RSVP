<?php

namespace App\Http\Controllers\Api\Mentor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\SessionNote;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class MentorAppointmentsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $query = Appointment::query()
            ->where('mentor_id', $request->user()->id)
            ->with([
                'student:id,name,email',
                'timeSlot:id,mentor_id,date,start_time,end_time,status',
            ]);

        if (! empty($validated['date'])) {
            $query->whereHas('timeSlot', function ($timeSlotQuery) use ($validated) {
                $timeSlotQuery->whereDate('date', $validated['date']);
            });
        } elseif (! empty($validated['from']) && ! empty($validated['to'])) {
            $query->whereHas('timeSlot', function ($timeSlotQuery) use ($validated) {
                $timeSlotQuery->whereBetween('date', [$validated['from'], $validated['to']]);
            });
        }

        $appointments = $query->get()
            ->sortBy(function (Appointment $appointment) {
                $date = (string) optional($appointment->timeSlot)->date;
                $time = (string) optional($appointment->timeSlot)->start_time;

                return $date.' '.$time;
            })
            ->values();

        return $this->success('Mentor appointments retrieved', $appointments);
    }

    public function complete(Request $request, string $id)
    {
        $appointment = Appointment::where('id', $id)
            ->where('mentor_id', $request->user()->id)
            ->first();

        if (! $appointment) {
            return $this->failure('Appointment not found', null, 404);
        }

        if ($appointment->status !== 'confirmed') {
            return $this->failure('Only confirmed appointments can be completed', null, 422);
        }

        $appointment->update(['status' => 'completed']);

        AuditService::log(
            $request->user()->id,
            'appointment.completed',
            'Appointment',
            $appointment->id
        );

        return $this->success('Appointment marked as completed', $appointment->fresh());
    }

    public function upsertNotes(Request $request, string $id)
    {
        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $appointment = Appointment::where('id', $id)
            ->where('mentor_id', $request->user()->id)
            ->first();

        if (! $appointment) {
            return $this->failure('Appointment not found', null, 404);
        }

        $note = SessionNote::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'mentor_id' => $request->user()->id,
                'notes' => $validated['notes'],
            ]
        );

        AuditService::log(
            $request->user()->id,
            'appointment.notes_updated',
            'Appointment',
            $appointment->id,
            [
                'session_note_id' => $note->id,
            ]
        );

        return $this->success('Session note saved', $note);
    }
}
