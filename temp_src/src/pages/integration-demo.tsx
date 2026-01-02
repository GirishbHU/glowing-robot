import { useLocation } from "wouter";
import { ArrowRight, Users, Rocket, Sparkles, Target, Trophy, FileText, Zap, TrendingUp, Award, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// Mock leaderboard data for news ticker
const mockLeaderboardUpdates = [
  { name: "Cosmic Pioneer", action: "completed L2", alicorns: 12.45, time: "2m ago" },
  { name: "Epic Unicorn", action: "earned 500 Gleams", alicorns: 8.20, time: "5m ago" },
  { name: "Brilliant Dragon", action: "reached #3 on leaderboard", alicorns: 45.80, time: "8m ago" },
  { name: "Dynamic Titan", action: "completed L1", alicorns: 5.40, time: "12m ago" },
  { name: "Fierce Voyager", action: "earned 1000 Gleams", alicorns: 15.60, time: "15m ago" },
  { name: "Galactic Champion", action: "completed L3", alicorns: 55.20, time: "18m ago" },
];

function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockLeaderboardUpdates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const update = mockLeaderboardUpdates[currentIndex];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="bg-slate-800/80 border border-violet-500/30 rounded-lg p-3 overflow-hidden cursor-pointer hover:border-violet-500/60 transition-colors"
          onClick={() => window.location.href = "/value-journey"}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs font-bold text-violet-400">LIVE UPDATES</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm"
            >
              <span className="text-amber-400 font-semibold">{update.name}</span>
              <span className="text-slate-300"> {update.action}</span>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>🦄 {update.alicorns.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                <span>• {update.time}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-48">
        <p>Real-time activity from the community. Click to join the quest!</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function IntegrationDemo() {
  const [, setLocation] = useLocation();

  const featureTooltips = {
    levels: "Progress through 9 growth levels from L0 (Spark) to L8 (Masters/Jedi). Each level unlocks new insights and rewards!",
    stakeholders: "Choose from 9 stakeholder types: Startup, Investor/VC, Mentor, Accelerator, Incubator, Service Provider, Academic, Government, and Ecosystem.",
    gleams: "Gleams (Ğ) are points earned for each question. 100 Gleams = 1 Alicorn. Higher scores unlock more rewards!",
    alicorns: "Alicorns (🦄) are achievement tokens earned at L1+. Collect Alicorns to climb the leaderboard and win prizes!"
  };

  return (
    <div className="min-h-screen font-sans bg-background text-foreground">
      {/* Fixed Theme Switcher for Landing Page */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      
      {/* Hero Section - Begin Assessment CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-violet-950 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="container mx-auto px-4 lg:px-56 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-violet-200">Value Journey Quest</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-amber-200 bg-clip-text text-transparent">
                Discover Your Startup's True Potential
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Take the Value Journey Assessment to understand where you stand today and chart your path to unicorn status. Earn Gleams, unlock Alicorns, and get personalized insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-amber-500/30"
                    onClick={() => setLocation("/value-journey")}
                    data-testid="button-begin-assessment-hero"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Begin Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center cursor-pointer"
                      onClick={() => setLocation("/value-journey")}
                    >
                      <div className="h-12 w-12 mx-auto mb-2 rounded-xl bg-violet-500/20 flex items-center justify-center hover:bg-violet-500/30 transition-colors">
                        <Target className="h-6 w-6 text-violet-400" />
                      </div>
                      <p className="text-sm text-slate-400">9 Growth Levels</p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs bg-slate-800 text-white border-violet-500/50">
                    <p>{featureTooltips.levels}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center cursor-pointer"
                      onClick={() => setLocation("/value-journey")}
                    >
                      <div className="h-12 w-12 mx-auto mb-2 rounded-xl bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-colors">
                        <Users className="h-6 w-6 text-amber-400" />
                      </div>
                      <p className="text-sm text-slate-400">9 Stakeholder Types</p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs bg-slate-800 text-white border-amber-500/50">
                    <p>{featureTooltips.stakeholders}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center cursor-pointer"
                      onClick={() => setLocation("/value-journey")}
                    >
                      <div className="h-12 w-12 mx-auto mb-2 rounded-xl bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-400">Earn Gleams</p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs bg-slate-800 text-white border-emerald-500/50">
                    <p>{featureTooltips.gleams}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center cursor-pointer"
                      onClick={() => setLocation("/value-journey")}
                    >
                      <div className="h-12 w-12 mx-auto mb-2 rounded-xl bg-pink-500/20 flex items-center justify-center hover:bg-pink-500/30 transition-colors">
                        <Trophy className="h-6 w-6 text-pink-400" />
                      </div>
                      <p className="text-sm text-slate-400">Unlock Alicorns</p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs bg-slate-800 text-white border-pink-500/50">
                    <p>{featureTooltips.alicorns}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          </div>
          
          {/* Scroll Down Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col items-center mt-8"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => {
                document.getElementById('pitch-deck-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="text-sm text-slate-400 group-hover:text-violet-400 transition-colors mb-2">
                Explore More Features
              </span>
              <div className="flex flex-col items-center">
                <ChevronDown className="h-6 w-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
                <ChevronDown className="h-6 w-6 text-violet-400/60 -mt-3 group-hover:text-violet-300/60 transition-colors" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon - Pitch Deck Submission */}
      <section id="pitch-deck-section" className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-56">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-violet-600/30 via-purple-600/30 to-pink-600/30 border-2 border-amber-500/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-violet-500/20">
              {/* Animated glow effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"></div>
              
              <div className="relative z-10 text-center">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-400/60 mb-6 shadow-lg shadow-amber-500/20"
                >
                  <Zap className="h-5 w-5 text-amber-300" />
                  <span className="text-base font-bold text-amber-200">Coming Soon</span>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center mb-6"
                >
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 flex items-center justify-center shadow-xl shadow-amber-500/40 border-2 border-white/20">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                </motion.div>
                
                <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-amber-100 to-orange-200 bg-clip-text text-transparent">
                  Pitch Deck Submission
                </h2>
                
                <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-xl mx-auto leading-relaxed">
                  Submit your pitch deck for AI-powered analysis and get matched with investors who are looking for startups like yours. Get detailed feedback and improve your chances of funding.
                </p>
                
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40"
                  >
                    <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-emerald-300 font-medium">AI Analysis</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/40"
                  >
                    <div className="h-3 w-3 rounded-full bg-violet-400 animate-pulse"></div>
                    <span className="text-violet-300 font-medium">Investor Matching</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40"
                  >
                    <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-amber-300 font-medium">Detailed Feedback</span>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 text-slate-400 text-sm"
                >
                  Be the first to know when we launch!
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Ticker Sidepanels */}
      <div className="hidden lg:block fixed left-2 top-[55%] z-30 w-44">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <NewsTicker />
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="bg-slate-800/80 border border-cyan-500/30 rounded-lg p-3 cursor-pointer hover:border-cyan-500/60 transition-colors"
                onClick={() => window.location.href = "/value-journey"}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400">RECENT ACHIEVEMENTS</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { level: "L3", name: "InnovateTech", time: "3m ago" },
                    { level: "L2", name: "GrowthMaster", time: "8m ago" },
                    { level: "L1", name: "StartupPro", time: "15m ago" },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-700/50 last:border-0">
                      <span className="text-slate-300">{entry.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-cyan-400 font-semibold">{entry.level}</span>
                        <span className="text-slate-500">{entry.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-52">
              <p>Progress through 9 levels from L0 (Spark) to L8 (Masters/Jedi). Click to start your journey!</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>
      
      <div className="hidden lg:block fixed right-2 top-[55%] z-30 w-44">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="bg-slate-800/80 border border-amber-500/30 rounded-lg p-3 cursor-pointer hover:border-amber-500/60 transition-colors"
                onClick={() => window.location.href = "/value-journey"}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">TOP PERFORMERS</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { rank: 1, name: "StarFounder", alicorns: 145.80 },
                    { rank: 2, name: "VisionaryVC", alicorns: 128.45 },
                    { rank: 3, name: "TechPioneer", alicorns: 112.20 },
                  ].map((entry) => (
                    <div key={entry.rank} className="flex items-center justify-between py-1 border-b border-slate-700/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : 'text-amber-700'}`}>
                          #{entry.rank}
                        </span>
                        <span className="text-slate-300">{entry.name}</span>
                      </div>
                      <span className="text-violet-400 font-semibold">🦄 {entry.alicorns.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full mt-2 text-xs text-amber-400 hover:text-amber-300"
                >
                  View Full Leaderboard →
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-52">
              <p>Collect Alicorns (🦄) to climb the leaderboard! 100 Gleams = 1 Alicorn. Click to compete!</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>

      {/* Floating Sign In Button - positioned above the promo band */}
      <button 
        onClick={() => {
          const width = 500;
          const height = 600;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;
          const popup = window.open(
            '/api/login',
            'auth-popup',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
          );
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              window.location.reload();
            }
          }, 500);
        }}
        className="fixed right-4 bottom-[70px] z-50 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-violet-500/30 transition-colors cursor-pointer"
        data-testid="link-sign-in"
      >
        Sign In / Login
      </button>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container mx-auto px-4 lg:px-56 text-center text-slate-500 text-sm">
          <p>Powered by i2u.ai - Ideas to Unicorns through AI</p>
        </div>
      </footer>
    </div>
  );
}