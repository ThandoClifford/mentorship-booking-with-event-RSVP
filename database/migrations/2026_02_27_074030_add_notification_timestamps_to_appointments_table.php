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
        Schema::table('appointments', function (Blueprint $table) {
            $table->timestamp('confirmed_sent_at')->nullable()->after('cancelled_reason');
            $table->timestamp('cancelled_sent_at')->nullable()->after('confirmed_sent_at');
            $table->timestamp('reminder_sent_at')->nullable()->after('cancelled_sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['confirmed_sent_at', 'cancelled_sent_at', 'reminder_sent_at']);
        });
    }
};
