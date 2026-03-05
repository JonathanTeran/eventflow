<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::withoutGlobalScopes()
            ->where('status', '!=', 'draft')
            ->with(['organization:id,name,slug,logo_path,primary_color']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('venue', 'like', "%{$search}%");
            });
        }

        if ($request->input('upcoming') === 'true') {
            $query->where('date_end', '>=', now());
        }

        $query->orderBy('date_start', 'asc');

        $events = $query->paginate($request->input('per_page', 20));

        $events->getCollection()->transform(fn ($event) => $this->transformEvent($event));

        return response()->json($events);
    }

    public function featured(): JsonResponse
    {
        $events = Event::withoutGlobalScopes()
            ->whereIn('status', ['published', 'active'])
            ->where('date_end', '>=', now())
            ->with(['organization:id,name,slug,logo_path,primary_color'])
            ->orderBy('date_start', 'asc')
            ->take(10)
            ->get()
            ->map(fn ($event) => $this->transformEvent($event));

        return response()->json(['data' => $events]);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::withoutGlobalScopes()
            ->where('slug', $slug)
            ->where('status', '!=', 'draft')
            ->with([
                'organization:id,name,slug,logo_path,primary_color',
                'speakers' => fn ($q) => $q->where('status', 'confirmed')->orderBy('sort_order'),
                'sponsors' => fn ($q) => $q->whereIn('status', ['confirmed', 'paid'])->orderBy('sort_order'),
                'sponsors.sponsorLevel:id,name',
                'agenda' => fn ($q) => $q->orderBy('date')->orderBy('start_time'),
                'agenda.speaker:id,first_name,last_name,company,job_title,photo_path',
                'communities' => fn ($q) => $q->orderBy('sort_order'),
            ])
            ->firstOrFail();

        return response()->json(['data' => $this->transformEventDetail($event)]);
    }

    private function transformEvent(Event $event): array
    {
        return [
            'id' => $event->id,
            'organization_id' => $event->organization_id,
            'name' => $event->name,
            'slug' => $event->slug,
            'description' => $event->description,
            'date_start' => $event->date_start->toIso8601String(),
            'date_end' => $event->date_end->toIso8601String(),
            'location' => $event->location,
            'venue' => $event->venue,
            'latitude' => $event->latitude,
            'longitude' => $event->longitude,
            'capacity' => $event->capacity,
            'registration_type' => $event->registration_type,
            'status' => $event->status,
            'cover_image_url' => $event->cover_image_url,
            'registered_count' => $event->registeredCount(),
            'spots_left' => $event->spotsLeft(),
            'organization' => $event->organization ? [
                'id' => $event->organization->id,
                'name' => $event->organization->name,
                'slug' => $event->organization->slug,
                'logo_url' => $event->organization->logo_path
                    ? url('storage/' . $event->organization->logo_path)
                    : null,
                'primary_color' => $event->organization->primary_color,
            ] : null,
        ];
    }

    private function transformEventDetail(Event $event): array
    {
        $base = $this->transformEvent($event);

        $base['speakers'] = $event->speakers->map(fn ($s) => [
            'id' => $s->id,
            'first_name' => $s->first_name,
            'last_name' => $s->last_name,
            'email' => $s->email,
            'company' => $s->company,
            'job_title' => $s->job_title,
            'bio' => $s->bio,
            'photo_url' => $s->photo_url,
            'social_links' => $s->social_links,
            'status' => $s->status,
            'sort_order' => $s->sort_order,
        ]);

        $base['sponsors'] = $event->sponsors->map(fn ($sp) => [
            'id' => $sp->id,
            'company_name' => $sp->company_name,
            'logo_url' => $sp->logo_url,
            'website' => $sp->website,
            'description' => $sp->description,
            'level_name' => $sp->sponsorLevel?->name,
            'sort_order' => $sp->sort_order,
        ]);

        $base['agenda'] = $event->agenda->map(fn ($a) => [
            'id' => $a->id,
            'speaker_id' => $a->speaker_id,
            'title' => $a->title,
            'description' => $a->description,
            'date' => $a->date->toDateString(),
            'start_time' => $a->start_time,
            'end_time' => $a->end_time,
            'location_detail' => $a->location_detail,
            'type' => $a->type,
            'speaker' => $a->speaker ? [
                'id' => $a->speaker->id,
                'first_name' => $a->speaker->first_name,
                'last_name' => $a->speaker->last_name,
                'company' => $a->speaker->company,
                'job_title' => $a->speaker->job_title,
                'photo_url' => $a->speaker->photo_url,
            ] : null,
        ]);

        $base['communities'] = $event->communities->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'url' => $c->url,
            'logo_url' => $c->logo_path
                ? url('storage/' . $c->logo_path)
                : null,
            'description' => $c->description,
        ]);

        return $base;
    }
}
