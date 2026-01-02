<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnswerController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/answers', [AnswerController::class, 'index']);
Route::post('/submit-answer', [AnswerController::class, 'submitAnswer']);
Route::get('/merit-status', [AnswerController::class, 'getMeritStatus']);


use App\Http\Controllers\ValueJourneyController;

// Guest Routes
Route::post('/free-user', [ValueJourneyController::class, 'handleGuestSession']);
Route::post('/free-user/{sessionId}', [ValueJourneyController::class, 'handleGuestSession']);
Route::post('/guest-progress', [ValueJourneyController::class, 'saveGuestProgress']);

// Authenticated Routes
Route::prefix('value-journey/progress')->group(function () {
    Route::get('/{userId}', [ValueJourneyController::class, 'getUserProgress']);
    Route::post('/{userId}', [ValueJourneyController::class, 'saveUserProgress']);
    Route::post('/{userId}/pause', [ValueJourneyController::class, 'pauseProgress']);
});

// Guest-to-User Migration (requires auth)
Route::post('/migrate-guest', [ValueJourneyController::class, 'migrateGuestToUser'])->middleware('auth:sanctum');

use App\Http\Controllers\LeaderboardController;

Route::get('/leaderboard', [LeaderboardController::class, 'index']);
Route::get('/news', [LeaderboardController::class, 'news']); // Legacy


use App\Http\Controllers\NewsController;
Route::get('/news/trends', [NewsController::class, 'trends']);

use App\Http\Controllers\SocialController;
use App\Http\Controllers\PulseController; // Added

Route::prefix('social')->group(function () {
    Route::get('/feed', [SocialController::class, 'index']); // Legacy?
    Route::get('/pulse', [PulseController::class, 'index']); // New Pulse Engine
    Route::get('/aggregated-leaderboard', [PulseController::class, 'leaderboard']); // New Aggregated Logic
    Route::post('/posts', [SocialController::class, 'store'])->middleware('auth:sanctum');
    Route::post('/posts/{post}/react', [SocialController::class, 'react'])->middleware('auth:sanctum');
});

use App\Http\Controllers\ReferralController;
// Referral Stats
Route::middleware('auth:sanctum')->get('/referrals/stats', [ReferralController::class, 'stats']);

use App\Http\Controllers\KnowledgeController; // Added for new route
// Unicorn Protocol: Knowledge Contributions (Public/Guest accessible)
Route::post('/knowledge/contribute', [KnowledgeController::class, 'store']);
use App\Http\Controllers\CoachingController; // Added
// Concierge / Agony Aunt Chat Routes
Route::post('/coaching/conversations', [CoachingController::class, 'create']);
Route::post('/coaching/conversations/{id}/messages', [CoachingController::class, 'message']);
