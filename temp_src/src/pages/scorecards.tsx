import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, FileText, Download, Share2, Calendar,
  Sparkles, TrendingUp, Target, ChevronRight, Info, Maximize2, ExternalLink
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

const mockScorecards = [
  {
    id: "1",
    date: "2024-12-20",
    level: "L3",
    stakeholder: "Founder",
    gleams: 850,
    alicorns: 8.5,
    hint: "Launch level - Going to market",
    dimensions: [
      { name: "Go-to-Market", score: 4.2, hint: "Market entry strategy strength" },
      { name: "Customer Acquisition", score: 3.8, hint: "Customer growth efficiency" },
      { name: "Revenue Model", score: 4.5, hint: "Monetization clarity" },
      { name: "Feedback Loops", score: 4.0, hint: "Customer feedback integration" },
    ],
  },
  {
    id: "2",
    date: "2024-12-15",
    level: "L2",
    stakeholder: "Founder",
    gleams: 720,
    alicorns: 7.2,
    hint: "Build level - Creating the MVP",
    dimensions: [
      { name: "MVP Definition", score: 4.0, hint: "Minimum viable product clarity" },
      { name: "Tech Stack", score: 3.5, hint: "Technology choices" },
      { name: "Build Velocity", score: 4.2, hint: "Development speed" },
      { name: "Quality Standards", score: 3.8, hint: "Code and product quality" },
    ],
  },
  {
    id: "3",
    date: "2024-12-10",
    level: "L1",
    stakeholder: "Founder",
    gleams: 680,
    alicorns: 6.8,
    hint: "Hunt level - Finding product-market fit",
    dimensions: [
      { name: "Customer Discovery", score: 4.5, hint: "Understanding customer needs" },
      { name: "Problem Validation", score: 4.0, hint: "Problem worth solving" },
      { name: "Solution Hypothesis", score: 3.8, hint: "Proposed solution fit" },
      { name: "Market Sizing", score: 3.5, hint: "Market opportunity size" },
    ],
  },
];

export default function ScorecardsPage() {
  const [, setLocation] = useLocation();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const totalGleams = mockScorecards.reduce((sum, card) => sum + card.gleams, 0);
  const totalAlicorns = mockScorecards.reduce((sum, card) => sum + card.alicorns, 0);

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
              <FileText className="h-8 w-8 text-violet-400" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white">Your Scorecards</h1>
          </div>
          <p className="text-slate-400">
            Track your progress across all completed assessments
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-violet-500/50 text-center cursor-pointer transition-all"
                >
                  <div className="text-2xl font-bold text-white"><AnimatedCounter target={mockScorecards.length} /></div>
                  <div className="text-sm text-slate-400">Completed</div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent><p>Levels completed so far</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30 hover:border-amber-400 text-center cursor-pointer transition-all"
                >
                  <div className="text-2xl font-bold text-amber-400"><AnimatedCounter target={totalGleams} /> {GLEAM_SYMBOL}</div>
                  <div className="text-sm text-slate-400">Total Gleams</div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent><p>Points earned across all assessments</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="bg-slate-800/50 rounded-xl p-4 border border-violet-500/30 hover:border-violet-400 text-center cursor-pointer transition-all"
                >
                  <div className="text-2xl font-bold text-violet-400">{totalAlicorns.toFixed(1)} {ALICORN_SYMBOL}</div>
                  <div className="text-sm text-slate-400">Total Alicorns</div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent><p>Achievement tokens earned</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Scorecards List */}
          <div className="space-y-4">
            {mockScorecards.map((card, i) => {
              const theme = LEVEL_THEMES[card.level];

              return (
                <Dialog key={card.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.01, x: 5, boxShadow: "0 8px 30px rgba(139, 92, 246, 0.2)" }}
                          className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden cursor-pointer transition-all hover:border-violet-500/50"
                          data-testid={`card-scorecard-${card.id}`}
                        >
                          <div className={`h-1 bg-gradient-to-r ${theme.gradient}`} />
                          <div className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <motion.div 
                                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-lg`}
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                >
                                  {theme.emoji}
                                </motion.div>
                                <div>
                                  <div className="font-semibold text-white">{card.level} {LEVEL_NAMES[card.level]}</div>
                                  <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(card.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-amber-400 font-semibold">{card.gleams} {GLEAM_SYMBOL}</div>
                                  <div className="text-xs text-slate-400">{card.alicorns} {ALICORN_SYMBOL}</div>
                                </div>
                                <Maximize2 className="h-4 w-4 text-slate-500" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Click to view details - {card.hint}</p></TooltipContent>
                  </Tooltip>
                  
                  <ResizableDialogContent className="bg-slate-900 border-violet-500/50 max-w-2xl">
                    <div className={`h-2 rounded-t-lg bg-gradient-to-r ${theme.gradient} -mx-6 -mt-6 mb-4`} />
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl`}>
                        {theme.emoji}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">{card.level} {LEVEL_NAMES[card.level]} Assessment</h2>
                        <p className="text-slate-400 text-sm">{card.hint}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-bold text-xl">{card.gleams} {GLEAM_SYMBOL}</div>
                        <div className="text-violet-400">{card.alicorns} {ALICORN_SYMBOL}</div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-white mb-3">Dimension Scores</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {card.dimensions.map((dim) => (
                          <Tooltip key={dim.name}>
                            <TooltipTrigger asChild>
                              <div className="bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-800/50 transition-all">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-slate-300">{dim.name}</span>
                                  <span className="text-xs font-semibold text-violet-400">{dim.score}/5</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(dim.score / 5) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                    className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full`}
                                  />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent><p>{dim.hint}</p></TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 flex items-center gap-2 mb-4">
                      <Info className="h-3 w-3" />
                      <span>Scorecard data for illustration purposes</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        className={`flex-1 bg-gradient-to-r ${theme.gradient} text-white`}
                        onClick={() => setLocation("/value-journey")}
                      >
                        Retake
                      </Button>
                    </div>
                  </ResizableDialogContent>
                </Dialog>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30"
                  onClick={() => setLocation("/value-journey")}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Continue Assessment
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Start your next level assessment</p></TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
}
