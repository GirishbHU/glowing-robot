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
        Schema::create('pulses', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'news', 'challenge', 'kudos', 'user_post'
            $table->text('content');
            $table->unsignedBigInteger('related_entity_id')->nullable(); // Polymorphic-ish ID
            $table->string('related_entity_type')->nullable(); // 'Newsmaker', 'User', 'LeaderboardEntry'
            $table->json('engagement_metrics')->nullable(); // {likes: 0, shares: 0}
            $table->string('region')->nullable(); // For filtering
            $table->string('sector')->nullable(); // For filtering
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pulses');
    }
};
