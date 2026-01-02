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
        Schema::create("answers", function (Blueprint $table) {
            $table->id();
            $table->string("level_id"); // e.g., L0
            $table->string("level_name");
            $table->string("dimension_id"); // e.g., D1
            $table->string("stakeholder"); // e.g., Startup (Founder)
            $table->text("question");
            $table->text("grade_1");
            $table->text("grade_2");
            $table->text("grade_3");
            $table->text("grade_4");
            $table->text("grade_5");
            $table->integer("gleams")->default(0);
            $table->decimal("alicorns", 8, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("answers");
    }
};
