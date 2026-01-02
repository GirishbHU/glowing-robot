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
            $table->string('referral_code', 10)->unique()->nullable()->after('email'); // Unique code for the user to share
            $table->unsignedBigInteger('referrer_id')->nullable()->after('referral_code'); // Who referred this user
            $table->string('subscription_tier')->default('free')->after('referrer_id'); // free, pro, enterprise
            $table->foreign('referrer_id')->references('id')->on('users')->onDelete('set null');
            $table->index('referral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referrer_id']);
            $table->dropColumn(['referral_code', 'referrer_id', 'subscription_tier']);
        });
    }
};
