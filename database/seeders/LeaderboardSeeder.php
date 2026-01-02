<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Added DB Facade
use App\Models\LeaderboardEntry;
use App\Models\NewsFeedItem;

class LeaderboardSeeder extends Seeder
{
    public function run(): void
    {
        LeaderboardEntry::truncate();
        NewsFeedItem::truncate();
        DB::table('pulses')->where('type', 'news')->delete(); // Clear old news pulses

        // 9 Global Regions
        $regionMap = [
            'North America' => ['United States of America', 'Canada', 'Mexico'],
            'Latin America' => ['Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Uruguay', 'Mexico', 'Costa Rica'], // Mexico could be NA/LatAm, decided NA above or LatAm here. Let's strictly keep Mexico in NA context usually but culturally LatAm. Let's put Mexico in LatAm for this breakdown? User asked for 9 regions. Standard UN: Mexico is Central America/LatAm. Let's move Mexico to LatAm.
            'Western Europe' => ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Spain', 'Italy', 'Ireland', 'Portugal', 'Belgium'],
            'Eastern Europe' => ['Poland', 'Estonia', 'Ukraine', 'Romania', 'Czechia', 'Lithuania', 'Hungary', 'Bulgaria', 'Serbia'],
            'MENA' => ['Israel', 'United Arab Emirates', 'Saudi Arabia', 'Egypt', 'Turkey', 'Qatar', 'Morocco', 'Jordan', 'Kuwait', 'Bahrain'],
            'Sub-Saharan Africa' => ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Rwanda', 'Ethiopia', 'Tanzania', 'Uganda', 'Senegal'],
            'Central & South Asia' => ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Kazakhstan', 'Uzbekistan', 'Nepal'],
            'East Asia' => ['China', 'Japan', 'South Korea', 'Singapore', 'Indonesia', 'Vietnam', 'Philippines', 'Thailand', 'Malaysia', 'Taiwan', 'Hong Kong'],
            'Oceania' => ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea']
        ];
        // Note: 'Americas' split into North & Latin. 'Europe' split. 'Asia' split. 'MEA' split.
        // Re-verify mappings. Mexico in North America for NAFTA usually, but LatAm for startup culture? Let's keep Mexico in Latin America for this ecosystem view.

        // 9 Super Sectors
        $superSectorMap = [
            'DeepTech' => ['AI/ML', 'SpaceTech', 'Quantum Computing', 'Robotics', 'Semiconductors', 'Defense', 'Autonomous Vehicles'],
            'FinTech' => ['Banking', 'Crypto', 'Blockchain', 'Payments', 'InsurTech', 'WealthTech', 'DeFi'],
            'HealthTech' => ['Biotech', 'MedTech', 'Digital Health', 'Pharma', 'Genomics', 'Wellness', 'Elder Care'],
            'GreenTech' => ['CleanTech', 'Energy', 'Sustainability', 'AgTech', 'Climate', 'Solar', 'EVs', 'Carbon Capture'],
            'Consumer' => ['E-commerce', 'Gaming', 'Social Media', 'Media', 'Fashion', 'Direct to Consumer', 'Travel', 'Food & Beverage'],
            'Enterprise' => ['B2B Software', 'SaaS', 'Cybersecurity', 'Cloud Computing', 'Big Data', 'HR Tech', 'LegalTech', 'Logistics'],
            'Industrial' => ['Manufacturing', 'Construction', 'Mining', 'Automotive', 'Chemicals', 'Materials Science', 'IoT'],
            'EdTech' => ['Education', 'Online Learning', 'Training', 'Future of Work', 'Recruiting'],
            'GovTech' => ['Smart Cities', 'GovTech', 'Policy', 'Non-profit', 'Civic Tech', 'Infrastructure']
        ];

        $stakeholders = ['Founder', 'Investor', 'Mentor', 'Partner', 'Enabler', 'Facilitator', 'Media', 'Government', 'Talent']; // 9 Stakeholders
        
        $names = [
            "Cosmic", "Epic", "Brilliant", "Dynamic", "Fierce", "Galactic", "Heroic", "Infinite", "Jovial", "Keen",
            "Luminous", "Mystic", "Noble", "Omega", "Prime", "Quantum", "Rising", "Stellar", "Titan", "Ultimate",
            "Solar", "Lunar", "Astral", "Nebula", "Comet", "Meteor", "Pulsar", "Quasar", "Zenith", "Apex",
            "Vortex", "Nova", "Radiant", "Grand", "Super", "Hyper", "Ultra", "Mega", "Giga", "Tera"
        ];
        
        $roles = [
            "Pioneer", "Voyager", "Dragon", "Titan", "Phoenix", "Sage", "Legend", "Star", "Maverick", "Visionary",
            "Oracle", "Founder", "Crusader", "Builder", "Catalyst", "Thinker", "Unicorn", "Achiever", "Maker", "Dreamer",
            "Innovator", "Creator", "Strategist", "Architect", "Engineer", "Scientist", "Artist", "Explorer", "Leader", "Captain",
            "Master", "Expert", "Guru", "Wizard", "Genius", "Prodigy", "Virtuoso", "Champion", "Hero", "Victor"
        ];

        $newsSources = ['TechCrunch', 'Bloomberg', 'Forbes', 'Wired', 'The Verg', 'VentureBeat', 'Local Daily'];

        // Seed 2000 Entries for rich density
        for ($i = 0; $i < 2000; $i++) {
            $rank = $i + 1;
            $sh = $stakeholders[array_rand($stakeholders)];
            $name = $names[array_rand($names)] . " " . $roles[array_rand($roles)];
            
            // 1. Pick Super Sector
            $superSectorKeys = array_keys($superSectorMap);
            $superSector = $superSectorKeys[array_rand($superSectorKeys)];
            // 2. Pick Sub-Sector
            $subSector = $superSectorMap[$superSector][array_rand($superSectorMap[$superSector])];

            // 3. Pick Region
            $regionKeys = array_keys($regionMap);
            $region = $regionKeys[array_rand($regionKeys)];
            // 4. Pick Country
            $country = $regionMap[$region][array_rand($regionMap[$region])];

            LeaderboardEntry::create([
                'stakeholder' => $sh,
                'rank' => $rank,
                'name' => $name,
                'country' => $country,
                'region' => $region,
                'super_sector' => $superSector,
                'sector' => $subSector,
                'gleams' => max(0, 50000 - ($i * 20) + rand(-500, 500)),
                'alicorns' => max(0, 500 - ($i * 0.2)),
                'level' => 'L' . rand(1, 9), 
                'trend' => ['up', 'down', 'same'][rand(0, 2)],
                'updated_at' => now()->subMinutes(rand(0, 10000))
            ]);
        }
        
        // Seed News for 9x9 Matrix
        // Per Region
        foreach (array_keys($regionMap) as $reg) {
            for ($j = 0; $j < 3; $j++) {
                $title = "$reg Ecosystem Q1 Report: Growth in " . $superSectorKeys[array_rand($superSectorKeys)];
                $source = $newsSources[array_rand($newsSources)];

                NewsFeedItem::create([
                    'stakeholder' => $stakeholders[array_rand($stakeholders)],
                    'title' => $title,
                    'source' => $source,
                    'category' => 'Market',
                    'url' => '#',
                    'emoji' => '🌏',
                    'region' => $reg,
                    'published_at' => now()->subHours(rand(1, 48))
                ]);

                // Also seed into Pulse Feed
                DB::table('pulses')->insert([
                    'type' => 'news',
                    'content' => "$title (Source: $source)",
                    'category' => 'opinion',
                    'is_guest' => true,
                    'session_id' => 'system',
                    'author_name' => $source,
                    'author_info' => json_encode(['badges' => ['News 📰', 'Global 🌏']]),
                    // activity_type and status removed
                    'engagement_metrics' => json_encode(['likes' => rand(50, 500), 'shares' => rand(10, 100)]),
                    'virality_score' => rand(75, 1000),
                    'created_at' => now()->subHours(rand(1, 48)),
                    'updated_at' => now()->subHours(rand(1, 48)),
                ]);
            }
        }

        // Per Super Sector
        foreach (array_keys($superSectorMap) as $ss) {
            for ($j = 0; $j < 3; $j++) {
                $title = "$ss Breakthroughs: Top 10 Startups to Watch";
                $source = "VentureBeat";

                NewsFeedItem::create([
                    'stakeholder' => 'All',
                    'title' => $title,
                    'source' => $source,
                    'category' => 'Innovation',
                    'url' => '#',
                    'emoji' => '🚀',
                    'super_sector' => $ss,
                    'published_at' => now()->subHours(rand(1, 48))
                ]);

                // Also seed into Pulse Feed
                DB::table('pulses')->insert([
                    'type' => 'news',
                    'content' => "$title (Source: $source)",
                    'category' => 'idea',
                    'is_guest' => true,
                    'session_id' => 'system',
                    'author_name' => $source,
                    'author_info' => json_encode(['badges' => ['News 📰', 'Trending 🚀']]),
                    'activity_type' => 'posted',
                    'status' => 'active',
                    'engagement_metrics' => json_encode(['likes' => rand(100, 1000), 'shares' => rand(50, 200)]),
                    'virality_score' => rand(200, 2000),
                    'created_at' => now()->subHours(rand(1, 48)),
                    'updated_at' => now()->subHours(rand(1, 48)),
                ]);
            }
        }
    }
}
