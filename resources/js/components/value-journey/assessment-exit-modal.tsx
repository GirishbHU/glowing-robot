import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pause, Clock, Calendar, Lightbulb, Users, ArrowRight, Coffee, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssessmentExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPause: (options: PauseOptions) => void;
  onSwitchIdea: () => void;
  onSwitchRole: () => void;
  currentLevel: string;
  currentQuestionIndex: number;
  ideaName?: string;
  stakeholder?: string;
}

export interface PauseOptions {
  type: "break" | "schedule" | "done_for_now";
  breakDuration?: number;
  scheduledReturnTime?: Date;
}

const BREAK_DURATIONS = [
  { label: "2 min", value: 2 * 60 * 1000, icon: "☕" },
  { label: "5 min", value: 5 * 60 * 1000, icon: "🍵" },
  { label: "15 min", value: 15 * 60 * 1000, icon: "🥪" },
  { label: "30 min", value: 30 * 60 * 1000, icon: "🍽️" },
  { label: "1 hour", value: 60 * 60 * 1000, icon: "🏃" },
  { label: "2 hours", value: 2 * 60 * 60 * 1000, icon: "📚" },
  { label: "4 hours", value: 4 * 60 * 60 * 1000, icon: "💤" },
  { label: "12 hours", value: 12 * 60 * 60 * 1000, icon: "🌙" },
];

export function AssessmentExitModal({
  isOpen,
  onClose,
  onPause,
  onSwitchIdea,
  onSwitchRole,
  currentLevel,
  currentQuestionIndex,
  ideaName,
  stakeholder,
}: AssessmentExitModalProps) {
  const [step, setStep] = useState<"main" | "break" | "schedule">("main");
  const [selectedBreak, setSelectedBreak] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const handleBreakSelect = (duration: number) => {
    setSelectedBreak(duration);
  };

  const handleConfirmBreak = () => {
    if (selectedBreak) {
      onPause({ type: "break", breakDuration: selectedBreak });
    }
  };

  const handleConfirmSchedule = () => {
    if (scheduleDate && scheduleTime) {
      const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`);
      onPause({ type: "schedule", scheduledReturnTime: scheduledTime });
    }
  };

  const handleDoneForNow = () => {
    onPause({ type: "done_for_now" });
  };

  const resetAndClose = () => {
    setStep("main");
    setSelectedBreak(null);
    setScheduleDate("");
    setScheduleTime("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-violet-500/30 shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={resetAndClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              data-testid="button-close-exit-modal"
            >
              <X className="h-5 w-5" />
            </button>

            {step === "main" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    className="text-5xl mb-3"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🦄
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Taking a Break?</h2>
                  <p className="text-slate-400">
                    No worries! Your progress at <span className="text-amber-400">{currentLevel}</span> 
                    {ideaName && <span className="text-violet-400"> for "{ideaName}"</span>} is saved.
                  </p>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("break")}
                    className="w-full p-4 bg-violet-900/40 hover:bg-violet-800/50 border border-violet-500/30 rounded-xl flex items-center gap-4 text-left transition-all"
                    data-testid="button-take-break"
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-600/50 flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-violet-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Take a Break</div>
                      <div className="text-sm text-slate-400">Quick pause with timer (2 min - 12 hours)</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("schedule")}
                    className="w-full p-4 bg-blue-900/40 hover:bg-blue-800/50 border border-blue-500/30 rounded-xl flex items-center gap-4 text-left transition-all"
                    data-testid="button-schedule-return"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600/50 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Schedule Return</div>
                      <div className="text-sm text-slate-400">Set a specific date & time to continue</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSwitchIdea}
                    className="w-full p-4 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-500/30 rounded-xl flex items-center gap-4 text-left transition-all"
                    data-testid="button-switch-idea"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-600/50 flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-amber-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Switch to Another Idea</div>
                      <div className="text-sm text-slate-400">Work on a different startup idea</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSwitchRole}
                    className="w-full p-4 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-500/30 rounded-xl flex items-center gap-4 text-left transition-all"
                    data-testid="button-switch-role"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-600/50 flex items-center justify-center">
                      <Users className="h-6 w-6 text-emerald-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Switch Stakeholder Role</div>
                      <div className="text-sm text-slate-400">
                        {stakeholder ? `Currently: ${stakeholder}` : "Assess as mentor, investor, etc."}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDoneForNow}
                    className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-xl text-center transition-all"
                    data-testid="button-done-for-now"
                  >
                    <span className="text-slate-300">Just exit (I'll return when ready)</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === "break" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep("main")}
                    className="text-slate-400 hover:text-white"
                    data-testid="button-back-to-main"
                  >
                    ← Back
                  </button>
                  <h2 className="text-xl font-bold text-white">Take a Break</h2>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {BREAK_DURATIONS.map((duration) => (
                    <motion.button
                      key={duration.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBreakSelect(duration.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedBreak === duration.value
                          ? "bg-violet-600 border-violet-400 text-white"
                          : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-violet-500/50"
                      }`}
                      data-testid={`button-break-${duration.label.replace(" ", "-")}`}
                    >
                      <div className="text-2xl mb-1">{duration.icon}</div>
                      <div className="text-sm font-medium">{duration.label}</div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("main")}
                    className="flex-1 border-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmBreak}
                    disabled={!selectedBreak}
                    className="flex-1 bg-violet-600 hover:bg-violet-500"
                    data-testid="button-confirm-break"
                  >
                    <AlarmClock className="mr-2 h-4 w-4" />
                    Start Break
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "schedule" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep("main")}
                    className="text-slate-400 hover:text-white"
                    data-testid="button-back-to-main-schedule"
                  >
                    ← Back
                  </button>
                  <h2 className="text-xl font-bold text-white">Schedule Return</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="schedule-date" className="text-slate-300">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                      data-testid="input-schedule-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-time" className="text-slate-300">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                      data-testid="input-schedule-time"
                    />
                  </div>
                </div>

                <p className="text-sm text-slate-400">
                  We'll remind you when it's time to continue your {currentLevel} assessment.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("main")}
                    className="flex-1 border-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSchedule}
                    disabled={!scheduleDate || !scheduleTime}
                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                    data-testid="button-confirm-schedule"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </motion.div>
            )}

            <motion.div
              className="absolute -bottom-2 left-8 text-2xl"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🦄
            </motion.div>
            <motion.div
              className="absolute -bottom-2 right-8 text-2xl"
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              🦄
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
