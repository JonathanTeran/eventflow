<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicHomeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $events = Event::withoutGlobalScopes()
            ->whereIn('status', ['published', 'active'])
            ->with('organization:id,name')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->orderBy('date_start', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Public/Home', [
            'events' => $events->through(fn (Event $event) => [
                'name' => $event->name,
                'slug' => $event->slug,
                'date_start' => $event->date_start,
                'date_end' => $event->date_end,
                'location' => $event->location,
                'venue' => $event->venue,
                'cover_image_url' => $event->cover_image_url,
                'status' => $event->status,
                'registration_type' => $event->registration_type,
                'organization' => $event->organization ? [
                    'name' => $event->organization->name,
                ] : null,
            ]),
            'search' => $search ?? '',
        ]);
    }
}
