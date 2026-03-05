<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\ParticipantScan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScannerController extends Controller
{
    public function show(Event $event): Response
    {
        $this->authorize('view', $event);

        if (! request()->user()->can('participants.checkin')) {
            abort(403);
        }

        $scanTypes = $event->settings['scan_types'] ?? [
            ['key' => 'checkin', 'label' => 'Check-in', 'enabled' => true],
        ];

        $enabledTypes = collect($scanTypes)->where('enabled', true)->values();

        return Inertia::render('Events/Scanner', [
            'event' => $event,
            'scanTypes' => $enabledTypes,
            'stats' => $this->getStats($event),
        ]);
    }

    public function scan(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        if (! $request->user()->can('participants.checkin')) {
            abort(403);
        }

        $request->validate([
            'registration_code' => ['required', 'string'],
            'scan_type' => ['required', 'string'],
        ]);

        $participant = Participant::where('event_id', $event->id)
            ->where('registration_code', $request->registration_code)
            ->first();

        if (! $participant) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Participante no encontrado.',
            ], 404);
        }

        if ($participant->status === 'cancelled') {
            return response()->json([
                'status' => 'cancelled',
                'message' => 'Este registro fue cancelado.',
                'participant' => $this->formatParticipant($participant),
            ], 422);
        }

        // Check for duplicate scan
        $existing = ParticipantScan::where('participant_id', $participant->id)
            ->where('event_id', $event->id)
            ->where('scan_type', $request->scan_type)
            ->exists();

        if ($existing) {
            return response()->json([
                'status' => 'duplicate',
                'message' => 'Ya fue escaneado para este tipo.',
                'participant' => $this->formatParticipant($participant),
            ], 409);
        }

        // Create scan record
        ParticipantScan::create([
            'participant_id' => $participant->id,
            'event_id' => $event->id,
            'scan_type' => $request->scan_type,
            'scanned_by' => $request->user()->id,
            'scanned_at' => now(),
        ]);

        // If checkin type, update participant status
        if ($request->scan_type === 'checkin') {
            $participant->update([
                'status' => 'attended',
                'checked_in_at' => now(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Escaneo registrado correctamente.',
            'participant' => $this->formatParticipant($participant->fresh()),
        ]);
    }

    public function stats(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return response()->json($this->getStats($event));
    }

    private function getStats(Event $event): array
    {
        $totalParticipants = $event->participants()
            ->where('status', '!=', 'cancelled')
            ->count();

        $scanCounts = ParticipantScan::where('event_id', $event->id)
            ->selectRaw('scan_type, count(*) as count')
            ->groupBy('scan_type')
            ->pluck('count', 'scan_type')
            ->toArray();

        return [
            'total_participants' => $totalParticipants,
            'scan_counts' => $scanCounts,
        ];
    }

    private function formatParticipant(Participant $participant): array
    {
        return [
            'id' => $participant->id,
            'full_name' => $participant->full_name,
            'email' => $participant->email,
            'company' => $participant->company,
            'job_title' => $participant->job_title,
            'ticket_type' => $participant->ticket_type,
            'status' => $participant->status,
            'registration_code' => $participant->registration_code,
        ];
    }
}
