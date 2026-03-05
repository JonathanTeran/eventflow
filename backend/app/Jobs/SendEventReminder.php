<?php

namespace App\Jobs;

use App\Mail\EventReminder;
use App\Models\Event;
use App\Models\EventReminder as EventReminderModel;
use App\Models\Participant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEventReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Participant $participant,
        public Event $event,
        public string $type, // '48h', 'day_of', 'follow_up'
    ) {}

    public function handle(): void
    {
        // Check if already sent (prevent duplicates)
        $exists = EventReminderModel::where('event_id', $this->event->id)
            ->where('participant_id', $this->participant->id)
            ->where('type', $this->type)
            ->exists();

        if ($exists) {
            return;
        }

        Mail::to($this->participant->email)
            ->send(new EventReminder($this->participant, $this->event, $this->type));

        EventReminderModel::create([
            'event_id' => $this->event->id,
            'participant_id' => $this->participant->id,
            'type' => $this->type,
            'sent_at' => now(),
        ]);
    }
}
