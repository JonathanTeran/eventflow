<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Spatie\ICalendar\Components\Calendar;
use Spatie\ICalendar\Components\Event as ICalEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CalendarController extends Controller
{
    public function downloadEvent(string $slug): Response
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $calendar = Calendar::create()
            ->name($event->name)
            ->description($event->description ?? '');

        $iCalEvent = ICalEvent::create()
            ->name($event->name)
            ->description(strip_tags($event->description ?? ''))
            ->startsAt($event->date_start)
            ->endsAt($event->date_end ?? $event->date_start->copy()->addHours(2))
            ->address($this->formatLocation($event));

        if ($event->latitude && $event->longitude) {
            $iCalEvent->coordinates($event->latitude, $event->longitude);
        }

        $calendar->event($iCalEvent);

        $filename = "evento-{$event->slug}.ics";

        return response($calendar->get())
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    public function downloadAgenda(string $slug): Response
    {
        $event = Event::findBySlugPublic($slug);

        if (! $event || ! in_array($event->status, ['published', 'active'])) {
            throw new NotFoundHttpException;
        }

        $event->load(['agendaItems.speaker']);

        $calendar = Calendar::create()
            ->name("Agenda - {$event->name}")
            ->description("Agenda del evento {$event->name}");

        foreach ($event->agendaItems as $item) {
            $startDateTime = $event->date_start->copy()
                ->setDateFrom($item->date)
                ->setTimeFromTimeString($item->start_time);

            $endDateTime = $item->end_time
                ? $event->date_start->copy()
                    ->setDateFrom($item->date)
                    ->setTimeFromTimeString($item->end_time)
                : $startDateTime->copy()->addHour();

            $description = $item->description ?? '';
            if ($item->speaker) {
                $description .= "\n\nSpeaker: {$item->speaker->full_name}";
            }

            $iCalEvent = ICalEvent::create()
                ->name($item->title)
                ->description(strip_tags($description))
                ->startsAt($startDateTime)
                ->endsAt($endDateTime);

            if ($item->location_detail) {
                $iCalEvent->address($item->location_detail);
            }

            $calendar->event($iCalEvent);
        }

        $filename = "agenda-{$event->slug}.ics";

        return response($calendar->get())
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    private function formatLocation(Event $event): string
    {
        return implode(', ', array_filter([$event->venue, $event->location]));
    }
}
