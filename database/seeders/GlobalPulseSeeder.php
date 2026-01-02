<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GlobalPulseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('aggregated_leaderboards')->truncate();
        DB::table('pulses')->truncate();

        $stakeholders = ['Founder', 'Investor', 'Talent'];
        $regions = ['North America', 'Western Europe', 'East Asia', 'MENA', 'Latin America'];
        $sectors = ['FinTech', 'AI/ML', 'GreenTech', 'HealthTech'];
        $sources = ['TechCrunch', 'Bloomberg', 'Internal', 'VentureBeat', 'Forbes'];

        $companyNames = [
            'Nexus AI', 'Solaris', 'QuantumLeap', 'BioGen', 'FinFlow', 'EcoSphere', 'Nebula Dynamics', 
            'Stellar Systems', 'Apex Logic', 'Vortex Energy', 'CryptoVault', 'MedCore', 'EduVerse'
        ];

        // 1. Seed Aggregated Leaderboard
        foreach ($companyNames as $index => $name) {
            $source = $sources[array_rand($sources)];
            $internal = rand(70, 99);
            $external = rand(60, 95);
            $weighted = ($internal * 0.4) + ($external * 0.6);

            DB::table('aggregated_leaderboards')->insert([
                'stakeholder_type' => $stakeholders[array_rand($stakeholders)],
                'region' => $regions[array_rand($regions)],
                'sector' => $sectors[array_rand($sectors)],
                'source_name' => $source,
                'internal_score' => $internal,
                'external_score' => $external,
                'weighted_average_score' => $weighted,
                'rank' => $index + 1,
                'entity_name' => $name,
                'metadata' => json_encode(['change' => rand(-5, 15) . '%', 'trend' => rand(0, 1) ? 'up' : 'down']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Seed Pulses (The Live Feed)
        $actions = [
            "raised Series A", "launched a new protocol", "hit 1M ARR", "acquired a competitor", 
            "expanded to MENA", "released 'Project Titan'", "secured a government contract"
        ];

        // News Pulses
        for ($i = 0; $i < 15; $i++) {
            $company = $companyNames[array_rand($companyNames)];
            $action = $actions[array_rand($actions)];
            $sector = $sectors[array_rand($sectors)];
            $region = $regions[array_rand($regions)];

            DB::table('pulses')->insert([
                'type' => 'news',
                'content' => "**$company** just $action in **$region** ($sector).",
                'related_entity_type' => 'AggregatedLeaderboard',
                'engagement_metrics' => json_encode(['likes' => rand(10, 500), 'shares' => rand(5, 100)]),
                'region' => $region,
                'sector' => $sector,
                'created_at' => Carbon::now()->subMinutes(rand(1, 1440)), // Past 24 hours
                'updated_at' => now(),
            ]);
        }

        // System Challenges/Kudos (Existing)
        $challenges = [
            "Can you beat **Solaris** in GreenTech? Their score just hit 94.2.",
            "Who is the top Founder in **East Asia**? Check the Leaderboard.",
            "New 'Unicorn' badge unlocked by **Nexus AI**. Are you next?",
            "* # ^ Investor sentiment in **FinTech** is up 12% this week.",
            "🚀 **SYSTEM ANNOUNCEMENT:** Celebrating the rise of the **Global Startup Ecosystem Booster** in this emerging era of AI! Let's build the future together. 🌍✨"
        ];

        foreach ($challenges as $msg) {
            DB::table('pulses')->insert([
                'type' => 'challenge',
                'content' => $msg,
                'engagement_metrics' => json_encode(['likes' => rand(50, 1000), 'shares' => rand(20, 200)]),
                'virality_score' => rand(50, 1000), // Base score
                'created_at' => Carbon::now()->subMinutes(rand(1, 300)),
                'updated_at' => now(),
                // Identity: The Concierge
                'is_guest' => true,
                'session_id' => 'system-concierge-001',
                'author_name' => 'Ecosystem Concierge 🤖',
                'author_info' => json_encode(['role' => 'System Guide', 'location' => ' The Matrix', 'is_fancy' => true]),
            ]);
        }

        // 3. Seed Ideas, Opinions, Suggestions (New for Leaderboards)
        $userTypes = ['Founder', 'Investor', 'Expert'];
        
        $ideas = [
            "We should decentralize the verification process using ZK-proofs.",
            "Why don't we have a 'Failure Hall of Fame' to learn from mistakes?",
            "Proposal: A specialized hub for 'SpaceTech' distinct from DeepTech.",
            "Let's integrate a 'Co-Founder Matching' algorithm based on psychometrics."
        ];

        $opinions = [
            "The current valuation metrics for Seed stage are broken.",
            "Remote-first is the only way to scale a modern unicorn properly.",
            "AI won't replace founders, but founders using AI will replace those who don't.",
            "The 'Growth at all costs' era is dead. Long live sustainable profits."
        ];

        // Seed Ideas
        foreach ($ideas as $idea) {
            DB::table('pulses')->insert([
                'type' => 'user_post',
                'category' => 'idea',
                'content' => $idea,
                'engagement_metrics' => json_encode(['likes' => rand(100, 5000), 'shares' => rand(50, 500)]),
                'virality_score' => rand(500, 5000), // varying engagement
                'created_at' => Carbon::now()->subHours(rand(1, 24)), // Past 24h (good for 'Today' leaderboard)
                'updated_at' => now(),
            ]);
        }
        
         // Seed Opinions
        foreach ($opinions as $op) {
            DB::table('pulses')->insert([
                'type' => 'user_post',
                'category' => 'opinion',
                'content' => $op,
                'engagement_metrics' => json_encode(['likes' => rand(200, 3000), 'shares' => rand(20, 300)]),
                'virality_score' => rand(400, 4000),
                'created_at' => Carbon::now()->subMinutes(rand(1, 60)), // Past Hour (good for 'Hour' leaderboard)
                'updated_at' => now(),
            ]);
        }
    }
}
