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
        Schema::table('centre_events', function (Blueprint $table) {
            $table->foreignId('mentor_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->boolean('is_group_session')->default(false)->after('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('centre_events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('mentor_id');
            $table->dropColumn('is_group_session');
        });
    }
};
