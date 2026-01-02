<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValueJourneyProgress extends Model
{
    use HasFactory;

    protected $table = 'value_journey_progress';

    protected $fillable = [
        'user_id',
        'session_id',
        'stakeholder',
        'current_level',
        'aspirational_level',
        'is_aspirational',
        'gleams',
        'alicorns',
        'answers',
        'completed_at',
    ];

    protected $casts = [
        'is_aspirational' => 'boolean',
        'gleams' => 'integer',
        'alicorns' => 'decimal:2',
        'answers' => 'array',
        'completed_at' => 'datetime',
    ];
}
