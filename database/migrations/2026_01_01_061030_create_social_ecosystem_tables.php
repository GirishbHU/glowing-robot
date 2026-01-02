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
        // 1. Posts Table (The Core Content)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Content Types: text, article, quiz, poll
            $table->string('content_type')->default('text'); 
            
            $table->string('title')->nullable(); // For Articles/Quizzes
            $table->longText('body'); // JSON or Markdown content
            $table->json('media_urls')->nullable(); // Attached images/videos
            
            // Filters (The "Town Square" Segments)
            $table->string('stakeholder_filter')->nullable();
            $table->string('country_filter')->nullable();
            $table->string('sector_filter')->nullable();
            $table->string('level_filter')->nullable();
            
            // Economy Hooks
            $table->unsignedBigInteger('gleams_tipped')->default(0); // Monetary
            $table->float('influence_score')->default(0); // Influence (Calculated from reactions)
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['content_type', 'created_at']);
            $table->index(['stakeholder_filter', 'country_filter']);
        });

        // 2. Interactions Table (The "Influence" Economy)
        Schema::create('interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            
            // Type: like, love, insightful, share
            $table->string('type'); 
            $table->integer('weight')->default(1); // Weighted influence score
            
            $table->timestamps();
            
            $table->unique(['user_id', 'post_id', 'type']); // One reaction per type per user
        });

        // 3. Comments Table (Discussion)
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade'); // Nesting
            
            $table->text('body');
            $table->unsignedBigInteger('gleams_tipped')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
        Schema::dropIfExists('interactions');
        Schema::dropIfExists('posts');
    }
};
