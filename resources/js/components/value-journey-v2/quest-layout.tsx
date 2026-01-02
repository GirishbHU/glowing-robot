import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface QuestLayoutProps {
    children: ReactNode;
    className?: string;
}

export function RunningAlicornCounter() {
    const [count, setCount] = useState(1_847_293_456_781);
    const [displayCount, setDisplayCount] = useState("1,847,293,456,781");

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                const increment = Math.floor(Math.random() * 9_999_999) + 1_000_000;
                return prev + increment;
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setDisplayCount(count.toLocaleString());
    }, [count]);

    return (
        <div className="fixed top-6 right-6 z-50 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
            <motion.div
                className="flex flex-col items-end"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="flex items-center gap-2">
                    <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-2xl"
                    >
                        🦄
                    </motion.span>
                    <span className="text-xl font-mono font-bold text-violet-400">
                        {displayCount}
                    </span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Global Alicorns Syncing
                </span>
            </motion.div>
        </div>
    );
}

function ExitButton() {
    return (
        <a href="/dashboard" className="fixed top-6 left-6 z-[100] transition-transform hover:scale-105">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700/50 rounded-full shadow-lg backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">
                    ← EXIT TO DASHBOARD
                </span>
            </div>
        </a>
    );
}

export default function QuestLayout({ children, className }: QuestLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Immersive Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 0],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-fuchsia-500/10 rounded-full blur-[120px] mix-blend-screen"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            </div>

            <ExitButton />
            <RunningAlicornCounter />

            {/* Content Container */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                    "w-full max-w-4xl relative z-10",
                    "bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] shadow-2xl p-8 md:p-12",
                    className
                )}
            >
                {children}
            </motion.main>

            {/* Subtle Footer */}
            <div className="mt-8 relative z-10 flex items-center gap-6 text-slate-500 text-xs tracking-widest uppercase">
                <span className="hover:text-violet-400 transition-colors cursor-default">Unicorn Quest v2.0</span>
                <div className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="hover:text-fuchsia-400 transition-colors cursor-default">Powered by Global Intel</span>
            </div>
        </div>
    );
}
