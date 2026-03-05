<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survey_responses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('survey_id')->constrained('surveys')->cascadeOnDelete();
            $table->foreignUlid('question_id')->constrained('survey_questions')->cascadeOnDelete();
            $table->foreignUlid('participant_id')->nullable()->constrained('participants')->nullOnDelete();
            $table->jsonb('answer');
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['survey_id', 'participant_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_responses');
    }
};
