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
        Schema::create('social_economy_ledger', function (Blueprint $table) {
            $table->id();
            
            // User relationship (supports both authenticated and guest users)
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->uuid('guest_uuid')->nullable()->index();
            
            // CRITICAL: BIGINT for whole units only - NO decimals
            // This prevents fractional currency that could be monetized
            $table->bigInteger('gleams')->default(0);
            $table->bigInteger('alicorns')->default(0);
            
            // Transaction metadata (NOT financial)
            $table->enum('transaction_type', [
                'earned_assessment',    // From Value Journey completion
                'earned_contribution',  // From community actions
                'spent_unlock',         // Unlocking content
                'spent_badge',          // Purchasing badges
                'adjustment_admin',     // Admin corrections only
                'guest_migration'       // When guest→user conversion
            ]);
            
            $table->string('source_context')->nullable(); // e.g., "L3_Dimension_Stakeholder"
            $table->text('description')->nullable();
            
            // Audit trail
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['guest_uuid', 'created_at']);
            
            // Check constraints for non-negative balances (Laravel 10+)
            // Note: SQLite doesn't enforce CHECK constraints in earlier versions
            // but we'll add application-level validation
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_economy_ledger');
    }
};
