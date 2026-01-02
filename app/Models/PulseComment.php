<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PulseComment extends Model
{
    protected $fillable = [
        'user_id',
        'pulse_post_id',
        'parent_id',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(PulsePost::class, 'pulse_post_id');
    }

    public function replies()
    {
        return $this->hasMany(PulseComment::class, 'parent_id')->with('user');
    }
}
