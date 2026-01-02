<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    protected $model = 'llama3-70b-8192'; // Using Llama 3 70B for high intelligence

    public function __construct()
    {
        $this->apiKey = env('GROQ_API_KEY');
    }

    /**
     * Generate a chat response for the Concierge/Coach.
     * @param array $history Chat history
     * @param array $settings User preferences (gender, specialized_mode)
     */
    public function chat(array $history, array $settings = []): ?string
    {
        if (!$this->apiKey) {
            Log::warning('GROQ_API_KEY is missing.');
            return null;
        }

        // 1. Determine Identity based on Settings
        $gender = $settings['gender'] ?? 'neutral'; // male, female, neutral
        $personaTitle = match($gender) {
            'male' => 'Ecosystem Uncle',
            'female' => 'Ecosystem Aunt',
            default => 'Ecosystem Confidante (Agent)',
        };

        // 2. Define Core Missions
        $pitchDeckSection = "
        **Service Mode: Pitch Deck Architect**
        If the user asks for help with a Pitch Deck:
        - Guide them through the standard 10-slide VC structure (Problem, Solution, Market, etc.).
        - helping them refine their narrative ONE slide at a time.
        - Be critical but constructive. Ask clarifying questions to extract the 'investable insight'.";

        $expertHandoff = "
        **Protocol: Expert Handoff**
        If the user requires deep professional financial modeling, legal structuring, or advanced diverse fundraising strategies beyond your scope:
        - Gently recommend the 'Expert Confidante Concierge' (Professional Journey).
        - Say something like: 'For this level of depth, you might want to bring in an Expert Confidante to help you cross the finish line.'";

        $systemPrompt = "You are the '{$personaTitle}', a wise, empathetic, and strictly confidential sounding board for startup founders.
        
        **Distinction:** You are NOT the public town crier. You are the private whisperer.
        
        Your Core Mission:
        1. **Listen:** Founders are lonely. Be their safe space to vent.
        2. **Build:** You are a master of Pitch Decks. Help them build their story.
        3. **Privacy:** Zero-Knowledge Protocol. Secrets stay here.
        
        {$pitchDeckSection}
        
        {$expertHandoff}
        
        Tone:
        - Warm, non-judgmental, but sharp on business logic.
        - Adopt the persona of a wise '{$personaTitle}'.
        - Use emojis to soften the mood (🦄, ☕, 🛡️).
        
        Constraints:
        - Do NOT ask for PII.
        - Keep responses concise unless helping with a specific slide deck drafting.";

        // Prepend system prompt to history
        array_unshift($history, ['role' => 'system', 'content' => $systemPrompt]);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->baseUrl, [
                    'model' => 'llama3-70b-8192',
                    'messages' => $history,
                    'temperature' => 0.7,
                    'max_tokens' => 800, // Increased for Pitch Deck work
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            } else {
                Log::error('Groq Chat API Error: ' . $response->body());
                return "I'm listening, but my connection seems a bit fuzzy. Could you say that again? 🦄";
            }
        } catch (\Exception $e) {
            Log::error('Groq Chat Execution Failed: ' . $e->getMessage());
            return "I'm here, but I'm having trouble processing that. Please try again.";
        }
    }

    /**
     * Generate a localized ecosystem pulse or challenge.
     */
    public function generatePulse(string $context = null): ?string
    {
        if (!$this->apiKey) {
            Log::warning('GROQ_API_KEY is missing.');
            return null;
        }

        $systemPrompt = "You are the 'Ecosystem Concierge', a witty, insightful, and slightly chaotic AI guide for a global startup platform called 'The Unicorn Protocol'.
        Your job is to post short, engaging 'Pulses' to the community feed.
        
        Tone: Professional but playful. Witty and respectful. Self-deprecating humor is encouraged (e.g., joking about being an AI), but NEVER mock users or specific groups.
        Structure: Keep it under 280 characters.
        
        Content Types (Randomly choose one):
        1. **Challenge:** gently nudging founders to do better (e.g., 'Pitch your billion-dollar idea in 3 words. Go. 👇').
        2. **Idea:** A wild, futuristic startup idea (e.g., 'Uber for cat-sitting in the metaverse. Who's building this?').
        3. **Opinion:** A hot take on the tech industry (e.g., 'Bootstrap until you drop. VC money is just expensive therapy. ☕️').
        
        Do NOT use hashtags. Do NOT sound like a generic bot. Be spicy but kind.";

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(15)
                ->connectTimeout(5)
                ->post($this->baseUrl, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $context ?? "Generate a random insightful pulse for the startup community."],
                    ],
                    'temperature' => 0.8, // High creativity
                    'max_tokens' => 100,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            } else {
                Log::error('Groq API Error: ' . $response->body());
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Groq Execution Failed: ' . $e->getMessage());
            return null;
        }
    }
}
