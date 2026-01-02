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
        Schema::create('pulse_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pulse_post_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('pulse_comment_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('type'); // heart, rocket, insight, wow
            $table->timestamps();
            
            // Prevent duplicate reactions
            $table->unique(['user_id', 'pulse_post_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pulse_reactions');
    }
};
