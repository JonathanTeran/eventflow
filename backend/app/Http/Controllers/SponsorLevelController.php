<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\SponsorLevel;
use Illuminate\Http\Request;

class SponsorLevelController extends Controller
{
    public function index(Event $event)
    {
        $this->authorize('view', $event);

        return response()->json([
            'sponsor_levels' => $event->sponsorLevels()->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'benefits' => ['nullable', 'array'],
            'price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $maxOrder = $event->sponsorLevels()->max('sort_order') ?? 0;
        $validated['sort_order'] = $maxOrder + 1;

        $sponsorLevel = $event->sponsorLevels()->create($validated);

        return back()->with('success', 'Nivel de sponsor creado correctamente.');
    }

    public function update(Request $request, Event $event, SponsorLevel $sponsorLevel)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'benefits' => ['nullable', 'array'],
            'price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $sponsorLevel->update($validated);

        return back()->with('success', 'Nivel de sponsor actualizado correctamente.');
    }

    public function destroy(Event $event, SponsorLevel $sponsorLevel)
    {
        $this->authorize('update', $event);

        $sponsorLevel->delete();

        return back()->with('success', 'Nivel de sponsor eliminado correctamente.');
    }

    public function reorder(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'levels' => ['required', 'array'],
            'levels.*.id' => ['required', 'string'],
            'levels.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['levels'] as $level) {
            SponsorLevel::where('id', $level['id'])
                ->where('event_id', $event->id)
                ->update(['sort_order' => $level['sort_order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente.');
    }
}
