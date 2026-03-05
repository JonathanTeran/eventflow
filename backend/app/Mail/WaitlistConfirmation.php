<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\Participant;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WaitlistConfirmation extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Participant $participant,
        public Event $event,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Lista de espera — {$this->event->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.waitlist-confirmation',
            with: [
                'event' => $this->event,
                'participant' => $this->participant,
                'position' => $this->event->waitlistCount(),
            ],
        );
    }
}
