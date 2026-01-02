import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    Sparkles, Flame, Zap, ArrowRight, ArrowLeft,
    ChevronRight, CheckCircle2, Clock
} from "lucide-react";
import {
    OPTION_LABELS,
    OPTION_COLORS,
    shuffleWithSeed,
    formatGleams
} from "./wizard-utils";

interface QuestionStepProps {
    level: string;
    question: any;
    index: number;
    total: number;
    streak: number;
    onAnswer: (grade: number) => void;
    onBack: () => void;
    currentGleams: number;
}

export default function QuestionStep({
    level,
    question,
    index,
    total,
    streak,
    onAnswer,
    onBack,
    currentGleams
}: QuestionStepProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAdvancing, setIsAdvancing] = useState(false);

    // Seeded shuffle of options 1-5
    const options = shuffleWithSeed([1, 2, 3, 4, 5], `${level}_${question.code}`);

    const handleSelect = (grade: number) => {
        if (isAdvancing) return;
        setSelectedOption(grade);
        setIsAdvancing(true);

        // Brief delay for cinematic feedback before moving on
        setTimeout(() => {
            onAnswer(grade);
            setSelectedOption(null);
            setIsAdvancing(false);
        }, 600);
    };

    const progress = ((index + 1) / total) * 100;

    return (
        <div className="space-y-8">
            {/* Quest Header */}
            <div className="flex items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
                        <span>Progress: {index + 1} / {total}</span>
                        <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            {formatGleams(currentGleams)} Gleams
                        </span>
                    </div>
                    <div className="relative h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        />
                    </div>
                </div>

                {/* Streak Flame */}
                <AnimatePresence>
                    {streak > 0 && (
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative">
                                <Flame className={cn(
                                    "w-10 h-10 transition-colors duration-500",
                                    streak > 5 ? "text-orange-500" : "text-amber-400"
                                )} />
                                {streak > 3 && (
                                    <motion.div
                                        animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl"
                                    />
                                )}
                            </div>
                            <span className="text-xs font-black text-white">{streak}x</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={question.code}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Question {index + 1}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                            {question.text}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {options.map((grade, idx) => {
                            const colors = OPTION_COLORS[idx];
                            const isSelected = selectedOption === grade;
                            const description = question.grades?.[grade] || `Option ${grade}`;

                            return (
                                <motion.div
                                    key={grade}
                                    whileHover={{ x: 8 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelect(grade)}
                                    className={cn(
                                        "group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden",
                                        colors.bg, colors.border,
                                        isSelected ? "bg-white/10 ring-2 ring-white/20" : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110",
                                            isSelected ? "bg-white text-slate-900" : "bg-slate-900/80 text-white"
                                        )}>
                                            {OPTION_LABELS[idx]}
                                        </div>
                                        <p className={cn(
                                            "flex-1 text-sm font-semibold tracking-wide transition-colors",
                                            isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                                        )}>
                                            {description}
                                        </p>
                                        {isSelected && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Reveal background fill on selection */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            animate={{ x: 0 }}
                                            className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-transparent pointer-events-none"
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Rich Input Area */}
                    <div className="pt-4 space-y-4">
                        <div className="relative">
                            <textarea
                                placeholder="[REQUIRED FOR UNICORN STATUS] Write your evidence, context, or feedback here..."
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 min-h-[80px] resize-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 font-mono">OPTIONAL</div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-amber-400 hover:bg-amber-400/10 text-[10px] uppercase tracking-widest gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // In a real app, this would open a modal
                                    alert("Feedback logged! The Ecosystem Architects will review this parameter.");
                                }}
                            >
                                <span className="text-lg">🤔</span> Question this Question?
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>

                <div className="flex items-center gap-4">
                    <a href="/dashboard" className="text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors border-b border-transparent hover:border-slate-500">
                        Exit to Hubs
                    </a>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3" /> Auto-saves Progress
                    </div>
                </div>
            </div>
        </div>
    );
}
