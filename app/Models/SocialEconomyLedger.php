<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialEconomyLedger extends Model
{
    protected $table = 'social_economy_ledger';
    
    protected $fillable = [
        'user_id',
        'guest_uuid',
        'gleams',
        'alicorns',
        'transaction_type',
        'source_context',
        'description',
    ];
    
    protected $casts = [
        'gleams' => 'integer',
        'alicorns' => 'integer',
        'user_id' => 'integer',
    ];
    
    /**
     * Validation: Only positive transactions OR admin adjustments
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($ledger) {
            // Prevent negative balances unless it's an admin adjustment
            if ($ledger->transaction_type !== 'adjustment_admin' && 
                $ledger->transaction_type !== 'spent_unlock' && 
                $ledger->transaction_type !== 'spent_badge') {
                if ($ledger->gleams < 0 || $ledger->alicorns < 0) {
                    throw new \Exception('Social currency cannot be negative for earning transactions');
                }
            }
        });
    }
    
    /**
     * Relationship to User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Scope for guest transactions
     */
    public function scopeForGuest($query, string $guestUuid)
    {
        return $query->where('guest_uuid', $guestUuid);
    }
    
    /**
     * Scope for user transactions
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
