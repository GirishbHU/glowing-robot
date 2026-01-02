<?php

namespace App\Services\News;

interface NewsServiceInterface
{
    /**
     * Fetch trending topics globally or for a specific query
     * @param string $query Optional search query
     * @param int $limit Number of results
     * @return array Standardized array of trends
     */
    public function fetchTrends(string $query = '', int $limit = 10): array;

    /**
     * Analyze sentiment of a given text
     * @param string $text
     * @return float Score from -1.0 to 1.0
     */
    public function analyzeSentiment(string $text): float;

    /**
     * Extract entities (people, companies) from text
     * @param string $text
     * @return array List of extracted entities with types
     */
    public function extractEntities(string $text): array;
}
