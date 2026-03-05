<?php

namespace App\Jobs;

use App\Mail\RegistrationConfirmation;
use App\Models\Event;
use App\Models\Participant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendRegistrationConfirmation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Participant $participant,
        public Event $event,
    ) {}

    public function handle(): void
    {
        Mail::to($this->participant->email)
            ->send(new RegistrationConfirmation($this->participant, $this->event));
    }
}
