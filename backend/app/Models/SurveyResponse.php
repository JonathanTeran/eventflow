<?php

namespace App\Models;

use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyResponse extends Model
{
    use HasUlid;

    protected $fillable = [
        'survey_id',
        'question_id',
        'participant_id',
        'answer',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'answer' => 'array',
        ];
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(SurveyQuestion::class, 'question_id');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }
}
