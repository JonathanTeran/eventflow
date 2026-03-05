<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('job_title')->nullable();
            $table->enum('ticket_type', ['general', 'vip', 'student'])->default('general');
            $table->enum('status', ['registered', 'confirmed', 'attended', 'cancelled'])->default('registered');
            $table->string('registration_code')->unique();
            $table->timestamp('checked_in_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['event_id', 'email']);
            $table->index('status');
            $table->index('ticket_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
