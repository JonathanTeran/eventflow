<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpeakerRequest;
use App\Models\Event;
use App\Models\Speaker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SpeakerController extends Controller
{
    public function index(Event $event): Response
    {
        $this->authorize('view', $event);

        $speakers = $event->speakers()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($speaker) => array_merge($speaker->toArray(), [
                'photo_url' => $speaker->photo_url,
                'full_name' => $speaker->full_name,
            ]));

        return Inertia::render('Events/Speakers/Index', [
            'event' => $event,
            'speakers' => $speakers,
        ]);
    }

    public function create(Event $event): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('Events/Speakers/Create', [
            'event' => $event,
        ]);
    }

    public function store(StoreSpeakerRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        $data = $request->validated();
        $data['sort_order'] = ($event->speakers()->max('sort_order') ?? 0) + 1;

        $event->speakers()->create($data);

        return redirect()->route('events.speakers.index', $event)
            ->with('success', 'Speaker agregado correctamente.');
    }

    public function edit(Event $event, Speaker $speaker): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('Events/Speakers/Edit', [
            'event' => $event,
            'speaker' => array_merge($speaker->toArray(), [
                'photo_url' => $speaker->photo_url,
            ]),
        ]);
    }

    public function update(Request $request, Event $event, Speaker $speaker)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:5000'],
            'social_links' => ['nullable', 'array'],
            'social_links.twitter' => ['nullable', 'url', 'max:255'],
            'social_links.linkedin' => ['nullable', 'url', 'max:255'],
            'social_links.website' => ['nullable', 'url', 'max:255'],
            'status' => ['required', Rule::in(['invited', 'confirmed', 'declined'])],
        ]);

        $speaker->update($validated);

        return redirect()->route('events.speakers.index', $event)
            ->with('success', 'Speaker actualizado correctamente.');
    }

    public function destroy(Event $event, Speaker $speaker)
    {
        $this->authorize('update', $event);

        if (! request()->user()->can('speakers.delete')) {
            abort(403);
        }

        $speaker->delete();

        return back()->with('success', 'Speaker eliminado correctamente.');
    }

    public function updatePhoto(Request $request, Event $event, Speaker $speaker)
    {
        $this->authorize('update', $event);

        $request->validate([
            'photo' => ['required', 'image', 'max:2048'],
        ]);

        if ($speaker->photo_path) {
            Storage::disk('public')->delete($speaker->photo_path);
        }

        $path = $request->file('photo')->store(
            "events/{$event->id}/speakers",
            'public'
        );

        $speaker->update(['photo_path' => $path]);

        return back()->with('success', 'Foto actualizada correctamente.');
    }

    public function reorder(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'speakers' => ['required', 'array'],
            'speakers.*.id' => ['required', 'string'],
            'speakers.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['speakers'] as $item) {
            Speaker::where('id', $item['id'])
                ->where('event_id', $event->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente.');
    }
}
