<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('survey_id')->constrained('surveys')->cascadeOnDelete();
            $table->text('question_text');
            $table->enum('type', ['text', 'rating', 'multiple_choice', 'single_choice'])->default('text');
            $table->jsonb('options')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('required')->default(false);
            $table->timestamps();

            $table->index(['survey_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
    }
};
