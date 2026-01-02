<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\Answer;

class AnswersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Path to the JSON file
        $jsonPath = resource_path('js/lib/answer-keys.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File not found: $jsonPath");
            return;
        }

        $json = File::get($jsonPath);
        $data = json_decode($json, true);

        if (!$data) {
            $this->command->error("Invalid JSON data");
            return;
        }

        $this->command->info('Seeding answers... this might take a moment.');

        $count = 0;
        $count = 0;
        // fast truncate that works cross-database for simple tables
        \Illuminate\Support\Facades\DB::table('answers')->delete();

        foreach ($data as $levelId => $levelData) {
            $levelName = $levelData['levelName'] ?? 'Unknown Level';
            $questions = $levelData['questions'] ?? [];

            foreach ($questions as $dimensionId => $dimensionData) {
                // Determine gleams/alicorns if available at dimension level
                // In your JSON, 'gleams' and 'alicorns' are inside dimensionData
                $gleams = $dimensionData['gleams'] ?? 0;
                $alicorns = $dimensionData['alicorns'] ?? 0;
                
                $stakeholders = $dimensionData['stakeholders'] ?? [];

                foreach ($stakeholders as $stakeholderName => $stakeholderData) {
                    $questionText = $stakeholderData['question'] ?? '';
                    $grades = $stakeholderData['grades'] ?? [];

                    Answer::create([
                        'level_id' => $levelId,
                        'level_name' => $levelName,
                        'dimension_id' => $dimensionId,
                        'stakeholder' => $stakeholderName,
                        'question' => $questionText,
                        'grade_1' => $grades['1'] ?? '',
                        'grade_2' => $grades['2'] ?? '',
                        'grade_3' => $grades['3'] ?? '',
                        'grade_4' => $grades['4'] ?? '',
                        'grade_5' => $grades['5'] ?? '',
                        'gleams' => $gleams,
                        'alicorns' => $alicorns,
                    ]);

                    $count++;
                }
            }
        }

        $this->command->info("Seeded $count answers successfully.");
    }
}
