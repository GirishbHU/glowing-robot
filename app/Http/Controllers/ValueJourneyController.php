<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ValueJourneyProgress;
use App\Services\MeritService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ValueJourneyController extends Controller
{
    protected $meritService;
    
    public function __construct(MeritService $meritService)
    {
        $this->meritService = $meritService;
    }
    
    /**
     * Handle guest session creation/update (Frontend: /api/free-user)
     */
    public function handleGuestSession(Request $request, $sessionId = null)
    {
        // Get or create guest UUID
        $guestUuid = $request->input('guestUuid') ?? $this->meritService->getOrCreateGuestUuid();
        
        // Use guest UUID as session ID for consistency
        $sid = $sessionId ?? $guestUuid;

        // Find or create progress for this session
        $progress = ValueJourneyProgress::firstOrCreate(
            ['session_id' => $sid],
            [
                'user_id' => null, // Explicitly null for guests
                'guest_uuid' => $guestUuid
            ]
        );

        // Update fields if provided
        if ($request->has('stakeholder')) $progress->stakeholder = $request->input('stakeholder');
        if ($request->has('currentLevel')) $progress->current_level = $request->input('currentLevel');
        if ($request->has('aspirationalLevel')) $progress->aspirational_level = $request->input('aspirationalLevel');
        
        $progress->save();

        return response()->json([
            'success' => true,
            'sessionId' => $sid,
            'guestUuid' => $guestUuid,
            'progress' => $progress
        ]);
    }

    /**
     * Get authenticated user progress (Frontend: GET /api/value-journey/progress/{userId})
     */
    public function getUserProgress(Request $request, $userId)
    {
        $user = \App\Models\User::find($userId);
       $progress = ValueJourneyProgress::where('user_id', $userId)->first();
        
        if (!$progress) {
            // Return empty structure expected by frontend
            return response()->json([
                'stakeholder' => null,
                'currentLevel' => 'L0',
                'aspirationalLevel' => 'L1',
                'answers' => [],
                'gleams' => $user ? $user->total_gleams : 0,
                'alicorns' => $user ? $user->total_alicorns : 0,
                'merit_level' => $user ? $user->merit_level : 'L0',
                'execution_score' => $user ? $user->execution_score : 0
            ]);
        }

        return response()->json([
            ...$progress->toArray(),
            'merit_level' => $user ? $user->merit_level : 'L0',
            'execution_score' => $user ? $user->execution_score : 0,
            'gleams' => $user ? $user->total_gleams : 0,
            'alicorns' => $user ? $user->total_alicorns : 0
        ]);
    }

    /**
     * Save authenticated user progress with merit calculation
     * (Frontend: POST /api/value-journey/progress/{userId})
     */
    public function saveUserProgress(Request $request, $userId)
    {
        $user = \App\Models\User::find($userId);
        $progress = ValueJourneyProgress::firstOrNew(['user_id' => $userId]);
        
        $progress->stakeholder = $request->input('stakeholder');
        $progress->current_level = $request->input('currentLevel');
        $progress->aspirational_level = $request->input('aspirationalLevel');
        $progress->is_aspirational = $request->input('isAspirational', false);
        $progress->answers = $request->input('answers', []);
        
        // Check if level was completed
        $levelCompleted = $request->input('levelCompleted');
        $answers = $request->input('answers', []);
        
        if ($levelCompleted && !empty($answers)) {
            // Calculate execution score and award gleams
            $result = $this->meritService->processAssessmentCompletion(
                $user,
                null, // No guest UUID for authenticated users
                $answers,
                $levelCompleted
            );
            
            // Store result in response for frontend
            $progress->gleams = $result['gleams_earned'];
            $progress->merit_level_info = $result;
        }
        
        if ($request->input('completed', false)) {
            $progress->completed_at = now();
        }

        $progress->save();

        return response()->json([
            'success' => true,
            'data' => $progress,
            'user' => [
                'merit_level' => $user->merit_level,
                'execution_score' => $user->execution_score,
                'total_gleams' => $user->total_gleams,
                'total_alicorns' => $user->total_alicorns
            ],
            'level_up_info' => $progress->merit_level_info ?? null
        ]);
    }
    
    /**
     * Save guest progress with gleam rewards
     */
    public function saveGuestProgress(Request $request)
    {
        $guestUuid = $request->input('guestUuid');
        
        if (!$guestUuid) {
            return response()->json(['error' => 'Guest UUID required'], 400);
        }
        
        $progress = ValueJourneyProgress::firstOrNew(['session_id' => $guestUuid]);
        $progress->guest_uuid = $guestUuid;
        $progress->stakeholder = $request->input('stakeholder');
        $progress->current_level = $request->input('currentLevel');
        $progress->aspirational_level = $request->input('aspirationalLevel');
        $progress->answers = $request->input('answers', []);
        
        // Check if level was completed
        $levelCompleted = $request->input('levelCompleted');
        $answers = $request->input('answers', []);
        
        if ($levelCompleted && !empty($answers)) {
            // Award gleams to guest
            $result = $this->meritService->processAssessmentCompletion(
                null, // No user
                $guestUuid,
                $answers,
                $levelCompleted
            );
            
            $progress->merit_level_info = $result;
        }
        
        $progress->save();
        
        // Get guest's total gleams
        $totalGleams = \App\Models\SocialEconomyLedger::where('guest_uuid', $guestUuid)->sum('gleams');
        $totalAlicorns = \App\Models\SocialEconomyLedger::where('guest_uuid', $guestUuid)->sum('alicorns');
        
        return response()->json([
            'success' => true,
            'data' => $progress,
            'guest' => [
                'total_gleams' => $totalGleams,
                'total_alicorns' => $totalAlicorns,
                'execution_score' => $result['execution_score'] ?? 0
            ]
        ]);
    }

    /**
     * Handle pause (Frontend: POST /api/value-journey/progress/{userId}/pause)
     */
    public function pauseProgress(Request $request, $userId)
    {
        // Simple acknowledgment for now, or update a 'status' field if we added one
        return response()->json(['success' => true, 'message' => 'Progress paused']);
    }
    
    /**
     * Migrate guest to authenticated user
     */
    public function migrateGuestToUser(Request $request)
    {
        $guestUuid = $request->input('guestUuid');
        $user = Auth::user();
        
        if (!$user || !$guestUuid) {
            return response()->json(['error' => 'Invalid request'], 400);
        }
        
        // Migrate social economy
        $migrated = $this->meritService->migrateGuestEconomy($guestUuid, $user);
        
        // Link guest progress to user
        ValueJourneyProgress::where('guest_uuid', $guestUuid)
            ->update(['user_id' => $user->id, 'session_id' => null]);
        
        // Update user's guest_uuid for reference
        $user->guest_uuid = $guestUuid;
        $user->save();
        
        return response()->json([
            'success' => true,
            'migrated' => $migrated,
            'user' => [
                'total_gleams' => $user->total_gleams,
                'total_alicorns' => $user->total_alicorns
            ]
        ]);
    }
}
