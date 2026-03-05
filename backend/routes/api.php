<?php

use Illuminate\Support\Facades\Route;

// API v1 routes (for future mobile app)
Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok']));
});
