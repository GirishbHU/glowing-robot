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
        Schema::create('knowledge_contributions', function (Blueprint $table) {
            $table->id();
            $table->uuid('guest_uuid')->nullable()->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // Context (Where in the Protocol?)
            $table->string('question_code')->index(); // L0_Q1, DIM_ALIGNMENT
            $table->string('stakeholder_role'); // founder, investor
            
            // Contribution Type (The Dialogue)
            // 'answer_insight'  -> "Here is a better answer..."
            // 'critique_q'      -> "This question is irrelevant because..."
            // 'taxonomy_idea'   -> "Rename 'Alignment' to 'Synergy'..."
            $table->string('contribution_type')->index(); 
            
            // The Content
            $table->text('content');
            
            // Identity & Integrity (Protocol Metadata)
            $table->string('ip_address', 45)->nullable();
            $table->string('client_timezone')->nullable();
            $table->timestamp('local_time_at_creation')->nullable();
            
            // Gamification & Moderation
            $table->boolean('is_public')->default(false);
            $table->boolean('is_implemented')->default(false); // Did this become part of the Protocol?
            $table->integer('bonus_gleams_awarded')->default(0);

            $table->timestamps();
            
            // Index for protocol analysis
            $table->index(['question_code', 'contribution_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_contributions');
    }
};
