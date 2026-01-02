import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";
import {
    Trophy, Share2, Sparkles, Rocket,
    ChevronRight, Twitter, Linkedin, MessageCircle,
    ArrowUpRight, Award, Zap, Download
} from "lucide-react";
import {
    formatGleams,
    gleamsToAlicorns,
    gleamsToAlicornsNum
} from "./wizard-utils";
import { MILESTONE_BADGES } from "./wizard-types";

interface ResultsStepProps {
    gleams: number;
    level: string;
    aspiration: string;
    stakeholder: string;
    onReset: () => void;
    onUpgrade: () => void;
}

export default function ResultsStep({
    gleams,
    level,
    aspiration,
    stakeholder,
    onReset,
    onUpgrade
}: ResultsStepProps) {
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(true);
    const alicorns = gleamsToAlicornsNum(gleams);

    // Cinematic count-up effect
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = gleams / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= gleams) {
                setScore(gleams);
                clearInterval(timer);
            } else {
                setScore(current);
            }
        }, duration / steps);

        setTimeout(() => setShowConfetti(false), 8000);
        return () => clearInterval(timer);
    }, [gleams]);

    const shareUrl = "https://i2u.ai/quest";
    const shareText = `🚀 I just reached ${gleamsToAlicorns(gleams)} Alicorns on the Unicorn Quest! 🦄\n\nLevel: ${level} → ${aspiration}\nRole: ${stakeholder}\n\nAssess your startup DNA at: ${shareUrl}`;

    return (
        <div className="space-y-10">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} gravity={0.2} colors={['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b']} />}

            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30"
                >
                    <Trophy className="w-12 h-12 text-white" />
                </motion.div>

                <div className="space-y-1">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black text-white"
                    >
                        Quest Complete!
                    </motion.h2>
                    <p className="text-slate-400 font-medium">Your potential has been calculated.</p>
                </div>
            </div>

            {/* Score Showcase */}
            <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-8 flex flex-col items-center justify-center space-y-2 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-violet-400 text-xs font-black uppercase tracking-widest relative z-10">Total Alicorns</span>
                    <motion.div className="text-6xl font-black text-white tracking-tighter relative z-10">
                        {gleamsToAlicorns(score)}
                    </motion.div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold relative z-10">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        {Math.round(score).toLocaleString()} Gleams
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-800/20 border border-slate-700/50 rounded-3xl p-8 space-y-4"
                >
                    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">Achievements Unlocked</h3>
                    <div className="space-y-3">
                        {MILESTONE_BADGES.slice(0, 3).map((badge, i) => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50"
                            >
                                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl shadow-lg", badge.gradient)}>
                                    {badge.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{badge.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">{badge.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Virality Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-gradient-to-r from-violet-600/20 via-slate-800/40 to-fuchsia-600/20 border border-violet-500/20 rounded-[2rem] p-8 text-center space-y-6"
            >
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        <Share2 className="w-5 h-5 text-violet-400" /> Spread the Magic
                    </h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Your score places you in the <span className="text-violet-300 font-bold">Top 15%</span> of all candidates. Share your success!
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    <Button
                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                        className="bg-black hover:bg-slate-900 text-white rounded-xl px-6 gap-2"
                    >
                        <Twitter className="w-4 h-4" /> Share on X
                    </Button>
                    <Button
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/`, '_blank')}
                        className="bg-[#0077b5] hover:bg-[#006097] text-white rounded-xl px-6 gap-2"
                    >
                        <Linkedin className="w-4 h-4" /> LinkedIn
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigator.clipboard.writeText(shareText)}
                        className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-6 gap-2"
                    >
                        <Download className="w-4 h-4" /> Download Card
                    </Button>
                </div>
            </motion.div>

            {/* CTAs */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                <Button
                    onClick={onUpgrade}
                    className="w-full md:w-auto h-14 px-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-2xl gap-2 shadow-xl shadow-amber-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Award className="w-5 h-5" /> Get Verified Status <ChevronRight className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    onClick={onReset}
                    className="text-slate-500 hover:text-white hover:bg-slate-800/50 h-14 rounded-2xl border border-slate-800/50 px-8"
                >
                    <Zap className="w-4 h-4 mr-2" /> Take Another Quest
                </Button>
            </div>
        </div>
    );
}
