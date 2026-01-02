<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GroqService;
use Illuminate\Support\Facades\Log;

class CoachingController extends Controller
{
    protected $groqService;

    public function __construct(GroqService $groqService)
    {
        $this->groqService = $groqService;
    }

    /**
     * Initialize a new conversation (Ephemeral).
     * We don't save this to the DB to enforce "Zero-Knowledge" architecture.
     * The Frontend holds the state.
     */
    public function create(Request $request)
    {
        // In a real implementation with persistence, we would create a Conversation model here.
        // For "Zero-Knowledge" / Ephemeral, we just return a session ID or dummy object to the frontend.
        // Privacy: Secrets remain with the individual (Client-Side State).
        
        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => uniqid('sess_'), // Ephemeral ID
                'title' => $request->json('title', 'Confidential Session'),
                'createdAt' => now()->toIso8601String(),
            ]
        ]);
    }

    /**
     * Handle a message in the conversation.
     * The history is passed from the client to maintain context without DB storage.
     */
    public function message(Request $request, $id)
    {
        $content = $request->json('content');
        
        // In a stateless/ephemeral design, the client should arguably send the history.
        // For this implementation, we'll assume single-turn or the client handles context.
        // Ideally, we'd accept `messages` array from request.
        
        // Let's assume the client sends just the new message for now, 
        // but for better chat, we might want the last few messages.
        // Updated to accept 'history' and 'settings' (e.g., gender preferences)
        $history = $request->json('history', []);
        $settings = $request->json('settings', []);
        
        // Ensure the new message is in the history
        if (empty($history) || end($history)['content'] !== $content) {
             $history[] = ['role' => 'user', 'content' => $content];
        }

        // Call Groq with "Agony Aunt" persona & settings
        $response = $this->groqService->chat($history, $settings);
        
        // Return as a stream-like JSON (for simplicity with the existing frontend reader)
        // The frontend expects data: { content: "..." } lines.
        
        return response()->stream(function () use ($response) {
            // Simulate streaming for the "feel"
            $chunkSize = 10;
            $parts = str_split($response, $chunkSize);
            
            foreach ($parts as $part) {
                echo "data: " . json_encode(['content' => $part]) . "\n\n";
                if (ob_get_length()) ob_flush();
                flush();
                usleep(50000); // 50ms delay for typing effect
            }
            echo "data: " . json_encode(['done' => true]) . "\n\n";
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }
}
