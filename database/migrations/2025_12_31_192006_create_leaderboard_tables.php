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
        Schema::create("leaderboard_entries", function (Blueprint $table) {
            $table->id();
            $table->string("stakeholder")->index();
            $table->integer("rank");
            $table->string("name");
            $table->string("country");
            $table->string("sector");
            $table->bigInteger("gleams")->default(0);
            $table->decimal("alicorns", 8, 2)->default(0);
            $table->string("level");
            $table->enum("trend", ["up", "down", "same"])->default("same");
            $table->timestamps();
            
            // Re-compute rank on updates if needed, or simple index
            $table->index(["stakeholder", "gleams"]);
        });

        Schema::create("news_feed_items", function (Blueprint $table) {
            $table->id();
            $table->string("stakeholder")->index(); // e.g. "Founder" or "All"
            $table->string("title");
            $table->string("source");
            $table->string("category");
            $table->string("url")->nullable();
            $table->string("emoji")->default("");
            $table->timestamp("published_at")->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("news_feed_items");
        Schema::dropIfExists("leaderboard_entries");
    }
};
