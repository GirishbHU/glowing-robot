<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'status' => 'working',
        'app_url' => config('app.url'),
        'vite_running' => file_exists(public_path('hot')),
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version()
    ]);
});
