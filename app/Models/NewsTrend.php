<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsTrend extends Model
{
    use HasFactory;

    protected $fillable = [
        'news_cycle_id',
        'keyword',
        'source',
        'sentiment_score',
        'volume',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'sentiment_score' => 'float',
    ];

    public function cycle()
    {
        return $this->belongsTo(NewsCycle::class, 'news_cycle_id');
    }
}
