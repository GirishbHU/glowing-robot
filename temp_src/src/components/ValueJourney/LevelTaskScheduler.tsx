import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Target, CheckCircle2, Plus, X, Bell, ChevronRight, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ScheduledTask {
  id: string;
  levelId: string;
  levelName: string;
  type: "self-assessment" | "aspirational";
  scheduledDate: Date;
  reminder: boolean;
  completed: boolean;
  gleamsTarget?: number;
}

interface LevelTaskSchedulerProps {
  currentLevel: string;
  aspirationalLevel: string;
  completedLevels: string[];
  onScheduleTask?: (task: ScheduledTask) => void;
  className?: string;
}

const LEVELS = [
  { id: "L0", name: "Spark", emoji: "✨" },
  { id: "L1", name: "Conviction", emoji: "💎" },
  { id: "L2", name: "Ideation", emoji: "💡" },
  { id: "L3", name: "Business Model", emoji: "📊" },
  { id: "L4", name: "MVP/MLP", emoji: "🚀" },
  { id: "L5", name: "Product-Market Fit", emoji: "🎯" },
  { id: "L6", name: "Scaling Ops", emoji: "⚡" },
  { id: "L7", name: "Scaling Mkt", emoji: "📈" },
  { id: "L8", name: "Stewardship", emoji: "🦄" },
];

export function LevelTaskScheduler({
  currentLevel,
  aspirationalLevel,
  completedLevels,
  onScheduleTask,
  className = "",
}: LevelTaskSchedulerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"self-assessment" | "aspirational">("self-assessment");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const currentLevelIndex = LEVELS.findIndex(l => l.id === currentLevel);
  const aspirationalLevelIndex = LEVELS.findIndex(l => l.id === aspirationalLevel);

  const selfAssessmentLevels = LEVELS.slice(0, currentLevelIndex + 1);
  const aspirationalLevels = LEVELS.slice(currentLevelIndex + 1, aspirationalLevelIndex + 1);

  const addScheduledTask = () => {
    if (!selectedLevel || !scheduleDate) return;
    
    const level = LEVELS.find(l => l.id === selectedLevel);
    if (!level) return;

    const newTask: ScheduledTask = {
      id: `task-${Date.now()}`,
      levelId: selectedLevel,
      levelName: level.name,
      type: selectedType,
      scheduledDate: new Date(`${scheduleDate}T${scheduleTime || "09:00"}`),
      reminder: true,
      completed: false,
      gleamsTarget: selectedLevel === "L0" ? 100 : 1000,
    };

    setScheduledTasks(prev => [...prev, newTask]);
    onScheduleTask?.(newTask);
    setShowScheduleModal(false);
    setSelectedLevel(null);
    setScheduleDate("");
    setScheduleTime("");
  };

  const toggleTaskComplete = (taskId: string) => {
    setScheduledTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const removeTask = (taskId: string) => {
    setScheduledTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const upcomingTasks = scheduledTasks.filter(t => !t.completed && new Date(t.scheduledDate) >= new Date());
  const completedTasksCount = scheduledTasks.filter(t => t.completed).length;

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 ${className}`}>
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between"
        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Calendar className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Level Task Scheduler</h3>
            <p className="text-xs text-slate-400">Plan your assessment journey</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {upcomingTasks.length > 0 && (
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
              {upcomingTasks.length} upcoming
            </Badge>
          )}
          {completedTasksCount > 0 && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {completedTasksCount} done
            </Badge>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <Target className="h-4 w-4" />
                    <span>Self-Assessment Zone</span>
                  </div>
                  <div className="space-y-1">
                    {selfAssessmentLevels.map(level => {
                      const isCompleted = completedLevels.includes(level.id);
                      const hasTask = scheduledTasks.some(t => t.levelId === level.id && t.type === "self-assessment");
                      
                      return (
                        <motion.div
                          key={level.id}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isCompleted 
                              ? "bg-green-500/10 border border-green-500/30" 
                              : hasTask
                                ? "bg-amber-500/10 border border-amber-500/30"
                                : "bg-slate-800/50 border border-slate-700/50"
                          }`}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center gap-2">
                            <span>{level.emoji}</span>
                            <span className="text-sm text-slate-200">{level.id}: {level.name}</span>
                            {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                          </div>
                          {!isCompleted && !hasTask && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-amber-300 hover:bg-amber-500/10"
                              onClick={() => {
                                setSelectedLevel(level.id);
                                setSelectedType("self-assessment");
                                setShowScheduleModal(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-violet-300">
                    <Rocket className="h-4 w-4" />
                    <span>Aspirational Zone</span>
                  </div>
                  <div className="space-y-1">
                    {aspirationalLevels.length > 0 ? aspirationalLevels.map(level => {
                      const hasTask = scheduledTasks.some(t => t.levelId === level.id && t.type === "aspirational");
                      
                      return (
                        <motion.div
                          key={level.id}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            hasTask
                              ? "bg-violet-500/10 border border-violet-500/30"
                              : "bg-slate-800/50 border border-slate-700/50"
                          }`}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center gap-2">
                            <span>{level.emoji}</span>
                            <span className="text-sm text-slate-200">{level.id}: {level.name}</span>
                          </div>
                          {!hasTask && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-violet-300 hover:bg-violet-500/10"
                              onClick={() => {
                                setSelectedLevel(level.id);
                                setSelectedType("aspirational");
                                setShowScheduleModal(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          )}
                        </motion.div>
                      );
                    }) : (
                      <div className="text-center text-slate-500 text-sm py-4">
                        Complete your current level to unlock aspirational goals!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {scheduledTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Clock className="h-4 w-4" />
                    <span>Scheduled Tasks</span>
                  </div>
                  <div className="space-y-2">
                    {scheduledTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          task.completed
                            ? "bg-green-500/5 border-green-500/20"
                            : task.type === "self-assessment"
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-violet-500/10 border-violet-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              task.completed
                                ? "bg-green-500 border-green-500"
                                : "border-slate-500 hover:border-green-400"
                            }`}
                          >
                            {task.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </button>
                          <div>
                            <div className={`text-sm font-medium ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                              {LEVELS.find(l => l.id === task.levelId)?.emoji} {task.levelId}: {task.levelName}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{new Date(task.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <Badge className={`text-[10px] ${
                                task.type === "self-assessment" 
                                  ? "bg-green-500/20 text-green-300" 
                                  : "bg-violet-500/20 text-violet-300"
                              }`}>
                                {task.type === "self-assessment" ? "Reality" : "Aspiration"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.reminder && !task.completed && (
                            <Bell className="h-4 w-4 text-amber-400" />
                          )}
                          {task.gleamsTarget && !task.completed && (
                            <span className="text-xs text-amber-300">
                              <Sparkles className="h-3 w-3 inline mr-1" />
                              {task.gleamsTarget} Ğ
                            </span>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-slate-500 hover:text-red-400"
                            onClick={() => removeTask(task.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-400" />
                  Schedule Assessment
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setShowScheduleModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {LEVELS.find(l => l.id === selectedLevel)?.emoji}
                    </span>
                    <div>
                      <div className="font-medium text-white">
                        {selectedLevel}: {LEVELS.find(l => l.id === selectedLevel)?.name}
                      </div>
                      <Badge className={`text-xs ${
                        selectedType === "self-assessment" 
                          ? "bg-green-500/20 text-green-300" 
                          : "bg-violet-500/20 text-violet-300"
                      }`}>
                        {selectedType === "self-assessment" ? "Self-Assessment" : "Aspirational"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Date</label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-slate-800 border-slate-600"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Time (optional)</label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>

                <Button
                  onClick={addScheduledTask}
                  disabled={!scheduleDate}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Task
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LevelTaskScheduler;
