import { motion } from "framer-motion";
import { LEVELS, LEVEL_THEMES, LEVEL_NAMES } from "@/lib/value-journey-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, Target, Play } from "lucide-react";

interface LevelSelectorStepProps {
    selected: string | null;
    onSelect: (level: string) => void;
    onNext: () => void;
    title: string;
    description: string;
    minLevel?: string;
}

export default function LevelSelectorStep({
    selected,
    onSelect,
    onNext,
    title,
    description,
    minLevel
}: LevelSelectorStepProps) {
    // Filter levels if minLevel is provided (e.g. only show L2+ if current is L1)
    const displayLevels = minLevel
        ? LEVELS.filter(l => l.level > minLevel)
        : LEVELS;

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white"
                >
                    {title}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400"
                >
                    {description}
                </motion.p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayLevels.map((l, idx) => {
                    const theme = LEVEL_THEMES[l.level] || LEVEL_THEMES["L0"];
                    const isSelected = selected === l.level;

                    return (
                        <motion.div
                            key={l.level}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(l.level)}
                            className={cn(
                                "relative p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col items-center text-center",
                                isSelected
                                    ? "bg-slate-800/40 border-violet-500 shadow-lg shadow-violet-900/20"
                                    : "bg-slate-800/10 border-slate-700/50 hover:bg-slate-800/30 hover:border-slate-600"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-colors",
                                isSelected ? "bg-violet-500 text-white" : "bg-slate-900 text-slate-400 group-hover:bg-slate-800"
                            )}>
                                {theme.emoji}
                            </div>

                            <div className="space-y-1">
                                <h3 className={cn(
                                    "font-bold text-sm",
                                    isSelected ? "text-violet-300" : "text-white"
                                )}>
                                    {LEVEL_NAMES[l.level]}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                                    {l.level} FOCUS
                                </p>
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId="level-glow"
                                    className="absolute inset-0 rounded-2xl border-2 border-violet-400/30 pointer-events-none"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-8"
            >
                <Button
                    disabled={!selected}
                    onClick={onNext}
                    className={cn(
                        "h-14 px-12 rounded-2xl font-bold text-lg transition-all",
                        selected
                            ? "bg-violet-600 text-white hover:bg-violet-500 shadow-xl shadow-violet-900/40"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                >
                    Lock Selection <Target className="ml-2 w-5 h-5" />
                </Button>
            </motion.div>
        </div>
    );
}
