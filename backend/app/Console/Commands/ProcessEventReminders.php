<?php

namespace App\Console\Commands;

use App\Jobs\SendEventReminder;
use App\Models\Event;
use App\Models\EventReminder;
use Illuminate\Console\Command;

class ProcessEventReminders extends Command
{
    protected $signature = 'reminders:process';

    protected $description = 'Process and send event reminders (48h before, day of event, follow-up)';

    public function handle(): int
    {
        $this->info('Processing event reminders...');

        $this->process48hReminders();
        $this->processDayOfReminders();
        $this->processFollowUpReminders();

        $this->info('Done.');

        return Command::SUCCESS;
    }

    private function process48hReminders(): void
    {
        // Events starting between 47-49 hours from now (to account for hourly cron)
        $events = Event::withoutGlobalScopes()
            ->whereIn('status', ['published', 'active'])
            ->whereBetween('date_start', [
                now()->addHours(47),
                now()->addHours(49),
            ])
            ->get();

        $count = 0;
        foreach ($events as $event) {
            $participants = $event->participants()
                ->whereIn('status', ['registered', 'confirmed'])
                ->whereNotIn('id', function ($query) use ($event) {
                    $query->select('participant_id')
                        ->from('event_reminders')
                        ->where('event_id', $event->id)
                        ->where('type', '48h');
                })
                ->get();

            foreach ($participants as $participant) {
                SendEventReminder::dispatch($participant, $event, '48h');
                $count++;
            }
        }

        $this->info("  48h reminders: {$count} queued");
    }

    private function processDayOfReminders(): void
    {
        // Events starting today (between 0-2 hours from now for morning run)
        $events = Event::withoutGlobalScopes()
            ->whereIn('status', ['published', 'active'])
            ->whereDate('date_start', today())
            ->whereTime('date_start', '>=', now()->subHours(2)->format('H:i:s'))
            ->whereTime('date_start', '<=', now()->addHours(6)->format('H:i:s'))
            ->get();

        $count = 0;
        foreach ($events as $event) {
            $participants = $event->participants()
                ->whereIn('status', ['registered', 'confirmed'])
                ->whereNotIn('id', function ($query) use ($event) {
                    $query->select('participant_id')
                        ->from('event_reminders')
                        ->where('event_id', $event->id)
                        ->where('type', 'day_of');
                })
                ->get();

            foreach ($participants as $participant) {
                SendEventReminder::dispatch($participant, $event, 'day_of');
                $count++;
            }
        }

        $this->info("  Day-of reminders: {$count} queued");
    }

    private function processFollowUpReminders(): void
    {
        $yesterday = now()->subDay()->toDateString();

        // Events that ended yesterday (follow-up next day)
        $events = Event::withoutGlobalScopes()
            ->where('status', 'completed')
            ->where(function ($query) use ($yesterday) {
                $query->whereDate('date_end', $yesterday)
                    ->orWhere(function ($q) use ($yesterday) {
                        $q->whereNull('date_end')
                            ->whereDate('date_start', $yesterday);
                    });
            })
            ->get();

        $count = 0;
        foreach ($events as $event) {
            $participants = $event->participants()
                ->where('status', 'attended')
                ->whereNotIn('id', function ($query) use ($event) {
                    $query->select('participant_id')
                        ->from('event_reminders')
                        ->where('event_id', $event->id)
                        ->where('type', 'follow_up');
                })
                ->get();

            foreach ($participants as $participant) {
                SendEventReminder::dispatch($participant, $event, 'follow_up');
                $count++;
            }
        }

        $this->info("  Follow-up reminders: {$count} queued");
    }
}
