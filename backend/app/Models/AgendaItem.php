<?php

namespace App\Models;

use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgendaItem extends Model
{
    use HasFactory, HasUlid, SoftDeletes;

    protected $fillable = [
        'event_id',
        'speaker_id',
        'title',
        'description',
        'date',
        'start_time',
        'end_time',
        'location_detail',
        'type',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(Speaker::class);
    }
}
