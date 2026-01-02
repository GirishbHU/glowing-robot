<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Services\MeritService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    protected $meritService;
    
    public function __construct(MeritService $meritService)
    {
        $this->meritService = $meritService;
    }
    
    public function index()
    {
        $answers = Answer::all();
        
        if ($answers->isEmpty()) {
            return response()->json([
                'success' => false,
                'error' => 'empty_database',
                'message' => 'The question database is initializing. Please run the seeder.'
            ], 503); // Service Unavailable
        }

        $formatted = [];

        foreach ($answers as $answer) {
            $formatted[$answer->level_id]['levelName'] = $answer->level_name;
            
            // Initialize questions array if not exists
            if (!isset($formatted[$answer->level_id]['questions'])) {
                $formatted[$answer->level_id]['questions'] = [];
            }

            // Initialize specific dimension/question if not exists
            if (!isset($formatted[$answer->level_id]['questions'][$answer->dimension_id])) {
                $formatted[$answer->level_id]['questions'][$answer->dimension_id] = [
                    'type' => 'Dimension', // Default or fetch if stored
                    'gleams' => $answer->gleams,
                    'alicorns' => $answer->alicorns,
                    'stakeholders' => []
                ];
            }

            $formatted[$answer->level_id]['questions'][$answer->dimension_id]['stakeholders'][$answer->stakeholder] = [
                'question' => $answer->question,
                'grades' => [
                    '1' => $answer->grade_1,
                    '2' => $answer->grade_2,
                    '3' => $answer->grade_3,
                    '4' => $answer->grade_4,
                    '5' => $answer->grade_5,
                ]
            ];
        }

        return response()->json($formatted);
    }
    
    /**
     * Submit an answer and calculate sub-score
     * Award Gleams immediately for section completion
     */
    public function submitAnswer(Request $request)
    {
        $validated = $request->validate([
            'level' => 'required|string',
            'dimension' => 'required|string',
            'stakeholder' => 'required|string',
            'grade' => 'required|integer|min:1|max:5',
            'guestUuid' => 'nullable|string',
            'sectionCompleted' => 'boolean'
        ]);
        
        $user = Auth::user();
        $guestUuid = $validated['guestUuid'] ?? null;
        
        // Calculate sub-score for this answer (grade 1-5)
        $subScore = $validated['grade'] * 20; // Normalize to 0-100 range per answer
        
        // Prepare response
        $response = [
            'success' => true,
            'sub_score' => $subScore,
            'grade' => $validated['grade'],
            'gleams_earned' => 0,
            'section_bonus' => 0
        ];
        
        // If section (dimension) is completed, award gleams
        if ($validated['sectionCompleted'] ?? false) {
            $sectionGleams = 25; // Base gleams per dimension completion
            
            // Award to user or guest
            $this->meritService->awardGleams(
                $user,
                $guestUuid,
                $sectionGleams,
                'earned_assessment',
                "{$validated['level']}_{$validated['dimension']}"
            );
            
            $response['gleams_earned'] = $sectionGleams;
            $response['section_bonus'] = true;
        }
        
        // Get updated totals
        if ($user) {
            $response['totals'] = [
                'gleams' => $user->total_gleams,
                'alicorns' => $user->total_alicorns,
                'execution_score' => $user->execution_score,
                'merit_level' => $user->merit_level
            ];
        } else if ($guestUuid) {
            $totalGleams = \App\Models\SocialEconomyLedger::where('guest_uuid', $guestUuid)->sum('gleams');
            $totalAlicorns = \App\Models\SocialEconomyLedger::where('guest_uuid', $guestUuid)->sum('alicorns');
            
            $response['totals'] = [
                'gleams' => $totalGleams,
                'alicorns' => $totalAlicorns,
                'execution_score' => 0,
                'merit_level' => 'L0'
            ];
        }
        
        return response()->json($response);
    }
    
    /**
     * Get user's current merit status
     */
    public function getMeritStatus(Request $request)
    {
        $user = Auth::user();
        $guestUuid = $request->input('guestUuid');
        
        if ($user) {
            return response()->json([
                'merit_level' => $user->merit_level,
                'execution_score' => $user->execution_score,
                'total_gleams' => $user->total_gleams,
                'total_alicorns' => $user->total_alicorns,
                'next_level_threshold' => $this->getNextLevelThreshold($user->merit_level),
                'progress_percentage' => $this->calculateProgressPercentage($user->merit_level, $user->execution_score)
            ]);
        } else if ($guestUuid) {
            $totalGleams = \App\Models\SocialEconomyLedger::where('guest_uuid', $guestUuid)->sum('gleams');
            $totalAlicorns = \App\Models\SocialEconomyLedger::where('guest_uuid', $guestUuid)->sum('alicorns');
            
            return response()->json([
                'merit_level' => 'L0',
                'execution_score' => 0,
                'total_gleams' => $totalGleams,
                'total_alicorns' => $totalAlicorns,
                'next_level_threshold' => 100,
                'progress_percentage' => 0
            ]);
        }
        
        return response()->json(['error' => 'No user or guest UUID provided'], 400);
    }
    
    /**
     * Get the next level threshold for current merit level
     */
    protected function getNextLevelThreshold(string $currentLevel): int
    {
        $thresholds = [
            'L0' => 100,
            'L1' => 300,
            'L2' => 600,
            'L3' => 1000,
            'L4' => 1500,
            'L5' => 2200,
            'L6' => 3000,
            'L7' => 4000,
            'L8' => null, // Max level
        ];
        
        return $thresholds[$currentLevel] ?? null;
    }
    
    /**
     * Calculate progress percentage to next level
     */
    protected function calculateProgressPercentage(string $currentLevel, int $currentScore): float
    {
        $allThresholds = [
            'L0' => 0,
            'L1' => 100,
            'L2' => 300,
            'L3' => 600,
            'L4' => 1000,
            'L5' => 1500,
            'L6' => 2200,
            'L7' => 3000,
            'L8' => 4000,
        ];
        
        $currentThreshold = $allThresholds[$currentLevel];
        $nextThreshold = $this->getNextLevelThreshold($currentLevel);
        
        if ($nextThreshold === null) {
            return 100; // Max level reached
        }
        
        $progress = (($currentScore - $currentThreshold) / ($nextThreshold - $currentThreshold)) * 100;
        return min(max($progress, 0), 100); // Clamp between 0-100
    }
}
