<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\Participant;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventReminder extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Participant $participant,
        public Event $event,
        public string $type,
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->type) {
            '48h' => "Recordatorio: {$this->event->name} es en 2 dias!",
            'day_of' => "Hoy es el dia! — {$this->event->name}",
            'follow_up' => "Gracias por asistir a {$this->event->name}",
            default => "Recordatorio — {$this->event->name}",
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        $profileUrl = url("/e/{$this->event->slug}/networking/{$this->participant->registration_code}/profile");
        $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data='.urlencode($profileUrl);

        return new Content(
            view: 'emails.event-reminder',
            with: [
                'event' => $this->event,
                'participant' => $this->participant,
                'type' => $this->type,
                'qrCodeUrl' => $qrCodeUrl,
            ],
        );
    }
}
