<?php

namespace App\Models;

use App\Traits\HasUlid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParticipantConnection extends Model
{
    use HasUlid;
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'participant_id',
        'connected_participant_id',
        'status',
        'notes',
    ];

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function connectedParticipant(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'connected_participant_id');
    }
}
