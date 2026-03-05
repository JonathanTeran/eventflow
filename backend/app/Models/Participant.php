<?php

namespace App\Models;

use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Participant extends Model
{
    use HasFactory, HasUlid, SoftDeletes;

    protected $fillable = [
        'event_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'job_title',
        'country',
        'city',
        'ticket_type',
        'status',
        'registration_code',
        'networking_pin',
        'social_links',
        'networking_visible',
        'checked_in_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
            'social_links' => 'array',
            'networking_visible' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Participant $participant) {
            if (! $participant->registration_code) {
                $participant->registration_code = strtoupper(Str::random(8));
            }
            if (! $participant->networking_pin) {
                $participant->networking_pin = strtoupper(Str::random(6));
            }
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function scans(): HasMany
    {
        return $this->hasMany(ParticipantScan::class);
    }

    public function savedContacts(): HasMany
    {
        return $this->hasMany(ParticipantConnection::class, 'participant_id');
    }

    public function savedBy(): HasMany
    {
        return $this->hasMany(ParticipantConnection::class, 'connected_participant_id');
    }

    public function scopeNetworkingVisible(Builder $query): Builder
    {
        return $query->where('networking_visible', true)->whereNotNull('networking_pin');
    }
}
