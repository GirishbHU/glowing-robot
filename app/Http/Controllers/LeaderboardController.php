<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeaderboardEntry;
use App\Models\NewsFeedItem;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $stakeholder = $request->input('stakeholder');
        $country = $request->input('country');
        $sector = $request->input('sector');
        $level = $request->input('level');
        $limit = $request->input('limit', 50);

        $query = LeaderboardEntry::query();

        if ($stakeholder) {
            $query->where('stakeholder', $stakeholder);
        }
        if ($country) {
            $query->where('country', $country);
        }
        if ($sector) {
            $query->where('sector', $sector);
        }
        if ($level) {
            $query->where('level', $level);
        }
        if ($request->has('region')) {
            $query->where('region', $request->input('region'));
        }

        // Return ordered by Rank
        return response()->json(
            $query->orderBy('gleams', 'desc')->limit($limit)->get() // Order by Gleams for dynamic ranking
        );
    }

    public function news(Request $request)
    {
        $stakeholder = $request->input('stakeholder');
        $limit = $request->input('limit', 10);

        $query = NewsFeedItem::query();

        if ($stakeholder) {
            $query->whereIn('stakeholder', [$stakeholder, 'All']);
        }

        return response()->json(
            $query->orderBy('published_at', 'desc')->limit($limit)->get()
        );
    }
}
