<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KnowledgeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('knowledge_sources')->insert([
            [
                'name' => 'i2u.ai Blog on LinkedIn',
                'url' => 'https://www.linkedin.com/newsletters/i2u-ai-blog-7359775076067467264/',
                'type' => 'rss', 
                'frequency' => 'daily',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Adventures in Business Model Terrain',
                'url' => 'https://adventuresinbmterrain.blogspot.com/',
                'type' => 'scrape',
                'frequency' => 'weekly',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
