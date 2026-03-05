<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsors', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignUlid('sponsor_level_id')->nullable()->constrained('sponsor_levels')->nullOnDelete();
            $table->string('company_name');
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->enum('status', ['prospect', 'confirmed', 'paid'])->default('prospect');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('sponsor_level_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
    }
};
