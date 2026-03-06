<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgendaItemRequest;
use App\Models\AgendaItem;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AgendaItemController extends Controller
{
    public function index(Event $event): Response
    {
        $this->authorize('view', $event);

        $agendaItems = $event->agendaItems()
            ->with('speaker:id,first_name,last_name')
            ->orderBy('date')
            ->orderBy('start_time')
            ->orderBy('sort_order')
            ->get();

        $agendaItemsByDate = $agendaItems->groupBy(fn ($item) => $item->date->format('Y-m-d'));

        $speakers = $event->speakers()
            ->orderBy('sort_order')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('Events/Agenda/Index', [
            'event' => $event,
            'agendaItemsByDate' => $agendaItemsByDate,
            'speakers' => $speakers,
        ]);
    }

    public function create(Event $event): Response
    {
        $this->authorize('update', $event);

        $speakers = $event->speakers()
            ->orderBy('sort_order')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('Events/Agenda/Create', [
            'event' => $event,
            'speakers' => $speakers,
        ]);
    }

    public function store(StoreAgendaItemRequest $request, Event $event)
    {
        $this->authorize('update', $event);

        $data = $request->validated();
        $data['sort_order'] = ($event->agendaItems()->max('sort_order') ?? 0) + 1;

        $event->agendaItems()->create($data);

        return redirect()->route('events.agenda.index', $event)
            ->with('success', 'Sesión agregada correctamente.');
    }

    public function edit(Event $event, AgendaItem $agendaItem): Response
    {
        $this->authorize('update', $event);

        $speakers = $event->speakers()
            ->orderBy('sort_order')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('Events/Agenda/Edit', [
            'event' => $event,
            'agendaItem' => $agendaItem,
            'speakers' => $speakers,
        ]);
    }

    public function update(Request $request, Event $event, AgendaItem $agendaItem)
    {
        $this->authorize('update', $event);

        $request->merge([
            'start_time' => StoreAgendaItemRequest::normalizeTime($request->start_time),
            'end_time' => StoreAgendaItemRequest::normalizeTime($request->end_time),
        ]);

        $validated = $request->validate([
            'speaker_id' => ['nullable', 'string', Rule::exists('speakers', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'date' => [
                'required',
                'date',
                'after_or_equal:' . substr($event->getRawOriginal('date_start'), 0, 10),
                'before_or_equal:' . substr($event->getRawOriginal('date_end'), 0, 10),
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'location_detail' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::in(['talk', 'workshop', 'break', 'networking', 'ceremony'])],
        ], [
            'date.after_or_equal' => 'La fecha debe estar dentro del rango del evento.',
            'date.before_or_equal' => 'La fecha debe estar dentro del rango del evento.',
        ]);

        $agendaItem->update($validated);

        return redirect()->route('events.agenda.index', $event)
            ->with('success', 'Sesión actualizada correctamente.');
    }

    public function destroy(Event $event, AgendaItem $agendaItem)
    {
        $this->authorize('update', $event);

        if (! request()->user()->can('agenda.delete')) {
            abort(403);
        }

        $agendaItem->delete();

        return back()->with('success', 'Sesión eliminada correctamente.');
    }

    public function move(Request $request, Event $event, AgendaItem $agendaItem)
    {
        $this->authorize('update', $event);

        $request->merge([
            'start_time' => StoreAgendaItemRequest::normalizeTime($request->start_time),
            'end_time' => StoreAgendaItemRequest::normalizeTime($request->end_time),
        ]);

        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                'after_or_equal:' . substr($event->getRawOriginal('date_start'), 0, 10),
                'before_or_equal:' . substr($event->getRawOriginal('date_end'), 0, 10),
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ], [
            'date.after_or_equal' => 'La fecha debe estar dentro del rango del evento.',
            'date.before_or_equal' => 'La fecha debe estar dentro del rango del evento.',
        ]);

        $agendaItem->update($validated);

        return back()->with('success', 'Sesión movida correctamente.');
    }

    public function reorder(Request $request, Event $event)
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'string'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['items'] as $item) {
            AgendaItem::where('id', $item['id'])
                ->where('event_id', $event->id)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente.');
    }
}
