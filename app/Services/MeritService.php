<?php

namespace App\Services;

use App\Models\User;
use App\Models\SocialEconomyLedger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MeritService
{
    /**
     * Merit Level Thresholds
     */
    const MERIT_THRESHOLDS = [
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
    
    /**
     * Gleam rewards per level completion
     */
    const GLEAM_REWARDS = [
        'L1' => 50,
        'L2' => 75,
        'L3' => 100,
        'L4' => 150,
        'L5' => 200,
        'L6' => 300,
        'L7' => 400,
        'L8' => 500,
    ];
    
    /**
     * Calculate Execution Score based on 18 parameters from answerKeys
     * 
     * The 18 parameters come from:
     * - 3 Dimensions × 6 Stakeholders = 18 question responses
     * 
     * @param array $answers User's answers in format: ['L1' => ['Dimension1' => ['Stakeholder1' => grade, ...]]]
     * @return int Execution score (0-10000)
     */
    public function calculateExecutionScore(array $answers): int
    {
        $totalScore = 0;
        $maxPossibleScore = 0;
        $responseCount = 0;
        
        foreach ($answers as $level => $dimensions) {
            foreach ($dimensions as $dimension => $stakeholders) {
                foreach ($stakeholders as $stakeholder => $response) {
                    $responseCount++;
                    
                    // Each answer is graded 1-5
                    $grade = $response['grade'] ?? 1;
                    $totalScore += $grade;
                    $maxPossibleScore += 5; // Max grade is 5
                }
            }
        }
        
        if ($maxPossibleScore === 0) {
            return 0;
        }
        
        // Normalize to 0-10000 scale
        $normalizedScore = ($totalScore / $maxPossibleScore) * 10000;
        
        // Apply quality multipliers based on completion and consistency
        $completionRate = $responseCount / 18; // Expecting 18 parameters (3×6)
        $qualityMultiplier = 1 + ($completionRate * 0.2); // Up to 20% bonus for full completion
        
        $executionScore = (int) ($normalizedScore * $qualityMultiplier);
        
        return min($executionScore, 10000); // Cap at 10000
    }
    
    /**
     * Update user's execution score and check for level-up
     * 
     * @param User|null $user Authenticated user
     * @param string|null $guestUuid Guest UUID for unauthenticated users
     * @param array $answers User's answers
     * @param string $completedLevel The level just completed (e.g., 'L3')
     * @return array ['leveled_up' => bool, 'new_level' => string|null, 'gleams_earned' => int]
     */
    public function processAssessmentCompletion($user, ?string $guestUuid, array $answers, string $completedLevel): array
    {
        $executionScore = $this->calculateExecutionScore($answers);
        
        $leveledUp = false;
        $newLevel = null;
        $gleamsEarned = self::GLEAM_REWARDS[$completedLevel] ?? 50; // Default 50 gleams
        
        // Update execution score
        if ($user) {
            $user->execution_score = max($user->execution_score, $executionScore); // Keep highest score
            
            // Check for level-up
            $previousLevel = $user->merit_level;
            $qualifyingLevel = $this->getQualifyingLevel($executionScore);
            
            if ($this->isLevelHigher($qualifyingLevel, $previousLevel)) {
                $user->merit_level = $qualifyingLevel;
                $user->merit_level_updated_at = now();
                $leveledUp = true;
                $newLevel = $qualifyingLevel;
                
                // Bonus gleams for level-up
                $gleamsEarned += 100;
            }
            
            $user->save();
            
            // Award gleams to authenticated user
            $this->awardGleams($user, null, $gleamsEarned, 'earned_assessment', "{$completedLevel}_completion");
        } else {
            // Award gleams to guest
            $this->awardGleams(null, $guestUuid, $gleamsEarned, 'earned_assessment', "{$completedLevel}_completion");
        }
        
        return [
            'leveled_up' => $leveledUp,
            'new_level' => $newLevel,
            'gleams_earned' => $gleamsEarned,
            'execution_score' => $executionScore,
        ];
    }
    
    /**
     * Get the merit level user qualifies for based on execution score
     */
    protected function getQualifyingLevel(int $executionScore): string
    {
        $qualifyingLevel = 'L0';
        
        foreach (self::MERIT_THRESHOLDS as $level => $threshold) {
            if ($executionScore >= $threshold) {
                $qualifyingLevel = $level;
            }
        }
        
        return $qualifyingLevel;
    }
    
    /**
     * Check if levelA is higher than levelB
     */
    protected function isLevelHigher(string $levelA, string $levelB): bool
    {
        $indexA = array_search($levelA, array_keys(self::MERIT_THRESHOLDS));
        $indexB = array_search($levelB, array_keys(self::MERIT_THRESHOLDS));
        
        return $indexA !== false && $indexB !== false && $indexA > $indexB;
    }
    
    /**
     * Award Gleams to user or guest
     */
    public function awardGleams(?User $user, ?string $guestUuid, int $amount, string $transactionType = 'earned_assessment', ?string $context = null): void
    {
        SocialEconomyLedger::create([
            'user_id' => $user?->id,
            'guest_uuid' => $guestUuid,
            'gleams' => $amount,
            'alicorns' => 0,
            'transaction_type' => $transactionType,
            'source_context' => $context,
            'description' => "Earned {$amount} gleams from {$transactionType}",
        ]);
    }
    
    /**
     * Award Alicorns to user or guest
     */
    public function awardAlicorns(?User $user, ?string $guestUuid, int $amount, string $transactionType = 'earned_contribution', ?string $context = null): void
    {
        SocialEconomyLedger::create([
            'user_id' => $user?->id,
            'guest_uuid' => $guestUuid,
            'gleams' => 0,
            'alicorns' => $amount,
            'transaction_type' => $transactionType,
            'source_context' => $context,
            'description' => "Earned {$amount} alicorns from {$transactionType}",
        ]);
    }
    
    /**
     * Migrate guest gleams/alicorns to authenticated user
     * Called when guest converts to registered user
     */
    public function migrateGuestEconomy(string $guestUuid, User $user): array
    {
        return DB::transaction(function () use ($guestUuid, $user) {
            // Find all guest ledger entries
            $guestEntries = SocialEconomyLedger::where('guest_uuid', $guestUuid)->get();
            
            $totalGleams = $guestEntries->sum('gleams');
            $totalAlicorns = $guestEntries->sum('alicorns');
            
            if ($guestEntries->isEmpty()) {
                return ['gleams' => 0, 'alicorns' => 0];
            }
            
            // Create migration entry for the user
            SocialEconomyLedger::create([
                'user_id' => $user->id,
                'guest_uuid' => null,
                'gleams' => $totalGleams,
                'alicorns' => $totalAlicorns,
                'transaction_type' => 'guest_migration',
                'source_context' => $guestUuid,
                'description' => "Migrated {$totalGleams} gleams and {$totalAlicorns} alicorns from guest session {$guestUuid}",
            ]);
            
            // Mark original entries as migrated by updating them to point to user
            $guestEntries->each(function ($entry) use ($user) {
                $entry->update(['user_id' => $user->id]);
            });
            
            return [
                'gleams' => $totalGleams,
                'alicorns' => $totalAlicorns,
            ];
        });
    }
    
    /**
     * Get or create guest UUID for session
     */
    public function getOrCreateGuestUuid(?string $existingUuid = null): string
    {
        return $existingUuid ?? (string) Str::uuid();
    }
}
