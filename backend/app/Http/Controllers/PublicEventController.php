<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicRegisterParticipantRequest;
use App\Jobs\SendRegistrationConfirmation;
use App\Mail\WaitlistConfirmation;
use App\Models\Event;
use App\Models\Participant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PublicEventController extends Controller
{
    public function show(Request $request, string $slug): Response
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event) {
            throw new NotFoundHttpException;
        }

        $isPreview = $request->hasValidSignature();

        // Fallback: admin autenticado con permiso puede previsualizar
        if (! $isPreview && auth()->check()) {
            $isPreview = auth()->user()->can('update', $event);
        }

        if (! $isPreview && ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $event->load([
            'speakers' => fn ($q) => $q->where('status', 'confirmed')->orderBy('sort_order'),
            'sponsors' => fn ($q) => $q->whereIn('status', ['confirmed', 'paid'])
                ->with('sponsorLevel')
                ->orderBy('sort_order'),
            'agendaItems' => fn ($q) => $q->with('speaker')->orderBy('date')->orderBy('start_time'),
            'sponsorLevels' => fn ($q) => $q->orderBy('sort_order'),
            'communities' => fn ($q) => $q->orderBy('sort_order'),
        ]);

        return Inertia::render('Public/EventShow', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
                'description' => $event->description,
                'date_start' => $event->date_start,
                'date_end' => $event->date_end,
                'location' => $event->location,
                'venue' => $event->venue,
                'capacity' => $event->capacity,
                'registration_type' => $event->registration_type,
                'status' => $event->status,
                'cover_image_url' => $event->cover_image_url,
                'latitude' => $event->latitude,
                'longitude' => $event->longitude,
            ],
            'registeredCount' => $event->registeredCount(),
            'speakers' => $event->speakers->map(fn ($s) => [
                'id' => $s->id,
                'first_name' => $s->first_name,
                'last_name' => $s->last_name,
                'full_name' => $s->full_name,
                'company' => $s->company,
                'job_title' => $s->job_title,
                'bio' => $s->bio,
                'photo_url' => $s->photo_url,
                'social_links' => $s->social_links,
            ]),
            'sponsors' => $event->sponsors->map(fn ($sp) => [
                'id' => $sp->id,
                'company_name' => $sp->company_name,
                'logo_url' => $sp->logo_url,
                'website' => $sp->website,
                'description' => $sp->description,
                'sponsor_level' => $sp->sponsorLevel ? [
                    'id' => $sp->sponsorLevel->id,
                    'name' => $sp->sponsorLevel->name,
                    'sort_order' => $sp->sponsorLevel->sort_order,
                ] : null,
            ]),
            'agendaItems' => $event->agendaItems->map(fn ($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'date' => $item->date,
                'start_time' => $item->start_time,
                'end_time' => $item->end_time,
                'location_detail' => $item->location_detail,
                'type' => $item->type,
                'speaker' => $item->speaker ? [
                    'full_name' => $item->speaker->full_name,
                ] : null,
            ]),
            'sponsorLevels' => $event->sponsorLevels->map(fn ($level) => [
                'id' => $level->id,
                'name' => $level->name,
                'sort_order' => $level->sort_order,
            ]),
            'communities' => $event->communities->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'url' => $c->url,
                'logo_url' => $c->logo_url,
                'description' => $c->description,
            ]),
            'isPreview' => $isPreview,
        ]);
    }

    public function showRegistrationForm(string $slug): Response
    {
        $event = $this->findPublicOpenEvent($slug);

        return Inertia::render('Public/EventRegister', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
                'description' => $event->description,
                'date_start' => $event->date_start,
                'date_end' => $event->date_end,
                'location' => $event->location,
                'venue' => $event->venue,
                'cover_image_url' => $event->cover_image_url,
                'capacity' => $event->capacity,
            ],
            'spotsLeft' => $event->spotsLeft(),
            'registeredCount' => $event->registeredCount(),
        ]);
    }

    public function register(PublicRegisterParticipantRequest $request, string $slug): RedirectResponse
    {
        $event = $this->findPublicOpenEvent($slug);

        // Check for existing registration with same email
        $existing = Participant::where('event_id', $event->id)
            ->where('email', $request->email)
            ->first();

        if ($existing) {
            if ($existing->status === 'waitlisted') {
                return redirect()->route('public.event.waitlisted', [
                    'slug' => $event->slug,
                    'registration_code' => $existing->registration_code,
                ]);
            }

            return redirect()->route('public.event.registered', [
                'slug' => $event->slug,
                'registration_code' => $existing->registration_code,
            ]);
        }

        // If event is full, add to waitlist
        $isWaitlisted = $event->isFull();

        $participant = Participant::create([
            'event_id' => $event->id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company' => $request->company,
            'job_title' => $request->job_title,
            'country' => $request->country,
            'city' => $request->city,
            'ticket_type' => 'general',
            'status' => $isWaitlisted ? 'waitlisted' : 'confirmed',
        ]);

        if ($isWaitlisted) {
            Mail::to($participant->email)->send(new WaitlistConfirmation($participant, $event));

            return redirect()->route('public.event.waitlisted', [
                'slug' => $event->slug,
                'registration_code' => $participant->registration_code,
            ]);
        }

        SendRegistrationConfirmation::dispatch($participant, $event);

        return redirect()->route('public.event.registered', [
            'slug' => $event->slug,
            'registration_code' => $participant->registration_code,
        ]);
    }

    public function registrationSuccess(string $slug, string $registrationCode): Response
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $participant = Participant::where('event_id', $event->id)
            ->where('registration_code', $registrationCode)
            ->firstOrFail();

        $networkingUrl = route('public.networking', [
            'slug' => $event->slug,
            'registration_code' => $participant->registration_code,
        ]);

        return Inertia::render('Public/EventRegistrationSuccess', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
                'date_start' => $event->date_start,
                'date_end' => $event->date_end,
                'location' => $event->location,
                'venue' => $event->venue,
            ],
            'participant' => [
                'first_name' => $participant->first_name,
                'full_name' => $participant->full_name,
                'email' => $participant->email,
                'registration_code' => $participant->registration_code,
            ],
            'networkingUrl' => $networkingUrl,
        ]);
    }

    public function waitlistSuccess(string $slug, string $registrationCode): Response
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $participant = Participant::where('event_id', $event->id)
            ->where('registration_code', $registrationCode)
            ->where('status', 'waitlisted')
            ->firstOrFail();

        $position = Participant::where('event_id', $event->id)
            ->where('status', 'waitlisted')
            ->where('created_at', '<=', $participant->created_at)
            ->count();

        return Inertia::render('Public/EventWaitlist', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
                'date_start' => $event->date_start,
                'date_end' => $event->date_end,
                'location' => $event->location,
                'venue' => $event->venue,
            ],
            'participant' => [
                'first_name' => $participant->first_name,
                'full_name' => $participant->full_name,
                'email' => $participant->email,
                'registration_code' => $participant->registration_code,
            ],
            'position' => $position,
        ]);
    }

    public function lookup(Request $request, string $slug): RedirectResponse
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Ingresa tu correo electronico.',
            'email.email' => 'Ingresa un correo electronico valido.',
        ]);

        $participant = Participant::where('event_id', $event->id)
            ->where('email', $request->email)
            ->whereIn('status', ['registered', 'confirmed', 'attended'])
            ->first();

        if (! $participant) {
            return back()->withErrors(['lookup' => 'No encontramos un registro con este correo. Verifica e intenta de nuevo.']);
        }

        return redirect()->route('public.networking', [
            'slug' => $event->slug,
            'registration_code' => $participant->registration_code,
        ]);
    }

    private function findPublicOpenEvent(string $slug): Event
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        if ($event->registration_type !== 'open') {
            throw new NotFoundHttpException;
        }

        return $event;
    }
}
