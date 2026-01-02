<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'level_id',
        'level_name',
        'dimension_id',
        'stakeholder',
        'question',
        'grade_1',
        'grade_2',
        'grade_3',
        'grade_4',
        'grade_5',
        'gleams',
        'alicorns',
    ];

    protected $casts = [
        'gleams' => 'integer',
        'alicorns' => 'decimal:2',
    ];
}
