<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('aggregated_leaderboards', function (Blueprint $table) {
            $table->id();
            $table->string('stakeholder_type'); // Founder, Investor, etc.
            $table->string('region')->nullable();
            $table->string('sector')->nullable();
            
            // Aggregation Logic
            $table->string('source_name'); // 'TechCrunch', 'Internal', 'Bloomberg'
            $table->decimal('internal_score', 10, 2)->nullable(); // 0-100
            $table->decimal('external_score', 10, 2)->nullable(); // Normalized 0-100
            $table->decimal('weighted_average_score', 10, 2); // The final rank metric
            
            $table->integer('rank')->default(0);
            $table->string('entity_name'); // The Startup/Person Name
            $table->json('metadata')->nullable(); // Extra details
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aggregated_leaderboards');
    }
};
