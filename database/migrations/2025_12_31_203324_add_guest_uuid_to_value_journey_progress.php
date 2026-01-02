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
        Schema::table('value_journey_progress', function (Blueprint $table) {
            $table->uuid('guest_uuid')->nullable()->after('session_id')->index();
            $table->json('merit_level_info')->nullable()->after('answers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('value_journey_progress', function (Blueprint $table) {
            $table->dropColumn(['guest_uuid', 'merit_level_info']);
        });
    }
};
