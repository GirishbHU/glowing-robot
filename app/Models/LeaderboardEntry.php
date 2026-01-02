<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaderboardEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'stakeholder',
        'rank',
        'name',
        'country',
        'sector',
        'gleams',
        'alicorns',
        'level',
        'trend',
        'region',
        'super_sector',
    ];
}
