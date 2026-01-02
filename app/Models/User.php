<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'sector',
        'password',
        'merit_level',
        'execution_score',
        'guest_uuid',
        'referral_code',
        'referrer_id',
        'subscription_tier',
        'google_id',
        'avatar',
    ];

    /**
     * Get the users referred by this user.
     */
    public function referrals()
    {
        return $this->hasMany(User::class, 'referrer_id');
    }

    /**
     * Get the user who referred this user.
     */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'merit_level_updated_at' => 'datetime',
            'execution_score' => 'integer',
        ];
    }
    
    /**
     * Social Economy Ledger entries for this user
     */
    public function ledgerEntries()
    {
        return $this->hasMany(\App\Models\SocialEconomyLedger::class);
    }
    
    /**
     * Get total Gleams balance
     */
    public function getTotalGleamsAttribute(): int
    {
        return $this->ledgerEntries()->sum('gleams');
    }
    
    /**
     * Get total Alicorns balance
     */
    public function getTotalAlicornsAttribute(): int
    {
        return $this->ledgerEntries()->sum('alicorns');
    }
    
    /**
     * Check if user qualifies for next merit level
     */
    public function canLevelUp(): bool
    {
        $meritThresholds = [
            'L0' => 0,
            'L1' => 100,
            'L2' => 300,
            'L3' => 600,
            'L4' => 1000,
            'L5' => 1500,
            'L6' => 2200,
            'L7' => 3000,
            'L8' => 4000,
        ];
        
        $currentLevel = $this->merit_level;
        $currentIndex = array_search($currentLevel, array_keys($meritThresholds));
        
        if ($currentIndex === false || $currentIndex >= 8) {
            return false; // Already at max level
        }
        
        $nextLevel = array_keys($meritThresholds)[$currentIndex + 1];
        return $this->execution_score >= $meritThresholds[$nextLevel];
    }
}
