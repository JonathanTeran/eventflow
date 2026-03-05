<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\Participant;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WaitlistPromoted extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Participant $participant,
        public Event $event,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Tienes un lugar! — {$this->event->name}",
        );
    }

    public function content(): Content
    {
        $networkingUrl = route('public.networking', [
            'slug' => $this->event->slug,
            'registration_code' => $this->participant->registration_code,
        ]);

        $profileUrl = url("/e/{$this->event->slug}/networking/{$this->participant->registration_code}/profile");
        $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data='.urlencode($profileUrl);

        return new Content(
            view: 'emails.waitlist-promoted',
            with: [
                'event' => $this->event,
                'participant' => $this->participant,
                'networkingUrl' => $networkingUrl,
                'qrCodeUrl' => $qrCodeUrl,
            ],
        );
    }
}
