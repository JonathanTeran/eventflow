<?php

namespace App\Models;

use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SponsorLevel extends Model
{
    use HasFactory, HasUlid;

    protected $fillable = [
        'event_id',
        'name',
        'sort_order',
        'benefits',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'benefits' => 'array',
            'price' => 'decimal:2',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function sponsors(): HasMany
    {
        return $this->hasMany(Sponsor::class)->orderBy('sort_order');
    }
}
