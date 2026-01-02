<?php

namespace App\Http\Controllers;

use App\Services\News\NewsCycleService;
use App\Services\News\NewsServiceInterface;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    protected $newsService;
    protected $cycleService;

    public function __construct(NewsServiceInterface $newsService, NewsCycleService $cycleService)
    {
        $this->newsService = $newsService;
        $this->cycleService = $cycleService;
    }

    /**
     * Get current cycle status and relevant trends
     */
    public function trends(Request $request)
    {
        // 1. Get current cycle context
        $cycle = $this->cycleService->getCurrentCycle();
        $cycleStatus = $this->cycleService->getCycleStatus();

        // 2. Determine query based on cycle focus
        $query = $this->buildQueryForStakeholder($cycle->stakeholder_focus);
        
        // 3. Fetch trends (cached in production)
        $trends = $this->newsService->fetchTrends($query, 10);

        return response()->json([
            'cycle' => $cycleStatus,
            'trends' => $trends
        ]);
    }

    protected function buildQueryForStakeholder(string $stakeholder): string
    {
        // Map stakeholders to search queries
        $map = [
            'Startup' => 'startup OR "new business" OR entrepreneur',
            'Investor / VC' => '"venture capital" OR investment OR funding',
            'Mentor / Advisor' => 'mentorship OR "business advice" OR coaching',
            'Accelerator' => '"startup accelerator" OR ycombinator OR techstars',
            'Incubator' => '"business incubator" OR "innovation hub"',
            'Service Provider' => 'consulting OR "legal services" OR accounting',
            'Research / Academic' => '"university research" OR R&D OR innovation',
            'Government / Policy' => 'regulation OR "business policy" OR subsidy',
            'Ecosystem' => '"startup ecosystem" OR "community building"'
        ];

        return $map[$stakeholder] ?? 'technology';
    }
}
