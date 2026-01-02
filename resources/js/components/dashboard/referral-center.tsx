import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Check, Share2, Award, Zap, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ReferralStats {
    referral_code: string;
    referral_link: string;
    referral_count: number;
    progress_percentage: number;
    rewards_earned: number;
    next_reward_at: string;
}

export function ReferralCenter() {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetch('/api/referrals/stats', {
            headers: {
                'Accept': 'application/json',
                // Auth token handled by Sanctum cookies or header if configured, usually implicit with cookie
            }
        })
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load referral stats", err);
                setLoading(false);
            });
    }, []);

    const copyLink = () => {
        if (!stats) return;
        navigator.clipboard.writeText(stats.referral_link);
        setCopied(true);
        toast({ title: "Link Copied!", description: "Share it with your network to earn rewards." });
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnWhatsApp = () => {
        if (!stats) return;
        const text = `Identify your gaps and value with the i2u Value Journey Assessment. Check it out: ${stats.referral_link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        if (!stats) return;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(stats.referral_link)}`, '_blank');
    };

    if (loading) {
        return <div className="animate-pulse h-48 bg-slate-800/50 rounded-xl" />;
    }

    if (!stats) return null;

    return (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 overflow-hidden relative">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                    <Gift className="w-5 h-5" /> Referral Rewards
                </CardTitle>
                <CardDescription>
                    Invite founders & ecosystem partners. Earn 1 Year of <span className="text-amber-400 font-bold">Pro Subscription</span> for every 5 referrals.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Total Referrals</div>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {stats.referral_count} <UsersIcon className="w-4 h-4 text-slate-500" />
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Rewards Earned</div>
                        <div className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                            {stats.rewards_earned} <Award className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Progress to next Reward</span>
                        <span className="text-amber-400 font-medium">{stats.next_reward_at}</span>
                    </div>
                    <Progress value={stats.progress_percentage} className="h-2 bg-slate-700" indicatorClassName="bg-amber-500" />
                </div>

                {/* Referral Link & Share */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg flex items-center px-3 py-2 text-sm text-slate-300 truncate font-mono">
                            {stats.referral_link}
                        </div>
                        <Button onClick={copyLink} variant="outline" className="border-slate-600 hover:bg-slate-800">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={shareOnWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                            <Share2 className="w-4 h-4 mr-2" /> WhatsApp
                        </Button>
                        <Button onClick={shareOnLinkedIn} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white">
                            <Share2 className="w-4 h-4 mr-2" /> LinkedIn
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
