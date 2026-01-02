import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, Link } from '@inertiajs/react';
import { ReferralCenter } from '@/components/dashboard/referral-center';
import { StakeholderLeaderboard } from '@/components/value-journey/stakeholder-leaderboard';
import { Button } from '@/components/ui/button';
import { Rocket, Target, BarChart2, Compass, Play, Globe, Zap, Users, GraduationCap, ArrowRight, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConciergeChat } from '@/components/agents/concierge-chat';
import { ResourceLinkManager } from '@/components/agents/resource-link-manager';

export default function Dashboard({ auth }: { auth: any }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-white">
                        Command Center
                    </h2>
                    <Link href="/journey">
                        <Button className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-950/20">
                            <Play className="w-4 h-4 mr-2" /> Resume Journey
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-slate-950 min-h-screen text-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">

                    {/* Welcome Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <h1 className="text-4xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                                Welcome back, {auth.user.name}
                            </h1>
                            <p className="text-slate-400 text-lg">
                                Your multi-dimensional ecosystem intelligence hub.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Column (Left - 2/3) */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Referral Widget (Hero Position) */}
                            <ReferralCenter />

                            {/* Ecosystem Pulse (Phase 11: Global Town Square) */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                        <Globe className="w-6 h-6 text-blue-400" /> Ecosystem Evolution
                                    </h3>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Phase 11 active</div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Founder Hub', icon: <Rocket className="w-5 h-5" />, color: 'bg-violet-500/10 text-violet-400', border: 'hover:border-violet-500/50', href: '/role/founder' },
                                        { label: 'Unicorn Grove', icon: <Zap className="w-5 h-5" />, color: 'bg-emerald-500/10 text-emerald-400', border: 'hover:border-emerald-500/50', href: '/level/l7' },
                                        { label: 'FinTech Square', icon: <BarChart2 className="w-5 h-5" />, color: 'bg-amber-500/10 text-amber-400', border: 'hover:border-amber-500/50', href: '/sector/fintech' },
                                        { label: 'Oceanic Frontier', icon: <Globe className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-400', border: 'hover:border-blue-500/50', href: '/region/oceanic' },
                                    ].map((hub, i) => (
                                        <Link key={i} href={hub.href} className={cn("p-4 rounded-2xl bg-slate-900 border border-slate-800/50 transition-all hover:-translate-y-1 hover:bg-slate-800/40", hub.border)}>
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", hub.color)}>
                                                {hub.icon}
                                            </div>
                                            <div className="text-xs font-black uppercase tracking-widest text-white leading-tight">{hub.label}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/journey" className="block group">
                                    <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-all hover:bg-slate-800/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                            <Compass className="w-24 h-24" />
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-6">
                                            <Compass className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">The Value Journey</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">Update your assessment and see your impact grow in real-time.</p>
                                    </div>
                                </Link>

                                <Link href="/profile" className="block group">
                                    <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all hover:bg-slate-800/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                            <Target className="w-24 h-24" />
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Global Identity</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">Manage your credentials and view your achievements.</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Phase 13: Unicorn Agents & Zero-Knowledge Protocol */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <ConciergeChat />
                                <ResourceLinkManager />
                            </div>
                        </div>

                        {/* Sidebar (Right - 1/3) */}
                        <div className="space-y-8">
                            {/* Leaderboard Widget */}
                            <div className="bg-slate-900/40 rounded-[2rem] border border-slate-800/50 p-6 backdrop-blur-xl">
                                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                    <Award className="w-5 h-5 text-amber-400" /> Elite Performers
                                </h3>
                                <StakeholderLeaderboard limit={5} compact={true} />
                                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                                    <Link href="/region/row" className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 hover:text-white transition-colors">
                                        View Global Pulse <ArrowRight className="inline-block ml-1 w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


