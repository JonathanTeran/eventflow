<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participant_scans', function (Blueprint $table) {
            $table->dropForeign(['scanned_by']);
            $table->foreignUlid('scanned_by')->nullable()->change();
            $table->foreign('scanned_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('participant_scans', function (Blueprint $table) {
            $table->dropForeign(['scanned_by']);
            $table->foreignUlid('scanned_by')->nullable(false)->change();
            $table->foreign('scanned_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
