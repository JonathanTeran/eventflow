<?php

use App\Http\Controllers\Api\V1\EventController;
use Illuminate\Support\Facades\Route;

// API v1 routes (for mobile app)
Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok']));

    // Public event endpoints
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/featured', [EventController::class, 'featured']);
    Route::get('/events/{slug}', [EventController::class, 'show']);
});
