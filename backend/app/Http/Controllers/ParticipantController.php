<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkImportParticipantsRequest;
use App\Http\Requests\StoreParticipantRequest;
use App\Http\Requests\UpdateParticipantRequest;
use App\Mail\WaitlistPromoted;
use App\Models\Event;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ParticipantController extends Controller
{
    public function index(Request $request, Event $event): Response
    {
        $this->authorize('view', $event);

        $participants = $event->participants()
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            }))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->ticket_type, fn ($q, $type) => $q->where('ticket_type', $type))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Events/Participants/Index', [
            'event' => $event,
            'participants' => $participants,
            'filters' => $request->only(['search', 'status', 'ticket_type']),
        ]);
    }

    public function create(Event $event): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('Events/Participants/Create', [
            'event' => $event,
        ]);
    }

    public function store(StoreParticipantRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        if ($event->isFull()) {
            return back()->withErrors(['capacity' => 'No se puede registrar: el evento ha alcanzado su capacidad máxima.']);
        }

        $event->participants()->create($request->validated());

        return redirect()->route('events.participants.index', $event)
            ->with('success', 'Participante registrado correctamente.');
    }

    public function edit(Event $event, Participant $participant): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('Events/Participants/Edit', [
            'event' => $event,
            'participant' => $participant,
        ]);
    }

    public function update(UpdateParticipantRequest $request, Event $event, Participant $participant)
    {
        $this->authorize('update', $event);

        $oldStatus = $participant->status;
        $participant->update($request->validated());

        // If participant was cancelled and there's someone in waitlist, promote them
        if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            $this->promoteFromWaitlist($event);
        }

        return redirect()->route('events.participants.index', $event)
            ->with('success', 'Participante actualizado correctamente.');
    }

    private function promoteFromWaitlist(Event $event): void
    {
        $promoted = $event->promoteFromWaitlist();

        if ($promoted) {
            Mail::to($promoted->email)->send(new WaitlistPromoted($promoted, $event));
        }
    }

    public function destroy(Event $event, Participant $participant)
    {
        $this->authorize('update', $event);

        $wasConfirmed = in_array($participant->status, ['registered', 'confirmed', 'attended']);
        $participant->delete();

        // If a confirmed participant was deleted, promote from waitlist
        if ($wasConfirmed) {
            $this->promoteFromWaitlist($event);
        }

        return back()->with('success', 'Participante eliminado correctamente.');
    }

    public function checkIn(Event $event, Participant $participant)
    {
        $this->authorize('view', $event);

        if (! request()->user()->can('participants.checkin')) {
            abort(403);
        }

        $participant->update([
            'status' => 'attended',
            'checked_in_at' => now(),
        ]);

        return back()->with('success', 'Check-in realizado correctamente.');
    }

    public function bulkImport(BulkImportParticipantsRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $header = fgetcsv($handle);

        if (! $header) {
            fclose($handle);

            return back()->withErrors(['file' => 'El archivo CSV está vacío.']);
        }

        $header = array_map(fn ($col) => strtolower(trim($col)), $header);
        $count = 0;

        DB::transaction(function () use ($handle, $header, $event, &$count) {
            while (($row = fgetcsv($handle)) !== false) {
                $data = array_combine($header, $row);

                if (empty($data['first_name']) || empty($data['last_name']) || empty($data['email'])) {
                    continue;
                }

                $event->participants()->updateOrCreate(
                    ['email' => trim($data['email'])],
                    [
                        'first_name' => trim($data['first_name']),
                        'last_name' => trim($data['last_name']),
                        'phone' => trim($data['phone'] ?? ''),
                        'company' => trim($data['company'] ?? ''),
                        'job_title' => trim($data['job_title'] ?? ''),
                        'ticket_type' => in_array($data['ticket_type'] ?? '', ['general', 'vip', 'student'])
                            ? $data['ticket_type']
                            : 'general',
                    ]
                );
                $count++;
            }
        });

        fclose($handle);

        return back()->with('success', "{$count} participantes importados correctamente.");
    }

    public function exportCsv(Event $event): StreamedResponse
    {
        $this->authorize('view', $event);

        $fileName = "participantes-{$event->slug}.csv";

        return response()->streamDownload(function () use ($event) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'first_name', 'last_name', 'email', 'phone', 'company',
                'job_title', 'country', 'city', 'ticket_type', 'status', 'registration_code', 'checked_in_at',
            ]);

            $event->participants()->orderBy('last_name')->chunk(200, function ($participants) use ($handle) {
                foreach ($participants as $participant) {
                    fputcsv($handle, [
                        $participant->first_name,
                        $participant->last_name,
                        $participant->email,
                        $participant->phone,
                        $participant->company,
                        $participant->job_title,
                        $participant->country,
                        $participant->city,
                        $participant->ticket_type,
                        $participant->status,
                        $participant->registration_code,
                        $participant->checked_in_at?->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
