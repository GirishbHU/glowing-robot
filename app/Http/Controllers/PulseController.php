<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PulseController extends Controller
{
    /**
     * Get the live pulse feed / leaderboard.
     * Supports filtering by 'timeframe' and 'category'.
     */
    public function index(Request $request)
    {
        $timeframe = $request->input('timeframe'); // hour, day, week, month, year
        $category = $request->input('category');   // idea, opinion, suggestion
        
        $query = DB::table('pulses');

        // Filter by Category
        if ($category) {
            $query->where('category', $category);
        }

        // Filter by Timeframe
        if ($timeframe) {
            switch ($timeframe) {
                case 'hour':
                    $query->where('created_at', '>=', now()->subHour());
                    break;
                case 'day':
                    $query->where('created_at', '>=', now()->subDay());
                    break;
                case 'week':
                    $query->where('created_at', '>=', now()->subWeek());
                    break;
                case 'month':
                    $query->where('created_at', '>=', now()->subMonth());
                    break;
                case 'year':
                    $query->where('created_at', '>=', now()->subYear());
                    break;
            }
            // If checking a leaderboard, sort by virality
            $query->orderBy('virality_score', 'desc');
        } else {
            // Default chronological feed
            $query->orderBy('created_at', 'desc');
        }

        $pulses = $query->take(20)
            ->get()
            ->map(function ($p) {
                $p->engagement_metrics = json_decode($p->engagement_metrics);
                $p->author_info = json_decode($p->author_info);
                return $p;
            });

        return response()->json($pulses);
    }

    /**
     * Store a new pulse (User or Guest).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:280',
            'category' => 'nullable|string|in:idea,opinion,suggestion',
            'author_name' => 'nullable|string|max:50',
            'session_id' => 'nullable|string|max:255',
            'author_info' => 'nullable|array',
        ]);

        $sessionId = $validated['session_id'] ?? session()->getId();
        
        // Determine Author Name (Hierarchy: Display Name > Guest#Session)
        $authorName = $validated['author_name'];
        if (!$authorName) {
            $authorName = 'Guest#' . substr(md5($sessionId), 0, 8);
        }

        // Gamification: FUD Fighter Badge 🛡️ (Chaos Mode)
        // Simple sentiment check for optimistic keywords
        $optimisticKeywords = ['future', 'build', 'grow', 'vision', 'strong', 'opportunity', 'bullish', 'long-term', 'resilient', 'WAGMI', 'innovate'];
        $contentLower = strtolower($validated['content']);
        $isOptimistic = false;
        foreach ($optimisticKeywords as $keyword) {
            if (str_contains($contentLower, $keyword)) {
                $isOptimistic = true;
                break;
            }
        }

        $authorInfo = $validated['author_info'] ?? [];
        if ($isOptimistic) {
            // Append badge if not already present (though this is new post)
            $authorInfo['badges'] = array_merge($authorInfo['badges'] ?? [], ['FUD Fighter 🛡️']);
        }

        $pulse = DB::table('pulses')->insert([
            'type' => 'user_post',
            'content' => $validated['content'],
            'category' => $validated['category'] ?? 'opinion',
            'is_guest' => true,
            'session_id' => $sessionId,
            'author_name' => $authorName,
            'author_info' => json_encode($authorInfo),
            'author_info' => json_encode($authorInfo),
            'engagement_metrics' => json_encode(['likes' => 0, 'shares' => 0]),
            'virality_score' => 0, // Starts at 0
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Pulse posted!', 'author_name' => $authorName], 201);
    }

    /**
     * Get the aggregated leaderboard.
     */
    public function leaderboard(Request $request)
    {
        $limit = $request->input('limit', 5);
        $stakeholder = $request->input('stakeholder');

        $query = DB::table('aggregated_leaderboards')
            ->orderBy('weighted_average_score', 'desc');

        if ($stakeholder) {
            $query->where('stakeholder_type', $stakeholder);
        }

        $leaders = $query->take($limit)->get()->map(function ($l) {
            $l->metadata = json_decode($l->metadata);
            return $l;
        });

        return response()->json($leaders);
    }
}
