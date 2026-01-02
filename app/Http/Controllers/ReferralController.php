<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReferralController extends Controller
{
    /**
     * Get referral statistics for the authenticated user.
     */
    public function stats(Request $request)
    {
        $user = Auth::user();

        // Count successful referrals (users who registered with this user's code)
        $referralCount = $user->referrals()->count();

        // Calculate progress towards next reward
        // Logic: Every 5 referrals = 1 Reward (e.g., Free Year)
        $target = 5;
        $progress = ($referralCount % $target) / $target * 100;
        $rewardsEarned = floor($referralCount / $target);

        // Standardize the referral link
        // In production, this should be the APP_URL
        $referralLink = config('app.url') . '/register?ref=' . $user->referral_code;

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => $referralLink,
            'referral_count' => $referralCount,
            'progress_percentage' => $progress,
            'rewards_earned' => $rewardsEarned,
            'next_reward_at' => $target - ($referralCount % $target) . ' more referrals',
        ]);
    }
}
