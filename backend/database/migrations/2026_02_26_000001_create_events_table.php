<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->dateTime('date_start');
            $table->dateTime('date_end');
            $table->string('location')->nullable();
            $table->string('venue')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->enum('registration_type', ['open', 'invite'])->default('open');
            $table->enum('status', ['draft', 'published', 'active', 'completed', 'cancelled'])->default('draft');
            $table->string('cover_image_path')->nullable();
            $table->jsonb('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('organization_id');
            $table->index('status');
            $table->index('date_start');
            $table->unique(['organization_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
