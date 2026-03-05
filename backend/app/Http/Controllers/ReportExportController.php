<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportExportController extends Controller
{
    public function organizationReport(Request $request)
    {
        $user = Auth::user();
        $organizationId = $user->currentOrganizationId();

        $events = Event::where('organization_id', $organizationId)
            ->withCount(['participants', 'speakers', 'sponsors'])
            ->orderByDesc('date_start')
            ->get();

        $totalEvents = $events->count();
        $totalParticipants = $events->sum('participants_count');
        $totalSpeakers = $events->sum('speakers_count');
        $totalSponsors = $events->sum('sponsors_count');

        $totalAttended = Event::where('organization_id', $organizationId)
            ->withCount(['participants as attended_count' => function ($q) {
                $q->where('status', 'attended');
            }])
            ->get()
            ->sum('attended_count');

        $pdf = Pdf::loadView('pdf.report-organization', [
            'organization' => $user->organization ?? (object) ['name' => 'Mi Organizacion'],
            'events' => $events,
            'totalEvents' => $totalEvents,
            'totalParticipants' => $totalParticipants,
            'totalAttended' => $totalAttended,
            'totalSpeakers' => $totalSpeakers,
            'totalSponsors' => $totalSponsors,
            'generatedAt' => now(),
        ]);

        return $pdf->download('reporte-organizacion.pdf');
    }

    public function eventReport(Event $event)
    {
        $this->authorize('view', $event);

        $event->load(['participants', 'speakers', 'sponsors.sponsorLevel', 'agendaItems']);

        $participantsByStatus = $event->participants->groupBy('status')->map->count();
        $participantsByTicket = $event->participants->groupBy('ticket_type')->map->count();

        $pdf = Pdf::loadView('pdf.report-event', [
            'event' => $event,
            'participantsByStatus' => $participantsByStatus,
            'participantsByTicket' => $participantsByTicket,
            'generatedAt' => now(),
        ]);

        return $pdf->download("reporte-{$event->slug}.pdf");
    }

    public function participantsList(Event $event)
    {
        $this->authorize('view', $event);

        $participants = $event->participants()
            ->orderBy('last_name')
            ->get();

        $pdf = Pdf::loadView('pdf.participants-list', [
            'event' => $event,
            'participants' => $participants,
            'generatedAt' => now(),
        ]);

        return $pdf->download("participantes-{$event->slug}.pdf");
    }
}
