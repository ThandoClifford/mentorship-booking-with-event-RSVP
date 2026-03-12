<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MongoDB\Laravel\Eloquent\Model;

class MentorAvailability extends Model
{
    protected $fillable = [
        'mentor_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}
