<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PulsePost extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'type',
        'context_type',
        'context_value',
        'media_urls',
        'gleam_bounty',
        'impressions',
    ];

    protected $casts = [
        'media_urls' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reactions()
    {
        return $this->hasMany(PulseReaction::class);
    }

    public function comments()
    {
        return $this->hasMany(PulseComment::class)->whereNull('parent_id')->with('replies.user');
    }
}
