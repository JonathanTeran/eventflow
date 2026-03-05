<?php

namespace App\Models;

use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SurveyQuestion extends Model
{
    use HasUlid;

    protected $fillable = [
        'survey_id',
        'question_text',
        'type',
        'options',
        'sort_order',
        'required',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'required' => 'boolean',
        ];
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(SurveyResponse::class, 'question_id');
    }
}
