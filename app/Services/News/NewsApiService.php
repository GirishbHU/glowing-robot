<?php

namespace App\Services\News;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NewsApiService implements NewsServiceInterface
{
    protected $apiKey;
    protected $baseUrl = 'https://newsapi.org/v2';

    public function __construct()
    {
        $this->apiKey = config('services.newsapi.key');
    }

    public function fetchTrends(string $query = 'startup OR technology OR investment', int $limit = 10): array
    {
        if (!$this->apiKey) {
            Log::warning('NewsAPI key not configured. Returning mock data.');
            return $this->getMockTrends();
        }

        try {
            $response = Http::get("{$this->baseUrl}/everything", [
                'q' => $query,
                'sortBy' => 'popularity',
                'language' => 'en',
                'pageSize' => $limit,
                'apiKey' => $this->apiKey
            ]);

            if ($response->failed()) {
                Log::error('NewsAPI request failed: ' . $response->body());
                return $this->getMockTrends();
            }

            $articles = $response->json()['articles'] ?? [];
            return array_map(function ($article) {
                return [
                    'title' => $article['title'],
                    'description' => $article['description'],
                    'source' => $article['source']['name'] ?? 'Unknown',
                    'url' => $article['url'],
                    'published_at' => $article['publishedAt'],
                    'sentiment' => $this->analyzeSentiment($article['title'] . ' ' . $article['description'])
                ];
            }, $articles);

        } catch (\Exception $e) {
            Log::error('NewsAPI Exception: ' . $e->getMessage());
            return $this->getMockTrends();
        }
    }

    public function analyzeSentiment(string $text): float
    {
        // Simple heuristic sentiment analysis (placeholder for real NLP)
        $positiveWords = ['growth', 'success', 'breakthrough', 'record', 'gain', 'profit', 'innovative', 'launch'];
        $negativeWords = ['loss', 'fail', 'crash', 'downturn', 'crisis', 'risk', 'problem', 'delay'];

        $text = strtolower($text);
        $score = 0;

        foreach ($positiveWords as $word) {
            if (str_contains($text, $word)) $score += 0.2;
        }
        foreach ($negativeWords as $word) {
            if (str_contains($text, $word)) $score -= 0.2;
        }

        return max(min($score, 1.0), -1.0);
    }

    public function extractEntities(string $text): array
    {
        // Placeholder entity extraction
        // In a real paid version, this would use Google NLP or OpenAI
        return [];
    }

    protected function getMockTrends(): array
    {
        return [
            [
                'title' => 'Global Startup Funding Reaches New Highs',
                'description' => 'Venture capital flows are increasing as AI startups dominate the market.',
                'source' => 'Mock News',
                'url' => 'https://techcrunch.com/startups',
                'published_at' => now()->toIso8601String(),
                'sentiment' => 0.8
            ],
            [
                'title' => 'Tech Giants Face New Regulations',
                'description' => 'Governments worldwide are discussing new frameworks for digital markets.',
                'source' => 'Mock News',
                'url' => 'https://www.reuters.com/technology',
                'published_at' => now()->toIso8601String(),
                'sentiment' => -0.4
            ]
        ];
    }
}
