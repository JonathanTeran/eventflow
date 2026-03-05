<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSponsorRequest;
use App\Models\Event;
use App\Models\Sponsor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SponsorController extends Controller
{
    public function index(Event $event): Response
    {
        $this->authorize('view', $event);

        $sponsors = $event->sponsors()
            ->with('sponsorLevel:id,name')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($sponsor) => array_merge($sponsor->toArray(), [
                'logo_url' => $sponsor->logo_url,
            ]));

        $sponsorLevels = $event->sponsorLevels()->orderBy('sort_order')->get();

        return Inertia::render('Events/Sponsors/Index', [
            'event' => $event,
            'sponsors' => $sponsors,
            'sponsorLevels' => $sponsorLevels,
        ]);
    }

    public function create(Event $event): Response
    {
        $this->authorize('update', $event);

        $sponsorLevels = $event->sponsorLevels()->orderBy('sort_order')->get();

        return Inertia::render('Events/Sponsors/Create', [
            'event' => $event,
            'sponsorLevels' => $sponsorLevels,
        ]);
    }

    public function store(StoreSponsorRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        $data = $request->validated();
        $data['sort_order'] = ($event->sponsors()->max('sort_order') ?? 0) + 1;

        $event->sponsors()->create($data);

        return redirect()->route('events.sponsors.index', $event)
            ->with('success', 'Sponsor agregado correctamente.');
    }

    public function edit(Event $event, Sponsor $sponsor): Response
    {
        $this->authorize('update', $event);

        $sponsor->load('sponsorLevel:id,name');
        $sponsorLevels = $event->sponsorLevels()->orderBy('sort_order')->get();

        return Inertia::render('Events/Sponsors/Edit', [
            'event' => $event,
            'sponsor' => array_merge($sponsor->toArray(), [
                'logo_url' => $sponsor->logo_url,
            ]),
            'sponsorLevels' => $sponsorLevels,
        ]);
    }

    public function update(Request $request, Event $event, Sponsor $sponsor)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'sponsor_level_id' => ['nullable', 'string', Rule::exists('sponsor_levels', 'id')],
            'company_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['prospect', 'confirmed', 'paid'])],
        ]);

        $sponsor->update($validated);

        return redirect()->route('events.sponsors.index', $event)
            ->with('success', 'Sponsor actualizado correctamente.');
    }

    public function destroy(Event $event, Sponsor $sponsor)
    {
        $this->authorize('update', $event);

        if (! request()->user()->can('sponsors.delete')) {
            abort(403);
        }

        $sponsor->delete();

        return back()->with('success', 'Sponsor eliminado correctamente.');
    }

    public function updateLogo(Request $request, Event $event, Sponsor $sponsor)
    {
        $this->authorize('update', $event);

        $request->validate([
            'logo' => ['required', 'image', 'max:4096'],
        ]);

        if ($sponsor->logo_path) {
            Storage::disk('public')->delete($sponsor->logo_path);
        }

        $path = $request->file('logo')->store(
            "events/{$event->id}/sponsors",
            'public'
        );

        $sponsor->update(['logo_path' => $path]);

        return back()->with('success', 'Logo actualizado correctamente.');
    }

    public function reorder(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'sponsors' => ['required', 'array'],
            'sponsors.*.id' => ['required', 'string'],
            'sponsors.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['sponsors'] as $item) {
            Sponsor::where('id', $item['id'])
                ->where('event_id', $event->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente.');
    }
}
