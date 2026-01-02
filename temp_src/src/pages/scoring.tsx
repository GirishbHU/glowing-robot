import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, ArrowRight, Sparkles, Star, Trophy, 
  Gift, TrendingUp, Users, Share2, Zap, Info, Maximize2, Calculator
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

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

const gleamsInfo = [
  { label: "L0 (Spark) Parameters", value: `Up to 10 ${GLEAM_SYMBOL} each`, hint: "Initial level has smaller rewards" },
  { label: "L1+ Parameters", value: `Up to 100 ${GLEAM_SYMBOL} each`, hint: "Higher levels earn more Gleams" },
  { label: "Referral Bonus", value: `+100 ${GLEAM_SYMBOL} per referral`, hint: "Invite friends to earn bonus" },
  { label: "Suggestion Bonus", value: `+50 ${GLEAM_SYMBOL} for approved suggestions`, hint: "Help improve the platform" },
];

const ratingScale = [
  { rating: 1, label: "Not at all", percent: 20, color: "text-red-400" },
  { rating: 2, label: "Slightly", percent: 40, color: "text-orange-400" },
  { rating: 3, label: "Moderately", percent: 60, color: "text-yellow-400" },
  { rating: 4, label: "Very much", percent: 80, color: "text-emerald-400" },
  { rating: 5, label: "Absolutely", percent: 100, color: "text-amber-400" },
];

export default function ScoringPage() {
  const [, setLocation] = useLocation();

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
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-amber-400" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white">Gleams & Alicorns</h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🦄</span>
            </motion.div>
          </div>
          <p className="text-slate-400 max-w-xl mx-auto">
            Understand how scoring works and maximize your rewards
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Gleams Section */}
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, y: [0, -3, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    whileHover={{ scale: 1.01, boxShadow: "0 8px 40px rgba(245, 158, 11, 0.2)" }}
                    className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-8 border border-amber-500/30 cursor-pointer relative"
                  >
                    <motion.div
                      className="absolute top-4 right-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Maximize2 className="h-5 w-5 text-amber-400" />
                    </motion.div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl font-bold text-white"
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {GLEAM_SYMBOL}
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-amber-400">Gleams</h2>
                        <p className="text-slate-300">Points earned per parameter</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-400" />
                          How to Earn
                        </h3>
                        <ul className="space-y-3 text-sm">
                          {gleamsInfo.map((item, i) => (
                            <Tooltip key={item.label}>
                              <TooltipTrigger asChild>
                                <motion.li 
                                  className="flex items-start gap-3 text-slate-300 cursor-pointer hover:text-white transition-colors"
                                  whileHover={{ x: 3 }}
                                >
                                  <Sparkles className="h-4 w-4 text-amber-400 mt-0.5" />
                                  <div>
                                    <span className="text-white font-medium">{item.label}:</span>{" "}
                                    {item.value}
                                  </div>
                                </motion.li>
                              </TooltipTrigger>
                              <TooltipContent><p>{item.hint}</p></TooltipContent>
                            </Tooltip>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-amber-400" />
                          Calculation
                        </h3>
                        <div className="bg-slate-900/50 rounded-xl p-4 text-sm">
                          <p className="text-slate-300 mb-3">
                            Gleams are calculated based on your confidence rating (1-5):
                          </p>
                          <div className="space-y-2">
                            {ratingScale.filter(r => [1, 3, 5].includes(r.rating)).map((r) => (
                              <Tooltip key={r.rating}>
                                <TooltipTrigger asChild>
                                  <motion.div 
                                    className={`flex justify-between cursor-pointer ${r.color}`}
                                    whileHover={{ x: 3 }}
                                  >
                                    <span>Rating {r.rating} ({r.label})</span>
                                    <span>{r.percent}% of max {GLEAM_SYMBOL}</span>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent><p>{r.label} confidence = {r.percent}% Gleams</p></TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Click to see detailed Gleams breakdown</p></TooltipContent>
            </Tooltip>
            
            <ResizableDialogContent className="bg-slate-900 border-amber-500/50 max-w-2xl">
              <div className="h-2 rounded-t-lg bg-gradient-to-r from-amber-500 to-orange-500 -mx-6 -mt-6 mb-4" />
              <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Gleams Calculation Details
              </h2>
              
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-white mb-3">Rating to Gleams Conversion</h3>
                <div className="space-y-3">
                  {ratingScale.map((r, i) => (
                    <motion.div 
                      key={r.rating}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${r.color} bg-slate-700`}>
                        {r.rating}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">{r.label}</span>
                          <span className={r.color}>{r.percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${r.percent}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Info className="h-3 w-3" />
                <span>Scoring mechanics for illustration purposes</span>
              </div>
            </ResizableDialogContent>
          </Dialog>

          {/* Alicorns Section */}
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, y: [0, -3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    whileHover={{ scale: 1.01, boxShadow: "0 8px 40px rgba(139, 92, 246, 0.2)" }}
                    className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-2xl p-8 border border-violet-500/30 cursor-pointer relative"
                  >
                    <motion.div
                      className="absolute top-4 right-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Maximize2 className="h-5 w-5 text-violet-400" />
                    </motion.div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div 
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-3xl"
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {ALICORN_SYMBOL}
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-violet-400">Alicorns</h2>
                        <p className="text-slate-300">Achievement tokens for your unicorn journey</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Star className="h-4 w-4 text-violet-400" />
                          Conversion Rate
                        </h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div 
                              className="bg-slate-900/50 rounded-xl p-6 text-center cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="text-4xl font-bold mb-2">
                                <span className="text-amber-400">100 {GLEAM_SYMBOL}</span>
                                <motion.span 
                                  className="text-slate-500 mx-2"
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  =
                                </motion.span>
                                <span className="text-violet-400">1 {ALICORN_SYMBOL}</span>
                              </div>
                              <p className="text-sm text-slate-400">
                                Alicorns are earned at L1+ levels only
                              </p>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent><p>L0 earns Gleams only, L1+ earns Alicorns too</p></TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-violet-400" />
                          Benefits
                        </h3>
                        <ul className="space-y-3 text-sm">
                          {[
                            { icon: Star, text: "Track your unicorn progress", hint: "Watch your Alicorns grow" },
                            { icon: Trophy, text: "Climb the global leaderboard", hint: "Compete with founders worldwide" },
                            { icon: Users, text: "Compare with peers in your sector", hint: "Benchmark against industry" },
                            { icon: Gift, text: "Unlock exclusive insights (coming soon)", hint: "Premium features await" },
                          ].map((item, i) => (
                            <Tooltip key={item.text}>
                              <TooltipTrigger asChild>
                                <motion.li 
                                  className="flex items-start gap-3 text-slate-300 cursor-pointer hover:text-white transition-colors"
                                  whileHover={{ x: 3 }}
                                >
                                  <item.icon className="h-4 w-4 text-violet-400 mt-0.5" />
                                  {item.text}
                                </motion.li>
                              </TooltipTrigger>
                              <TooltipContent><p>{item.hint}</p></TooltipContent>
                            </Tooltip>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Click to see Alicorn benefits</p></TooltipContent>
            </Tooltip>
            
            <ResizableDialogContent className="bg-slate-900 border-violet-500/50 max-w-lg">
              <div className="h-2 rounded-t-lg bg-gradient-to-r from-violet-500 to-purple-500 -mx-6 -mt-6 mb-4" />
              <h2 className="text-2xl font-bold text-violet-400 mb-4 flex items-center gap-2">
                <span className="text-3xl">🦄</span>
                Alicorn Benefits
              </h2>
              
              <div className="space-y-3 mb-4">
                {[
                  { title: "Leaderboard Ranking", desc: "Compete globally based on Alicorn count" },
                  { title: "Sector Benchmarks", desc: "Compare your progress with industry peers" },
                  { title: "Progress Tracking", desc: "Visual journey from Spark to Unicorn" },
                  { title: "Future Rewards", desc: "Exclusive insights and features coming soon" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/50 rounded-lg p-3"
                  >
                    <div className="font-medium text-white">{item.title}</div>
                    <div className="text-sm text-slate-400">{item.desc}</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Info className="h-3 w-3" />
                <span>Benefits for illustration purposes</span>
              </div>
            </ResizableDialogContent>
          </Dialog>

          {/* Example Calculation */}
          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, boxShadow: "0 8px 30px rgba(139, 92, 246, 0.15)" }}
                    className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 cursor-pointer relative"
                  >
                    <motion.div
                      className="absolute top-4 right-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Calculator className="h-5 w-5 text-violet-400" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                      <Calculator className="h-5 w-5 text-violet-400" />
                      Example: L1 Assessment
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      {[
                        { value: "10", label: "Parameters", color: "text-white" },
                        { value: `800 ${GLEAM_SYMBOL}`, label: "Avg Rating 4/5", color: "text-amber-400" },
                        { value: `8.00 ${ALICORN_SYMBOL}`, label: "Earned", color: "text-violet-400" },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-slate-900/50 rounded-xl p-4"
                        >
                          <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
                          <div className="text-sm text-slate-400">{item.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Click to see detailed calculation</p></TooltipContent>
            </Tooltip>
            
            <ResizableDialogContent className="bg-slate-900 border-violet-500/50 max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">L1 Assessment Calculation</h2>
              
              <div className="space-y-4 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-2">Formula:</div>
                  <div className="text-white font-mono">
                    Gleams = Parameters × Max{GLEAM_SYMBOL} × (Rating/5)
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-2">Example (Rating 4/5):</div>
                  <div className="text-white font-mono">
                    = 10 × 100 × (4/5)<br/>
                    = 10 × 100 × 0.8<br/>
                    = <span className="text-amber-400">800 {GLEAM_SYMBOL}</span>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-2">Alicorn Conversion:</div>
                  <div className="text-white font-mono">
                    = 800 ÷ 100<br/>
                    = <span className="text-violet-400">8.00 {ALICORN_SYMBOL}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Info className="h-3 w-3" />
                <span>Example calculation for illustration</span>
              </div>
            </ResizableDialogContent>
          </Dialog>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30"
                  onClick={() => setLocation("/value-journey")}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Earning Gleams
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Begin your assessment journey</p></TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
}
