<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommunityRequest;
use App\Models\Community;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function index(Event $event): Response
    {
        $this->authorize('view', $event);

        $communities = $event->communities()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($community) => array_merge($community->toArray(), [
                'logo_url' => $community->logo_url,
            ]));

        return Inertia::render('Events/Communities/Index', [
            'event' => $event,
            'communities' => $communities,
        ]);
    }

    public function create(Event $event): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('Events/Communities/Create', [
            'event' => $event,
        ]);
    }

    public function store(StoreCommunityRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        $data = $request->validated();
        $data['sort_order'] = ($event->communities()->max('sort_order') ?? 0) + 1;

        $event->communities()->create($data);

        return redirect()->route('events.communities.index', $event)
            ->with('success', 'Comunidad agregada correctamente.');
    }

    public function edit(Event $event, Community $community): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('Events/Communities/Edit', [
            'event' => $event,
            'community' => array_merge($community->toArray(), [
                'logo_url' => $community->logo_url,
            ]),
        ]);
    }

    public function update(Request $request, Event $event, Community $community)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $community->update($validated);

        return redirect()->route('events.communities.index', $event)
            ->with('success', 'Comunidad actualizada correctamente.');
    }

    public function destroy(Event $event, Community $community)
    {
        $this->authorize('update', $event);

        if (! request()->user()->can('communities.delete')) {
            abort(403);
        }

        $community->delete();

        return back()->with('success', 'Comunidad eliminada correctamente.');
    }

    public function updateLogo(Request $request, Event $event, Community $community)
    {
        $this->authorize('update', $event);

        $request->validate([
            'logo' => ['required', 'image', 'max:4096'],
        ]);

        if ($community->logo_path) {
            Storage::disk('public')->delete($community->logo_path);
        }

        $path = $request->file('logo')->store(
            "events/{$event->id}/communities",
            'public'
        );

        $community->update(['logo_path' => $path]);

        return back()->with('success', 'Logo actualizado correctamente.');
    }

    public function reorder(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'communities' => ['required', 'array'],
            'communities.*.id' => ['required', 'string'],
            'communities.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['communities'] as $item) {
            Community::where('id', $item['id'])
                ->where('event_id', $event->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente.');
    }
}
