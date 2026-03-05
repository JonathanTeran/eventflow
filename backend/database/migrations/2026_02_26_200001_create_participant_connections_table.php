<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participant_connections', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('participant_id')->constrained('participants')->cascadeOnDelete();
            $table->foreignUlid('connected_participant_id')->constrained('participants')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['participant_id', 'connected_participant_id'], 'participant_connections_unique');
            $table->index('participant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participant_connections');
    }
};
