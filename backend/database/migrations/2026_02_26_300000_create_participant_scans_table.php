<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participant_scans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('participant_id')->constrained('participants')->cascadeOnDelete();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('scan_type');
            $table->foreignUlid('scanned_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('scanned_at');
            $table->timestamps();

            $table->unique(['participant_id', 'event_id', 'scan_type']);
            $table->index(['event_id', 'scan_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participant_scans');
    }
};
