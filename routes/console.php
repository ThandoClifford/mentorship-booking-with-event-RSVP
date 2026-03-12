<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('send:appointment-reminders')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('backup:run')
    ->daily()
    ->at('02:00');
