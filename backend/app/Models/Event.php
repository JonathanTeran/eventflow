<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Event extends Model
{
    use BelongsToOrganization, HasFactory, HasUlid, SoftDeletes;

    protected $appends = ['cover_image_url'];

    protected $fillable = [
        'organization_id',
        'name',
        'slug',
        'description',
        'date_start',
        'date_end',
        'location',
        'venue',
        'latitude',
        'longitude',
        'capacity',
        'registration_type',
        'status',
        'cover_image_path',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'date_start' => 'datetime',
            'date_end' => 'datetime',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'capacity' => 'integer',
            'settings' => 'array',
        ];
    }

    public function sponsorLevels(): HasMany
    {
        return $this->hasMany(SponsorLevel::class)->orderBy('sort_order');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class)->orderBy('sort_order');
    }

    public function sponsors(): HasMany
    {
        return $this->hasMany(Sponsor::class)->orderBy('sort_order');
    }

    public function communities(): HasMany
    {
        return $this->hasMany(Community::class)->orderBy('sort_order');
    }

    public function agendaItems(): HasMany
    {
        return $this->hasMany(AgendaItem::class)->orderBy('date')->orderBy('start_time');
    }

    public function scans(): HasMany
    {
        return $this->hasMany(ParticipantScan::class);
    }

    public function surveys(): HasMany
    {
        return $this->hasMany(Survey::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(EventReminder::class);
    }

    public function registeredCount(): int
    {
        return $this->participants()->where('status', '!=', 'cancelled')->count();
    }

    public function spotsLeft(): ?int
    {
        if ($this->capacity === null) {
            return null;
        }

        return max(0, $this->capacity - $this->registeredCount());
    }

    public function isFull(): bool
    {
        $spots = $this->spotsLeft();

        return $spots !== null && $spots <= 0;
    }

    public function waitlistCount(): int
    {
        return $this->participants()->where('status', 'waitlisted')->count();
    }

    public function waitlistedParticipants()
    {
        return $this->participants()
            ->where('status', 'waitlisted')
            ->orderBy('created_at');
    }

    public function promoteFromWaitlist(): ?Participant
    {
        $next = $this->waitlistedParticipants()->first();

        if ($next) {
            $next->update(['status' => 'confirmed']);

            return $next;
        }

        return null;
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (! $this->cover_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->cover_image_path);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('date_start', '>', now())->orderBy('date_start');
    }

    public static function findBySlugPublic(string $slug): ?self
    {
        return static::withoutGlobalScopes()
            ->where('slug', $slug)
            ->first();
    }
}
