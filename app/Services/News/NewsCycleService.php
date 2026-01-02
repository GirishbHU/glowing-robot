<?php

namespace App\Services\News;

use App\Models\NewsCycle;
use Carbon\Carbon;

class NewsCycleService
{
    // The 9 Stakeholders in order
    const CYCLE_ORDER = [
        'Startup',
        'Investor / VC',
        'Mentor / Advisor',
        'Accelerator',
        'Incubator',
        'Service Provider',
        'Research / Academic',
        'Government / Policy',
        'Ecosystem'
    ];

    /**
     * Get or create the current active news cycle
     */
    public function getCurrentCycle(): NewsCycle
    {
        $now = Carbon::now();
        
        // Find active cycle
        $active = NewsCycle::where('status', 'active')
            ->where('end_time', '>', $now)
            ->first();

        if ($active) {
            return $active;
        }

        // If no active cycle, check for next scheduled one or create new
        return $this->rotateCycle();
    }

    /**
     * Rotate to the next day in the cycle
     */
    public function rotateCycle(): NewsCycle
    {
        // Close any old active cycles
        NewsCycle::where('status', 'active')->update(['status' => 'completed']);

        // Find the last cycle to determine next step
        $last = NewsCycle::latest('id')->first();
        
        $nextDayNumber = 1;
        $batchId = (string) \Illuminate\Support\Str::uuid();

        if ($last) {
            $nextDayNumber = ($last->day_number % 9) + 1;
            $batchId = $nextDayNumber === 1 ? (string) \Illuminate\Support\Str::uuid() : $last->batch_id;
        }

        $stakeholder = self::CYCLE_ORDER[$nextDayNumber - 1];

        // Create new cycle (24 hour duration)
        $newCycle = NewsCycle::create([
            'batch_id' => $batchId,
            'day_number' => $nextDayNumber,
            'stakeholder_focus' => $stakeholder,
            'start_time' => Carbon::now(),
            'end_time' => Carbon::now()->addHours(24),
            'status' => 'active'
        ]);

        return $newCycle;
    }

    public function getCycleStatus(): array
    {
        $current = $this->getCurrentCycle();
        
        return [
            'day' => $current->day_number,
            'total_days' => 9,
            'focus' => $current->stakeholder_focus,
            'ends_in' => $current->end_time->diffForHumans(),
            'batch_id' => $current->batch_id
        ];
    }
}
