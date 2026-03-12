<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use MongoDB\Laravel\Eloquent\Model;

class TimeSlot extends Model
{
    protected $fillable = [
        'mentor_id',
        'date',
        'start_time',
        'end_time',
        'status',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function appointment(): HasOne
    {
        return $this->hasOne(Appointment::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
