<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'day_number',
        'stakeholder_focus',
        'start_time',
        'end_time',
        'status'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'day_number' => 'integer',
    ];

    // Relationship with Trends
    public function trends()
    {
        return $this->hasMany(NewsTrend::class);
    }

    /**
     * Scope for active cycle
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
