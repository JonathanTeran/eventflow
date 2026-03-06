<?php

namespace App\Jobs;

use App\Mail\EventCommunication;
use App\Models\Communication;
use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEventCommunication implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Communication $communication,
        public Event $event,
    ) {}

    public function handle(): void
    {
        $this->communication->update(['status' => 'sending']);

        $participants = $this->event->participants()
            ->whereIn('status', ['registered', 'confirmed', 'attended'])
            ->get();

        $sentCount = 0;

        foreach ($participants as $participant) {
            try {
                Mail::to($participant->email)
                    ->send(new EventCommunication($this->communication, $this->event, $participant));
                $sentCount++;
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $this->communication->update([
            'status' => 'sent',
            'sent_count' => $sentCount,
            'sent_at' => now(),
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        $this->communication->update(['status' => 'failed']);
    }
}
