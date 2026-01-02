import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Zap } from "lucide-react";

export default function HypeTrain({ manualTrigger = false }: { manualTrigger?: boolean }) {
    const [isActive, setIsActive] = useState(false);

    // Mock mechanics for now - in production this would listen to Echo/Pusher
    useEffect(() => {
        if (manualTrigger) {
            triggerTrain();
        }
    }, [manualTrigger]);

    // Self-triggering for demo purposes every 60s
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) triggerTrain(); // Random chance
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const triggerTrain = () => {
        setIsActive(true);
        // Reset after animation
        setTimeout(() => setIsActive(false), 8000);
    };

    return (
        <AnimatePresence>
            {isActive && (
                <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex items-center justify-center">
                    {/* Atmospheric Effects */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-violet-500/10 mix-blend-overlay"
                    />

                    {/* The Train/Rocket */}
                    <motion.div
                        initial={{ x: "120vw" }}
                        animate={{ x: "-120vw" }}
                        transition={{ duration: 4, ease: "linear" }}
                        className="relative flex items-center gap-4"
                    >
                        {/* Engine */}
                        <div className="relative">
                            <Rocket className="w-32 h-32 text-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.8)] transform -rotate-45" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.2 }}
                                className="absolute -left-10 top-10 w-20 h-20 bg-orange-500 rounded-full blur-[40px] opacity-80"
                            />
                        </div>

                        {/* Carriages (Text) */}
                        <div className="bg-slate-900/90 border-y-4 border-amber-500 text-white p-6 rounded-xl shadow-2xl skew-x-[-12deg] flex items-center gap-4">
                            <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
                            <div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Hype Train Inbound!</h2>
                                <p className="text-xl font-bold text-amber-400">2x Rewards Active 🚀</p>
                            </div>
                        </div>

                        {/* Trailing Particules */}
                        <div className="w-96 h-2 bg-gradient-to-l from-transparent via-amber-500 to-transparent blur-md" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
