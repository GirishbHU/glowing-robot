import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import { 
  Rocket, RefreshCw, ArrowRight, Share2, Trophy, 
  Copy, MessageCircle, TrendingUp, Star,
  BarChart2, Minimize2, Maximize2, GripHorizontal, X, Sparkles, Settings,
  Home, ArrowLeft, Coffee, LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssessmentContextSafe } from "@/contexts/AssessmentContext";
import EnhancedShareModal from "@/components/ValueJourney/EnhancedShareModal";
import SettingsModal from "@/components/SettingsModal";

const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

const gleamsToAlicorns = (gleams: number): string => {
  const alicorns = Math.round((gleams / 100) * 100) / 100;
  return alicorns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const hasProgressedBeyondL0 = (level: string): boolean => {
  return Boolean(level && level !== "L0");
};

type LayoutMode = 'horizontal' | 'vertical' | 'compact';

const getSmartPosition = () => {
  const positions = [
    { x: 0, y: 0, corner: 'left-bottom' },
    { x: 0, y: -100, corner: 'left-higher' },
    { x: 50, y: -50, corner: 'left-offset' },
  ];
  const saved = localStorage.getItem('floater_position');
  if (saved) return JSON.parse(saved);
  return positions[0];
};

export default function FloatingActionBar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const context = useAssessmentContextSafe();
  
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showUpdatesPanel, setShowUpdatesPanel] = useState(false);
  const [showEnhancedShareModal, setShowEnhancedShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevGleams, setPrevGleams] = useState(0);
  const [hasNewLeaderboardPosition, setHasNewLeaderboardPosition] = useState(false);
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const [initialPosition] = useState(getSmartPosition);
  
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      if (width < 500) {
        setLayoutMode('compact');
      } else if (width < 768) {
        setLayoutMode('vertical');
      } else {
        setLayoutMode('horizontal');
      }
    };
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);
  
  const hasSeenTutorial = localStorage.getItem('floater_tutorial_seen') === 'true';
  
  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowTutorial(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  useEffect(() => {
    if (showTutorial) {
      const steps = [0, 1, 2, 3];
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps.length) {
          setShowTutorial(false);
          localStorage.setItem('floater_tutorial_seen', 'true');
          clearInterval(interval);
        } else {
          setTutorialStep(currentStep);
        }
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [showTutorial]);
  
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimer) clearTimeout(idleTimer);
      const timer = setTimeout(() => setIsIdle(true), 8000);
      setIdleTimer(timer);
    };
    
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    
    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [idleTimer]);
  
  const tutorialMessages = [
    { icon: "👆", text: "Drag me anywhere!", action: "drag" },
    { icon: "📌", text: "Click grip to minimize", action: "minimize" },
    { icon: "❌", text: "Click X to hide me", action: "hide" },
    { icon: "✨", text: "Now explore!", action: "done" },
  ];
  
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  
  if (isInIframe) {
    return null;
  }
  
  const mockUpdates = [
    { name: "Cosmic Pioneer", action: "completed L2", alicorns: 12.45, time: "2m ago" },
    { name: "Epic Unicorn", action: "earned 500 Gleams", alicorns: 8.20, time: "5m ago" },
    { name: "Brilliant Dragon", action: "reached #3 on leaderboard", alicorns: 45.80, time: "8m ago" },
    { name: "Dynamic Titan", action: "completed L1", alicorns: 5.40, time: "12m ago" },
    { name: "Fierce Voyager", action: "earned 1000 Gleams", alicorns: 15.60, time: "15m ago" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUpdateIndex((prev) => (prev + 1) % mockUpdates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalGleams = context?.totalGleams ?? 0;
  const currentLevel = context?.currentLevel ?? "L0";
  const assessmentProgress = context?.assessmentProgress ?? 0;
  const hasCompletedAssessment = context?.hasCompletedAssessment ?? false;
  const hasNewResults = context?.hasNewResults ?? false;
  const leaderboardPosition = context?.leaderboardPosition ?? null;
  const isInAssessment = context?.isInAssessment ?? false;

  const isOnValueJourney = location === "/value-journey";

  useEffect(() => {
    if (isInAssessment) {
      setIsCollapsed(true);
    }
  }, [isInAssessment]);

  useEffect(() => {
    if (totalGleams > prevGleams && prevGleams > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevGleams(totalGleams);
  }, [totalGleams, prevGleams]);

  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}/value-journey`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Copied!", description: "Share link copied to clipboard" });
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const shareOnX = () => {
    const text = `I'm on the Value Journey Quest earning Gleams & Alicorns! Can you beat my score?`;
    const url = `${window.location.origin}/value-journey`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
  };

  const shareOnLinkedIn = () => {
    const url = `${window.location.origin}/value-journey`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
  };

  const shareOnWhatsApp = () => {
    const text = `Check out the Value Journey Quest! I'm earning Gleams and climbing the leaderboard. Join me: ${window.location.origin}/value-journey`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleStartAssessment = () => {
    if (isOnValueJourney && context) {
      context.setTriggerStartAssessment(true);
    } else {
      setLocation("/value-journey");
    }
  };

  const handleViewResults = () => {
    if (isOnValueJourney && context) {
      context.setShowResultsPopup(true);
    } else {
      setLocation("/value-journey");
    }
  };

  const handleViewLeaderboard = () => {
    if (context) {
      context.setShowLeaderboard(true);
    }
    if (!isOnValueJourney) {
      setLocation("/value-journey");
    }
  };

  const handleShare = () => {
    setShowEnhancedShareModal(true);
  };

  const handleHome = () => {
    if (context) {
      context.setTriggerHome?.(true);
    }
    setLocation("/value-journey");
  };

  const handleBack = () => {
    if (context?.setTriggerBack) {
      context.setTriggerBack(true);
    }
  };

  const handlePauseBreak = () => {
    if (context?.setShowPauseModal) {
      context.setShowPauseModal(true);
    }
  };

  const handleExit = () => {
    if (context?.setShowExitModal) {
      context.setShowExitModal(true);
    }
  };

  const getAssessmentButtonText = () => {
    if (isOnValueJourney) {
      if (hasCompletedAssessment) return "New Assessment";
      if (assessmentProgress > 0) return "Continue";
      return "Start Quest";
    }
    return "Take Quest";
  };

  const getAssessmentButtonIcon = () => {
    if (hasCompletedAssessment) return <RefreshCw className="mr-1.5 h-4 w-4" />;
    if (assessmentProgress > 0) return <ArrowRight className="mr-1.5 h-4 w-4" />;
    return <Rocket className="mr-1.5 h-4 w-4" />;
  };

  return (
    <>
      <AnimatePresence>
        {!isHidden && (
          <motion.div
            drag
            dragConstraints={{ left: -500, right: 500, top: -400, bottom: 150 }}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ x: initialPosition.x, y: 100 + initialPosition.y, opacity: 0 }}
            animate={{ 
              x: initialPosition.x,
              y: initialPosition.y, 
              opacity: 1,
              scale: isIdle && !isCollapsed ? [1, 1.02, 1] : 1
            }}
            exit={{ y: 100, opacity: 0 }}
            transition={isIdle ? { 
              scale: { duration: 3, repeat: Infinity },
              default: { delay: 0.5, type: "spring", stiffness: 200, damping: 25 }
            } : { delay: 0.5, type: "spring", stiffness: 200, damping: 25 }}
            style={{
              boxShadow: isIdle && !isCollapsed ? "0 0 25px rgba(139,92,246,0.4)" : "none"
            }}
            className="fixed bottom-[160px] left-6 z-50 cursor-grab active:cursor-grabbing"
            whileDrag={{ scale: 1.02 }}
            onDragEnd={(_, info) => {
              const newPos = { x: initialPosition.x + info.offset.x, y: initialPosition.y + info.offset.y };
              localStorage.setItem('floater_position', JSON.stringify(newPos));
            }}
          >
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: -70, scale: 1 }}
              exit={{ opacity: 0, y: -80, scale: 0.9 }}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <motion.div 
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-violet-500/40 whitespace-nowrap"
                animate={tutorialStep === 0 ? { x: [-10, 10, -10] } : tutorialStep === 1 ? { scale: [1, 0.9, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    {tutorialMessages[tutorialStep]?.icon}
                  </motion.span>
                  <span className="font-semibold">{tutorialMessages[tutorialStep]?.text}</span>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  {tutorialMessages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all ${i === tutorialStep ? 'bg-white' : 'bg-white/30'}`} 
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: -60 }}
              exit={{ scale: 0, opacity: 0, y: -80 }}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold shadow-lg shadow-yellow-500/40">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  ✨
                </motion.span>
                +{totalGleams - prevGleams} Gleams!
                <motion.span
                  animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  ✨
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSharePanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-violet-500/40 shadow-2xl shadow-violet-500/20"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-violet-400 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share, Invite, Challenge
                </h4>
                <button 
                  onClick={() => setShowSharePanel(false)}
                  className="text-slate-400 hover:text-white text-lg"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <Button size="sm" variant="ghost" onClick={shareOnX} className="p-2 h-auto flex flex-col gap-1 hover:bg-blue-500/20">
                  <span className="text-blue-400 text-lg font-bold">𝕏</span>
                  <span className="text-[10px] text-slate-400">Post</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={shareOnLinkedIn} className="p-2 h-auto flex flex-col gap-1 hover:bg-blue-600/20">
                  <span className="text-blue-500 text-lg font-bold">in</span>
                  <span className="text-[10px] text-slate-400">Share</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={shareOnWhatsApp} className="p-2 h-auto flex flex-col gap-1 hover:bg-green-500/20">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                  <span className="text-[10px] text-slate-400">Send</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={copyShareLink} className="p-2 h-auto flex flex-col gap-1 hover:bg-slate-500/20">
                  <Copy className="h-5 w-5 text-slate-400" />
                  <span className="text-[10px] text-slate-400">Copy</span>
                </Button>
              </div>
              <div className="text-xs text-center text-yellow-400 bg-yellow-500/10 rounded-lg py-2">
                🎁 Earn +100 Gleams per referral!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showUpdatesPanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-green-500/40 shadow-2xl shadow-green-500/20"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Live Updates
                </h4>
                <button 
                  onClick={() => setShowUpdatesPanel(false)}
                  className="text-slate-400 hover:text-white text-lg"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mockUpdates.map((update, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg ${index === currentUpdateIndex ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-800/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-semibold text-sm">{update.name}</span>
                      <span className="text-xs text-slate-500">{update.time}</span>
                    </div>
                    <span className="text-slate-300 text-sm">{update.action}</span>
                    <div className="flex items-center gap-1 mt-1 text-xs text-violet-400">
                      <span>🦄 {update.alicorns.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="text-xs text-center text-slate-500 mt-3">
                Illustration purposes only
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout
          className={`
            ${layoutMode === 'vertical' ? 'flex flex-col items-center gap-2 px-3 py-4 rounded-2xl' : 
              layoutMode === 'compact' ? 'flex flex-wrap justify-center items-center gap-2 px-3 py-3 rounded-2xl max-w-[280px]' :
              'flex items-center gap-2 px-5 py-3 rounded-full'}
            bg-transparent
            border border-violet-500
            ${showCelebration ? 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-transparent' : ''}
          `}
        >
          {!isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-slate-400 hover:text-violet-400 transition-colors cursor-grab active:cursor-grabbing">
                  <GripHorizontal className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Drag to reposition</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Navigation Buttons */}
          {!isCollapsed && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="rounded-full bg-slate-700 text-white hover:bg-slate-600 p-2.5"
                      onClick={handleHome}
                      data-testid="button-fab-home"
                    >
                      <Home className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Go Home</p>
                </TooltipContent>
              </Tooltip>

              {isInAssessment && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="rounded-full bg-slate-700 text-white hover:bg-slate-600 p-2.5"
                          onClick={handleBack}
                          data-testid="button-fab-back"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Go Back</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="rounded-full bg-amber-600 text-white hover:bg-amber-500 px-3 py-2"
                          onClick={handlePauseBreak}
                          data-testid="button-fab-pause"
                        >
                          <Coffee className="mr-1 h-3.5 w-3.5" />
                          <span className="text-xs">Break</span>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Take a break - your progress is saved</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="rounded-full bg-red-600/80 text-white hover:bg-red-500 p-2.5"
                          onClick={handleExit}
                          data-testid="button-fab-exit"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Exit assessment</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {layoutMode === 'horizontal' && <div className="w-px h-6 bg-slate-700/50" />}
            </>
          )}

          {!isCollapsed && totalGleams > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewResults}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full cursor-pointer transition-all text-sm ${
                    hasProgressedBeyondL0(currentLevel) 
                      ? 'bg-violet-600 text-white hover:bg-violet-500' 
                      : 'bg-yellow-600 text-white hover:bg-yellow-500'
                  }`}
                  data-testid="button-fab-scores"
                >
                  <motion.span 
                    className="text-lg"
                    animate={showCelebration ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {hasProgressedBeyondL0(currentLevel) ? ALICORN_SYMBOL : GLEAM_SYMBOL}
                  </motion.span>
                  <span className="font-bold tabular-nums">
                    {hasProgressedBeyondL0(currentLevel) ? gleamsToAlicorns(totalGleams) : totalGleams.toLocaleString()}
                  </span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64">
                <p>Your earned {hasProgressedBeyondL0(currentLevel) ? 'Alicorns' : 'Gleams'}! Click to view your detailed results and assessment profile.</p>
              </TooltipContent>
            </Tooltip>
          )}

          {!isCollapsed && assessmentProgress > 0 && assessmentProgress < 100 && (
            <div className="flex items-center gap-2 px-3">
              <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${assessmentProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-slate-400 tabular-nums">{Math.round(assessmentProgress)}%</span>
            </div>
          )}

          {!isCollapsed && layoutMode === 'horizontal' && (
            <div className="w-px h-6 bg-slate-700/50" />
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-500/25 font-semibold text-sm px-5 py-3"
                  onClick={handleStartAssessment}
                  data-testid="button-fab-assessment"
                >
                  {isCollapsed ? (
                    <Rocket className="h-4 w-4" />
                  ) : (
                    <>
                      {getAssessmentButtonIcon()}
                      {getAssessmentButtonText()}
                    </>
                  )}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-64">
              <p>{hasCompletedAssessment ? 'Start a new assessment at a different level' : assessmentProgress > 0 ? 'Continue your assessment from where you left off' : 'Begin your Value Journey Quest to earn Gleams and Alicorns!'}</p>
            </TooltipContent>
          </Tooltip>

          {!isCollapsed && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="relative"
                  >
                    <Button
                      size="sm"
                      className="rounded-full bg-cyan-600 text-white hover:bg-cyan-500 px-4 py-2.5 text-xs"
                      onClick={handleShare}
                      data-testid="button-fab-share"
                    >
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      Share
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  <p>Share your progress on social media, invite friends to compete, or challenge others to beat your score!</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Button
                      size="sm"
                      className="rounded-full bg-slate-600 text-white hover:bg-slate-500 p-2.5"
                      onClick={() => setShowSettingsModal(true)}
                      data-testid="button-fab-settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  <p>Customize your display name settings - choose real name, display name, or anonymous for different contexts</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Button
                      size="sm"
                      className="rounded-full bg-amber-600 text-white hover:bg-amber-500 px-4 py-2.5 text-xs"
                      onClick={handleViewResults}
                      data-testid="button-fab-results"
                    >
                      <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
                      {hasCompletedAssessment ? (
                        <span className="flex items-center gap-1.5">
                          {hasProgressedBeyondL0(currentLevel) ? ALICORN_SYMBOL : GLEAM_SYMBOL}
                          <span className="tabular-nums">
                            {hasProgressedBeyondL0(currentLevel) ? gleamsToAlicorns(totalGleams) : totalGleams.toLocaleString()}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          {ALICORN_SYMBOL}
                          <span className="tabular-nums">3.45</span>
                          <span className="text-[10px] opacity-70">(Illustration)</span>
                        </span>
                      )}
                    </Button>
                    {hasNewResults && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"
                      />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  <p>{hasCompletedAssessment 
                    ? 'View your detailed assessment results, scores breakdown, and performance profile chart.' 
                    : 'Take the Value Journey Quest to earn real Gleams and Alicorns! Start your assessment to see your actual score here.'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="relative"
                  >
                    <Button
                      size="sm"
                      className="rounded-full bg-green-600 text-white hover:bg-green-500 px-4 py-2.5 text-xs"
                      onClick={() => setShowUpdatesPanel(!showUpdatesPanel)}
                      data-testid="button-fab-updates"
                    >
                      <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                      Updates
                    </Button>
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-slate-900"
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  <p>Live activity feed showing recent achievements from the community - completions, Gleams earned, and leaderboard moves!</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-1 p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                data-testid="button-fab-collapse"
              >
                {isCollapsed ? (
                  <Maximize2 className="h-3.5 w-3.5" />
                ) : (
                  <Minimize2 className="h-3.5 w-3.5" />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isCollapsed ? 'Expand bar' : 'Minimize bar'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsHidden(true)}
                className="ml-1 p-2 rounded-full bg-slate-700/80 text-slate-400 hover:bg-red-600 hover:text-white transition-colors"
                data-testid="button-fab-hide"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Hide floating bar</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore button when hidden - positioned at same level as floating bar */}
      <AnimatePresence>
        {isHidden && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-[160px] left-6 z-50"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsHidden(false)}
                  className="p-3 rounded-full bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/30 transition-colors"
                  data-testid="button-fab-restore"
                >
                  <Sparkles className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Show Quest bar</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Share Modal */}
      <EnhancedShareModal
        isOpen={showEnhancedShareModal}
        onClose={() => setShowEnhancedShareModal(false)}
        totalGleams={totalGleams}
        currentLevel={currentLevel}
        stakeholder="founder"
      />
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}
