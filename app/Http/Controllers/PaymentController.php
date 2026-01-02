<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Create a Cashfree Order
     */
    public function createCashfreeOrder(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tier = $request->input('tier', 'talent');
        $amount = $this->getAmountForTier($tier, 'INR');

        if ($amount <= 0) {
            return response()->json(['error' => 'Invalid amount'], 400);
        }

        $response = Http::withHeaders([
            'x-client-id' => config('services.cashfree.app_id'),
            'x-client-secret' => config('services.cashfree.secret_key'),
            'x-api-version' => '2023-08-01',
        ])->post($this->getCashfreeUrl() . '/orders', [
            'order_id' => 'order_' . time() . '_' . $user->id,
            'order_amount' => $amount,
            'order_currency' => 'INR',
            'customer_details' => [
                'customer_id' => (string)$user->id,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone ?? '9999999999',
            ],
            'order_meta' => [
                'return_url' => route('payment.verify.cashfree') . '?order_id={order_id}',
            ],
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        Log::error('Cashfree Order Creation Failed', ['response' => $response->body()]);
        return response()->json(['error' => 'Payment initiation failed'], 500);
    }

    /**
     * Verify Cashfree Payment
     */
    public function verifyCashfree(Request $request)
    {
        $orderId = $request->input('order_id');

        $response = Http::withHeaders([
            'x-client-id' => config('services.cashfree.app_id'),
            'x-client-secret' => config('services.cashfree.secret_key'),
            'x-api-version' => '2023-08-01',
        ])->get($this->getCashfreeUrl() . '/orders/' . $orderId);

        if ($response->successful()) {
            $data = $response->json();
            if ($data['order_status'] === 'PAID') {
                $this->activateUserSubscription(auth()->user());
                return redirect()->route('dashboard')->with('success', 'Welcome to the Journey!');
            }
        }

        return redirect()->route('register')->with('error', 'Payment failed or pending.');
    }

    /**
     * Create a PayPal Order
     */
    public function createPaypalOrder(Request $request)
    {
        $user = auth()->user();
        $tier = $request->input('tier', 'talent');
        $amount = $this->getAmountForTier($tier, 'USD');

        $accessToken = $this->getPaypalAccessToken();
        
        $response = Http::withToken($accessToken)
            ->post($this->getPaypalUrl() . '/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'amount' => [
                        'currency_code' => 'USD',
                        'value' => (string)$amount,
                    ],
                    'description' => "Unicorn Protocol - " . ucfirst($tier) . " Tier",
                ]],
            ]);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        Log::error('PayPal Order Creation Failed', ['response' => $response->body()]);
        return response()->json(['error' => 'PayPal initiation failed'], 500);
    }

    /**
     * Capture PayPal Order
     */
    public function capturePaypalOrder(Request $request)
    {
        $orderId = $request->input('order_id');
        $accessToken = $this->getPaypalAccessToken();

        $response = Http::withToken($accessToken)
            ->post($this->getPaypalUrl() . "/v2/checkout/orders/{$orderId}/capture");

        if ($response->successful()) {
            $data = $response->json();
            if ($data['status'] === 'COMPLETED') {
                $this->activateUserSubscription(auth()->user());
                return response()->json(['status' => 'success']);
            }
        }

        Log::error('PayPal Capture Failed', ['response' => $response->body()]);
        return response()->json(['error' => 'Payment capture failed'], 500);
    }

    private function getPaypalAccessToken()
    {
        $response = Http::withBasicAuth(
            config('services.paypal.client_id'),
            config('services.paypal.client_secret')
        )->asForm()->post($this->getPaypalUrl() . '/v1/oauth2/token', [
            'grant_type' => 'client_credentials',
        ]);

        return $response->json()['access_token'];
    }

    private function getPaypalUrl()
    {
        return config('services.paypal.mode') === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
    }

    private function getAmountForTier($tier, $currency)
    {
        $tiers = [
            'talent' => ['INR' => 999, 'USD' => 14.99],
            'stakeholder' => ['INR' => 9999, 'USD' => 149.99],
            'government' => ['INR' => 0, 'USD' => 0],
        ];

        return $tiers[$tier][$currency] ?? 0;
    }

    private function getCashfreeUrl()
    {
        return config('services.cashfree.environment') === 'production' 
            ? 'https://api.cashfree.com/pg' 
            : 'https://sandbox.cashfree.com/pg';
    }

    private function activateUserSubscription($user)
    {
        if ($user) {
            $user->update([
                'email_verified_at' => now(), // Assume payment verifies them
            ]);
        }
    }
}
