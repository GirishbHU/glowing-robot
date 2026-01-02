<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Interaction;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SocialController extends Controller
{
    /**
     * Fetch the global feed with filters
     */
    public function index(Request $request)
    {
        $query = Post::with(['author', 'interactions', 'comments'])
            ->latest();

        // Apply Filters
        if ($request->has('stakeholder')) {
            $query->where('stakeholder_filter', $request->stakeholder);
        }
        if ($request->has('country')) {
            $query->where('country_filter', $request->country);
        }
        if ($request->has('sector')) {
            $query->where('sector_filter', $request->sector);
        }
        if ($request->has('level')) {
            $query->where('level_filter', $request->level);
        }

        // Pagination
        $posts = $query->paginate(20);

        return response()->json($posts);
    }

    /**
     * Create a new post (Article, Poll, Quiz, etc.)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content_type' => 'required|in:text,article,quiz,poll',
            'body' => 'required|string',
            'title' => 'nullable|string|max:255',
            'stakeholder_filter' => 'nullable|string',
            'country_filter' => 'nullable|string',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'content_type' => $validated['content_type'],
            'body' => $validated['body'],
            'title' => $validated['title'] ?? null,
            'stakeholder_filter' => $validated['stakeholder_filter'] ?? null,
            'country_filter' => $validated['country_filter'] ?? null,
        ]);

        return response()->json($post, 201);
    }

    /**
     * Handle Interactions (Like, Love, etc.) -> Influence Economy
     */
    public function react(Request $request, Post $post)
    {
        $validated = $request->validate([
            'type' => 'required|in:like,love,insightful,share'
        ]);

        $user = Auth::user();

        // Weight logic for Influence Economy
        $weights = [
            'like' => 1,
            'love' => 2,
            'insightful' => 5,
            'share' => 10
        ];

        // Toggle interaction
        $existing = Interaction::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->where('type', $validated['type'])
            ->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('influence_score', $weights[$validated['type']]);
            $action = 'removed';
        } else {
            Interaction::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
                'type' => $validated['type'],
                'weight' => $weights[$validated['type']]
            ]);
            $post->increment('influence_score', $weights[$validated['type']]);
            $action = 'added';
        }

        return response()->json([
            'status' => 'success',
            'action' => $action,
            'new_score' => $post->influence_score
        ]);
    }
}
