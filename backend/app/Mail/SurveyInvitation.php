<?php

namespace App\Mail;

use App\Models\Participant;
use App\Models\Survey;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SurveyInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Participant $participant,
        public Survey $survey
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Tu opinión importa: {$this->survey->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.survey-invitation',
        );
    }
}
