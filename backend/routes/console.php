<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Process event reminders every hour
Schedule::command('reminders:process')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();
