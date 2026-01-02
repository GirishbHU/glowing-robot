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
        Schema::create("value_journey_progress", function (Blueprint $table) {
            $table->id();
            $table->string("user_id")->nullable()->index();
            $table->string("session_id")->nullable()->index();
            $table->string("stakeholder")->nullable();
            $table->string("current_level")->nullable();
            $table->string("aspirational_level")->nullable();
            $table->boolean("is_aspirational")->default(false);
            $table->integer("gleams")->default(0);
            $table->decimal("alicorns", 8, 2)->default(0);
            $table->json("answers")->nullable();
            $table->timestamp("completed_at")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("value_journey_progress");
    }
};
