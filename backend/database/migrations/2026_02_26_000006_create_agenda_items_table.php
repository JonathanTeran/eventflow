<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agenda_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignUlid('speaker_id')->nullable()->constrained('speakers')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('location_detail')->nullable();
            $table->enum('type', ['talk', 'workshop', 'break', 'networking', 'ceremony'])->default('talk');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_id', 'date']);
            $table->index('speaker_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agenda_items');
    }
};
