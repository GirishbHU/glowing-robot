<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PulseReaction extends Model
{
    protected $fillable = [
        'user_id',
        'pulse_post_id',
        'pulse_comment_id',
        'type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(PulsePost::class, 'pulse_post_id');
    }
}
