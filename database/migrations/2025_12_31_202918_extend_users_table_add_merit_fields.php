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
        Schema::table('users', function (Blueprint $table) {
            // Merit Level: L0 (Uninitiated) through L8 (Master)
            $table->enum('merit_level', ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'])
                  ->default('L0')
                  ->after('email')
                  ->index();
            
            // Execution Score: Performance metric (0-10000, allows for decimal precision)
            $table->unsignedInteger('execution_score')->default(0)->after('merit_level')->index();
            
            // Guest UUID for pre-authentication tracking
            $table->uuid('guest_uuid')->nullable()->after('execution_score')->unique();
            
            // Timestamp for merit progression tracking
            $table->timestamp('merit_level_updated_at')->nullable()->after('guest_uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'merit_level',
                'execution_score',
                'guest_uuid',
                'merit_level_updated_at'
            ]);
        });
    }
};
