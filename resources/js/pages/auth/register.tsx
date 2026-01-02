import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket, Users, User, CheckCircle2 } from "lucide-react";
import { LISTING_FEES, STAKEHOLDER_TIERS } from "@/lib/pricing-plans";
import { cn } from "@/lib/utils";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        guest_session_id: '',
        referral_code: '',
        tier: 'talent',
        sector: '',
        payment_method: 'cashfree', // default for India
    });

    const [isProcessingPayment, setIsProcessingPayment] = (useState as any)(false);

    useEffect(() => {
        // Capture Guest Session ID
        const guestId = localStorage.getItem('freeUserSessionId');
        if (guestId) setData('guest_session_id', guestId);

        // Capture URL Params (Referral)
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        const urlTier = params.get('tier');

        if (ref) setData('referral_code', ref);
        if (urlTier && (urlTier === 'ecosystem' || urlTier === 'professional')) {
            setData('tier', urlTier);
        }
    }, []);

    const handlePayment = async (userId: any, tier: string, method: string) => {
        setIsProcessingPayment(true);
        try {
            const endpoint = method === 'cashfree'
                ? route('payment.create.cashfree')
                : route('payment.create.paypal');

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content,
                },
                body: JSON.stringify({ tier, client_user_id: userId }),
            });

            const result = await response.json();

            if (result.payment_session_id) {
                // Cashfree Logic (Simplified redirect for now)
                window.location.href = `https://payments.cashfree.com/order/${result.order_id}`;
            } else if (result.links) {
                // PayPal Logic
                const approveLink = result.links.find((l: any) => l.rel === 'approve');
                if (approveLink) window.location.href = approveLink.href;
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            setIsProcessingPayment(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onSuccess: (page: any) => {
                const user = page.props.auth.user;
                if (selectedPlan.usd.min > 0) {
                    handlePayment(user.id, data.tier, data.payment_method);
                }
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const selectedPlan = STAKEHOLDER_TIERS[data.tier as keyof typeof STAKEHOLDER_TIERS];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Head title="Register - Value Journey" />

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[100px] mix-blend-screen animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <div className="w-full max-w-4xl relative z-10 grid md:grid-cols-2 gap-8 items-start">

                {/* Left Side: Plan Selection */}
                <div className="space-y-6">
                    <div className="text-left">
                        <h1 className="text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                                Join the Journey
                            </span>
                        </h1>
                        <p className="text-slate-400">Select your role to unlock the full potential of the protocol.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Talent Option */}
                        <div
                            onClick={() => setData('tier', 'talent')}
                            className={cn(
                                "cursor-pointer p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group",
                                data.tier === 'talent'
                                    ? "bg-slate-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", data.tier === 'talent' ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-400")}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Individual Talent</h3>
                                        <p className="text-sm text-slate-400">Founders & Professionals</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 line-through">₹9,999</p>
                                    <p className="text-lg font-bold text-white">₹99 - ₹999</p>
                                </div>
                            </div>
                            {data.tier === 'talent' && (
                                <div className="mt-3 pt-3 border-t border-slate-800 text-sm text-slate-300 grid grid-cols-1 gap-1">
                                    {STAKEHOLDER_TIERS.talent.features.map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stakeholder Option */}
                        <div
                            onClick={() => setData('tier', 'stakeholder')}
                            className={cn(
                                "cursor-pointer p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group",
                                data.tier === 'stakeholder'
                                    ? "bg-slate-900 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", data.tier === 'stakeholder' ? "bg-violet-500/20 text-violet-300" : "bg-slate-800 text-slate-400")}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Ecosystem Stakeholder</h3>
                                        <p className="text-sm text-slate-400">Organizations & Investors</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 line-through">₹99,999</p>
                                    <p className="text-lg font-bold text-white">₹999 - ₹9,999</p>
                                </div>
                            </div>
                            {data.tier === 'stakeholder' && (
                                <div className="mt-3 pt-3 border-t border-slate-800 text-sm text-slate-300 grid grid-cols-1 gap-1">
                                    {STAKEHOLDER_TIERS.stakeholder.features.map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Government Option */}
                        <div
                            onClick={() => setData('tier', 'government')}
                            className={cn(
                                "cursor-pointer p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group",
                                data.tier === 'government'
                                    ? "bg-slate-900 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", data.tier === 'government' ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400")}>
                                        <Rocket className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Gov & NGOs</h3>
                                        <p className="text-sm text-slate-400">Public Sector Entities</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-emerald-400 uppercase tracking-widest">Free</p>
                                </div>
                            </div>
                            {data.tier === 'government' && (
                                <div className="mt-3 pt-3 border-t border-slate-800 text-sm text-slate-300 grid grid-cols-1 gap-1">
                                    {STAKEHOLDER_TIERS.government.features.map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
                    <div className="mb-6 space-y-4">
                        <a
                            href="/auth/google"
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white p-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
                        >
                            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign up with Google
                        </a>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900 px-2 text-slate-500 font-medium">Or register with email</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-200">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
                                placeholder="Your Name"
                                autoFocus
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
                                placeholder="founder@startup.com"
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sector" className="text-slate-200">Sector / Industry</Label>
                            <div className="relative">
                                <select
                                    id="sector"
                                    name="sector"
                                    value={data.sector}
                                    onChange={(e) => setData('sector', e.target.value)}
                                    className="w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 rounded-md p-2 appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select your primary sector...</option>
                                    <option value="SaaS">SaaS / Enterprise Software</option>
                                    <option value="Fintech">Fintech & Insurtech</option>
                                    <option value="Healthtech">Healthtech & Biotech</option>
                                    <option value="Edtech">Edtech & Future of Work</option>
                                    <option value="E-commerce">E-commerce & Retail</option>
                                    <option value="Cleantech">Cleantech & Sustainability</option>
                                    <option value="AI_ML">AI / ML & Deep Tech</option>
                                    <option value="Web3">Web3 & Blockchain</option>
                                    <option value="Consumer">Consumer Apps (B2C)</option>
                                    <option value="Hardware">Hardware & IoT</option>
                                    <option value="Media">Media & Entertainment</option>
                                    <option value="Agtech">Agtech & Food</option>
                                    <option value="Logistics">Logistics & Supply Chain</option>
                                    <option value="RealEstate">Real Estate & Proptech</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            {errors.sector && <p className="text-sm text-red-500">{errors.sector}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
                                required
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-slate-200">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500"
                                required
                            />
                            {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                        </div>

                        {/* Referral Code (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="referral_code" className="text-slate-200">Referral Code (Optional)</Label>
                            <Input
                                id="referral_code"
                                name="referral_code"
                                value={data.referral_code}
                                onChange={(e) => setData('referral_code', e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 uppercase tracking-widest"
                                placeholder="REF123"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-slate-200">Payment Method</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setData('payment_method', 'cashfree')}
                                    className={cn(
                                        "cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                                        data.payment_method === 'cashfree' ? "bg-white/10 border-white/50 ring-1 ring-white/50" : "bg-slate-800/30 border-slate-700 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <span className="text-sm font-bold text-white">Cashfree</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">India / UPI / Cards</span>
                                </div>
                                <div
                                    onClick={() => setData('payment_method', 'paypal')}
                                    className={cn(
                                        "cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                                        data.payment_method === 'paypal' ? "bg-white/10 border-white/50 ring-1 ring-white/50" : "bg-slate-800/30 border-slate-700 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <span className="text-sm font-bold text-white">PayPal</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Global / Credit Card</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold py-2.5 rounded-xl shadow-lg shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                            disabled={processing || isProcessingPayment}
                        >
                            {processing || isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {selectedPlan?.usd.min === 0 ? 'Register for Free' : `Register & Pay ${data.payment_method === 'cashfree' ? '₹' + selectedPlan?.inr.min : '$' + selectedPlan?.usd.min}`}
                            {!processing && !isProcessingPayment && <Rocket className="w-4 h-4 ml-2" />}
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-slate-400">
                                Already have an account?{' '}
                                <Link
                                    href={route('login')}
                                    className="text-violet-400 hover:text-violet-300 font-medium transition-colors hover:underline"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
