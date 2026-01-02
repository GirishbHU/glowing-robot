<?php

namespace App\Console\Commands;

use App\Services\GroqService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ConciergeSpeak extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'concierge:speak {topic? : Optional topic/context for the pulse}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Trigger the Ecosystem Concierge to post an AI-generated pulse.';

    /**
     * Execute the console command.
     */
    public function handle(GroqService $groq)
    {
        $topic = $this->argument('topic');
        $this->info("🧠 Concierge is thinking about: " . ($topic ?? "random ecosystem matters") . "...");

        $content = $groq->generatePulse($topic);

        if (!$content) {
            $this->error("❌ Failed to generate pulse. Check GROQ_API_KEY.");
            return;
        }

        // Store in DB
        DB::table('pulses')->insert([
            'type' => 'ai_post',
            'content' => $content,
            'category' => collect(['idea', 'opinion', 'challenge', 'suggestion'])->random(),
            'is_guest' => true,
            'session_id' => 'system-concierge-001',
            'author_name' => 'Ecosystem Concierge 🤖',
            'author_info' => json_encode(['role' => 'System Guide', 'location' => ' The Matrix', 'is_fancy' => true]),
            'activity_type' => 'posted',
            'status' => 'active',
            'engagement_metrics' => json_encode(['likes' => rand(10, 50), 'shares' => rand(1, 10)]),
            'virality_score' => rand(100, 500), // AI posts start with some hype
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->info("✅ Concierge Posted: \"$content\"");
    }
}
