import { motion } from "framer-motion";
import { STAKEHOLDERS, StakeholderType } from "@/lib/value-journey-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

interface StakeholderStepProps {
    selected: StakeholderType | null;
    onSelect: (type: StakeholderType) => void;
    onNext: () => void;
}

export default function StakeholderStep({ selected, onSelect, onNext }: StakeholderStepProps) {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white"
                >
                    Identify Your Role
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400"
                >
                    Choose the path that best represents your current mission in the ecosystem.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STAKEHOLDERS.map((s, idx) => (
                    <motion.div
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(s.id)}
                        className={cn(
                            "relative p-5 rounded-2xl border transition-all cursor-pointer group",
                            selected === s.id
                                ? "bg-violet-600/20 border-violet-500 shadow-lg shadow-violet-900/20"
                                : "bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-600"
                        )}
                    >
                        {selected === s.id && (
                            <motion.div
                                layoutId="active-check"
                                className="absolute top-3 right-3 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <Check className="w-4 h-4 text-white" />
                            </motion.div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className="text-3xl bg-slate-900/50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                {s.emoji}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors">
                                    {s.name}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    {s.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
                            ? "bg-white text-black hover:bg-slate-200 shadow-xl shadow-white/10"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                >
                    Confirm My Role <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
            </motion.div>
        </div>
    );
}
