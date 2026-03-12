<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'message',
        'published_on',
    ];

    protected function casts(): array
    {
        return [
            'published_on' => 'date',
        ];
    }
}
