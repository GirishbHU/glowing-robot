import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, BarChart3, TrendingUp, Target, 
  Sparkles, PieChart, Activity, Calendar, Info, Maximize2, ExternalLink
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LEVEL_THEMES, LEVEL_NAMES } from "@/lib/valueJourneyTypes";

const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * easedProgress));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(target);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);
  
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function IllustrationDisclaimer() {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="fixed bottom-4 left-4 z-40 px-3 py-1.5 rounded-full bg-slate-800/90 border border-violet-500/30 text-xs text-slate-400 flex items-center gap-2"
        >
          <Info className="h-3 w-3 text-violet-400" />
          <span>Numbers shown for illustration purposes</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const progressData = [
  { level: "L0", completed: true, gleams: 80, date: "Dec 5", hint: "Spark - Your journey began here" },
  { level: "L1", completed: true, gleams: 680, date: "Dec 10", hint: "Hunt - Finding product-market fit" },
  { level: "L2", completed: true, gleams: 720, date: "Dec 15", hint: "Build - Creating the MVP" },
  { level: "L3", completed: true, gleams: 850, date: "Dec 20", hint: "Launch - Going to market" },
  { level: "L4", completed: false, gleams: 0, date: null, hint: "Rocket - Accelerating growth" },
  { level: "L5", completed: false, gleams: 0, date: null, hint: "Optimize - Refining operations" },
  { level: "L6", completed: false, gleams: 0, date: null, hint: "Lead - Dominating the market" },
  { level: "L7", completed: false, gleams: 0, date: null, hint: "Unicorn - Reaching $1B+" },
  { level: "L8", completed: false, gleams: 0, date: null, hint: "Jedi - Legacy & stewardship" },
];

const dimensionScores = [
  { name: "Vision", score: 85, hint: "Clarity of your startup vision" },
  { name: "Market", score: 72, hint: "Market understanding and sizing" },
  { name: "Product", score: 88, hint: "Product-market fit strength" },
  { name: "Team", score: 65, hint: "Team readiness and capabilities" },
  { name: "Traction", score: 78, hint: "Customer acquisition progress" },
  { name: "Revenue", score: 60, hint: "Revenue model and sustainability" },
];

const weeklyProgress = [
  { week: "Week 1", gleams: 80 },
  { week: "Week 2", gleams: 680 },
  { week: "Week 3", gleams: 720 },
  { week: "Week 4", gleams: 850 },
];

export default function ChartsPage() {
  const [, setLocation] = useLocation();
  const [selectedLevel, setSelectedLevel] = useState<typeof progressData[0] | null>(null);
  const totalGleams = progressData.reduce((sum, d) => sum + d.gleams, 0);
  const completedLevels = progressData.filter(d => d.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
      <IllustrationDisclaimer />
      
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="mb-6 text-slate-400 hover:text-white"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Return to home page</p></TooltipContent>
        </Tooltip>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <BarChart3 className="h-8 w-8 text-violet-400" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white">Progress Charts</h1>
          </div>
          <p className="text-slate-400">
            Visualize your journey through all growth levels
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Levels Completed", value: `${completedLevels}/9`, target: completedLevels, icon: Target, color: "text-violet-400", hint: "Progress through 9 growth levels" },
              { label: "Total Gleams", value: totalGleams, target: totalGleams, suffix: ` ${GLEAM_SYMBOL}`, icon: Sparkles, color: "text-amber-400", hint: "Points earned across all assessments" },
              { label: "Alicorns Earned", value: (totalGleams / 100).toFixed(1), target: totalGleams / 100, suffix: ` ${ALICORN_SYMBOL}`, icon: Activity, color: "text-violet-400", hint: "100 Gleams = 1 Alicorn" },
              { label: "Days Active", value: 15, target: 15, icon: Calendar, color: "text-emerald-400", hint: "Days since you started" },
            ].map((stat, i) => (
              <Tooltip key={stat.label}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-violet-500/50 cursor-pointer transition-all"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                    </motion.div>
                    <div className={`text-xl font-bold ${stat.color}`}>
                      {typeof stat.value === 'number' ? <AnimatedCounter target={stat.target} /> : stat.value}
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>{stat.hint}</p></TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Level Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ boxShadow: "0 0 30px rgba(139, 92, 246, 0.1)" }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              Level Progress
            </h3>
            
            <div className="space-y-4">
              {progressData.map((level, i) => {
                const theme = LEVEL_THEMES[level.level];
                const maxGleams = level.level === "L0" ? 100 : 1000;
                const percentage = level.completed ? (level.gleams / maxGleams) * 100 : 0;

                return (
                  <Dialog key={level.level}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.01, x: 5, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                            className="flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all hover:border hover:border-violet-500/30"
                          >
                            <motion.div 
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                                level.completed 
                                  ? `bg-gradient-to-br ${theme.gradient}` 
                                  : "bg-slate-700/50"
                              }`}
                              animate={level.completed ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                            >
                              {theme.emoji}
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white">
                                    {level.level} {LEVEL_NAMES[level.level]}
                                  </span>
                                  {level.completed && (
                                    <span className="text-xs text-slate-400">{level.date}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${level.completed ? "text-amber-400" : "text-slate-500"}`}>
                                    {level.completed ? `${level.gleams} ${GLEAM_SYMBOL}` : "—"}
                                  </span>
                                  <Maximize2 className="h-3 w-3 text-slate-500" />
                                </div>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                  className={`h-full rounded-full ${
                                    level.completed 
                                      ? `bg-gradient-to-r ${theme.gradient}` 
                                      : ""
                                  }`}
                                />
                              </div>
                            </div>
                          </motion.div>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{level.hint}</p></TooltipContent>
                    </Tooltip>
                    
                    <ResizableDialogContent className="bg-slate-900 border-violet-500/50">
                      <div className={`h-2 rounded-t-lg bg-gradient-to-r ${theme.gradient} -mx-6 -mt-6 mb-4`} />
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl`}>
                          {theme.emoji}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{level.level} {LEVEL_NAMES[level.level]}</h2>
                          <p className="text-slate-400">{level.hint}</p>
                        </div>
                      </div>
                      
                      {level.completed ? (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-amber-400">{level.gleams} {GLEAM_SYMBOL}</div>
                            <div className="text-xs text-slate-400">Gleams Earned</div>
                          </div>
                          <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-violet-400">{(level.gleams / 100).toFixed(1)} {ALICORN_SYMBOL}</div>
                            <div className="text-xs text-slate-400">Alicorns</div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-800/50 rounded-lg p-4 text-center mb-4">
                          <p className="text-slate-400">Complete this level to earn Gleams!</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-slate-500 flex items-center gap-2 mb-4">
                        <Info className="h-3 w-3" />
                        <span>Level data for illustration purposes</span>
                      </div>
                      
                      <Button
                        className={`w-full bg-gradient-to-r ${theme.gradient} text-white`}
                        onClick={() => setLocation("/value-journey")}
                      >
                        {level.completed ? "Retake Assessment" : "Start Assessment"}
                      </Button>
                    </ResizableDialogContent>
                  </Dialog>
                );
              })}
            </div>
          </motion.div>

          {/* Dimension Radar & Weekly Progress */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dimension Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ boxShadow: "0 0 30px rgba(139, 92, 246, 0.1)" }}
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-violet-400" />
                Dimension Scores
              </h3>
              
              <div className="space-y-4">
                {dimensionScores.map((dim, i) => (
                  <Tooltip key={dim.name}>
                    <TooltipTrigger asChild>
                      <motion.div 
                        className="space-y-1 cursor-pointer"
                        whileHover={{ scale: 1.02, x: 3 }}
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{dim.name}</span>
                          <span className="text-violet-400 font-medium">{dim.score}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dim.score}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent><p>{dim.hint}</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>

            {/* Weekly Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ boxShadow: "0 0 30px rgba(245, 158, 11, 0.1)" }}
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-400" />
                Weekly Gleams Earned
              </h3>
              
              <div className="flex items-end justify-between h-40 gap-4">
                {weeklyProgress.map((week, i) => {
                  const maxGleams = Math.max(...weeklyProgress.map(w => w.gleams));
                  const height = (week.gleams / maxGleams) * 100;
                  
                  return (
                    <Tooltip key={week.week}>
                      <TooltipTrigger asChild>
                        <div className="flex-1 flex flex-col items-center gap-2 cursor-pointer">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                            className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg min-h-[20px]"
                          />
                          <span className="text-xs text-slate-400">{week.week}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{week.gleams} {GLEAM_SYMBOL} earned</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold shadow-lg shadow-violet-500/30"
                  onClick={() => setLocation("/value-journey")}
                >
                  Continue Your Journey
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Start or continue your assessment</p></TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
}
