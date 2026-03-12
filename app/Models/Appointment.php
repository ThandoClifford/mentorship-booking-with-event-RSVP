<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'student_id',
        'mentor_id',
        'time_slot_id',
        'status',
        'student_contact_details',
        'appointment_subject',
        'cancelled_reason',
        'confirmed_sent_at',
        'cancelled_sent_at',
        'reminder_sent_at',
    ];

    protected $casts = [
        'confirmed_sent_at' => 'datetime',
        'cancelled_sent_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class, 'time_slot_id');
    }

    public function sessionNote(): HasOne
    {
        return $this->hasOne(SessionNote::class);
    }
}
