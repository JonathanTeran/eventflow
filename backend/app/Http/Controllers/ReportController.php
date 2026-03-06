<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\Sponsor;
use App\Models\Speaker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display a listing of reports for the organization's events.
     */
    public function index(Request $request): Response
    {
        if (! request()->user()->can('events.view')) {
            abort(403);
        }

        // Get all events for the current organization to populate a selector if needed
        $eventsList = Event::select('id', 'name', 'date_start', 'status')
            ->orderByDesc('date_start')
            ->get();

        // Base query for participants in the organization
        $participantsQuery = Participant::whereHas('event');

        // Stats by Event
        $participantsByEvent = Participant::join('events', 'participants.event_id', '=', 'events.id')
            ->select('events.name as event_name', DB::raw('count(participants.id) as total_participants'))
            ->groupBy('events.id', 'events.name')
            ->orderByDesc('total_participants')
            ->limit(10)
            ->get();

        // Check-in rates by Event (Checked in / Total)
        $checkInRates = Participant::join('events', 'participants.event_id', '=', 'events.id')
            ->select(
                'events.name as event_name',
                DB::raw('count(participants.id) as total_registered'),
                DB::raw('SUM(CASE WHEN participants.status = \'attended\' THEN 1 ELSE 0 END) as total_checked_in')
            )
            ->groupBy('events.id', 'events.name')
            ->orderByDesc('total_registered')
            ->limit(10)
            ->get()
            ->map(function ($event) {
                $rate = $event->total_registered > 0 
                    ? round(($event->total_checked_in / $event->total_registered) * 100, 2) 
                    : 0;
                
                return [
                    'event_name' => $event->event_name,
                    'total_registered' => $event->total_registered,
                    'total_checked_in' => $event->total_checked_in,
                    'check_in_rate' => $rate,
                ];
            });

        // Global status distribution
        $globalStatus = Participant::whereHas('event')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Registration trends over time (last 30 days)
        $registrationsOverTime = Participant::whereHas('event')
            ->where('created_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Reports/Index', [
            'events_list' => $eventsList,
            'metrics' => [
                'total_events' => Event::count(),
                'total_participants' => Participant::whereHas('event')->count(),
                'total_checked_in' => Participant::whereHas('event')->where('status', 'attended')->count(),
                'total_sponsors' => Sponsor::whereHas('event')->count(),
                'total_speakers' => Speaker::whereHas('event')->count(),
            ],
            'charts' => [
                'participants_by_event' => $participantsByEvent,
                'check_in_rates' => $checkInRates,
                'global_status' => $globalStatus,
                'registrations_over_time' => $registrationsOverTime,
            ]
        ]);
    }
}
