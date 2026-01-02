import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Trophy, Rocket, Globe, Target,
    ArrowRight, Sparkles, Zap, ChevronLeft,
    TrendingUp, Users, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StakeholderLeaderboard from '@/components/value-journey/stakeholder-leaderboard';
import { RunningAlicornCounter } from '@/components/value-journey-v2/quest-layout';
import SocialPulse from '@/components/social-pulse/social-pulse';

interface EcosystemHubProps {
    type: 'role' | 'level' | 'sector' | 'region';
    slug: string;
    meta: {
        name: string;
        title: string;
        icon: string;
        tagline: string;
    };
    filters: Record<string, any>;
}

export default function EcosystemHub({ type, slug, meta, filters }: EcosystemHubProps) {
    const themeGradient = useMemo(() => {
        if (type === 'role') return "from-violet-600 to-indigo-600";
        if (type === 'level') return "from-emerald-600 to-teal-600";
        if (type === 'sector') return "from-amber-600 to-orange-600";
        return "from-blue-600 to-cyan-600";
    }, [type]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className={cn(
                        "absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-screen",
                        type === 'role' ? "bg-violet-600/20" :
                            type === 'level' ? "bg-emerald-500/10" :
                                "bg-blue-500/10"
                    )}
                />
            </div>

            <RunningAlicornCounter />

            {/* Navigation Bar */}
            <nav className="relative z-50 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <Link
                    href={route('dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm tracking-widest uppercase">Dashboard</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href={route('journey')}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Take Assessment
                        </motion.button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-16">
                {/* Hero Section */}
                <section className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]",
                                "bg-slate-900/50 border-slate-800"
                            )}>
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                {type} Spotlight
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                {meta.title}
                            </h1>
                            <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                                {meta.tagline}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-4"
                        >
                            <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-md">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white">1.2k+</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black">Active Builders</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-md">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white">450+</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black">Level Ups</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative hidden lg:block"
                    >
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-br blur-3xl opacity-20",
                            themeGradient
                        )} />
                        <div className="relative p-10 bg-slate-900/40 border border-slate-800/50 rounded-[3rem] backdrop-blur-2xl box-shadow-2xl">
                            <div className="text-6xl mb-6">{meta.icon}</div>
                            <h3 className="text-2xl font-bold text-white mb-4">Ecosystem Intelligence</h3>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Our real-time pulse engine tracks the growth of {meta.name} across the globe. Join the network to unlock deeper insights.
                            </p>
                            <Link href={route('register')}>
                                <button className={cn(
                                    "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20",
                                    themeGradient
                                )}>
                                    Join the Hub <ArrowRight className="inline-block ml-2 w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Social Pulse Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                        <h2 className="text-3xl font-black text-white px-8 py-2 border border-slate-800 rounded-full bg-slate-900/50 backdrop-blur-xl">
                            The Social Pulse
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                    </div>

                    <SocialPulse contextType={type} contextValue={slug} />
                </section>

                {/* Leaderboard Section */}
                <section className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white">Global Ranking</h2>
                            <p className="text-slate-500 text-sm">Real-time leaders within the <span className="text-violet-400 font-bold">{meta.name}</span> segment.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-2 rounded-xl">
                            <span className="text-[10px] font-black uppercase text-slate-500 px-4">Daily Update Cycle</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-4 md:p-8 backdrop-blur-xl">
                        <StakeholderLeaderboard
                            initialFilters={filters}
                            hideFilters={true} // In the hub, we lock the main filter
                        />
                    </div>
                </section>

                {/* Footer Insight */}
                <footer className="pt-8 border-t border-slate-900 flex flex-col items-center text-center gap-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
                        Global Town Square Protocol v1.0
                    </div>
                    <div className="flex items-center gap-6 text-slate-600 text-xs font-bold">
                        <span className="hover:text-white transition-colors cursor-pointer">Intelligence</span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="hover:text-white transition-colors cursor-pointer">Transparency</span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="hover:text-white transition-colors cursor-pointer">Participation</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}
