<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        $totalEvents = Event::withoutGlobalScope('organization')->count();

        // Event status breakdown
        $eventsByStatus = Event::withoutGlobalScope('organization')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Users by role
        $usersByRole = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.name', DB::raw('count(*) as count'))
            ->groupBy('roles.name')
            ->pluck('count', 'name')
            ->toArray();

        // Organizations ranked by events count
        $topOrganizations = Organization::withCount([
                'users',
                'events' => fn ($q) => $q->withoutGlobalScope('organization'),
            ])
            ->where('is_active', true)
            ->orderByDesc('events_count')
            ->limit(5)
            ->get(['id', 'name', 'slug', 'is_active', 'created_at']);

        // Upcoming events (next 5 across all orgs)
        $upcomingEvents = Event::withoutGlobalScope('organization')
            ->with('organization:id,name')
            ->where('date_start', '>', now())
            ->whereIn('status', ['published', 'active'])
            ->orderBy('date_start')
            ->limit(5)
            ->get(['id', 'name', 'date_start', 'date_end', 'location', 'status', 'capacity', 'organization_id']);

        // Monthly registrations (last 6 months of users)
        $monthlyUsers = User::select(
                DB::raw("to_char(created_at, 'YYYY-MM') as month"),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        // Monthly orgs (last 6 months)
        $monthlyOrgs = Organization::select(
                DB::raw("to_char(created_at, 'YYYY-MM') as month"),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        // Fill missing months
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $months[$month] = [
                'label' => now()->subMonths($i)->translatedFormat('M Y'),
                'users' => $monthlyUsers[$month] ?? 0,
                'organizations' => $monthlyOrgs[$month] ?? 0,
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_organizations' => Organization::count(),
                'active_organizations' => Organization::where('is_active', true)->count(),
                'inactive_organizations' => Organization::where('is_active', false)->count(),
                'total_users' => User::count(),
                'total_events' => $totalEvents,
                'published_events' => $eventsByStatus['published'] ?? 0,
                'active_events' => $eventsByStatus['active'] ?? 0,
                'draft_events' => $eventsByStatus['draft'] ?? 0,
                'completed_events' => $eventsByStatus['completed'] ?? 0,
            ],
            'events_by_status' => $eventsByStatus,
            'users_by_role' => $usersByRole,
            'top_organizations' => $topOrganizations,
            'upcoming_events' => $upcomingEvents,
            'monthly_growth' => array_values($months),
            'recent_organizations' => Organization::withCount(['users', 'events'])
                ->latest()
                ->limit(5)
                ->get(),
            'recent_users' => User::with('organization:id,name', 'roles:id,name')
                ->latest()
                ->limit(10)
                ->get(['id', 'first_name', 'last_name', 'email', 'organization_id', 'created_at']),
        ]);
    }
}
