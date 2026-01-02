<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('landing-page');
})->name('home');

Route::get('/terms', function () {
    return Inertia::render('terms-and-conditions');
})->name('terms');

Route::get('/auth/google', [\App\Http\Controllers\SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [\App\Http\Controllers\SocialAuthController::class, 'handleGoogleCallback']);

Route::get('/journey', function () {
    return Inertia::render('value-journey');
})->name('journey');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::post('/payment/cashfree/create', [\App\Http\Controllers\PaymentController::class, 'createCashfreeOrder'])->name('payment.create.cashfree');
    Route::get('/payment/cashfree/verify', [\App\Http\Controllers\PaymentController::class, 'verifyCashfree'])->name('payment.verify.cashfree');
    
    Route::post('/payment/paypal/create', [\App\Http\Controllers\PaymentController::class, 'createPaypalOrder'])->name('payment.create.paypal');
    Route::post('/payment/paypal/capture', [\App\Http\Controllers\PaymentController::class, 'capturePaypalOrder'])->name('payment.verify.paypal');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Social Pulse Routes
    Route::get('/api/pulse', [\App\Http\Controllers\PulseController::class, 'index']);
    Route::post('/api/pulse', [\App\Http\Controllers\PulseController::class, 'store']);
    Route::post('/api/pulse/{id}/react', [\App\Http\Controllers\PulseController::class, 'react']);
    Route::post('/api/pulse/{id}/comment', [\App\Http\Controllers\PulseController::class, 'comment']);
});

// Ecosystem Hubs (Global Town Square)
// Ecosystem Hubs (Global Town Square)
Route::get('/role/{slug}', [\App\Http\Controllers\EcosystemHubController::class, 'role'])->name('hub.role');
Route::get('/level/{slug}', [\App\Http\Controllers\EcosystemHubController::class, 'level'])->name('hub.level');
Route::get('/sector/{slug}', [\App\Http\Controllers\EcosystemHubController::class, 'sector'])->name('hub.sector');
Route::get('/region/{slug}', [\App\Http\Controllers\EcosystemHubController::class, 'region'])->name('hub.region');
Route::get('/rationale/{slug}', [\App\Http\Controllers\EcosystemHubController::class, 'rationale'])->name('hub.rationale');
Route::get('/eitr/{slug}', [\App\Http\Controllers\EcosystemHubController::class, 'eitr'])->name('hub.eitr');

// Test route
Route::get('/test', function () {
    return response()->json([
        'status' => 'PHP server working!',
        'app_url' => config('app.url'),
        'vite_hot_file_exists' => file_exists(public_path('hot')),
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version()
    ]);
});

// Simple HTML test
Route::get('/debug-db', function () {
    try {
        $answerCount = \App\Models\Answer::count();
        $userCount = \App\Models\User::count();
        $dbName = \Illuminate\Support\Facades\DB::connection()->getDatabaseName();
        
        return response()->json([
            'status' => 'connected',
            'database' => $dbName,
            'answer_count' => $answerCount,
            'user_count' => $userCount,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

require __DIR__.'/auth.php';
