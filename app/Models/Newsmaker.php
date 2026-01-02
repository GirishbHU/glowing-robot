<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Newsmaker extends Model
{
    use HasFactory;

    protected $fillable = [
        'ghost_uuid',
        'name',
        'entity_type',
        'associated_stakeholder',
        'relevance_score',
        'last_mentioned_at'
    ];

    protected $casts = [
        'last_mentioned_at' => 'datetime',
    ];
}
