<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Event::class);

        $isSuperAdmin = $request->user()->isSuperAdmin();

        $events = Event::query()
            ->when($isSuperAdmin, fn ($q) => $q->with('organization:id,name'))
            ->when($request->search, fn ($q, $search) => $q->where('name', 'ilike', "%{$search}%"))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('date_start')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Events/Index', [
            'events' => $events,
            'filters' => $request->only(['search', 'status']),
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Event::class);

        if (! $request->user()->currentOrganizationId()) {
            return redirect()->route('events.index')
                ->with('error', 'Debes impersonar una organización para crear eventos.');
        }

        return Inertia::render('Events/Create');
    }

    public function store(StoreEventRequest $request)
    {
        if (! $request->user()->currentOrganizationId()) {
            return back()->with('error', 'Debes impersonar una organización para crear eventos.');
        }

        $event = Event::create($request->safe()->except('cover_image'));

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store("events/{$event->id}", 'public');
            $event->update(['cover_image_path' => $path]);
        }

        // Create default sponsor levels
        $defaultLevels = [
            ['name' => 'Oro', 'sort_order' => 1],
            ['name' => 'Plata', 'sort_order' => 2],
            ['name' => 'Bronce', 'sort_order' => 3],
        ];

        foreach ($defaultLevels as $level) {
            $event->sponsorLevels()->create($level);
        }

        return redirect()->route('events.show', $event)
            ->with('success', 'Evento creado correctamente.');
    }

    public function show(Event $event): Response
    {
        $this->authorize('view', $event);

        $event->load('sponsorLevels');
        $event->loadCount(['participants', 'speakers', 'sponsors', 'agendaItems']);

        $previewUrl = URL::temporarySignedRoute(
            'public.event',
            now()->addHour(),
            ['slug' => $event->slug]
        );

        return Inertia::render('Events/Show', [
            'event' => $event,
            'previewUrl' => $previewUrl,
        ]);
    }

    public function edit(Event $event): Response
    {
        $this->authorize('update', $event);

        $scanTypes = $event->settings['scan_types'] ?? [
            ['key' => 'checkin', 'label' => 'Check-in', 'enabled' => true],
        ];

        return Inertia::render('Events/Edit', [
            'event' => $event,
            'scanTypes' => $scanTypes,
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event)
    {
        $event->update($request->validated());

        return redirect()->route('events.show', $event)
            ->with('success', 'Evento actualizado correctamente.');
    }

    public function destroy(Event $event)
    {
        $this->authorize('delete', $event);

        $event->delete();

        return redirect()->route('events.index')
            ->with('success', 'Evento eliminado correctamente.');
    }

    public function updateCover(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $request->validate([
            'cover_image' => ['required', 'image', 'max:4096'],
        ]);

        if ($event->cover_image_path) {
            Storage::disk('public')->delete($event->cover_image_path);
        }

        $path = $request->file('cover_image')->store(
            "events/{$event->id}",
            'public'
        );

        $event->update(['cover_image_path' => $path]);

        return back()->with('success', 'Imagen de portada actualizada correctamente.');
    }

    public function updateStatus(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['draft', 'published', 'active', 'completed', 'cancelled'])],
        ]);

        $event->update($validated);

        return back()->with('success', 'Estado del evento actualizado correctamente.');
    }
}
