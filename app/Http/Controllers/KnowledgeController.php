<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;

class KnowledgeController extends Controller
{
    /**
     * Store a new knowledge contribution (Answer, Critique, or Idea).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_code' => 'required|string',
            'stakeholder_role' => 'required|string',
            'contribution_type' => 'required|string|in:answer_insight,critique_q,taxonomy_idea',
            'content' => 'required|string|min:10', // Minimum effort required
            'guest_uuid' => 'nullable|string',
            'client_timezone' => 'nullable|string',
            'local_time' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $userId = Auth::id();
            $guestUuid = $request->guest_uuid;

            // Prevent spam: Simple check if user submitted same content recently could benefit here
            // For now, we trust the rate limiter.

            $bonusGleams = 50; // Standard reward for contribution

            // Create the contribution record
            $contributionId = DB::table('knowledge_contributions')->insertGetId([
                'user_id' => $userId,
                'guest_uuid' => $guestUuid,
                'question_code' => $validated['question_code'],
                'stakeholder_role' => $validated['stakeholder_role'],
                'contribution_type' => $validated['contribution_type'],
                'content' => $validated['content'],
                'ip_address' => $request->ip(),
                'client_timezone' => $validated['client_timezone'],
                'local_time_at_creation' => $validated['local_time'] ? date('Y-m-d H:i:s', strtotime($validated['local_time'])) : now(),
                'bonus_gleams_awarded' => $bonusGleams,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Award the Gleams (Transaction)
            // Ideally we insert into a 'Wallet' or 'Ledger', but for now we rely on the Frontend to track session total
            // or the User model if authenticated.
            
            // NOTE: The actual persistence of the "Total Score" usually happens in ValueJourneyController -> saveProgress.
            // This API acknowledges the *event*.
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Contribution recorded. Protocol updated.',
                'bonus_gleams' => $bonusGleams,
                'id' => $contributionId
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record contribution',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
