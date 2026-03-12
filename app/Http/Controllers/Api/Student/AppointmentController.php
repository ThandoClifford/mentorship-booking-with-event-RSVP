<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Mail\AppointmentCancelledMail;
use App\Mail\AppointmentConfirmedMail;
use App\Models\Appointment;
use App\Models\TimeSlot;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'time_slot_id' => ['required', 'string'],
        ]);

        $studentId = $request->user()->id;

        $slot = TimeSlot::where('id', $validated['time_slot_id'])->first();

        if (! $slot || $slot->status !== 'available') {
            abort(response()->json([
                'success' => false,
                'message' => 'Selected slot is no longer available',
                'data' => null,
            ], 422));
        }

        $dayOfWeek = strtolower(Carbon::parse($slot->date)->englishDayOfWeek);
        if (! in_array($dayOfWeek, ['tuesday', 'thursday'], true)) {
            abort(response()->json([
                'success' => false,
                'message' => 'Appointments are only allowed on Tuesday or Thursday slots',
                'data' => null,
            ], 422));
        }

        $hasExistingSameDay = Appointment::query()
            ->where('student_id', $studentId)
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereHas('timeSlot', function ($query) use ($slot) {
                $query->whereDate('date', $slot->date);
            })
            ->exists();

        if ($hasExistingSameDay) {
            abort(response()->json([
                'success' => false,
                'message' => 'You already have an appointment on this date',
                'data' => null,
            ], 422));
        }

        $slotAlreadyHasAppointment = Appointment::where('time_slot_id', $slot->id)->exists();

        if ($slotAlreadyHasAppointment) {
            abort(response()->json([
                'success' => false,
                'message' => 'This slot has been used before and cannot be booked again',
                'data' => null,
            ], 422));
        }

        $appointment = Appointment::create([
            'student_id' => $studentId,
            'mentor_id' => $slot->mentor_id,
            'time_slot_id' => $slot->id,
            'status' => 'confirmed',
        ]);

        $slot->update(['status' => 'booked']);

        $appointment = $appointment->fresh();

        $appointment->load([
            'student:id,name,email',
            'timeSlot:id,mentor_id,date,start_time,end_time,status',
            'mentor:id,name,email',
        ]);

        $mailWarning = null;

        if (is_null($appointment->confirmed_sent_at)) {
            try {
                Mail::to($appointment->student->email)->queue(new AppointmentConfirmedMail($appointment));
                $appointment->update(['confirmed_sent_at' => now()]);
                $appointment->refresh();
            } catch (\Throwable $exception) {
                $mailWarning = ' Confirmation email could not be sent.';
            }
        }

        AuditService::log(
            $studentId,
            'appointment.booked',
            'Appointment',
            $appointment->id,
            [
                'slot_id' => $appointment->time_slot_id,
                'mentor_id' => $appointment->mentor_id,
            ]
        );

        return $this->success('Appointment booked successfully.'.($mailWarning ?? ''), $appointment, 201);
    }

    public function index(Request $request)
    {
        $appointments = Appointment::query()
            ->where('student_id', $request->user()->id)
            ->with([
                'timeSlot:id,mentor_id,date,start_time,end_time,status',
                'mentor:id,name,email',
            ])
            ->get()
            ->sortByDesc(function (Appointment $appointment) {
                $date = (string) optional($appointment->timeSlot)->date;
                $time = (string) optional($appointment->timeSlot)->start_time;

                return $date.' '.$time;
            })
            ->values();

        return $this->success('Appointments retrieved', $appointments);
    }

    public function cancel(Request $request, string $id)
    {
        $validated = $request->validate([
            'cancelled_reason' => ['nullable', 'string'],
        ]);

        $studentId = $request->user()->id;

        $appointment = Appointment::where('id', $id)
            ->where('student_id', $studentId)
            ->first();

        if (! $appointment) {
            abort(response()->json([
                'success' => false,
                'message' => 'Appointment not found',
                'data' => null,
            ], 404));
        }

        if ($appointment->status === 'completed') {
            abort(response()->json([
                'success' => false,
                'message' => 'Completed appointments cannot be cancelled',
                'data' => null,
            ], 422));
        }

        $appointment->update([
            'status' => 'cancelled',
            'cancelled_reason' => $validated['cancelled_reason'] ?? $appointment->cancelled_reason,
        ]);

        $slot = TimeSlot::where('id', $appointment->time_slot_id)->first();

        if ($slot && $slot->status === 'booked') {
            $slot->update(['status' => 'available']);
        }

        $updatedAppointment = $appointment->fresh([
            'student:id,name,email',
            'timeSlot:id,mentor_id,date,start_time,end_time,status',
            'mentor:id,name,email',
        ]);

        $mailWarning = null;

        if (is_null($updatedAppointment->cancelled_sent_at)) {
            try {
                Mail::to($updatedAppointment->student->email)->queue(new AppointmentCancelledMail($updatedAppointment));
                $updatedAppointment->update(['cancelled_sent_at' => now()]);
                $updatedAppointment->refresh();
            } catch (\Throwable $exception) {
                $mailWarning = ' Cancellation email could not be sent.';
            }
        }

        AuditService::log(
            $studentId,
            'appointment.cancelled',
            'Appointment',
            $updatedAppointment->id,
            [
                'reason' => (string) ($updatedAppointment->cancelled_reason ?? ''),
            ]
        );

        return $this->success('Appointment cancelled'.($mailWarning ?? ''), $updatedAppointment);
    }
}
