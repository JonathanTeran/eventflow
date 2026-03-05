<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateMissingNetworkingPins extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'participants:generate-pins';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate networking PINs for existing participants that do not have one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $participants = \App\Models\Participant::whereNull('networking_pin')->get();
        $count = $participants->count();

        $this->info("Found {$count} participants missing a networking PIN.");

        $bar = $this->output->createProgressBar($count);

        foreach ($participants as $participant) {
            $participant->updateQuietly([
                'networking_pin' => strtoupper(\Illuminate\Support\Str::random(6))
            ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully generated networking PINs for {$count} participants.");
    }
}
