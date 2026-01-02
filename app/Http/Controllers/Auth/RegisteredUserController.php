<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'guest_session_id' => 'nullable|string',
            'referral_code' => 'nullable|string|exists:users,referral_code',
            'tier' => 'nullable|string|in:free,ecosystem,professional',
            'sector' => 'nullable|string|max:100',
        ]);

        $referrerId = null;
        if ($request->referral_code) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            $referrerId = $referrer?->id;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'sector' => $request->sector,
            'password' => Hash::make($request->password),
            'referral_code' => \Illuminate\Support\Str::random(10), // Generate unique code
            'referrer_id' => $referrerId,
            'subscription_tier' => $request->input('tier', 'free'),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Migrate Guest Data if exists
        if ($request->guest_session_id) {
            $guestProgress = \App\Models\ValueJourneyProgress::where('guest_uuid', $request->guest_session_id)->first();
            if ($guestProgress) {
                // If the user already has progress (unlikely on fresh register, but possible), we might want to merge or overwrite.
                // For now, simple reassignment:
                $guestProgress->user_id = $user->id;
                $guestProgress->guest_uuid = null; // Clear guest UUID to finalize ownership
                $guestProgress->save();
            }
        }

        return redirect(route('dashboard', absolute: false));
    }
}
