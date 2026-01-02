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
        Schema::create('pulse_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->string('type')->default('post'); // post, insight, milestone, question
            $table->string('context_type')->nullable()->index(); // region, sector, role, level
            $table->string('context_value')->nullable()->index(); // e.g. oceania, fintech, founder
            $table->json('media_urls')->nullable();
            $table->integer('gleam_bounty')->default(0);
            $table->integer('impressions')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pulse_posts');
    }
};
