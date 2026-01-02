<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsFeedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stakeholder',
        'title',
        'source',
        'category',
        'url',
        'emoji',
        'published_at',
        'region',
        'super_sector',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
