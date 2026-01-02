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
        Schema::table('pulses', function (Blueprint $table) {
            $table->string('session_id')->nullable()->index()->after('id'); // For tracking guests
            $table->string('author_name')->nullable()->after('session_id'); // Display Name
            $table->json('author_info')->nullable()->after('author_name'); // { location, tags, global_citizen: boolean }
            $table->boolean('is_guest')->default(false)->after('author_info');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pulses', function (Blueprint $table) {
            //
        });
    }
};
