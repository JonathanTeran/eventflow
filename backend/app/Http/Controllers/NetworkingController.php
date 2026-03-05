<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\ParticipantConnection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class NetworkingController extends Controller
{
    public function show(string $slug, string $registrationCode): Response
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $savedContactIds = $participant->savedContacts()->pluck('connected_participant_id')->toArray();

        $profileUrl = url("/e/{$event->slug}/networking/{$participant->registration_code}/profile");

        return Inertia::render('Public/Networking', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'participant' => [
                'first_name' => $participant->first_name,
                'full_name' => $participant->full_name,
                'registration_code' => $participant->registration_code,
                'networking_pin' => $participant->networking_pin,
                'social_links' => $participant->social_links ?? [],
                'networking_visible' => $participant->networking_visible,
            ],
            'savedContactIds' => $savedContactIds,
            'profileUrl' => $profileUrl,
        ]);
    }

    public function updatePin(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $validated = $request->validate([
            'networking_pin' => ['required', 'string', 'size:6', 'regex:/^[A-Z0-9]{6}$/'],
        ], [
            'networking_pin.required' => 'El PIN es obligatorio.',
            'networking_pin.size' => 'El PIN debe tener exactamente 6 caracteres.',
            'networking_pin.regex' => 'El PIN solo puede contener letras mayusculas y numeros.',
        ]);

        $pin = strtoupper($validated['networking_pin']);

        $exists = Participant::where('event_id', $event->id)
            ->where('networking_pin', $pin)
            ->where('id', '!=', $participant->id)
            ->whereNull('deleted_at')
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Este PIN ya esta en uso por otro participante.',
                'errors' => ['networking_pin' => ['Este PIN ya esta en uso por otro participante.']],
            ], 422);
        }

        $data = ['networking_pin' => $pin];

        // Auto-enable networking visibility on first PIN set
        if (! $participant->networking_pin) {
            $data['networking_visible'] = true;
        }

        $participant->update($data);

        return response()->json([
            'networking_pin' => $participant->networking_pin,
            'networking_visible' => $participant->networking_visible,
            'message' => 'PIN actualizado correctamente.',
        ]);
    }

    public function searchPin(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $request->validate([
            'networking_pin' => ['required', 'string', 'size:6'],
        ]);

        $pin = strtoupper($request->input('networking_pin'));

        $found = Participant::where('event_id', $event->id)
            ->where('networking_pin', $pin)
            ->where('id', '!=', $participant->id)
            ->whereIn('status', ['confirmed', 'attended'])
            ->whereNull('deleted_at')
            ->first();

        if (! $found) {
            return response()->json([
                'found' => false,
                'contact' => null,
            ]);
        }

        $alreadySaved = $participant->savedContacts()
            ->where('connected_participant_id', $found->id)
            ->exists();

        return response()->json([
            'found' => true,
            'contact' => [
                'id' => $found->id,
                'full_name' => $found->full_name,
                'company' => $found->company,
                'job_title' => $found->job_title,
                'email' => $found->email,
                'registration_code' => $found->registration_code,
                'social_links' => $found->social_links ?? [],
            ],
            'already_saved' => $alreadySaved,
        ]);
    }

    public function updateProfile(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $validated = $request->validate([
            'social_links' => ['nullable', 'array'],
            'social_links.linkedin' => ['nullable', 'url', 'max:500'],
            'social_links.github' => ['nullable', 'url', 'max:500'],
            'social_links.instagram' => ['nullable', 'url', 'max:500'],
            'social_links.website' => ['nullable', 'url', 'max:500'],
            'social_links.whatsapp' => ['nullable', 'string', 'max:500'],
            'networking_visible' => ['sometimes', 'boolean'],
        ]);

        $participant->update([
            'social_links' => $validated['social_links'] ?? [],
            'networking_visible' => $validated['networking_visible'] ?? $participant->networking_visible,
        ]);

        return response()->json([
            'message' => 'Perfil de networking actualizado.',
            'social_links' => $participant->social_links,
            'networking_visible' => $participant->networking_visible,
        ]);
    }

    public function profile(string $slug, string $registrationCode): Response
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $participant = Participant::where('event_id', $event->id)
            ->where('registration_code', $registrationCode)
            ->whereIn('status', ['confirmed', 'attended'])
            ->whereNull('deleted_at')
            ->first();

        if (! $participant) {
            throw new NotFoundHttpException;
        }

        $viewerRc = request()->query('viewer');
        $connectionStatus = 'none';

        if ($viewerRc) {
            if ($viewerRc === $registrationCode) {
                $connectionStatus = 'self';
            } else {
                $viewer = Participant::where('event_id', $event->id)
                    ->where('registration_code', $viewerRc)
                    ->whereIn('status', ['confirmed', 'attended'])
                    ->whereNull('deleted_at')
                    ->first();

                if ($viewer) {
                    $connection = ParticipantConnection::where(function ($q) use ($viewer, $participant) {
                        $q->where('participant_id', $viewer->id)
                          ->where('connected_participant_id', $participant->id);
                    })->orWhere(function ($q) use ($viewer, $participant) {
                        $q->where('participant_id', $participant->id)
                          ->where('connected_participant_id', $viewer->id);
                    })->first();

                    if ($connection) {
                        if ($connection->status === ParticipantConnection::STATUS_ACCEPTED) {
                            $connectionStatus = 'accepted';
                        } elseif ($connection->status === ParticipantConnection::STATUS_PENDING) {
                            // Si el viewer es quien envió la solicitud (participant_id = viewer->id)
                            if ($connection->participant_id === $viewer->id) {
                                $connectionStatus = 'pending_sent';
                            } else {
                                $connectionStatus = 'pending_received';
                            }
                        }
                    }
                }
            }
        }

        $isPublicView = !in_array($connectionStatus, ['self', 'accepted']);

        return Inertia::render('Public/NetworkingProfile', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'participant' => [
                'id' => $participant->id,
                'first_name' => $participant->first_name,
                'last_name' => $participant->last_name,
                'full_name' => $participant->full_name,
                'email' => $isPublicView ? null : $participant->email,
                'company' => $participant->company,
                'job_title' => $participant->job_title,
                'social_links' => $isPublicView ? [] : ($participant->social_links ?? []),
                'registration_code' => $participant->registration_code,
            ],
            'connectionStatus' => $connectionStatus,
            'viewerRegistrationCode' => $viewerRc,
        ]);
    }

    public function acceptContact(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $validated = $request->validate([
            'requester_participant_id' => ['required', 'string'],
        ]);

        $connection = ParticipantConnection::where('participant_id', $validated['requester_participant_id'])
            ->where('connected_participant_id', $participant->id)
            ->where('status', ParticipantConnection::STATUS_PENDING)
            ->first();

        if (! $connection) {
            return response()->json(['message' => 'Solicitud no encontrada.'], 404);
        }

        $connection->update(['status' => ParticipantConnection::STATUS_ACCEPTED]);

        // Crear la conexión inversa para que sea verdaderamente bidireccional y simple de consultar
        ParticipantConnection::firstOrCreate(
            [
                'participant_id' => $participant->id,
                'connected_participant_id' => $validated['requester_participant_id'],
            ],
            ['status' => ParticipantConnection::STATUS_ACCEPTED]
        );

        return response()->json(['accepted' => true]);
    }

    public function connectWithPin(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $validated = $request->validate([
            'target_participant_id' => ['required'],
            'pin' => ['required', 'string', 'size:6'],
        ]);

        $target = Participant::where('event_id', $event->id)
            ->where('id', $validated['target_participant_id'])
            ->whereIn('status', ['confirmed', 'attended'])
            ->whereNull('deleted_at')
            ->first();

        if (! $target || $target->id === $participant->id) {
            return response()->json([
                'message' => 'Participante no válido.'
            ], 422);
        }

        if (strtoupper($target->networking_pin) !== strtoupper($validated['pin'])) {
            return response()->json([
                'message' => 'El PIN ingresado es incorrecto.'
            ], 422);
        }

        // Crear la conexión bidireccional ACEPTADA
        ParticipantConnection::updateOrCreate(
            [
                'participant_id' => $participant->id,
                'connected_participant_id' => $target->id,
            ],
            ['status' => ParticipantConnection::STATUS_ACCEPTED]
        );

        ParticipantConnection::updateOrCreate(
            [
                'participant_id' => $target->id,
                'connected_participant_id' => $participant->id,
            ],
            ['status' => ParticipantConnection::STATUS_ACCEPTED]
        );

        return response()->json(['connected' => true]);
    }

    public function rejectContact(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $validated = $request->validate([
            'requester_participant_id' => ['required', 'string'],
        ]);

        ParticipantConnection::where('participant_id', $validated['requester_participant_id'])
            ->where('connected_participant_id', $participant->id)
            ->where('status', ParticipantConnection::STATUS_PENDING)
            ->delete();

        return response()->json(['rejected' => true]);
    }

    public function directory(string $slug, string $registrationCode): Response
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $search = request()->query('search');

        $query = Participant::where('event_id', $event->id)
            ->networkingVisible()
            ->whereIn('status', ['confirmed', 'attended'])
            ->whereNull('deleted_at')
            ->where('id', '!=', $participant->id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $participants = $query->orderBy('first_name')
            ->paginate(20)
            ->withQueryString();

        $savedContactIds = $participant->savedContacts()->pluck('connected_participant_id')->toArray();

        return Inertia::render('Public/NetworkingDirectory', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'participants' => $participants->through(fn ($p) => [
                'id' => $p->id,
                'full_name' => $p->full_name,
                'first_name' => $p->first_name,
                'company' => $p->company,
                'job_title' => $p->job_title,
                'registration_code' => $p->registration_code,
            ]),
            'savedContactIds' => $savedContactIds,
            'viewerRegistrationCode' => $participant->registration_code,
            'search' => $search ?? '',
        ]);
    }

    public function saveContact(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $validated = $request->validate([
            'connected_participant_id' => ['required', 'string'],
        ]);

        $target = Participant::where('event_id', $event->id)
            ->where('id', $validated['connected_participant_id'])
            ->whereNull('deleted_at')
            ->first();

        if (! $target || $target->id === $participant->id) {
            return response()->json(['message' => 'Participante no valido.'], 422);
        }

        ParticipantConnection::firstOrCreate(
            [
                'participant_id' => $participant->id,
                'connected_participant_id' => $target->id,
            ],
            ['status' => ParticipantConnection::STATUS_PENDING]
        );

        return response()->json(['saved' => true, 'status' => 'pending']);
    }

    public function removeContact(Request $request, string $slug, string $registrationCode): JsonResponse
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $validated = $request->validate([
            'connected_participant_id' => ['required', 'string'],
        ]);

        ParticipantConnection::where('participant_id', $participant->id)
            ->where('connected_participant_id', $validated['connected_participant_id'])
            ->delete();

        return response()->json(['removed' => true]);
    }

    public function myContacts(string $slug, string $registrationCode): Response
    {
        [$event, $participant] = $this->resolveEventAndParticipant($slug, $registrationCode);

        $connections = $participant->savedContacts()
            ->with('connectedParticipant')
            ->get();

        $contacts = $connections->map(fn ($conn) => [
            'id' => $conn->connectedParticipant->id,
            'full_name' => $conn->connectedParticipant->full_name,
            'first_name' => $conn->connectedParticipant->first_name,
            'email' => $conn->connectedParticipant->email,
            'company' => $conn->connectedParticipant->company,
            'job_title' => $conn->connectedParticipant->job_title,
            'social_links' => $conn->connectedParticipant->social_links ?? [],
            'registration_code' => $conn->connectedParticipant->registration_code,
            'saved_at' => $conn->created_at->toISOString(),
            'status' => $conn->status,
        ])->values();

        $incomingRequests = ParticipantConnection::where('connected_participant_id', $participant->id)
            ->where('status', ParticipantConnection::STATUS_PENDING)
            ->with('participant')
            ->get()
            ->map(fn ($conn) => [
                'id' => $conn->participant->id,
                'full_name' => $conn->participant->full_name,
                'first_name' => $conn->participant->first_name,
                'company' => $conn->participant->company,
                'job_title' => $conn->participant->job_title,
                'registration_code' => $conn->participant->registration_code,
                'requested_at' => $conn->created_at->toISOString(),
            ])->values();

        return Inertia::render('Public/NetworkingContacts', [
            'event' => [
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'contacts' => $contacts,
            'requests' => $incomingRequests,
            'participant' => [
                'first_name' => $participant->first_name,
                'full_name' => $participant->full_name,
                'registration_code' => $participant->registration_code,
            ],
        ]);
    }

    private function resolveEventAndParticipant(string $slug, string $registrationCode): array
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $participant = Participant::where('event_id', $event->id)
            ->where('registration_code', $registrationCode)
            ->whereIn('status', ['confirmed', 'attended'])
            ->whereNull('deleted_at')
            ->first();

        if (! $participant) {
            throw new NotFoundHttpException;
        }

        return [$event, $participant];
    }
}
