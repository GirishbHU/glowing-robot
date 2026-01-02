import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Trophy, Zap, Globe } from "lucide-react";
import { useState, useEffect } from "react";

interface WelcomeStepProps {
    onStart: () => void;
}

function RotatingStats() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const stats = [
        { value: "124,700+", label: "Gleams Awarded Today", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
        { value: "50,000+", label: "Founders Assessed", icon: <Trophy className="w-4 h-4 text-violet-400" /> },
        { value: "4.9/5", label: "Quest Satisfaction", icon: <Zap className="w-4 h-4 text-emerald-400" /> },
        { value: "Global", label: "Network Connectivity", icon: <Globe className="w-4 h-4 text-blue-400" /> },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % stats.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-12 overflow-hidden relative">
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-3 text-slate-400"
            >
                {stats[currentIndex].icon}
                <span className="font-bold text-white">{stats[currentIndex].value}</span>
                <span className="text-xs uppercase tracking-widest">{stats[currentIndex].label}</span>
            </motion.div>
        </div>
    );
}

export default function WelcomeStep({ onStart }: WelcomeStepProps) {
    return (
        <div className="flex flex-col items-center text-center space-y-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/20 mb-4"
            >
                <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Trophy className="w-10 h-10 text-white" />
                </motion.span>
            </motion.div>

            <div className="space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight"
                >
                    The Unicorn Quest
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
                >
                    Assess your startup DNA with <span className="text-white font-bold">Precise Logic</span>, backup your decisions with <span className="text-white font-bold">Collective Wisdom</span>, and unlock <span className="text-white font-bold">Actionable Growth</span> on your path to the next level.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto pt-4">
                    {[
                        { title: "Precise Logic", desc: "No buzzfeed quizzes. We measure 9 Critical Dimensions & 9 EitRs." },
                        { title: "Collective Wisdom", desc: "Benchmark against thousands of other founders globally." },
                        { title: "Actionable Growth", desc: "Don't just get a score. Get a tactical roadmap to L9." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl backdrop-blur-sm"
                        >
                            <h3 className="text-violet-300 font-bold text-sm mb-1">{item.title}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-sm pt-4"
            >
                <RotatingStats />

                <Button
                    onClick={onStart}
                    className="w-full h-16 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-violet-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden mt-6"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="flex items-center justify-center gap-2">
                        Enter the Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Button>

                <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                    Quest time: ~5-10 minutes • Rewards: Gleams & Alicorns
                </p>
            </motion.div>
        </div>
    );
}
