import { Link, Head } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Target, Shield, Zap, Globe, Cpu, Users } from "lucide-react";
import { motion } from "framer-motion";
import GlobalEcosystemPulse from "@/components/value-journey/global-ecosystem-pulse";
import HubClusterGrid from "@/components/value-journey/hub-cluster-grid";
import Footer from "@/components/layout/footer";
import GlobalNewsTicker from "@/components/layout/global-news-ticker";
import PublicBetaDisclaimer from "@/components/layout/public-beta-disclaimer";
import PulsePostInput from "@/components/value-journey/pulse-post-input";
import HypeTrain from "@/components/gamification/hype-train";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30">
            <Head title="Unicorn Ecosystem - The Social Network for Founders" />

            <PublicBetaDisclaimer />
            {/* <HypeTrain /> - Temporarily disabled for stability */}

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex flex-col">
                                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                    i2u.ai
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    Ideas to Unicorns through AI!
                                </span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-white transition-colors">Home</Link>
                            <button onClick={() => window.history.back()} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Back
                            </button>
                            <a href="#pulse" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pulse</a>
                            <a href="#matrix" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">The Matrix (9x9x9)</a>
                            <a href="#leaderboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Leaderboard</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="bg-white text-slate-950 hover:bg-slate-200 font-semibold rounded-full px-6">
                                    Join Ecosystem
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero: The Social Pulse & Matrix */}
            <section id="pulse" className="relative pt-24 pb-12 lg:pt-32 min-h-screen flex flex-col justify-start">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/10 blur-[150px] rounded-full opacity-40 pointer-events-none" />

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

                    {/* Hero Title & Subtitle */}
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                            The Social Network of the <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">Unicorns of Tomorrow, Today & Yesterday</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="textlg md:text-xl text-slate-400 font-medium tracking-normal max-w-3xl mx-auto"
                        >
                            Don't build in silence. Join 150+ countries. Soak in the glory of the ecosystem booster.
                        </motion.p>
                    </div>

                    {/* Pulse Composer Widget (Centered) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <PulsePostInput />
                    </motion.div>

                    {/* Main Content Grid: Left (Matrix) | Right (Feed) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Left Column: Matrix Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full"
                        >
                            <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl overflow-hidden p-4 md:p-6 h-full sticky top-24">
                                <HubClusterGrid compact={true} />
                            </div>
                        </motion.div>

                        {/* Right Column: Feed & Leaderboard */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="w-full h-full"
                        >
                            <GlobalEcosystemPulse simpleMode={true} />
                        </motion.div>
                    </div>
                </div>
            </section>



            {/* Rationale / Value Grid (Secondary) */}
            <section className="py-24 bg-slate-950 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-slate-500 uppercase tracking-widest text-xs font-bold">Why We Assess</span>
                        <h2 className="text-2xl font-bold text-white mt-2">The Science Behind the Glory</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">9x9x9 Agentic Matrix</h3>
                            <p className="text-slate-400 leading-relaxed">
                                We measure <span className="text-white">9 Dimensions</span> (Capabilities, Character, Accomplishments) against <span className="text-white">9 "Elephants in the Room"</span>. All 81 touchpoints are dynamically updated by AI Agents.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-2">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Crowdsourced Synergy</h3>
                            <p className="text-slate-400 leading-relaxed">
                                The protocol evolves live. Founders contributors synergetically revise the definitions of success, ensuring the benchmarks stay ahead of the market.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Actionable Growth</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Not just a score. You get a roadmap across 9 Valuation Levels. Our AI Agentic Infrastructure verifies your progress and unlocks ecosystem privileges.
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            {/* Feature Showcase: Leaderboard Preview */}
            <section id="leaderboard" className="py-24 bg-slate-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-900/10 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-black text-white leading-tight">
                                Rise to the <br />
                                <span className="text-amber-400">Top 1% Global Rank</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Your Unicorn Quest results aren't private. They are your badge of honor.
                                Prove your venture's viability to the world on our real-time Leaderboards.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                    <div className="text-3xl font-black text-white mb-1">150+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest">Countries</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                    <div className="text-3xl font-black text-white mb-1">20+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest">Industries</div>
                                </div>
                            </div>
                            <Link href="/register">
                                <Button className="bg-white text-slate-950 hover:bg-slate-200">
                                    Claim Your Profile
                                </Button>
                            </Link>
                        </div>

                        {/* Visual Mockup of Leaderboard */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-violet-600/20 blur-[100px] rounded-full" />
                            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm font-bold text-white uppercase tracking-widest">Live Rankings</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs text-emerald-500 font-mono">LIVE</span>
                                    </div>
                                </div>
                                {[1, 2, 3].map((rank) => (
                                    <div key={rank} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-900 ${rank === 1 ? 'bg-amber-400' : 'bg-slate-400'}`}>
                                            #{rank}
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 w-24 bg-slate-700 rounded mb-1.5" />
                                            <div className="h-2 w-16 bg-slate-800 rounded" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-violet-400">12,450 🦄</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plain Assessment Link at Bottom */}
            <section className="py-12 bg-slate-950 text-center">
                <p className="text-slate-500 text-sm mb-4">Ready to benchmark your venture?</p>
                <Link href="/journey">
                    <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900">
                        Start Unicorn Assessment (Secondary)
                    </Button>
                </Link>
            </section>

            {/* News Ticker */}
            <GlobalNewsTicker />

            {/* Footer */}
            <Footer />
        </div>
    );
}
