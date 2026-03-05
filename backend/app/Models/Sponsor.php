<?php

namespace App\Models;

use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Sponsor extends Model
{
    use HasFactory, HasUlid, SoftDeletes;

    protected $fillable = [
        'event_id',
        'sponsor_level_id',
        'company_name',
        'contact_name',
        'contact_email',
        'contact_phone',
        'logo_path',
        'website',
        'description',
        'amount_paid',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function sponsorLevel(): BelongsTo
    {
        return $this->belongsTo(SponsorLevel::class);
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }
}
