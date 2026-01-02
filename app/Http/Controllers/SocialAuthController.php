<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ValueJourneyProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Google authentication failed.');
        }

        // 1. Check if user exists by Google ID
        $user = User::where('google_id', $googleUser->id)->first();

        // 2. If not, check by email (and link accounts)
        if (!$user) {
            $user = User::where('email', $googleUser->email)->first();
            
            if ($user) {
                // Link existing account
                $user->update([
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => null, // Password is null for OAuth users
                    'email_verified_at' => now(), // Trust Google verification
                ]);
            }
        } else {
            // Update avatar if changed
            $user->update(['avatar' => $googleUser->avatar]);
        }

        // 3. Login the user
        Auth::login($user, true);

        // 4. Migrate Guest Progress (if any)
        $guestUuid = $request->cookie('guest_session_id');
        if ($guestUuid) {
            $this->migrateGuestProgress($user, $guestUuid);
        }

        return redirect()->route('dashboard');
    }

    /**
     * Migrate guest progress to the authenticated user.
     */
    protected function migrateGuestProgress(User $user, string $guestUuid)
    {
        ValueJourneyProgress::where('guest_uuid', $guestUuid)
            ->whereNull('user_id')
            ->update(['user_id' => $user->id]);
            
        // Also could migrate detailed answers if needed, but progress is the key
    }
}
