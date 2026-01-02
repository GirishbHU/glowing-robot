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
        // 1. News Cycles: usage of the 9-day cycle
        Schema::create('news_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('batch_id')->index(); // UUID for the full 9-day cycle set
            $table->integer('day_number'); // 1-9
            $table->string('stakeholder_focus'); // Startup, Investor, etc.
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->enum('status', ['future', 'active', 'completed'])->default('future');
            $table->timestamps();
            
            $table->index(['status', 'start_time']);
        });

        // 2. News Trends: Ingested topics from external APIs (Abstracted for future Paid APIs)
        Schema::create('news_trends', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('news_cycle_id')->nullable();
            $table->string('keyword')->index();
            $table->string('source')->default('open'); // 'newsapi', 'gdelt', 'paid_provider'
            $table->float('sentiment_score')->default(0); // -1.0 to 1.0 (NLP)
            $table->integer('volume')->default(0); // Mentions count
            $table->json('metadata')->nullable(); // Store raw API response data for debugging
            $table->timestamps();

            $table->foreign('news_cycle_id')->references('id')->on('news_cycles')->onDelete('cascade');
        });

        // 3. Newsmakers: "Ghost Profiles" for people/companies extracted from news
        Schema::create('newsmakers', function (Blueprint $table) {
            $table->id();
            $table->uuid('ghost_uuid')->unique(); // For potential future claiming/migration to User
            $table->string('name');
            $table->string('entity_type')->default('person'); // person, company, organization
            $table->string('associated_stakeholder')->nullable(); // Inferred role
            $table->integer('relevance_score')->default(0);
            $table->timestamp('last_mentioned_at')->nullable();
            $table->timestamps();

            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsmakers');
        Schema::dropIfExists('news_trends');
        Schema::dropIfExists('news_cycles');
    }
};
