<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participant;
use App\Models\Speaker;
use App\Models\Sponsor;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        if (! request()->user()->can('events.view')) {
            abort(403);
        }

        // 1. Events by Month (Bar Chart)
        $monthlyEvents = Event::select('date_start')
            ->where('date_start', '>=', now()->subMonths(5)->startOfMonth())
            ->get()
            ->groupBy(function ($event) {
                return $event->date_start->format('Y-m');
            })
            ->map->count();

        $eventsChartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $monthName = now()->subMonths($i)->translatedFormat('M Y');
            $eventsChartData[] = [
                'x' => ucfirst($monthName),
                'y' => $monthlyEvents->get($month, 0)
            ];
        }

        // 2. Participants by Status (Pie Chart)
        $participantStats = Participant::whereHas('event')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($stat) {
                return [
                    'status' => $stat->status,
                    'count' => $stat->count
                ];
            });

        // 3. Events by Status (Pie Chart)
        $eventsByStatus = Event::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($stat) {
                return [
                    'status' => $stat->status,
                    'count' => $stat->count
                ];
            });

        // 4. Top Events by Participants (Bar Chart)
        $topEvents = Event::withCount('participants')
            ->orderByDesc('participants_count')
            ->limit(5)
            ->get()
            ->map(function ($event) {
                return [
                    'x' => \Illuminate\Support\Str::limit($event->name, 20),
                    'y' => $event->participants_count
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'active_events' => Event::whereIn('status', ['published', 'active'])->count(),
                'draft_events' => Event::where('status', 'draft')->count(),
                'completed_events' => Event::where('status', 'completed')->count(),
                'total_events' => Event::count(),
                'total_participants' => Participant::whereHas('event')->count(),
                'total_speakers' => Speaker::whereHas('event')->count(),
                'total_sponsors' => Sponsor::whereHas('event')->count(),
            ],
            'charts' => [
                'events_by_month' => $eventsChartData,
                'participants_by_status' => $participantStats,
                'events_by_status' => $eventsByStatus,
                'top_events_by_participants' => $topEvents,
            ],
            'upcoming_events' => Event::where('date_start', '>', now())
                ->whereIn('status', ['published', 'active'])
                ->orderBy('date_start')
                ->limit(5)
                ->get(),
            'recent_events' => Event::orderByDesc('created_at')
                ->limit(5)
                ->get(),
        ]);
    }
}
