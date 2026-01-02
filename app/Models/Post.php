<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'content_type', // text, article, quiz, poll
        'title',
        'body',
        'media_urls',
        'stakeholder_filter',
        'country_filter',
        'sector_filter',
        'level_filter',
        'gleams_tipped',
        'influence_score',
    ];

    protected $casts = [
        'media_urls' => 'array',
        'gleams_tipped' => 'integer',
        'influence_score' => 'float',
    ];

    // Relationships
    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function interactions()
    {
        return $this->hasMany(Interaction::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id');
    }
}
