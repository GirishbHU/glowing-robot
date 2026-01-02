<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EcosystemHubController extends Controller
{
    /**
     * Display a specialized homepage for a specific Role.
     */
    public function role(string $slug): Response
    {
        $meta = $this->getRoleMeta($slug);
        return Inertia::render('hubs/ecosystem-hub', [
            'type' => 'role',
            'slug' => $slug,
            'meta' => $meta,
            'filters' => ['stakeholder' => $meta['name'] ?? $slug]
        ]);
    }

    /**
     * Display a specialized homepage for a specific Level.
     */
    public function level(string $slug): Response
    {
        $meta = $this->getLevelMeta($slug);
        return Inertia::render('hubs/ecosystem-hub', [
            'type' => 'level',
            'slug' => $slug,
            'meta' => $meta,
            'filters' => ['level' => strtoupper($slug)]
        ]);
    }

    /**
     * Display a specialized homepage for a specific Sector.
     */
    public function sector(string $slug): Response
    {
        $meta = $this->getSectorMeta($slug);
        return Inertia::render('hubs/ecosystem-hub', [
            'type' => 'sector',
            'slug' => $slug,
            'meta' => $meta,
            'filters' => ['sector' => $meta['name'] ?? $slug]
        ]);
    }

    /**
     * Display a specialized homepage for a specific Region.
     */
    public function region(string $slug): Response
    {
        $meta = $this->getRegionMeta($slug);
        return Inertia::render('hubs/ecosystem-hub', [
            'type' => 'region',
            'slug' => $slug,
            'meta' => $meta,
            'filters' => ['region' => $meta['id'] ?? $slug]
        ]);
    }

    /**
     * Display a specialized homepage for a specific Rationale Dimension.
     */
    public function rationale(string $slug): Response
    {
        $meta = $this->getRationaleMeta($slug);
        return Inertia::render('hubs/ecosystem-hub', [
            'type' => 'rationale',
            'slug' => $slug,
            'meta' => $meta,
            'filters' => ['dimension' => $meta['name'] ?? $slug]
        ]);
    }

    /**
     * Display a specialized homepage for a specific Elephant in the Room (Risk).
     */
    public function eitr(string $slug): Response
    {
        $meta = $this->getEitrMeta($slug);
        return Inertia::render('hubs/ecosystem-hub', [
            'type' => 'eitr',
            'slug' => $slug,
            'meta' => $meta,
            'filters' => ['risk' => $meta['name'] ?? $slug]
        ]);
    }

    private function getRoleMeta(string $slug): array
    {
        $roles = [
            'founder' => ['name' => 'Startup (Founder)', 'title' => 'The Founder\'s Forge', 'icon' => '🚀', 'tagline' => 'Where visionaries build the future.'],
            'investor' => ['name' => 'Investor', 'title' => 'The Capital Hub', 'icon' => '💰', 'tagline' => 'Backing the next generation of giants.'],
            'talent' => ['name' => 'Professional (Talent)', 'title' => 'The Talent Square', 'icon' => '👤', 'tagline' => 'Connecting builders to missions.'],
            'accelerator' => ['name' => 'Enabler (Accelerator)', 'title' => 'The Growth Engine', 'icon' => '⚡', 'tagline' => 'Catalyzing ecosystem velocity.'],
        ];

        return $roles[$slug] ?? ['name' => ucfirst($slug), 'title' => ucfirst($slug) . ' Hub', 'icon' => '🌐', 'tagline' => 'Building the ecosystem together.'];
    }

    private function getLevelMeta(string $slug): array
    {
        $levels = [
            'l0' => ['name' => 'L0 Spark', 'title' => 'The Spark Sanctuary', 'icon' => '🔥', 'tagline' => 'Where every great journey begins.'],
            'l7' => ['name' => 'L7 Unicorn', 'title' => 'The Unicorn Grove', 'icon' => '🦄', 'tagline' => 'Home to the world\'s most impactful builders.'],
            'l3' => ['name' => 'L3 Launch', 'title' => 'The Launchpad', 'icon' => '🚀', 'tagline' => 'Breaking orbit and scaling new heights.'],
        ];

        return $levels[strtolower($slug)] ?? ['name' => strtoupper($slug), 'title' => 'Level ' . strtoupper($slug), 'icon' => '📈', 'tagline' => 'Advancing through the value journey.'];
    }

    private function getSectorMeta(string $slug): array
    {
        $sectors = [
            'deeptech' => ['name' => 'DeepTech', 'title' => 'The DeepTech Frontier', 'icon' => '🧬', 'tagline' => 'Pushing the boundaries of science and engineering.'],
            'fintech' => ['name' => 'FinTech', 'title' => 'The Finance Hub', 'icon' => '🏦', 'tagline' => 'Revolutionizing the world of value exchange.'],
            'healthtech' => ['name' => 'HealthTech', 'title' => 'The Vitality Square', 'icon' => '🩺', 'tagline' => 'Innovating for a healthier tomorrow.'],
            'greentech' => ['name' => 'GreenTech', 'title' => 'The Sustainability Sphere', 'icon' => '🌱', 'tagline' => 'Building a resilient planet for future generations.'],
            'consumer' => ['name' => 'Consumer', 'title' => 'The Consumer Plaza', 'icon' => '🛍️', 'tagline' => 'Connecting brands with the pulse of culture.'],
            'enterprise' => ['name' => 'Enterprise', 'title' => 'The B2B Fortress', 'icon' => '🏢', 'tagline' => 'Empowering organizations to scale and succeed.'],
            'industrial' => ['name' => 'Industrial', 'title' => 'The Industrial Forge', 'icon' => '🏗️', 'tagline' => 'Building the physical infrastructure of the world.'],
            'edtech' => ['name' => 'EdTech', 'title' => 'The Learning Lab', 'icon' => '🎓', 'tagline' => 'Unlocking potential through knowledge.'],
            'govtech' => ['name' => 'GovTech', 'title' => 'The Civic Center', 'icon' => '🏛️', 'tagline' => 'Innovating for the public good.'],
        ];

        return $sectors[strtolower($slug)] ?? ['name' => ucfirst($slug), 'title' => ucfirst($slug) . ' Sector', 'icon' => '🛠️', 'tagline' => 'Innovation across every industry.'];
    }

    private function getRegionMeta(string $slug): array
    {
        $regions = [
            'north-america' => ['id' => 'North America', 'title' => 'The North American Nexus', 'icon' => '🦅', 'tagline' => 'The birthplace of the modern startup ecosystem.'],
            'latin-america' => ['id' => 'Latin America', 'title' => 'The LatAm Pulse', 'icon' => '💃', 'tagline' => 'Vibrant innovation from the Rio Grande to Patagonia.'],
            'western-europe' => ['id' => 'Western Europe', 'title' => 'The European Union', 'icon' => '🇪🇺', 'tagline' => 'History meets future in the old world.'],
            'eastern-europe' => ['id' => 'Eastern Europe', 'title' => 'The Eastern Frontier', 'icon' => '🏰', 'tagline' => 'Technical brilliance rising from the east.'],
            'mena' => ['id' => 'MENA', 'title' => 'The MENA Oasis', 'icon' => '🐪', 'tagline' => 'Bridging continents with ambition and capital.'],
            'sub-saharan-africa' => ['id' => 'Sub-Saharan Africa', 'title' => 'The African Horizon', 'icon' => '🦁', 'tagline' => 'The brooding giant of global innovation.'],
            'central-south-asia' => ['id' => 'Central & South Asia', 'title' => 'The Asian Tiger', 'icon' => '🐅', 'tagline' => 'A billion dreams rising.'],
            'east-asia' => ['id' => 'East Asia', 'title' => 'The Dragon\'s Den', 'icon' => '🐉', 'tagline' => 'Technological supremacy at scale.'],
            'oceania' => ['id' => 'Oceania', 'title' => 'The Oceanic Frontier', 'icon' => '🌊', 'tagline' => 'Leading innovation across the Pacific.'],
        ];

        return $regions[strtolower($slug)] ?? ['id' => ucfirst($slug), 'title' => ucfirst($slug) . ' Hub', 'icon' => '🗺️', 'tagline' => 'Local vision, global impact.'];
    }

    private function getRationaleMeta(string $slug): array
    {
        $dims = [
            'team' => ['name' => 'Team', 'title' => 'The Human Capital', 'icon' => '👥', 'tagline' => 'The engine of the enterprise.'],
            'product' => ['name' => 'Product', 'title' => 'The Solution', 'icon' => '📦', 'tagline' => 'Solving real problems for real people.'],
            'market' => ['name' => 'Market', 'title' => 'The Arena', 'icon' => '🎯', 'tagline' => 'Understanding the battlefield.'],
            'model' => ['name' => 'Model', 'title' => 'The Business Model', 'icon' => '📊', 'tagline' => 'Capturing value from innovation.'],
            'tech' => ['name' => 'Technology', 'title' => 'The Tech Stack', 'icon' => '💻', 'tagline' => 'The foundation of scalability.'],
            'legal' => ['name' => 'Legal', 'title' => 'The Legal Framework', 'icon' => '⚖️', 'tagline' => 'Building on solid ground.'],
            'finance' => ['name' => 'Finance', 'title' => 'The Financial Health', 'icon' => '💰', 'tagline' => 'Fueling the journey.'],
            'ops' => ['name' => 'Operations', 'title' => 'The Operational Excellence', 'icon' => '⚙️', 'tagline' => 'Execution is everything.'],
            'impact' => ['name' => 'Impact', 'title' => 'The Global Impact', 'icon' => '🌍', 'tagline' => 'Making a difference beyond profit.'],
        ];
        return $dims[strtolower($slug)] ?? ['name' => ucfirst($slug), 'title' => ucfirst($slug) . ' Dimension', 'icon' => '🧠', 'tagline' => 'A core pillar of the 9x9x9 Matrix.'];
    }

    private function getEitrMeta(string $slug): array
    {
        $eitrs = [
            'conflict' => ['name' => 'Co-Founder Conflict', 'title' => 'Managing Conflict', 'icon' => '⚔️', 'tagline' => 'Aligning visions, resolving disputes.'],
            'burn' => ['name' => 'Burn Rate', 'title' => 'Burn Rate Control', 'icon' => '🔥', 'tagline' => 'Extending the runway.'],
            'unit-economics' => ['name' => 'Unit Economics', 'title' => 'Unit Economics', 'icon' => '📉', 'tagline' => 'Profitability at the unit level.'],
            'tech-debt' => ['name' => 'Technical Debt', 'title' => 'Tech Debt Management', 'icon' => '🏗️', 'tagline' => 'Building for the long haul.'],
            'regulatory' => ['name' => 'Regulatory Risk', 'title' => 'Regulatory Compliance', 'icon' => '🏛️', 'tagline' => 'Navigating the rules of the game.'],
            'market' => ['name' => 'Market Shift', 'title' => 'Market Dynamics', 'icon' => '🌪️', 'tagline' => 'Adapting to the winds of change.'],
            'key-man' => ['name' => 'Key Man Risk', 'title' => 'Key Person Risk', 'icon' => '🔑', 'tagline' => 'Decentralizing critical knowledge.'],
            'cap-table' => ['name' => 'Cap Table', 'title' => 'Cap Table Hygiene', 'icon' => '🍰', 'tagline' => 'Fair ownership for future growth.'],
            'culture' => ['name' => 'Toxic Culture', 'title' => 'Culture Guard', 'icon' => '☣️', 'tagline' => 'Protecting the soul of the startup.'],
        ];
        return $eitrs[strtolower($slug)] ?? ['name' => ucfirst($slug), 'title' => ucfirst($slug) . ' Risk', 'icon' => '⚠️', 'tagline' => 'An elephant in the room.'];
    }
}
