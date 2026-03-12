<?php

namespace App\Console\Commands;

use App\Mail\AppointmentReminderMail;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'send:appointment-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send reminder emails for confirmed appointments in the next 24 hours';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $hours = (int) env('REMINDER_WINDOW_HOURS', 24);
        $windowStart = now();
        $windowEnd = now()->addHours($hours);
        $scannedCount = 0;
        $sentCount = 0;
        $skippedCount = 0;

        $this->info('Scanning confirmed appointments from '.$windowStart->toDateTimeString().' to '.$windowEnd->toDateTimeString().' (window: '.$hours.'h)');

        Appointment::query()
            ->where('status', 'confirmed')
            ->whereNull('reminder_sent_at')
            ->with(['student:id,name,email', 'mentor:id,name,email', 'timeSlot:id,date,start_time,end_time,mentor_id'])
            ->orderBy('id')
            ->chunkById(100, function ($appointments) use ($windowStart, $windowEnd, &$scannedCount, &$sentCount, &$skippedCount) {
                foreach ($appointments as $appointment) {
                    $scannedCount++;

                    if (! $appointment->timeSlot || ! $appointment->student) {
                        $skippedCount++;
                        continue;
                    }

                    $appointmentDateTime = Carbon::parse($appointment->timeSlot->date.' '.$appointment->timeSlot->start_time);

                    if (! $appointmentDateTime->betweenIncluded($windowStart, $windowEnd)) {
                        $skippedCount++;
                        continue;
                    }

                    try {
                        Mail::to($appointment->student->email)->queue(new AppointmentReminderMail($appointment));
                        $appointment->update(['reminder_sent_at' => now()]);
                        $sentCount++;
                        $this->info('Reminder sent for appointment #'.$appointment->id);
                    } catch (\Throwable $exception) {
                        $skippedCount++;
                        $this->error('Failed reminder for appointment #'.$appointment->id.': '.$exception->getMessage());
                    }
                }
            });

        $this->info('Reminder run complete. Scanned: '.$scannedCount.', Sent: '.$sentCount.', Skipped: '.$skippedCount);

        return self::SUCCESS;
    }
}
