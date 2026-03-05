<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_reminders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignUlid('participant_id')->constrained('participants')->cascadeOnDelete();
            $table->enum('type', ['48h', 'day_of', 'follow_up']);
            $table->timestamp('sent_at');
            $table->timestamps();

            $table->unique(['event_id', 'participant_id', 'type']);
            $table->index(['event_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_reminders');
    }
};
