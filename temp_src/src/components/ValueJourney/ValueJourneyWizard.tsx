import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { ResizableModal } from "@/components/ui/resizable-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  STAKEHOLDERS, 
  LEVELS, 
  LEVEL_THEMES,
  getQuestionsForLevel,
  calculateLevelScore,
  calculateGleams,
  calculateAlicorns,
  StakeholderType,
  getLevelDisplayName
} from "@/lib/valueJourneyTypes";
import { 
  Rocket, Target, ChevronRight, ChevronLeft, 
  Sparkles, Trophy, Flame, ArrowRight, Play, Check,
  Scale, MessageSquare, ChevronDown, ChevronUp, Share2, Star,
  Copy, Mail, MessageCircle, UserPlus, Loader2, RefreshCw, Globe, Building, Users, TrendingUp, LogIn, LogOut, BarChart2, Home, ArrowLeft, Clock, Pause, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleRadarChart } from "@/components/ui/simple-radar-chart";
import { useToast } from "@/hooks/use-toast";
import Confetti from "react-confetti";
import { Textarea } from "@/components/ui/textarea";
import answerKeys from "@/lib/answerKeys.json";
import { useAuth } from "@/hooks/use-auth";
import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { useLocation } from "wouter";
import EnhancedShareModal from "./EnhancedShareModal";
import { UserProgressPanel, PauseBreakModal, BreakCountdown } from "./UserProgressPanel";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import HintTooltip, { InlineHint, LearningTip, QuickHint } from "@/components/HintTooltip";
import type { PauseState, UserIdea, IdeaRole } from "@shared/schema";
import { UnicornCoach } from "@/components/UnicornCoach";
import { StakeholderLeaderboard } from "@/components/StakeholderLeaderboard";
import { AssessmentExitModal, type PauseOptions } from "./AssessmentExitModal";
import { ContextSwitcher } from "./ContextSwitcher";
import { IdentityBar } from "./IdentityBar";

type WizardStep = "welcome" | "stakeholder" | "stakeholder_confirm" | "current_level" | "aspirational_level" | "assessment" | "results";

// A-E option labels and colors
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
const OPTION_COLORS = [
  { color: "bg-blue-500", borderColor: "border-blue-500" },
  { color: "bg-cyan-500", borderColor: "border-cyan-500" },
  { color: "bg-teal-500", borderColor: "border-teal-500" },
  { color: "bg-emerald-500", borderColor: "border-emerald-500" },
  { color: "bg-violet-500", borderColor: "border-violet-500" },
];

// Fisher-Yates shuffle with seed based on question code for consistency
const shuffleWithSeed = (array: number[], seed: string): number[] => {
  const result = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  for (let i = result.length - 1; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    const j = hash % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Fallback descriptions when CSV data is missing
const FALLBACK_GRADES: Record<number, string> = {
  1: "Not at all confident",
  2: "Slightly confident",
  3: "Moderately confident",
  4: "Mostly confident",
  5: "Extremely confident"
};

// Get jumbled grade options for a specific question
const getJumbledOptions = (level: string, questionCode: string, stakeholder: string) => {
  const levelData = (answerKeys as any)[level];
  const grades = levelData?.questions?.[questionCode]?.stakeholders?.[stakeholder]?.grades;
  
  // Create array of grade values [1,2,3,4,5] and shuffle with consistent seed
  const gradeValues = [1, 2, 3, 4, 5];
  const seed = `${level}_${questionCode}_${stakeholder}`;
  const shuffledGrades = shuffleWithSeed(gradeValues, seed);
  
  // Return options with A-E labels mapped to shuffled grades
  // Use CSV data if available, fallback to generic descriptions otherwise
  return shuffledGrades.map((gradeValue, index) => ({
    label: OPTION_LABELS[index],
    actualGrade: gradeValue,
    description: grades?.[gradeValue] || FALLBACK_GRADES[gradeValue],
    ...OPTION_COLORS[index]
  }));
};

interface AssessmentState {
  stakeholder: StakeholderType | null;
  currentLevel: string;
  aspirationalLevel: string;
  isAspirational: boolean;
  assessingEarlierLevel: string | null;
  answers: Record<string, Record<string, number>>;
  currentQuestionIndex: number;
  streak: number;
  lastAnswerTime: number | null;
  currentCompleted: boolean;
  aspirationalCompleted: boolean;
  startTime: number | null;
}

// Scoring symbols
const GLEAM_SYMBOL = "Ğ"; // G with vertical cross for Gleams
const ALICORN_SYMBOL = "🦄"; // Unicorn horn for Alicorns

// Helper to format gleams with comma separators
const formatGleams = (gleams: number) => gleams.toLocaleString();

// Helper to convert Gleams to Alicorns (100 Gleams = 1 Alicorn) - returns number
const gleamsToAlicornsNum = (gleams: number): number => Math.round((gleams / 100) * 100) / 100;

// Helper to format Alicorns for display (100 Gleams = 1 Alicorn) - returns formatted string with commas
const gleamsToAlicorns = (gleams: number): string => {
  const alicorns = gleamsToAlicornsNum(gleams);
  return alicorns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
};

// Growth Milestone Badges
interface MilestoneBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradient: string;
  shareMessage: string;
  requirement: string;
}

const MILESTONE_BADGES: MilestoneBadge[] = [
  {
    id: "first_spark",
    name: "First Spark",
    icon: "✨",
    description: "Completed your first L0 assessment",
    gradient: "from-yellow-500 to-amber-500",
    shareMessage: "I just earned my First Spark badge on Value Journey Quest! 🔥 Starting my journey to unicorn status!",
    requirement: "Complete L0 current assessment"
  },
  {
    id: "dual_vision",
    name: "Dual Vision",
    icon: "👁️",
    description: "Completed both current and aspirational assessments",
    gradient: "from-violet-500 to-purple-500",
    shareMessage: "I've unlocked Dual Vision! 👁️ Assessed where I am AND where I want to be on Value Journey Quest!",
    requirement: "Complete both current & aspirational"
  },
  {
    id: "level_up",
    name: "Level Up Hero",
    icon: "🚀",
    description: "Progressed beyond Spark to higher levels",
    gradient: "from-cyan-500 to-blue-500",
    shareMessage: "I'm a Level Up Hero! 🚀 Moving beyond L0 Spark on Value Journey Quest!",
    requirement: "Progress to L1 or higher"
  },
  {
    id: "gleam_hunter",
    name: "Gleam Hunter",
    icon: "💎",
    description: "Earned 500+ Gleams in total",
    gradient: "from-emerald-500 to-teal-500",
    shareMessage: "I'm a Gleam Hunter! 💎 Earned 500+ Gleams on Value Journey Quest! Can you beat me?",
    requirement: "Earn 500+ total Gleams"
  },
  {
    id: "alicorn_rider",
    name: "Alicorn Rider",
    icon: "🦄",
    description: "Earned 10+ Alicorns in total",
    gradient: "from-pink-500 to-rose-500",
    shareMessage: "I'm an Alicorn Rider! 🦄 Earned 10+ Alicorns on Value Journey Quest! Join the herd!",
    requirement: "Earn 10+ total Alicorns"
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    icon: "⚡",
    description: "Completed assessment in under 5 minutes",
    gradient: "from-orange-500 to-red-500",
    shareMessage: "I'm a Speed Demon! ⚡ Blazed through my assessment in under 5 minutes!",
    requirement: "Complete in under 5 minutes"
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    icon: "🎯",
    description: "Achieved 90%+ average score",
    gradient: "from-indigo-500 to-blue-500",
    shareMessage: "I'm a Perfectionist! 🎯 Achieved 90%+ score on Value Journey Quest!",
    requirement: "Average score 90%+"
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    icon: "🦋",
    description: "Shared your results on social media",
    gradient: "from-fuchsia-500 to-pink-500",
    shareMessage: "I'm a Social Butterfly! 🦋 Spreading the Value Journey Quest word! Join me!",
    requirement: "Share on social media"
  },
  {
    id: "trailblazer",
    name: "Trailblazer",
    icon: "🏆",
    description: "Reached the leaderboard top 10",
    gradient: "from-amber-500 to-yellow-500",
    shareMessage: "I'm a Trailblazer! 🏆 Made it to the Top 10 on the Value Journey Quest leaderboard!",
    requirement: "Reach leaderboard top 10"
  }
];

// Helper to format score based on level - L0 shows Gleams, L1+ shows Alicorns
const formatScoreForLevel = (gleams: number, level: string) => {
  if (level === "L0") {
    return { value: formatGleams(gleams), symbol: GLEAM_SYMBOL, unit: "Gleams" };
  }
  return { value: gleamsToAlicorns(gleams), symbol: ALICORN_SYMBOL, unit: "Alicorns" };
};

// Check if user has progressed beyond L0
const hasProgressedBeyondL0 = (currentLevel: string) => currentLevel !== "L0";

// Format leaderboard entry score as Alicorns
// The leaderboard stores scores as Gleams directly, so we just convert to Alicorns
const formatLeaderboardScore = (score: number): string => {
  return gleamsToAlicorns(score);
};

// Running Alicorn Counter - counts into trillions continuously
function RunningAlicornCounter() {
  const [count, setCount] = useState(1_847_293_456_781);
  const [displayCount, setDisplayCount] = useState("1,847,293,456,781");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const increment = Math.floor(Math.random() * 9_999_999) + 1_000_000;
        const newCount = prev + increment;
        return newCount;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    setDisplayCount(count.toLocaleString());
  }, [count]);
  
  return (
    <motion.div
      className="text-center py-3 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl border border-violet-500/30"
      animate={{ 
        boxShadow: [
          "0 0 0 rgba(139, 92, 246, 0)",
          "0 0 30px rgba(139, 92, 246, 0.4)",
          "0 0 0 rgba(139, 92, 246, 0)"
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.div 
        className="text-4xl mb-1"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        🦄
      </motion.div>
      <motion.div 
        className="text-xl md:text-2xl font-bold font-mono text-violet-300 tracking-tight"
        key={displayCount}
        initial={{ scale: 1.02 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.05 }}
      >
        {displayCount}
      </motion.div>
      <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-green-500"
        />
        Global Alicorns Running
      </div>
    </motion.div>
  );
}

// Rotating Stats Component for Live Stats Carousel
function RotatingStats() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const stats = [
    { value: "124,700", label: "Gleams Awarded Today", icon: "✨", color: "text-yellow-400" },
    { value: "89", label: "Assessments Completed", icon: "📊", color: "text-cyan-400" },
    { value: "4.9", label: "Average Rating", icon: "⭐", color: "text-amber-400" },
    { value: "12", label: "Countries Represented", icon: "🌍", color: "text-green-400" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const currentStat = stats[currentIndex];
  
  return (
    <div className="space-y-3">
      <RunningAlicornCounter />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center py-2"
        >
          <div className="text-3xl mb-1">{currentStat.icon}</div>
          <div className={`text-2xl font-bold ${currentStat.color}`}>{currentStat.value}</div>
          <div className="text-xs text-slate-400">{currentStat.label}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Rotating Tips Component
function RotatingTips() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tips = [
    "Answer honestly - there's no wrong answer, only insights!",
    "Higher scores unlock more Alicorns and Gleams",
    "Complete both levels for maximum rewards",
    "Share your results to earn bonus Gleams",
    "Daily challenges give 500 extra Gleams",
    "Top leaderboard positions win exclusive prizes",
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={currentIndex}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="text-sm text-slate-300"
      >
        {tips[currentIndex]}
      </motion.p>
    </AnimatePresence>
  );
}

export default function ValueJourneyWizard() {
  const [step, setStep] = useState<WizardStep>("welcome");
  const [state, setState] = useState<AssessmentState>({
    stakeholder: null,
    currentLevel: "L0",
    aspirationalLevel: "L1",
    isAspirational: false,
    assessingEarlierLevel: null,
    answers: {},
    currentQuestionIndex: 0,
    streak: 0,
    lastAnswerTime: null,
    currentCompleted: false,
    aspirationalCompleted: false,
    startTime: null,
  });
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [totalGleams, setTotalGleams] = useState(0);
  // Derive totalAlicorns from totalGleams (100 Gleams = 1 Alicorn)
  const totalAlicorns = totalGleams / 100;
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [reviewMode, setReviewMode] = useState<"current" | "aspirational">("current");
  const [contestingQuestion, setContestingQuestion] = useState<string | null>(null);
  const [contestRationale, setContestRationale] = useState("");
  const [contestNewScore, setContestNewScore] = useState<number | null>(null);
  
  // Registration state - now synced with Replit Auth
  const [showRegistration, setShowRegistration] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null); // User's OWN referral code
  const [referrerCode, setReferrerCode] = useState<string | null>(null); // Who referred this user
  
  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<any[]>([]);
  const [displayType, setDisplayType] = useState<'real' | 'fancy' | 'anonymous'>('fancy');
  const [fancyName, setFancyName] = useState("");
  
  // Floating share panel state
  const [showFloatingSharePanel, setShowFloatingSharePanel] = useState(false);
  const [pendingSharePanelOpen, setPendingSharePanelOpen] = useState(false);
  
  // Enhanced share modal state
  const [showEnhancedShareModal, setShowEnhancedShareModal] = useState(false);
  
  // Hint state for answer cards
  const [showClickHint, setShowClickHint] = useState(false);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  
  // Results popup state
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  
  // Timestamp and completion info
  const [completionTimestamp, setCompletionTimestamp] = useState<string | null>(null);
  const [userIp, setUserIp] = useState<string | null>(null);
  
  // Pause/break mechanism state
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [currentPauseState, setCurrentPauseState] = useState<PauseState | null>(null);
  const [showBreakCountdown, setShowBreakCountdown] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [hasExistingProgress, setHasExistingProgress] = useState(false);
  
  // Multi-idea and multi-role state
  const [showExitModal, setShowExitModal] = useState(false);
  const [showContextSwitcher, setShowContextSwitcher] = useState(false);
  const [userIdeas, setUserIdeas] = useState<UserIdea[]>([]);
  const [userRoles, setUserRoles] = useState<IdeaRole[]>([]);
  const [currentIdeaId, setCurrentIdeaId] = useState<number | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [currentIdeaName, setCurrentIdeaName] = useState<string | undefined>(undefined);
  
  // Identity bar state - user's chosen names
  const [userFancyName, setUserFancyName] = useState<string | undefined>(undefined);
  const [userRealName, setUserRealName] = useState<string | undefined>(undefined);
  
  // Drill-down popup states
  const [showRankDrilldown, setShowRankDrilldown] = useState(false);
  const [showScoreDrilldown, setShowScoreDrilldown] = useState(false);
  const [showCurrentChartDrilldown, setShowCurrentChartDrilldown] = useState(false);
  const [showAspirationalChartDrilldown, setShowAspirationalChartDrilldown] = useState(false);
  const [showGapDrilldown, setShowGapDrilldown] = useState(false);
  const [showStartAspirationalModal, setShowStartAspirationalModal] = useState(false);
  const [showAspirationalLevelPicker, setShowAspirationalLevelPicker] = useState(false);
  
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const assessmentContext = useAssessmentContext();
  
  // Derive isRegistered from authentication state
  const isRegistered = isAuthenticated;
  
  // Sync context with local state for global floating action bar
  useEffect(() => {
    assessmentContext.setTotalGleams(totalGleams);
    assessmentContext.setCurrentLevel(state.currentLevel);
    assessmentContext.setHasCompletedAssessment(state.currentCompleted || state.aspirationalCompleted);
  }, [totalGleams, state.currentLevel, state.currentCompleted, state.aspirationalCompleted]);
  
  // Calculate and sync assessment progress
  useEffect(() => {
    if (step === "assessment") {
      const level = state.assessingEarlierLevel || (state.isAspirational ? state.aspirationalLevel : state.currentLevel);
      const levelQuestions = getQuestionsForLevel(level);
      const questionCodes = levelQuestions ? Object.keys(levelQuestions) : [];
      const answeredCount = Object.keys(state.answers[level] || {}).length;
      const progress = questionCodes.length > 0 ? (answeredCount / questionCodes.length) * 100 : 0;
      assessmentContext.setAssessmentProgress(progress);
      assessmentContext.setIsInAssessment(true);
    } else {
      assessmentContext.setAssessmentProgress(0);
      assessmentContext.setIsInAssessment(false);
    }
  }, [step, state.answers, state.currentLevel, state.aspirationalLevel, state.isAspirational, state.assessingEarlierLevel]);
  
  // Listen for triggers from global floating action bar
  useEffect(() => {
    if (assessmentContext.triggerStartAssessment) {
      assessmentContext.setTriggerStartAssessment(false);
      if (state.currentCompleted || state.aspirationalCompleted) {
        // User completed assessment - go to level selection (keep stakeholder)
        setStep("current_level");
      } else if (!state.stakeholder) {
        // New user - need to select stakeholder first
        setStep("stakeholder");
      } else {
        // Has stakeholder, continue/start assessment
        setStep("assessment");
      }
    }
  }, [assessmentContext.triggerStartAssessment]);
  
  // Sync leaderboard visibility with context
  useEffect(() => {
    if (assessmentContext.showLeaderboard && !showLeaderboard) {
      setShowLeaderboard(true);
      assessmentContext.setShowLeaderboard(false);
    }
  }, [assessmentContext.showLeaderboard]);
  
  // Sync results popup visibility with context
  useEffect(() => {
    if (assessmentContext.showResultsPopup && !showResultsPopup) {
      setShowResultsPopup(true);
      assessmentContext.setShowResultsPopup(false);
    }
  }, [assessmentContext.showResultsPopup]);

  // Listen for home trigger from floating action bar
  useEffect(() => {
    if (assessmentContext.triggerHome) {
      assessmentContext.setTriggerHome(false);
      setStep("welcome");
    }
  }, [assessmentContext.triggerHome]);

  // Listen for back trigger from floating action bar
  useEffect(() => {
    if (assessmentContext.triggerBack) {
      assessmentContext.setTriggerBack(false);
      if (step === "stakeholder") setStep("welcome");
      else if (step === "stakeholder_confirm") setStep("stakeholder");
      else if (step === "current_level") setStep("stakeholder_confirm");
      else if (step === "aspirational_level") setStep("current_level");
      else if (step === "assessment") setStep(state.isAspirational ? "aspirational_level" : "current_level");
      else if (step === "results") setStep("assessment");
    }
  }, [assessmentContext.triggerBack, step, state.isAspirational]);

  // Listen for pause modal trigger from floating action bar
  useEffect(() => {
    if (assessmentContext.showPauseModal) {
      assessmentContext.setShowPauseModal(false);
      setShowPauseModal(true);
    }
  }, [assessmentContext.showPauseModal]);

  // Listen for exit modal trigger from floating action bar
  useEffect(() => {
    if (assessmentContext.showExitModal) {
      assessmentContext.setShowExitModal(false);
      setShowExitModal(true);
    }
  }, [assessmentContext.showExitModal]);
  
  // Generate referral code from user ID when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const userRefCode = `i2u_${user.id.slice(0, 8)}`;
      setReferralCode(userRefCode);
      localStorage.setItem('i2uReferralCode', userRefCode);
    }
  }, [isAuthenticated, user?.id]);
  
  // Fetch user IP on mount
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Unknown'));
  }, []);
  
  // Auto-show registration prompt when entering results as unregistered user
  useEffect(() => {
    if (step === "results" && !isRegistered) {
      // Delay slightly to let results render first, then show registration
      const timer = setTimeout(() => {
        if (!showRegistration) {
          setShowRegistration(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, isRegistered]); // Removed showRegistration from deps to avoid infinite loops
  
  // Handle deferred share panel opening (when registration completes outside results)
  useEffect(() => {
    if (step === "results" && pendingSharePanelOpen) {
      setShowFloatingSharePanel(true);
      setPendingSharePanelOpen(false);
    }
  }, [step, pendingSharePanelOpen]);
  
  // Load referrer code from URL (who referred this visitor)
  useEffect(() => {
    // Check URL for referrer's code
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    if (refFromUrl) {
      setReferrerCode(refFromUrl);
      localStorage.setItem('i2uReferrerCode', refFromUrl); // Persist for registration
    } else {
      // Check localStorage for previously stored referrer code
      const savedReferrer = localStorage.getItem('i2uReferrerCode');
      if (savedReferrer) {
        setReferrerCode(savedReferrer);
      }
    }
  }, []);
  
  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=10');
        const data = await response.json();
        if (data.success) {
          setLeaderboardEntries(data.entries);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, []);
  
  // Generate fancy name
  const generateFancyName = () => {
    const adjectives = ["Brilliant", "Cosmic", "Dynamic", "Epic", "Fierce", "Galactic", "Heroic", "Infinite"];
    const nouns = ["Phoenix", "Dragon", "Unicorn", "Titan", "Pioneer", "Voyager", "Champion", "Maverick"];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };
  
  // Map stakeholder to i2u.ai role
  const getI2uRole = (stakeholder: StakeholderType | null): string => {
    const roleMap: Record<string, string> = {
      "Startup": "startup",
      "Investor / VC": "investor-vc",
      "Mentor / Advisor": "mentor-advisor",
      "Accelerator": "accelerator",
      "Incubator": "incubator",
      "Service Provider": "service-provider",
      "Research / Academic": "academic",
      "Government / Policy": "government",
      "Ecosystem": "ecosystem"
    };
    return stakeholder ? roleMap[stakeholder] || "startup" : "startup";
  };
  
  // Handle registration via popup window
  const handleRegister = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      '/api/login',
      'auth-popup',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
    
    // Listen for auth completion message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'auth-complete') {
        window.removeEventListener('message', handleMessage);
        // Refresh auth state by reloading user data
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    
    // Fallback: check if popup closed and refresh
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        // Refresh to check if auth succeeded
        window.location.reload();
      }
    }, 500);
  };
  
  // Get referral URL
  const getReferralUrl = () => {
    if (referralCode) {
      return `https://global-leaderboard.i2u.ai/register?ref=${referralCode}`;
    }
    return "https://i2u.ai";
  };
  
  // Share functions with referral link
  const getSharePageUrl = () => {
    const shareData = {
      score: currentScore,
      gleams: totalGleams,
      alicorns: totalAlicorns,
      level: state.currentLevel,
      aspirational: state.aspirationalLevel,
      stakeholder: state.stakeholder,
    };
    const encoded = btoa(JSON.stringify(shareData));
    const ref = referralCode || '';
    return `${window.location.origin}/share?data=${encoded}${ref ? `&ref=${ref}` : ''}`;
  };
  
  // Get share text based on user's current level
  const getShareScoreText = () => {
    const isL0 = state.currentLevel === "L0";
    if (isL0) {
      return `${GLEAM_SYMBOL} I earned ${formatGleams(totalGleams)} Gleams`;
    }
    return `${ALICORN_SYMBOL} I earned ${gleamsToAlicorns(totalGleams)} Alicorns`;
  };
  
  const shareOnX = () => {
    const shareUrl = getSharePageUrl();
    const text = `${getShareScoreText()} on the Value Journey Quest!\n\n📍 ${getLevelDisplayName(state.currentLevel)} → ${getLevelDisplayName(state.aspirationalLevel)}\n\nCan you beat my score? Take the assessment:\n\n#StartupJourney #i2uai`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const shareOnLinkedIn = () => {
    const shareUrl = getSharePageUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const shareOnWhatsApp = () => {
    const shareUrl = getSharePageUrl();
    const text = `${getShareScoreText()} on the Value Journey Quest!\n\n📍 ${getLevelDisplayName(state.currentLevel)} → ${getLevelDisplayName(state.aspirationalLevel)}\n\nCan you beat my score? ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const shareViaEmail = () => {
    const shareUrl = getSharePageUrl();
    const isL0 = state.currentLevel === "L0";
    const subject = `${isL0 ? GLEAM_SYMBOL : ALICORN_SYMBOL} Can you beat my score on the Value Journey Quest?`;
    const scoreText = isL0 
      ? `${formatGleams(totalGleams)} ${GLEAM_SYMBOL} Gleams`
      : `${gleamsToAlicorns(totalGleams)} Alicorns (${formatGleams(totalGleams)} ${GLEAM_SYMBOL} Gleams)`;
    const body = `Hi!\n\nI just earned ${scoreText} on the Value Journey Quest!\n\n📍 Current Level: ${getLevelDisplayName(state.currentLevel)}\n🚀 Aspiration: ${getLevelDisplayName(state.aspirationalLevel)}\n\nCan you beat my score? Take the assessment here:\n${shareUrl}\n\nBest regards`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };
  
  const copyShareLink = async () => {
    const isL0 = state.currentLevel === "L0";
    const scoreText = isL0 
      ? `${GLEAM_SYMBOL} ${formatGleams(totalGleams)} Gleams`
      : `${ALICORN_SYMBOL} ${gleamsToAlicorns(totalGleams)} Alicorns\n${GLEAM_SYMBOL} ${formatGleams(totalGleams)} Gleams`;
    const text = `Value Journey Assessment\n📍 ${getLevelDisplayName(state.currentLevel)} → ${getLevelDisplayName(state.aspirationalLevel)}\n${scoreText}\n\n${getReferralUrl()}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Share link copied to clipboard" });
    } catch (error) {
      toast({ title: "Copy failed", description: "Please copy manually", variant: "destructive" });
    }
  };

  // Track if fresh start was requested (skip restoring saved progress)
  const [freshStartHandled, setFreshStartHandled] = useState(false);
  
  // Handle fresh start from URL param - clears saved progress for a new assessment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isFresh = urlParams.get('fresh') === 'true';
    
    if (isFresh) {
      // Clear saved progress for fresh start
      localStorage.removeItem('valueJourneyProgress');
      
      // Clean up URL without triggering navigation
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Keep step at welcome, don't restore anything
      setStep("welcome");
      setFreshStartHandled(true);
    } else {
      setFreshStartHandled(true);
    }
  }, []);
  
  // Load saved progress from localStorage on mount (skipped if fresh start)
  useEffect(() => {
    if (!freshStartHandled) return;
    
    // Check if this was a fresh start
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fresh') === 'true') return;
    
    try {
      const savedProgress = localStorage.getItem('valueJourneyProgress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed.state) {
          // Validate and clamp currentQuestionIndex to prevent stuck states
          const restoredState = { ...parsed.state };
          if (restoredState.currentQuestionIndex !== undefined) {
            // Get the questions for the active level to validate index
            const activeLevel = restoredState.assessingEarlierLevel 
              || (restoredState.isAspirational ? restoredState.aspirationalLevel : restoredState.currentLevel);
            const levelData = getQuestionsForLevel(activeLevel || "L0");
            const maxIndex = (levelData?.questions?.length || 1) - 1;
            restoredState.currentQuestionIndex = Math.min(
              Math.max(0, restoredState.currentQuestionIndex),
              maxIndex
            );
          }
          setState(prev => ({
            ...prev,
            ...restoredState,
          }));
        }
        setTotalGleams(parsed.totalGleams || 0);
        // totalAlicorns is derived from totalGleams, no need to set separately
        
        // Determine the correct step based on saved step and completion state
        // Respect the saved step - only override if it seems invalid
        const savedStep = parsed.step;
        
        if (savedStep === "results") {
          // User was on results - stay there
          setStep("results");
        } else if (savedStep === "assessment" && parsed.state?.stakeholder) {
          // User was mid-assessment - resume it
          setStep("assessment");
        } else if (savedStep && savedStep !== "welcome") {
          // Restore other steps directly
          setStep(savedStep as WizardStep);
        } else if (parsed.state?.currentCompleted || parsed.state?.aspirationalCompleted) {
          // Fallback: if any assessment completed and no valid step, go to results
          setStep("results");
        } else if (parsed.state?.stakeholder && Object.keys(parsed.state?.answers || {}).length > 0) {
          setStep("assessment");
        } else if (parsed.state?.stakeholder) {
          setStep("current_level");
        }
      }
    } catch (e) {
      console.log('No saved progress found');
    }
  }, [freshStartHandled]);

  // Save progress to localStorage whenever state or step changes
  useEffect(() => {
    if (state.stakeholder || step !== "welcome") {
      try {
        localStorage.setItem('valueJourneyProgress', JSON.stringify({
          state,
          step,
          totalGleams,
          totalAlicorns,
          savedAt: new Date().toISOString(),
        }));
      } catch (e) {
        console.log('Could not save progress');
      }
    }
  }, [state, step, totalGleams, totalAlicorns]);
  
  const activeLevel = state.assessingEarlierLevel 
    ? state.assessingEarlierLevel 
    : (state.isAspirational ? state.aspirationalLevel : state.currentLevel);
  const levelData = getQuestionsForLevel(activeLevel);
  const questions = levelData?.questions || [];
  const currentQuestion = questions[state.currentQuestionIndex];
  const questionText = currentQuestion && state.stakeholder 
    ? currentQuestion.stakeholderQuestions[state.stakeholder] 
    : "";
  
  const levelKey = state.assessingEarlierLevel 
    ? `${state.assessingEarlierLevel}_cur`
    : `${activeLevel}_${state.isAspirational ? 'asp' : 'cur'}`;
  const levelAnswers = state.answers[levelKey] || {};
  const currentAnswer = currentQuestion ? levelAnswers[currentQuestion.code] : undefined;
  
  const progress = questions.length > 0 
    ? ((state.currentQuestionIndex + 1) / questions.length) * 100 
    : 0;
  
  const handleAnswer = useCallback((value: number) => {
    if (!currentQuestion || isAdvancing) return;
    
    const now = Date.now();
    let newStreak = state.streak;
    
    if (state.lastAnswerTime && now - state.lastAnswerTime < 8000) {
      newStreak = state.streak + 1;
      if (newStreak >= 3 && newStreak % 3 === 0) {
        setShowStreakBonus(true);
        setTimeout(() => setShowStreakBonus(false), 2000);
      }
    } else {
      newStreak = 1;
    }
    
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [levelKey]: {
          ...(prev.answers[levelKey] || {}),
          [currentQuestion.code]: value
        }
      },
      streak: newStreak,
      lastAnswerTime: now
    }));
    
    // Track questions answered and hide hint
    setTotalQuestionsAnswered(prev => prev + 1);
    setShowClickHint(false);
    
    setIsAdvancing(true);
    setTimeout(() => {
      setIsAdvancing(false);
      if (state.currentQuestionIndex < questions.length - 1) {
        setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
      } else {
        const updatedAnswers = { ...(levelAnswers), [currentQuestion.code]: value };
        const gleams = calculateGleams(updatedAnswers, activeLevel);
        const alicorns = calculateAlicorns(updatedAnswers, activeLevel);
        setTotalGleams(prev => prev + gleams);
        // totalAlicorns is derived from totalGleams, no need to set separately
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        
        if (state.assessingEarlierLevel) {
          setState(prev => ({
            ...prev,
            assessingEarlierLevel: null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            currentCompleted: prev.isAspirational ? prev.currentCompleted : true,
            aspirationalCompleted: prev.isAspirational ? true : prev.aspirationalCompleted,
          }));
        }
        const now = new Date();
        const microTimestamp = now.toISOString().replace('Z', '') + Math.floor(Math.random() * 1000).toString().padStart(3, '0') + 'Z';
        setCompletionTimestamp(microTimestamp);
        setStep("results");
      }
    }, 300);
  }, [currentQuestion, levelKey, state.streak, state.lastAnswerTime, isAdvancing, state.currentQuestionIndex, questions.length, levelAnswers, activeLevel, state.assessingEarlierLevel]);
  
  const nextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < questions.length - 1) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
    } else {
      const gleams = calculateGleams(levelAnswers, activeLevel);
      const alicorns = calculateAlicorns(levelAnswers, activeLevel);
      setTotalGleams(prev => prev + gleams);
      // totalAlicorns is derived from totalGleams, no need to set separately
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      
      if (state.assessingEarlierLevel) {
        // Completed an earlier level assessment - go back to results
        setState(prev => ({
          ...prev,
          assessingEarlierLevel: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentCompleted: prev.isAspirational ? prev.currentCompleted : true,
          aspirationalCompleted: prev.isAspirational ? true : prev.aspirationalCompleted,
        }));
      }
      const now = new Date();
      const microTimestamp = now.toISOString().replace('Z', '') + Math.floor(Math.random() * 1000).toString().padStart(3, '0') + 'Z';
      setCompletionTimestamp(microTimestamp);
      setStep("results");
    }
  }, [state.currentQuestionIndex, questions.length, levelAnswers, activeLevel, state.assessingEarlierLevel]);
  
  const prevQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }));
    }
  }, [state.currentQuestionIndex]);

  // Session ID for free user tracking
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('i2u_session_id');
    if (stored) return stored;
    const newId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('i2u_session_id', newId);
    return newId;
  });
  
  // Load identity info (idea name, fancy name, real name) from API on mount
  // This also handles magic link restoration - skip stakeholder step if already set
  const [identityLoaded, setIdentityLoaded] = useState(false);
  
  useEffect(() => {
    if (identityLoaded) return;
    
    const loadIdentity = async () => {
      // Skip if fresh start was requested
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('fresh') === 'true') {
        setIdentityLoaded(true);
        return;
      }
      
      try {
        // Fetch free user data for display name and stakeholder
        const userRes = await fetch(`/api/free-user/${sessionId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          const user = userData.user;
          
          if (user?.displayName) {
            // Parse fancy name and real name from displayName format: "FancyName (RealName)"
            const displayName = user.displayName;
            const match = displayName.match(/^(.+?)\s*\((.+)\)$/);
            if (match) {
              setUserFancyName(match[1].trim());
              setUserRealName(match[2].trim());
              setFancyName(match[1].trim());
            } else {
              setUserFancyName(displayName);
              setFancyName(displayName);
            }
          }
          
          // Restore stakeholder if already locked (magic link returning user)
          if (user?.isStakeholderLocked && user?.primaryStakeholder) {
            const stakeholder = user.primaryStakeholder as StakeholderType;
            setState(prev => ({ ...prev, stakeholder }));
            setIsStakeholderLocked(true);
            
            // Also update localStorage for consistency
            localStorage.setItem('i2u_stakeholder_locked', 'true');
            localStorage.setItem('i2u_primary_stakeholder', stakeholder);
            if (user.displayName) {
              localStorage.setItem('i2u_fancy_name', user.displayName);
            }
            
            // If user has a locked stakeholder, skip to level selection (not stakeholder selection)
            setStep('current_level');
          }
        }
        
        // Fetch user ideas for idea name
        const ideasRes = await fetch(`/api/ideas/${sessionId}`);
        if (ideasRes.ok) {
          const ideasData = await ideasRes.json();
          if (ideasData.ideas?.length > 0) {
            setCurrentIdeaName(ideasData.ideas[0].name);
            setUserIdeas(ideasData.ideas);
          }
        }
      } catch (error) {
        console.log('Could not load identity info');
      } finally {
        setIdentityLoaded(true);
      }
    };
    
    loadIdentity();
  }, [sessionId, identityLoaded]);
  
  const [isStakeholderLocked, setIsStakeholderLocked] = useState(false);
  const [showStakeholderLockAnimation, setShowStakeholderLockAnimation] = useState(false);
  const [additionalStakeholders, setAdditionalStakeholders] = useState<string[]>([]);

  const selectStakeholder = (s: StakeholderType) => {
    setState(prev => ({ ...prev, stakeholder: s }));
    // Show confirmation step with fancy name input
    setStep("stakeholder_confirm");
  };
  
  // Lock stakeholder and save to free user
  const confirmStakeholderLock = async () => {
    if (!state.stakeholder) return;
    
    setShowStakeholderLockAnimation(true);
    
    try {
      // Create or update free user with locked stakeholder
      await fetch('/api/free-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          primaryStakeholder: state.stakeholder,
          displayName: fancyName || undefined,
          isStakeholderLocked: true,
        }),
      });
      
      // Also try to lock if exists
      await fetch(`/api/free-user/${sessionId}/lock-stakeholder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeholder: state.stakeholder,
          displayName: fancyName || undefined,
        }),
      });
      
      setIsStakeholderLocked(true);
      localStorage.setItem('i2u_stakeholder_locked', 'true');
      localStorage.setItem('i2u_primary_stakeholder', state.stakeholder);
      if (fancyName) localStorage.setItem('i2u_fancy_name', fancyName);
      
      toast({
        title: "🔒 Role Locked!",
        description: `You are now a ${STAKEHOLDERS.find(s => s.id === state.stakeholder)?.name}. You can add more roles later.`,
      });
      
      setTimeout(() => {
        setShowStakeholderLockAnimation(false);
        setStep("current_level");
      }, 1500);
    } catch (error) {
      console.error("Failed to lock stakeholder:", error);
      setShowStakeholderLockAnimation(false);
      setStep("current_level");
    }
  };
  
  // Add additional stakeholder role
  const addAdditionalStakeholder = async (s: StakeholderType) => {
    if (s === state.stakeholder || additionalStakeholders.includes(s)) {
      toast({ title: "Already have this role", variant: "destructive" });
      return;
    }
    
    try {
      await fetch(`/api/free-user/${sessionId}/add-stakeholder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stakeholder: s }),
      });
      
      setAdditionalStakeholders(prev => [...prev, s]);
      toast({
        title: "✨ New Role Added!",
        description: `You can now assess as a ${STAKEHOLDERS.find(st => st.id === s)?.name} too.`,
      });
    } catch (error) {
      console.error("Failed to add stakeholder:", error);
    }
  };
  
  // Save progress to free user
  const saveFreeUserProgress = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      await fetch(`/api/free-user/${sessionId}/save-levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLevel: state.currentLevel,
          aspirationalLevel: state.aspirationalLevel,
          currentAnswers: state.answers,
          totalGleams,
          totalAlicorns: gleamsToAlicornsNum(totalGleams),
          completedLevels: Object.keys(state.answers).filter(level => 
            Object.keys(state.answers[level] || {}).length > 0
          ),
        }),
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, [sessionId, state.currentLevel, state.aspirationalLevel, state.answers, totalGleams]);
  
  // Auto-save progress periodically
  useEffect(() => {
    if (step === "assessment" || step === "results") {
      saveFreeUserProgress();
    }
  }, [step, totalGleams, saveFreeUserProgress]);

  const selectCurrentLevel = (level: string) => {
    const levelIndex = LEVELS.findIndex(l => l.level === level);
    const defaultAspirational = LEVELS[Math.min(levelIndex + 1, LEVELS.length - 1)]?.level || level;
    setState(prev => ({ 
      ...prev, 
      currentLevel: level,
      aspirationalLevel: defaultAspirational,
      isAspirational: false,
      currentQuestionIndex: 0,
      startTime: Date.now()
    }));
    setElapsedTime(0);
    setStep("assessment");
  };

  const selectAspirationalLevel = (level: string) => {
    setState(prev => ({ 
      ...prev, 
      aspirationalLevel: level,
      isAspirational: false,
      currentQuestionIndex: 0,
      startTime: Date.now()
    }));
    setElapsedTime(0);
    setStep("assessment");
  };

  const continueToAspirational = () => {
    setState(prev => ({ 
      ...prev, 
      isAspirational: true, 
      currentQuestionIndex: 0,
      streak: 0,
      lastAnswerTime: null,
      startTime: Date.now()
    }));
    setElapsedTime(0);
    setStep("assessment");
  };

  const CONTEST_COST = 10; // Gleams cost to contest

  const resetWizard = () => {
    setState({
      stakeholder: null,
      currentLevel: "L0",
      aspirationalLevel: "L1",
      isAspirational: false,
      assessingEarlierLevel: null,
      answers: {},
      currentQuestionIndex: 0,
      streak: 0,
      lastAnswerTime: null,
      currentCompleted: false,
      aspirationalCompleted: false,
      startTime: null,
    });
    setTotalGleams(0);
    // totalAlicorns is derived from totalGleams, no need to reset separately
    setElapsedTime(0);
    setIsAdvancing(false);
    setTotalQuestionsAnswered(0);
    setShowClickHint(false);
    setStep("welcome");
  };

  const startEarlierLevelAssessment = (level: string) => {
    setState(prev => ({
      ...prev,
      assessingEarlierLevel: level,
      currentQuestionIndex: 0,
      streak: 0,
      lastAnswerTime: null,
      startTime: Date.now()
    }));
    setElapsedTime(0);
    setStep("assessment");
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === "assessment" && state.startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - state.startTime!) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, state.startTime]);
  
  // Show hint to click on cards when user pauses (progressive delays)
  useEffect(() => {
    if (step !== "assessment" || currentAnswer !== undefined) {
      setShowClickHint(false);
      return;
    }
    
    // Progressive delay: 2s for first 2 questions, 4s for next 2, 6s after that
    const delay = totalQuestionsAnswered < 2 ? 2000 : totalQuestionsAnswered < 4 ? 4000 : 6000;
    
    const hintTimer = setTimeout(() => {
      setShowClickHint(true);
    }, delay);
    
    return () => clearTimeout(hintTimer);
  }, [step, state.currentQuestionIndex, currentAnswer, totalQuestionsAnswered]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startAssessment = () => {
    setState(prev => ({
      ...prev,
      answers: {},
      currentQuestionIndex: 0,
      streak: 0,
      lastAnswerTime: null,
      currentCompleted: false,
      aspirationalCompleted: false,
      assessingEarlierLevel: null,
      startTime: null,
    }));
    setTotalGleams(0);
    setElapsedTime(0);
    setIsAdvancing(false);
    setTotalQuestionsAnswered(0);
    setShowClickHint(false);
    setStep("stakeholder");
  };

  // Pause mechanism handlers
  const handlePauseAssessment = async (durationMinutes: number) => {
    if (!user?.id) return;
    
    const pauseState: PauseState = {
      isPaused: true,
      pauseStartTime: Date.now(),
      breakDuration: durationMinutes * 60 * 1000,
      alarmTime: Date.now() + (durationMinutes * 60 * 1000),
      level: activeLevel,
      questionIndex: state.currentQuestionIndex,
    };
    
    setCurrentPauseState(pauseState);
    setShowBreakCountdown(true);
    
    try {
      await fetch(`/api/value-journey/progress/${user.id}/pause`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pauseState }),
      });
    } catch (error) {
      console.error('Failed to save pause state:', error);
    }
  };

  const handleResumeAssessment = async (pauseState?: PauseState) => {
    if (!user?.id) return;
    
    setShowBreakCountdown(false);
    setCurrentPauseState(null);
    
    if (pauseState) {
      setStep("assessment");
      setState(prev => ({
        ...prev,
        currentQuestionIndex: pauseState.questionIndex,
      }));
    }
    
    try {
      await fetch(`/api/value-journey/progress/${user.id}/pause`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pauseState: null }),
      });
    } catch (error) {
      console.error('Failed to clear pause state:', error);
    }
  };

  const handleExtendBreak = async () => {
    if (!currentPauseState || !user?.id) return;
    
    const extendedPauseState: PauseState = {
      ...currentPauseState,
      breakDuration: currentPauseState.breakDuration + (5 * 60 * 1000),
      alarmTime: (currentPauseState.alarmTime || Date.now()) + (5 * 60 * 1000),
    };
    
    setCurrentPauseState(extendedPauseState);
    
    try {
      await fetch(`/api/value-journey/progress/${user.id}/pause`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pauseState: extendedPauseState }),
      });
    } catch (error) {
      console.error('Failed to extend break:', error);
    }
  };

  // Get session ID for ideas/roles
  const getSessionId = () => {
    const stored = localStorage.getItem('freeUserSessionId');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('freeUserSessionId', newId);
    return newId;
  };

  // Handle exit with pause options
  const handleExitPause = async (options: PauseOptions) => {
    const sessionId = getSessionId();
    
    toast({
      title: options.type === "break" ? "Break Started" : options.type === "schedule" ? "Return Scheduled" : "Progress Saved",
      description: options.type === "break" 
        ? `Your progress is saved. See you in ${Math.round((options.breakDuration || 0) / 60000)} minutes!`
        : options.type === "schedule"
        ? `We'll remind you on ${options.scheduledReturnTime?.toLocaleString()}`
        : "Your progress is saved. Return anytime!",
    });
    
    setShowExitModal(false);
    setStep("welcome");
  };

  // Handle switch to different idea
  const handleSwitchIdea = () => {
    setShowExitModal(false);
    setShowContextSwitcher(true);
  };

  // Handle switch to different role
  const handleSwitchRole = () => {
    setShowExitModal(false);
    setShowContextSwitcher(true);
  };

  // Create new idea
  const handleCreateIdea = async (name: string, description?: string): Promise<UserIdea> => {
    const sessionId = getSessionId();
    const response = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, name, description }),
    });
    const data = await response.json();
    if (data.success) {
      setUserIdeas(prev => [data.idea, ...prev]);
      return data.idea;
    }
    throw new Error('Failed to create idea');
  };

  // Add role to idea
  const handleAddRole = async (ideaId: number, stakeholder: string): Promise<IdeaRole> => {
    const sessionId = getSessionId();
    const response = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId, sessionId, stakeholder }),
    });
    const data = await response.json();
    if (data.success) {
      setUserRoles(prev => [data.role, ...prev]);
      return data.role;
    }
    throw new Error('Failed to add role');
  };

  // Handle context selection
  const handleSelectContext = (ideaId: number | null, roleId: number | null, stakeholder: string) => {
    setCurrentIdeaId(ideaId);
    setCurrentRoleId(roleId);
    
    const idea = userIdeas.find(i => i.id === ideaId);
    setCurrentIdeaName(idea?.name);
    
    const stakeholderData = STAKEHOLDERS.find(s => s.id === stakeholder);
    if (stakeholderData) {
      setState(prev => ({ ...prev, stakeholder: stakeholderData.id as StakeholderType }));
    }
    
    setShowContextSwitcher(false);
    toast({
      title: "Context Switched",
      description: idea ? `Now assessing "${idea.name}" as ${stakeholder}` : `Now assessing as ${stakeholder}`,
    });
  };

  // Fetch ideas and roles on mount
  useEffect(() => {
    const fetchIdeasAndRoles = async () => {
      const sessionId = getSessionId();
      try {
        const [ideasRes, rolesRes] = await Promise.all([
          fetch(`/api/ideas/${sessionId}`),
          fetch(`/api/roles/${sessionId}`)
        ]);
        const ideasData = await ideasRes.json();
        const rolesData = await rolesRes.json();
        
        if (ideasData.success) setUserIdeas(ideasData.ideas);
        if (rolesData.success) setUserRoles(rolesData.roles);
      } catch (error) {
        console.error('Failed to fetch ideas/roles:', error);
      }
    };
    
    fetchIdeasAndRoles();
  }, []);

  // Fetch user progress on mount if authenticated
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/value-journey/progress/${user.id}`);
        const data = await response.json();
        
        if (data.success && data.progress) {
          setUserProgress(data.progress);
          setHasExistingProgress(true);
          
          if (data.progress.currentPauseState?.isPaused) {
            setCurrentPauseState(data.progress.currentPauseState);
            setShowBreakCountdown(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user progress:', error);
      }
    };
    
    fetchUserProgress();
  }, [user?.id]);

  const levelTheme = LEVEL_THEMES[activeLevel] || LEVEL_THEMES["L0"];
  
  const currentLevelKey = `${state.currentLevel}_cur`;
  const aspirationalLevelKey = `${state.aspirationalLevel}_asp`;
  const currentAnswers = state.answers[currentLevelKey] || {};
  const aspirationalAnswers = state.answers[aspirationalLevelKey] || {};
  
  const currentLevelIndex = LEVELS.findIndex(l => l.level === state.currentLevel);
  
  // Calculate scores for all earlier levels (L0 to current-1)
  const earlierLevels = LEVELS.slice(0, currentLevelIndex);
  const earlierLevelScores = earlierLevels.map(level => {
    const key = `${level.level}_cur`;
    const answers = state.answers[key] || {};
    const hasAnswers = Object.keys(answers).length > 0;
    return {
      level: level.level,
      levelName: level.levelName,
      score: hasAnswers ? calculateLevelScore(answers) : 0,
      gleams: hasAnswers ? calculateGleams(answers, level.level) : 0,
      completed: hasAnswers
    };
  });
  
  // Cumulative current score = average of all completed levels (earlier + current)
  const currentLevelScore = calculateLevelScore(currentAnswers);
  const completedEarlierLevels = earlierLevelScores.filter(l => l.completed);
  const allCompletedScores = state.currentCompleted 
    ? [...completedEarlierLevels.map(l => l.score), currentLevelScore]
    : completedEarlierLevels.map(l => l.score);
  
  // Divide by number of completed levels, not total possible
  const completedLevelsCount = allCompletedScores.length;
  const totalEarnedScore = allCompletedScores.reduce((sum, s) => sum + s, 0);
  const cumulativeCurrentScore = completedLevelsCount > 0 
    ? Math.round(totalEarnedScore / completedLevelsCount)
    : 0;
  
  const currentScore = cumulativeCurrentScore;
  const aspirationalScore = calculateLevelScore(aspirationalAnswers);
  const gapScore = aspirationalScore - currentScore;
  const bothCompleted = state.currentCompleted && state.aspirationalCompleted;
  
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      {/* Break Countdown Overlay */}
      {showBreakCountdown && currentPauseState && (
        <BreakCountdown
          pauseState={currentPauseState}
          onResume={() => handleResumeAssessment(currentPauseState)}
          onExtend={handleExtendBreak}
        />
      )}

      {/* Pause Break Modal */}
      <PauseBreakModal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        onPause={handlePauseAssessment}
        currentLevel={activeLevel}
        currentQuestionIndex={state.currentQuestionIndex}
      />
      
      {/* Assessment Exit Modal - for switching ideas/roles or taking breaks */}
      <AssessmentExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onPause={handleExitPause}
        onSwitchIdea={handleSwitchIdea}
        onSwitchRole={handleSwitchRole}
        currentLevel={activeLevel}
        currentQuestionIndex={state.currentQuestionIndex}
        ideaName={currentIdeaName}
        stakeholder={state.stakeholder || undefined}
      />
      
      {/* Context Switcher - for managing ideas and roles */}
      <ContextSwitcher
        isOpen={showContextSwitcher}
        onClose={() => setShowContextSwitcher(false)}
        ideas={userIdeas}
        roles={userRoles}
        currentIdeaId={currentIdeaId}
        currentRoleId={currentRoleId}
        onSelectContext={handleSelectContext}
        onCreateIdea={handleCreateIdea}
        onAddRole={handleAddRole}
        sessionId={getSessionId()}
      />
      
      {/* Persistent Header with Take Assessment Button - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="text-slate-400 hover:text-white hover:bg-white/10 p-2"
                  data-testid="button-wizard-back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Go back</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.location.href = "/"}
                  className="text-slate-400 hover:text-white hover:bg-white/10 p-2"
                  data-testid="button-wizard-home"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Go to home</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-xl">🦄</span>
            <span className="font-heading font-bold text-lg hidden sm:inline">Value Journey Quest</span>
            
            {/* Identity Bar - shows user's idea and name */}
            {(currentIdeaName || userFancyName) && (
              <IdentityBar
                ideaName={currentIdeaName}
                fancyName={userFancyName}
                realName={userRealName}
                compact={true}
                className="hidden md:flex ml-4"
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Auth Buttons - Hide when user has magic link session (userFancyName) */}
            {!authLoading && !userFancyName && (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.firstName || 'User'} 
                      className="w-7 h-7 rounded-full border border-violet-500/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                      {user?.firstName?.[0] || user?.email?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-sm text-slate-300 hidden sm:inline">
                    {user?.firstName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => logout()}
                        className="text-slate-500 hover:text-slate-400 transition-colors text-xs underline-offset-2 hover:underline"
                        data-testid="button-logout"
                      >
                        logout
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Sign out of your account</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRegister}
                      className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                      data-testid="button-login"
                    >
                      <LogIn className="mr-1 h-4 w-4" />
                      Login
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sign in to save your progress across devices</TooltipContent>
                </Tooltip>
              )
            )}
            
            {totalGleams > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (state.currentCompleted || state.aspirationalCompleted) {
                        setStep("results");
                      }
                    }}
                    className={`flex items-center gap-2 ${hasProgressedBeyondL0(state.currentLevel) ? 'text-violet-400 bg-violet-400/10 hover:bg-violet-400/20' : 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'} px-3 py-1.5 rounded-full cursor-pointer transition-all border-2 ${hasProgressedBeyondL0(state.currentLevel) ? 'border-violet-500/30 hover:border-violet-500/60' : 'border-yellow-500/30 hover:border-yellow-500/60'}`}
                    data-testid="button-score-results"
                  >
                    <span className="text-lg">{hasProgressedBeyondL0(state.currentLevel) ? ALICORN_SYMBOL : GLEAM_SYMBOL}</span>
                    <span className="font-bold text-sm">{hasProgressedBeyondL0(state.currentLevel) ? gleamsToAlicorns(totalGleams) : totalGleams.toLocaleString()}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>🏆 Click to view your Results! Your total: {hasProgressedBeyondL0(state.currentLevel) ? gleamsToAlicorns(totalGleams) + ' Alicorns' : totalGleams.toLocaleString() + ' Gleams'}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  animate={step === "welcome" || step === "results" ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(139, 92, 246, 0)",
                      "0 0 20px 4px rgba(139, 92, 246, 0.4)",
                      "0 0 0 0 rgba(139, 92, 246, 0)"
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-lg"
                >
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                    onClick={() => {
                      if (step === "welcome") {
                        setStep("stakeholder");
                      } else if (!state.stakeholder) {
                        setStep("stakeholder");
                      } else if (!state.currentLevel) {
                        setStep("current_level");
                      } else if (!state.aspirationalLevel) {
                        setStep("aspirational_level");
                      } else if (state.currentCompleted || state.aspirationalCompleted) {
                        if (step === "results") {
                          setShowResultsPopup(true);
                        } else {
                          setStep("results");
                        }
                      } else {
                        setStep("assessment");
                      }
                    }}
                    data-testid="button-take-assessment-header"
                  >
                    <Play className="mr-1 h-4 w-4" />
                    {step === "results" ? "View Results" : step === "assessment" ? "Continue" : (state.currentCompleted || state.aspirationalCompleted) ? "My Results" : "Take Assessment"}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>💡 {step === "results" ? "View your detailed assessment results, charts, and badges" : step === "assessment" ? "Continue your assessment from where you left off" : (state.currentCompleted || state.aspirationalCompleted) ? "View your assessment results, charts, and scores" : "Start your Value Journey Quest to earn Gleams and Alicorns!"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-14" />
      
      {/* Floating Share/Register Button - Only shows on results page */}
      {step === "results" && (
        <div className="fixed bottom-6 right-6 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isRegistered) {
                    setShowEnhancedShareModal(true);
                  } else {
                    setShowRegistration(true);
                  }
                }}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
                  isRegistered 
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 shadow-violet-500/30" 
                    : "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30"
                }`}
                data-testid="button-floating-share"
              >
                {isRegistered ? (
                  <Share2 className="h-6 w-6 text-white" />
                ) : (
                  <UserPlus className="h-6 w-6 text-white" />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isRegistered ? "📤 Share your results on social media and challenge friends!" : "🔐 Register to save progress and unlock sharing features"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      
      {/* Enhanced Share Modal */}
      <EnhancedShareModal
        isOpen={showEnhancedShareModal}
        onClose={() => setShowEnhancedShareModal(false)}
        totalGleams={totalGleams}
        currentLevel={state.currentLevel}
        aspirationalLevel={state.aspirationalLevel}
        stakeholder={state.stakeholder || "founder"}
        referralCode={referralCode || undefined}
        userName={user?.firstName || user?.email?.split('@')[0]}
      />
      
      <AnimatePresence>
        {showStreakBonus && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.5 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <Flame className="h-6 w-6 text-yellow-300 animate-pulse" />
              <span className="font-bold text-lg">{state.streak} Streak! 🔥</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-4xl mx-auto">
        {/* STEP 1: Welcome - PROMOTIONAL HIGH-ENERGY Landing */}
        {step === "welcome" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* LEFT COLUMN - Hero Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Progress Panel for Returning Users */}
              {isAuthenticated && user?.id && hasExistingProgress && (
                <UserProgressPanel
                  userId={user.id}
                  onResumeAssessment={handleResumeAssessment}
                  onStartNewLevel={(level) => {
                    setState(prev => ({ ...prev, currentLevel: level }));
                    setStep("current_level");
                  }}
                  compact={true}
                />
              )}
              
              {/* Animated Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/50 via-purple-900/50 to-pink-900/50 p-8 border border-violet-500/30">
                {/* Floating particles background */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-violet-400/30 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10 space-y-4 text-center">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="inline-block"
                  >
                    <span className="text-7xl">🦄</span>
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Value Journey Quest
                  </h1>
                  <p className="text-lg text-slate-300 max-w-xl mx-auto">
                    Discover your startup readiness through a gamified self-assessment. 
                    Rate your confidence and unlock your path from Ideas to Unicorn!
                  </p>
                  
                  {/* Pulsing CTA Button */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(139, 92, 246, 0)",
                        "0 0 30px 10px rgba(139, 92, 246, 0.4)",
                        "0 0 0 0 rgba(139, 92, 246, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block rounded-xl mt-4"
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-xl px-10 py-6 rounded-xl"
                      onClick={startAssessment}
                      data-testid="button-begin-assessment"
                    >
                      <Play className="mr-2 h-6 w-6" />
                      Begin Assessment
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </motion.div>
                  
                  {/* FAB Buttons Announcement */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400"
                  >
                    <span className="text-lg">💡</span>
                    <span>During assessment, use the <span className="text-violet-400 font-medium">Break</span> & <span className="text-rose-400 font-medium">Exit</span> buttons in the bottom bar anytime</span>
                  </motion.div>
                </div>
              </div>
              
              {/* Feature Cards Row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <Target className="h-6 w-6" />, label: "9 Growth Levels", color: "text-cyan-400", bg: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
                  { icon: <span className="text-2xl">👥</span>, label: "9 Stakeholder Types", color: "text-violet-400", bg: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30" },
                  { icon: <Sparkles className="h-6 w-6" />, label: "Earn Gleams", color: "text-yellow-400", bg: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-500/30" },
                  { icon: <span className="text-2xl">🦄</span>, label: "Unlock Alicorns", color: "text-pink-400", bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -3 }}
                    className={`bg-gradient-to-br ${feature.bg} rounded-xl p-4 border ${feature.border} text-center cursor-pointer group`}
                  >
                    <div className={`${feature.color} mx-auto mb-2 group-hover:scale-110 transition-transform`}>{feature.icon}</div>
                    <div className={`text-sm font-semibold ${feature.color}`}>{feature.label}</div>
                  </motion.div>
                ))}
              </div>
              
              {/* Testimonial Chips - Rotating */}
              <div className="overflow-hidden">
                <motion.div
                  animate={{ x: [0, -100, 0] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="flex gap-4"
                >
                  {[
                    "🚀 500+ founders assessed",
                    "⭐ 4.9/5 rating",
                    "🏆 Top accelerator tool",
                    "💎 Backed by i2u.ai",
                    "🌍 Global community",
                    "📈 Proven growth framework",
                  ].map((chip, i) => (
                    <div key={i} className="flex-shrink-0 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 text-sm text-slate-300">
                      {chip}
                    </div>
                  ))}
                </motion.div>
              </div>
              
              {/* Daily Challenge Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-xl p-5 border-2 border-amber-500/40 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className="text-2xl"
                  >
                    🔥
                  </motion.span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Flame className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-amber-400 font-bold text-lg">🎁 Daily Challenge</div>
                    <p className="text-slate-300 text-sm">Complete your assessment today and earn <span className="text-yellow-400 font-bold">+500 Bonus Gleams!</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Time left</div>
                    <div className="text-xl font-bold text-orange-400">12:34:56</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* RIGHT COLUMN - Animated Sidebar (1/3 width) */}
            <div className="space-y-4">
              {/* Live Stats Carousel */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(34, 211, 238, 0)",
                    "0 0 20px 5px rgba(34, 211, 238, 0.2)",
                    "0 0 0 0 rgba(34, 211, 238, 0)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <span className="text-cyan-400 font-semibold text-sm">LIVE STATS</span>
                  </div>
                  <span className="text-[10px] text-slate-500 italic">Illustration</span>
                </div>
                <RotatingStats />
              </motion.div>
              
              {/* Mini Leaderboard Preview */}
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-sm">TOP PERFORMERS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs text-slate-400"
                    >
                      🔴 Live
                    </motion.span>
                    <span className="text-[10px] text-slate-500 italic">Illustration</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {leaderboardEntries.slice(0, 5).map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50"
                    >
                      <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                      <span className="flex-1 text-sm truncate">{entry.displayName || entry.fancyName}</span>
                      <span className="text-violet-400 font-bold text-sm">{ALICORN_SYMBOL} {formatLeaderboardScore(parseFloat(entry.score))}</span>
                    </motion.div>
                  ))}
                  {leaderboardEntries.length === 0 && (
                    <div className="text-center text-slate-500 text-sm py-4">
                      Be the first on the leaderboard!
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => setShowLeaderboard(true)}
                >
                  View Full Leaderboard
                </Button>
              </div>
              
              {/* Share & Earn Card */}
              <motion.div
                animate={{
                  borderColor: ["rgba(236, 72, 153, 0.3)", "rgba(236, 72, 153, 0.8)", "rgba(236, 72, 153, 0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 border-2"
              >
                <div className="text-center space-y-3">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-3xl inline-block"
                  >
                    🎁
                  </motion.span>
                  <div className="text-pink-400 font-bold">Share, Invite, Challenge, ...</div>
                  <p className="text-xs text-slate-400">
                    Invite friends and earn <span className="text-yellow-400 font-bold">+100 Gleams</span> for each referral!
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500"
                    onClick={() => {
                      if (isRegistered) {
                        setShowEnhancedShareModal(true);
                      } else {
                        setShowRegistration(true);
                      }
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {isRegistered ? "Share & Earn" : "Get Your Referral Link"}
                  </Button>
                </div>
              </motion.div>
              
              {/* Quick Tips */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="text-slate-400 text-xs font-semibold mb-2">💡 PRO TIP</div>
                <RotatingTips />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Who are you? (Stakeholder Selection) */}
        {step === "stakeholder" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-4">
                Step 1 of 3
              </Badge>
              <h2 className="text-4xl font-heading font-bold">Who are you?</h2>
              <p className="text-slate-400 text-lg">Select the role that best describes you in the startup ecosystem</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAKEHOLDERS.map((s) => (
                <Tooltip key={s.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectStakeholder(s.id)}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        state.stakeholder === s.id
                          ? "border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                      }`}
                      data-testid={`button-stakeholder-${s.id}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{s.emoji}</span>
                        <span className="text-xl font-bold">{s.name}</span>
                      </div>
                      <p className="text-sm text-slate-400">{s.description}</p>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-amber-300">{s.emoji} {s.name}</p>
                    <p className="text-xs mt-1">Click to select this role. Your stakeholder perspective shapes the assessment questions and insights you'll receive.</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Stakeholder Leaderboard Preview */}
            {state.stakeholder && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-md mx-auto bg-slate-800/30 rounded-xl p-4 border border-violet-500/20"
              >
                <StakeholderLeaderboard 
                  stakeholder={STAKEHOLDERS.find(s => s.id === state.stakeholder)?.name || "Founder"} 
                  variant="compact"
                  showNewsfeed={true}
                />
              </motion.div>
            )}

            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setStep("welcome")}
                className="text-slate-400"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2b: Stakeholder Confirmation with Fancy Name */}
        {step === "stakeholder_confirm" && state.stakeholder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8 max-w-lg mx-auto"
          >
            <div className="text-center space-y-4">
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                Confirm Your Role
              </Badge>
              
              {/* Animated Lock Visual */}
              <motion.div
                className="relative inline-block"
                animate={showStakeholderLockAnimation ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl
                    ${showStakeholderLockAnimation 
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/50" 
                      : "bg-gradient-to-br from-violet-500/30 to-purple-500/30 border-4 border-violet-500/50"
                    }`}
                  animate={showStakeholderLockAnimation ? { 
                    boxShadow: ["0 0 0 rgba(245, 158, 11, 0)", "0 0 60px rgba(245, 158, 11, 0.8)", "0 0 30px rgba(245, 158, 11, 0.4)"]
                  } : {}}
                  transition={{ duration: 1 }}
                >
                  {STAKEHOLDERS.find(s => s.id === state.stakeholder)?.emoji}
                </motion.div>
                
                {showStakeholderLockAnimation && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-2xl shadow-lg"
                  >
                    🔒
                  </motion.div>
                )}
              </motion.div>
              
              <h2 className="text-3xl font-heading font-bold">
                You're a {STAKEHOLDERS.find(s => s.id === state.stakeholder)?.name}!
              </h2>
              <p className="text-slate-400">
                This will be your primary role. You can add more roles later for different perspectives.
              </p>
            </div>
            
            {/* Display Name Input */}
            <div className="space-y-4 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">Choose Your Display Name</h3>
                <p className="text-sm text-slate-400">This is how you'll appear on leaderboards</p>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="e.g., Cosmic Pioneer, Stellar Voyager..."
                  value={fancyName}
                  onChange={(e) => setFancyName(e.target.value)}
                  className="text-center text-lg bg-slate-900/50 border-slate-600 focus:border-violet-500"
                  maxLength={30}
                  data-testid="input-display-name"
                />
                <p className="text-xs text-slate-500 text-center">
                  {fancyName ? `"${fancyName}" sounds legendary!` : "Leave blank to stay anonymous"}
                </p>
              </div>
              
              {/* Display Name Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {["Cosmic Pioneer", "Stellar Voyager", "Nova Architect", "Quantum Dreamer"].map((name) => (
                  <motion.button
                    key={name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFancyName(name)}
                    className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs border border-violet-500/30 hover:bg-violet-500/30 transition-all"
                  >
                    {name}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Confirmation Buttons */}
            <div className="flex flex-col gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={confirmStakeholderLock}
                    disabled={showStakeholderLockAnimation}
                    className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                    data-testid="button-confirm-stakeholder"
                  >
                    {showStakeholderLockAnimation ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          🔒
                        </motion.span>
                        Locking Your Role...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" /> Lock This Role & Continue
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Confirm your role to start the assessment</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => setStep("stakeholder")}
                    className="text-slate-400"
                    disabled={showStakeholderLockAnimation}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Choose Different Role
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Go back to pick a different stakeholder role</TooltipContent>
              </Tooltip>
            </div>
            
            <p className="text-xs text-center text-slate-500">
              🔓 Your role will be locked after confirmation. You can add additional perspectives later.
            </p>
          </motion.div>
        )}

        {/* STEP 3: Current Level Selection with Zone Highlighting */}
        {step === "current_level" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-4">
                Step 2 of 2
              </Badge>
              <h2 className="text-4xl font-heading font-bold">Where are you now?</h2>
              <p className="text-slate-400 text-lg">Select your current startup stage - levels at and below become your self-assessment zone</p>
            </div>
            
            {/* Zone Legend */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500/40 to-emerald-500/40 border border-green-500/60" />
                <span className="text-green-300">Self-Assessment Zone (Your Reality)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-violet-500/40 to-purple-500/40 border border-violet-500/60" />
                <span className="text-violet-300">Aspirational Zone (Your Future)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEVELS.map((level, idx) => {
                const theme = LEVEL_THEMES[level.level] || LEVEL_THEMES["L0"];
                const selectedIndex = LEVELS.findIndex(l => l.level === state.currentLevel);
                const isSelected = state.currentLevel === level.level;
                const isSelfAssessmentZone = selectedIndex >= 0 && idx <= selectedIndex;
                const isAspirationalZone = selectedIndex >= 0 && idx > selectedIndex;
                
                return (
                  <Tooltip key={level.level}>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectCurrentLevel(level.level)}
                        className={`p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? "border-green-500 bg-gradient-to-br from-green-500/30 to-emerald-500/20 shadow-lg shadow-green-500/30 ring-2 ring-green-400/50"
                            : isSelfAssessmentZone
                              ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
                              : isAspirationalZone
                                ? "border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-purple-500/5"
                                : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                        }`}
                        data-testid={`button-current-level-${level.level}`}
                      >
                        {/* Zone indicator badge */}
                        {selectedIndex >= 0 && (
                          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSelected
                              ? "bg-green-500 text-white"
                              : isSelfAssessmentZone
                                ? "bg-green-500/20 text-green-300"
                                : "bg-violet-500/20 text-violet-300"
                          }`}>
                            {isSelected ? "📍 YOUR LEVEL" : isSelfAssessmentZone ? "✓ REALITY" : "🚀 ASPIRATION"}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mb-2 mt-4">
                          <span className="text-2xl">{theme.emoji}</span>
                          <Badge className={`bg-gradient-to-r ${theme.gradient}`}>
                            {getLevelDisplayName(level.level)}
                          </Badge>
                        </div>
                        <div className="font-bold text-lg">{level.levelName}</div>
                        <p className="text-xs text-slate-400 mt-1">{level.levelFocus}</p>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-semibold">{theme.emoji} {level.levelName}</p>
                      <p className="text-xs mt-1">{level.levelFocus}</p>
                      <p className="text-xs text-amber-300 mt-2">
                        {isSelected ? "✅ This is your current level" : 
                         isSelfAssessmentZone ? "🎯 Part of your self-assessment zone" : 
                         "🚀 Part of your aspirational growth path"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Hint: Explore Aspirational Levels */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl p-4 border border-violet-500/30"
            >
              <div className="flex items-start gap-3">
                <motion.span 
                  className="text-2xl mt-0.5"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💡
                </motion.span>
                <div className="flex-1">
                  <p className="font-semibold text-violet-300">Tip: Explore Your Aspirational Zone!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Levels above your current stage form your <span className="text-violet-400">Aspirational Zone</span>. 
                    After completing your current level assessment, you'll unlock aspirational assessments to discover 
                    the gap between where you are and where you want to be!
                  </p>
                  <Button
                    variant="link"
                    className="text-violet-400 hover:text-violet-300 p-0 h-auto mt-2 text-sm"
                    onClick={() => setStep("aspirational_level")}
                    data-testid="link-explore-aspirational"
                  >
                    Preview aspirational levels →
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setStep("stakeholder_confirm")}
                className="text-slate-400"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Aspirational Level Selection */}
        {step === "aspirational_level" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-4">
                Step 3 of 3
              </Badge>
              <h2 className="text-4xl font-heading font-bold">Where do you aspire to be?</h2>
              <p className="text-slate-400 text-lg">Select your target stage - this defines your value journey gap</p>
            </div>

            <div className="text-center mb-4">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Current: {getLevelDisplayName(state.currentLevel)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEVELS.filter((_, idx) => idx > currentLevelIndex).map((level) => {
                const theme = LEVEL_THEMES[level.level] || LEVEL_THEMES["L0"];
                return (
                  <Tooltip key={level.level}>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAspirationalLevel(level.level)}
                        className={`p-5 rounded-xl border-2 text-left transition-all ${
                          state.aspirationalLevel === level.level
                            ? `border-violet-500 bg-violet-500/20 shadow-lg`
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                        }`}
                        data-testid={`button-aspirational-level-${level.level}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{theme.emoji}</span>
                          <Badge className={`bg-gradient-to-r ${theme.gradient}`}>
                            {getLevelDisplayName(level.level)}
                          </Badge>
                        </div>
                        <div className="font-bold text-lg">{level.levelName}</div>
                        <p className="text-xs text-slate-400 mt-1">{level.levelFocus}</p>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-semibold">{theme.emoji} {level.levelName}</p>
                      <p className="text-xs mt-1">{level.levelFocus}</p>
                      <p className="text-xs text-violet-300 mt-2">
                        🚀 Set this as your aspirational target to measure the gap from your current reality
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => state.currentCompleted ? setStep("results") : setStep("current_level")}
                className="text-slate-400"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {state.currentCompleted ? "Back to Results" : "Back to Current Level"}
              </Button>
              {!state.currentCompleted && (
                <Button
                  variant="outline"
                  className="border-green-500/50 text-green-400"
                  onClick={() => {
                    setState(prev => ({ ...prev, currentQuestionIndex: 0, startTime: Date.now() }));
                    setElapsedTime(0);
                    setStep("assessment");
                  }}
                >
                  Skip for Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 5: Assessment Questions */}
        {step === "assessment" && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge className={`bg-gradient-to-r ${levelTheme.gradient}`}>
                  {getLevelDisplayName(activeLevel)}
                </Badge>
                <Badge variant="outline" className={state.isAspirational ? "border-violet-500 text-violet-400" : "border-green-500 text-green-400"}>
                  {state.isAspirational ? "Aspirational" : "Current Reality"}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="border-violet-500/50 text-violet-300 cursor-pointer hover:bg-violet-500/20 hover:border-violet-400 transition-all"
                        onClick={() => setShowAspirationalLevelPicker(true)}
                      >
                        <Rocket className="h-3 w-3 mr-1" />
                        Goal: {getLevelDisplayName(state.aspirationalLevel)}
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to change your aspirational level</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                  <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowExitModal(true)}
                        className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                        data-testid="button-exit-assessment"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Exit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold">Exit Assessment</p>
                      <p className="text-xs text-slate-400">Take a break, switch ideas, or change your stakeholder role. Your progress is always saved!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {isAuthenticated && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPauseModal(true)}
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                          data-testid="button-pause-assessment"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Take Break
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pause and take a break (2 min - 12 hours)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="flex items-center gap-2 text-yellow-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-bold">{totalGleams.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-violet-400">
                  <span className="text-xl">🦄</span>
                  <span className="font-bold">{totalAlicorns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {state.streak >= 3 && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Flame className="h-5 w-5" />
                    <span className="font-bold">{state.streak}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Question {state.currentQuestionIndex + 1} of {questions.length}</span>
                <span>✨ {Math.round(progress * 100)} Gleams Potential</span>
              </div>
              <Progress value={progress} className="h-3" />
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-500/20"
              >
                <div className="flex items-center gap-2">
                  <motion.span 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-lg"
                  >
                    🎯
                  </motion.span>
                  <span className="text-xs text-slate-300">
                    {state.currentQuestionIndex < 3 
                      ? "Start strong! Each answer builds your profile."
                      : state.currentQuestionIndex < 9 
                      ? "Great momentum! Keep going to unlock insights."
                      : state.currentQuestionIndex < 15 
                      ? "Halfway there! Your unicorn potential is emerging!"
                      : "Almost done! Legendary status awaits!"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-amber-400">🦄</span>
                  <span className="text-amber-300 font-medium">
                    {state.currentQuestionIndex < 5 ? "Novice → Legend" : state.currentQuestionIndex < 12 ? "Building → Expert" : "Expert → Legend"}
                  </span>
                </div>
              </motion.div>
            </div>
            
            <Card className={`border-2 ${state.isAspirational ? 'border-violet-500/50 bg-violet-900/20' : 'border-green-500/50 bg-green-900/20'}`}>
              <CardContent className="p-8">
                <motion.div
                  key={state.currentQuestionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="text-2xl">{STAKEHOLDERS.find(s => s.id === state.stakeholder)?.emoji}</span>
                      <span>{state.stakeholder}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40"
                        animate={{ scale: state.isAspirational ? 0.9 : [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: state.isAspirational ? 0 : Infinity }}
                      >
                        <span className="text-sm">📍</span>
                        <span className="text-xs font-semibold text-green-300">{getLevelDisplayName(state.currentLevel)}</span>
                      </motion.div>
                      <motion.span 
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-slate-500"
                      >→</motion.span>
                      <motion.div 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/40"
                        animate={{ scale: state.isAspirational ? [1, 1.05, 1] : 0.9 }}
                        transition={{ duration: 2, repeat: state.isAspirational ? Infinity : 0 }}
                      >
                        <span className="text-sm">🚀</span>
                        <span className="text-xs font-semibold text-violet-300">{getLevelDisplayName(state.aspirationalLevel)}</span>
                      </motion.div>
                    </div>
                  </div>
                  
                  {currentQuestion.category === "EiR (Elephants in the Room)" && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-center gap-4 py-2">
                        <motion.span 
                          animate={{ x: [0, 20, 0], y: [0, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="text-3xl opacity-60"
                          title="Walking Elephant"
                        >🐘</motion.span>
                        <motion.span 
                          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-3xl opacity-70"
                          title="Jumping Elephant"
                        >🐘</motion.span>
                        <motion.span 
                          animate={{ y: [0, -25, -20, -25, 0], x: [0, 10, 20, 30, 40] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="text-3xl opacity-80"
                          title="Flying Elephant"
                        >🐘</motion.span>
                        <motion.span 
                          animate={{ y: [0, 5, 0, 5, 0], scale: [1, 0.95, 1, 0.95, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-3xl opacity-60"
                          title="Swimming Elephant"
                        >🐘</motion.span>
                      </div>
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-xs text-amber-400/80 italic"
                      >
                        These are the Elephants in the Room (EiRs) and out there in the market too!
                      </motion.p>
                    </motion.div>
                  )}
                  
                  {currentQuestion.category === "Dimension" && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-center gap-6 py-2">
                        <motion.div
                          animate={{ rotate: [0, 45, 0, -45, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-2xl"
                          title="Lightsaber"
                        >
                          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">⚔️</span>
                        </motion.div>
                        <motion.div
                          animate={{ 
                            x: [0, 30, 0],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                          className="text-xl text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                          title="Laser Beam"
                        >━━━●</motion.div>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="text-2xl drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                          title="Hologram"
                        >🌀</motion.div>
                        <motion.div
                          animate={{ 
                            boxShadow: [
                              "0 0 5px rgba(34,211,238,0.5)",
                              "0 0 20px rgba(34,211,238,0.8)",
                              "0 0 5px rgba(34,211,238,0.5)"
                            ]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-2xl rounded-full"
                          title="Energy Field"
                        >⭐</motion.div>
                      </div>
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-xs text-cyan-400/80 italic"
                      >
                        Explore the dimensions all over the world, Galaxy, Universe, Multiverse ...
                      </motion.p>
                    </motion.div>
                  )}
                  
                  <div className="space-y-2">
                    <p className={`text-sm ${state.isAspirational ? 'text-violet-400' : 'text-green-400'} font-medium`}>Select the option that best describes you:</p>
                    <h3 className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                      {questionText}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full">
                    {(() => {
                      const jumbledOptions = getJumbledOptions(activeLevel, currentQuestion.code, state.stakeholder || '');
                      const isEiR = currentQuestion.category === "EiR (Elephants in the Room)";
                      const isDimension = currentQuestion.category === "Dimension";
                      const themeColors = isEiR 
                        ? { primary: "rgba(217, 119, 6, 0.6)", secondary: "rgba(180, 83, 9, 0.4)" }
                        : isDimension 
                        ? { primary: "rgba(34, 211, 238, 0.6)", secondary: "rgba(6, 182, 212, 0.4)" }
                        : { primary: "rgba(139, 92, 246, 0.6)", secondary: "rgba(124, 58, 237, 0.4)" };
                      
                      return jumbledOptions.map((option, index) => (
                        <motion.button
                          key={option.label}
                          initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: -15 }}
                          animate={showClickHint && currentAnswer === undefined ? {
                            opacity: 1,
                            y: [0, -12, 2, -8, 0],
                            scale: [1, 1.08, 0.98, 1.04, 1],
                            rotateX: [0, 5, -3, 2, 0],
                            boxShadow: [
                              `0 0 0 ${themeColors.primary.replace('0.6', '0')}`,
                              `0 0 40px ${themeColors.primary}`,
                              `0 8px 25px ${themeColors.secondary}`,
                              `0 0 35px ${themeColors.primary}`,
                              `0 0 0 ${themeColors.primary.replace('0.6', '0')}`
                            ]
                          } : { opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                          whileHover={{ scale: 1.06, y: -6, boxShadow: `0 12px 40px ${themeColors.primary}` }}
                          whileTap={{ scale: 0.94 }}
                          transition={showClickHint && currentAnswer === undefined ? {
                            duration: 2.5,
                            repeat: Infinity,
                            delay: index * 0.2,
                            ease: "easeInOut"
                          } : { 
                            duration: 0.5, 
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 280,
                            damping: 18
                          }}
                          onClick={() => handleAnswer(option.actualGrade)}
                          className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                            !isAdvancing && currentAnswer === option.actualGrade
                              ? `${option.color} border-white text-white shadow-lg shadow-violet-500/30`
                              : `border-slate-600 bg-slate-800/80 hover:${option.borderColor} hover:bg-slate-700/80`
                          }`}
                          data-testid={`button-option-${option.label}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center ${
                              !isAdvancing && currentAnswer === option.actualGrade 
                                ? "bg-white/20" 
                                : `${option.color} text-white`
                            }`}>
                              {option.label}
                            </span>
                          </div>
                          <span className={`text-sm leading-snug ${
                            !isAdvancing && currentAnswer === option.actualGrade ? "text-white" : "text-slate-300"
                          }`}>
                            {option.description}
                          </span>
                        </motion.button>
                      ));
                    })()}
                  </div>
                  
                  {/* Click hint for first few questions */}
                  <AnimatePresence>
                    {showClickHint && currentAnswer === undefined && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mt-4 space-y-2"
                      >
                        <motion.div 
                          className={`flex items-center justify-center gap-3 ${state.isAspirational ? 'text-violet-400' : 'text-green-400'} text-sm`}
                          animate={{ 
                            scale: [1, 1.02, 1],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <motion.span
                            animate={{ y: [0, -6, 0], rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-xl"
                          >
                            👆
                          </motion.span>
                          <span className="font-medium">Tap any card above to reveal your path!</span>
                          <motion.span
                            animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                            className="text-xl"
                          >
                            👆
                          </motion.span>
                        </motion.div>
                        <motion.p 
                          className="text-center text-xs text-slate-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                        >
                          Each choice shapes your journey from Novice to Legend ✨
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex justify-between items-center w-full">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={state.currentQuestionIndex === 0 || isAdvancing}
                      data-testid="button-prev-question"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to the previous question</TooltipContent>
                </Tooltip>
                
                <div className="text-sm text-slate-400 text-center">
                  {isAdvancing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Advancing...
                    </span>
                  ) : currentAnswer !== undefined ? (
                    "Auto-advancing in a moment..."
                  ) : (
                    "Select a confidence level above"
                  )}
                </div>
                
                <div className="w-[100px]"></div>
              </div>
              
              {/* Subtle Skip button below - only show for non-final questions */}
              {state.currentQuestionIndex < questions.length - 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={nextQuestion}
                      disabled={isAdvancing}
                      className="text-xs text-slate-500 hover:text-slate-400 transition-colors underline-offset-2 hover:underline"
                      data-testid="button-skip-question"
                    >
                      Skip, if you wish!
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Skip this question and move on</TooltipContent>
                </Tooltip>
              )}
            </div>
          </motion.div>
        )}
        
        {/* STEP 6: Results */}
        {step === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <span className="text-8xl block mb-4">{bothCompleted ? "🦄" : "🎉"}</span>
              <h2 className="text-4xl font-heading font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                {bothCompleted ? "Journey Analysis Completed!" : "Assessment Completed!"}
              </h2>
              
              {/* Magic Link & Access Code */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/15 via-amber-500/10 to-violet-500/15 border border-violet-500/40 max-w-lg mx-auto space-y-4">
                {/* Magic Link */}
                <div>
                  <p className="text-xs text-violet-400 font-semibold mb-2">🔗 Your Magic Link</p>
                  <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-violet-500/20 overflow-hidden">
                    <p className="text-sm font-mono text-violet-300 truncate select-all">{`${window.location.origin}/m/${sessionId}`}</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/m/${sessionId}`);
                        toast({ title: "Link Copied!", description: "Your magic link is ready to use anywhere" });
                      }}
                      className="text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      data-testid="button-copy-magic-link"
                    >
                      📋 Copy Link
                    </button>
                  </div>
                </div>

                {/* Display Name */}
                {fancyName && (
                  <div className="pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-cyan-400 font-semibold mb-2">👤 Your Display Name</p>
                    <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-cyan-500/20">
                      <p className="text-lg font-bold text-white text-center">{fancyName}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(fancyName);
                          toast({ title: "Name Copied!", description: "Use any word from your name to login" });
                        }}
                        className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        data-testid="button-copy-display-name"
                      >
                        📋 Copy Name
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Use any word from this name to login from other devices
                    </p>
                  </div>
                )}

                {/* Account Created Timestamp */}
                {completionTimestamp && (
                  <div className="pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 font-semibold mb-1">📅 Account Created</p>
                    <p className="text-xs text-amber-300 font-mono">{completionTimestamp} UTC</p>
                    <p className="text-xs text-slate-500">({new Date(completionTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} local)</p>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 pt-2">
                  💡 Save these! Use the link or your display name to access your account from any device.
                </p>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className="border-cyan-500/30 bg-cyan-500/10 cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-500/20 transition-all group"
                      onClick={() => setShowRankDrilldown(true)}
                      data-testid="card-rank"
                    >
                      <CardContent className="p-4 text-center relative">
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">Click to drill down</span>
                        </div>
                        <span className="text-3xl block mb-1">🏆</span>
                        <div className="text-2xl font-bold text-cyan-400">#42</div>
                        <div className="text-xs text-slate-400">Your Rank</div>
                        <div className="text-xs text-cyan-400/70 mt-1">{getLevelDisplayName(state.currentLevel)}</div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-52">
                    <p>Your position on the leaderboard. Rankings update as you progress through L0 (Spark) to L8 (Masters/Jedi). Click to see 5 ranks above & below you!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className={`cursor-pointer transition-all group ${
                        totalGleams >= 100 
                          ? "border-violet-500/30 bg-violet-500/10 hover:border-violet-400/50 hover:bg-violet-500/20" 
                          : "border-amber-500/30 bg-amber-500/10 hover:border-amber-400/50 hover:bg-amber-500/20"
                      }`}
                      onClick={() => setShowScoreDrilldown(true)}
                      data-testid="card-alicorns"
                    >
                      <CardContent className="p-4 text-center relative">
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className={`text-[10px] ${totalGleams >= 100 ? "text-violet-400 bg-violet-500/20" : "text-amber-400 bg-amber-500/20"} px-1.5 py-0.5 rounded`}>Click to drill down</span>
                        </div>
                        <span className="text-3xl block mb-1">{totalGleams >= 100 ? ALICORN_SYMBOL : GLEAM_SYMBOL}</span>
                        <div className={`text-2xl font-bold ${totalGleams >= 100 ? "text-violet-400" : "text-amber-400"}`}>
                          {totalGleams >= 100 
                            ? gleamsToAlicorns(totalGleams).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : totalGleams.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">{totalGleams >= 100 ? "Alicorns" : "Gleams"}</div>
                        <div className={`text-xs mt-1 ${totalGleams >= 100 ? "text-violet-400/70" : "text-amber-400/70"}`}>
                          {totalGleams >= 100 ? `(${totalGleams.toLocaleString()} Gleams)` : "Earn 100 for 1 Alicorn!"}
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-52">
                    <p>{totalGleams >= 100 
                      ? "Alicorns are achievement tokens earned at L1+. 100 Gleams = 1 Alicorn. Click to see your Alicorn breakdown by level!"
                      : "Gleams are points earned per question. Collect 100 Gleams to earn your first Alicorn! Click for details."}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Charts Section - At Top */}
            <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-emerald-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-cyan-400">
                  <BarChart2 className="h-5 w-5" />
                  Your Assessment Charts
                  <span className="text-[10px] text-slate-400 font-normal">(Click charts to expand)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Level Radar Chart */}
                  <div 
                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 cursor-pointer hover:border-green-400/50 hover:bg-green-500/20 transition-all group"
                    onClick={() => setShowCurrentChartDrilldown(true)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-semibold text-sm">Current: {getLevelDisplayName(state.currentLevel)}</span>
                      </div>
                      <span className="text-[10px] text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Expand</span>
                    </div>
                    {Object.keys(state.answers[`${state.currentLevel}_cur`] || {}).length > 0 ? (
                      <SimpleRadarChart 
                        data={Object.entries(state.answers[`${state.currentLevel}_cur`] || {}).map(([code, score]) => ({
                          subject: code,
                          A: score as number,
                          fullMark: 5
                        }))} 
                        color="#22c55e" 
                      />
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-slate-400 text-xs">Complete assessment to see chart</p>
                        <SimpleRadarChart 
                          data={[
                            { subject: "P1", A: 4, fullMark: 5 },
                            { subject: "P2", A: 3, fullMark: 5 },
                            { subject: "P3", A: 5, fullMark: 5 },
                            { subject: "P4", A: 2, fullMark: 5 },
                            { subject: "P5", A: 4, fullMark: 5 },
                          ]} 
                          color="#22c55e" 
                        />
                        <p className="text-green-400/50 text-[10px] italic">Sample data</p>
                      </div>
                    )}
                  </div>

                  {/* Aspirational Level Radar Chart */}
                  <div 
                    className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 cursor-pointer hover:border-violet-400/50 hover:bg-violet-500/20 transition-all group"
                    onClick={() => {
                      const hasAspirationalData = Object.keys(state.answers[`${state.aspirationalLevel}_asp`] || {}).length > 0;
                      if (hasAspirationalData) {
                        setShowAspirationalChartDrilldown(true);
                      } else {
                        setShowStartAspirationalModal(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-violet-400" />
                        <span className="text-violet-400 font-semibold text-sm">Aspirational: {getLevelDisplayName(state.aspirationalLevel)}</span>
                      </div>
                      <span className="text-[10px] text-violet-400 bg-violet-500/20 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {Object.keys(state.answers[`${state.aspirationalLevel}_asp`] || {}).length > 0 ? "Expand" : "Start Assessment"}
                      </span>
                    </div>
                    {Object.keys(state.answers[`${state.aspirationalLevel}_asp`] || {}).length > 0 ? (
                      <SimpleRadarChart 
                        data={Object.entries(state.answers[`${state.aspirationalLevel}_asp`] || {}).map(([code, score]) => ({
                          subject: code,
                          A: score as number,
                          fullMark: 5
                        }))} 
                        color="#8b5cf6" 
                      />
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-slate-400 text-xs">Complete aspirational assessment</p>
                        <SimpleRadarChart 
                          data={[
                            { subject: "P1", A: 5, fullMark: 5 },
                            { subject: "P2", A: 4, fullMark: 5 },
                            { subject: "P3", A: 5, fullMark: 5 },
                            { subject: "P4", A: 4, fullMark: 5 },
                            { subject: "P5", A: 5, fullMark: 5 },
                          ]} 
                          color="#8b5cf6" 
                        />
                        <p className="text-violet-400/50 text-[10px] italic">Sample data</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {bothCompleted ? (
              <Card 
                className="border-2 border-violet-500/50 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 cursor-pointer hover:border-violet-400/70 transition-all group"
                onClick={() => setShowGapDrilldown(true)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Gap Analysis
                    <Rocket className="h-5 w-5 text-violet-400" />
                    <span className="text-[10px] text-slate-400 font-normal opacity-0 group-hover:opacity-100 transition-opacity">(Click for details)</span>
                  </CardTitle>
                  <CardDescription>Your potential value journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-green-500/10 border-2 border-green-500/50">
                      <div className="text-sm text-green-300 mb-1 font-medium">Current Reality</div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 mb-2">
                        {getLevelDisplayName(state.currentLevel)}
                      </Badge>
                      <div className="text-xs text-slate-500 mb-1">{getQuestionsForLevel(state.currentLevel)?.levelFocus}</div>
                      <div className="text-2xl font-bold text-green-400">
                        {state.currentLevel === "L0" ? GLEAM_SYMBOL : ALICORN_SYMBOL} {state.currentLevel === "L0" 
                          ? formatGleams(calculateGleams(currentAnswers, state.currentLevel))
                          : gleamsToAlicorns(calculateGleams(currentAnswers, state.currentLevel))}
                      </div>
                      <div className="text-xs text-green-400/70">{state.currentLevel === "L0" ? "Gleams" : "Alicorns"}</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-violet-500/10 border-2 border-violet-500/50">
                      <div className="text-sm text-violet-300 mb-1 font-medium">Aspiration</div>
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 mb-2">
                        {getLevelDisplayName(state.aspirationalLevel)}
                      </Badge>
                      <div className="text-xs text-slate-500 mb-1">{getQuestionsForLevel(state.aspirationalLevel)?.levelFocus}</div>
                      <div className="text-2xl font-bold text-violet-400">
                        {ALICORN_SYMBOL} {gleamsToAlicorns(calculateGleams(aspirationalAnswers, state.aspirationalLevel))}
                      </div>
                      <div className="text-xs text-violet-400/70">Alicorns</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-6 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ALICORN_SYMBOL}</span>
                      <span className="text-xl font-bold text-violet-400">{gleamsToAlicorns(totalGleams)}</span>
                      <span className="text-sm text-slate-400">Alicorns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-yellow-400">{GLEAM_SYMBOL}</span>
                      <span className="text-xl font-bold text-yellow-400">{totalGleams.toLocaleString()}</span>
                      <span className="text-sm text-slate-400">Gleams</span>
                    </div>
                  </div>
                  
                  <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${aspirationalScore}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full"
                      style={{ clipPath: `inset(0 0 0 ${currentScore}%)` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0 Gleams</span>
                    <span>Max Gleams</span>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Stakeholder:</span>
                      <span className="font-semibold flex items-center gap-2">
                        {STAKEHOLDERS.find(s => s.id === state.stakeholder)?.emoji} {state.stakeholder}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Journey:</span>
                      <span className="font-semibold">
                        {getQuestionsForLevel(state.currentLevel)?.levelName} → {getQuestionsForLevel(state.aspirationalLevel)?.levelName}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-600 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Check className="h-5 w-5 text-green-400" />
                    {state.isAspirational ? "Aspirational Assessment" : "Current Reality Assessment"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Stakeholder:</span>
                    <span className="font-semibold flex items-center gap-2">
                      {STAKEHOLDERS.find(s => s.id === state.stakeholder)?.emoji} {state.stakeholder}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Level Assessed:</span>
                    <Badge className={`bg-gradient-to-r ${levelTheme.gradient}`}>
                      {getLevelDisplayName(activeLevel)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{activeLevel === "L0" ? "Gleams" : "Alicorns"} Earned:</span>
                    <span className="text-2xl font-bold text-green-400">
                      {activeLevel === "L0" ? GLEAM_SYMBOL : ALICORN_SYMBOL} {activeLevel === "L0" 
                        ? formatGleams(calculateGleams(levelAnswers, activeLevel))
                        : gleamsToAlicorns(calculateGleams(levelAnswers, activeLevel))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What's Next? Section - Clear Navigation Options */}
            {state.currentCompleted && !state.aspirationalCompleted && (
              <Card className="border-2 border-violet-500/50 bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-purple-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-violet-400">
                    <Rocket className="h-5 w-5" />
                    What's Next?
                    <ArrowRight className="h-5 w-5" />
                  </CardTitle>
                  <CardDescription className="text-center">
                    Choose your next step in the Value Journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Continue to Next Level */}
                  {currentLevelIndex < LEVELS.length - 1 && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className="w-full h-auto py-4 bg-gradient-to-r from-green-500 to-emerald-500 flex flex-col items-center gap-1"
                        onClick={() => {
                          const nextLevel = LEVELS[currentLevelIndex + 1];
                          setState(prev => ({
                            ...prev,
                            currentLevel: nextLevel.level,
                            aspirationalLevel: LEVELS[Math.min(currentLevelIndex + 2, LEVELS.length - 1)]?.level || nextLevel.level,
                            isAspirational: false,
                            currentQuestionIndex: 0,
                            currentCompleted: false,
                            startTime: Date.now()
                          }));
                          setElapsedTime(0);
                          setStep("assessment");
                        }}
                        data-testid="button-next-level"
                      >
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-bold">Continue to {getLevelDisplayName(LEVELS[currentLevelIndex + 1]?.level)}</span>
                        <span className="text-xs opacity-80">{LEVELS[currentLevelIndex + 1]?.levelName}</span>
                      </Button>
                    </motion.div>
                  )}
                  
                  {/* Set Aspirational Level */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 border-violet-500/50 text-violet-400 hover:bg-violet-500/20 flex flex-col items-center gap-1"
                      onClick={() => setStep("aspirational_level")}
                      data-testid="button-set-aspirational"
                    >
                      <Target className="h-5 w-5" />
                      <span className="font-bold">Set Aspirational Goal</span>
                      <span className="text-xs opacity-80">Choose your target level</span>
                    </Button>
                  </motion.div>
                  
                  {/* Take Aspirational Assessment */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full h-auto py-4 bg-gradient-to-r from-violet-500 to-purple-500 flex flex-col items-center gap-1"
                      onClick={continueToAspirational}
                      data-testid="button-aspirational-assessment"
                    >
                      <Star className="h-5 w-5" />
                      <span className="font-bold">Aspirational Assessment</span>
                      <span className="text-xs opacity-80">{getLevelDisplayName(state.aspirationalLevel)}: {getQuestionsForLevel(state.aspirationalLevel)?.levelName}</span>
                    </Button>
                  </motion.div>
                </CardContent>
                
                {/* Subtle stakeholder change link */}
                <div className="px-6 pb-4 text-center">
                  <button
                    onClick={() => setStep("stakeholder")}
                    className="text-xs text-slate-500 hover:text-slate-400 underline-offset-2 hover:underline transition-colors"
                    data-testid="link-change-stakeholder"
                  >
                    Change stakeholder type ({state.stakeholder})
                  </button>
                </div>
              </Card>
            )}

            {/* Earlier Levels Section - Boost Your Score */}
            {earlierLevels.length > 0 && state.currentCompleted && (
              <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-cyan-400">
                    <Rocket className="h-5 w-5" />
                    Boost Your Foundation Score!
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                  </CardTitle>
                  <CardDescription className="text-center">
                    Complete earlier level assessments to strengthen your foundations and earn more points
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {earlierLevelScores.map((level) => (
                      <div 
                        key={level.level}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          level.completed 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-slate-800/50 border-slate-600 hover:border-cyan-500/50 transition-colors'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={level.completed ? 'bg-green-500' : 'bg-slate-600'}>
                            {getLevelDisplayName(level.level)}
                          </Badge>
                          <span className="font-medium">{level.levelName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {level.completed ? (
                            <>
                              <span className="text-green-400 font-bold">
                                {level.level === "L0" ? GLEAM_SYMBOL : ALICORN_SYMBOL} {level.level === "L0" 
                                  ? formatGleams(level.gleams) 
                                  : gleamsToAlicorns(level.gleams)}
                              </span>
                              <Check className="h-5 w-5 text-green-400" />
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-cyan-500 to-blue-500"
                              onClick={() => startEarlierLevelAssessment(level.level)}
                              data-testid={`button-take-earlier-${level.level}`}
                            >
                              Take Assessment
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-600 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Current Level:</span>
                      <span className="font-bold text-green-400">
                        {state.currentLevel === "L0" ? GLEAM_SYMBOL : ALICORN_SYMBOL} {state.currentLevel === "L0" 
                          ? formatGleams(calculateGleams(currentAnswers, state.currentLevel))
                          : gleamsToAlicorns(calculateGleams(currentAnswers, state.currentLevel))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Earlier Levels Completed:</span>
                      <span className="font-semibold">{completedEarlierLevels.length} / {earlierLevels.length}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-600 pt-2 mt-2">
                      <span className="text-slate-300 font-medium">Total Alicorns:</span>
                      <span className="text-2xl font-bold text-violet-400">{ALICORN_SYMBOL} {gleamsToAlicorns(totalGleams)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration & Share Section - PROMINENT */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(236, 72, 153, 0)",
                  "0 0 30px 10px rgba(236, 72, 153, 0.3)",
                  "0 0 0 0 rgba(236, 72, 153, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Card className="border-2 border-pink-500/50 bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-orange-500/20">
                <CardHeader className="pb-2">
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-center"
                  >
                    <span className="text-4xl">🚀</span>
                  </motion.div>
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl text-pink-400">
                    <Share2 className="h-6 w-6" />
                    Share, Invite, Challenge...
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </CardTitle>
                  <CardDescription className="text-center text-base">
                    {isRegistered 
                      ? "🎉 You're registered! Share your journey and earn rewards for every friend who joins!" 
                      : "🔥 Register now to get your personal referral link and start earning!"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Registration Form (if not registered) */}
                {!isRegistered && !showRegistration && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                    <div className="text-center mb-3">
                      <UserPlus className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">
                        Register with i2u.ai to unlock your <span className="text-yellow-400 font-bold">personal referral link</span>
                      </p>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
                      onClick={() => setShowRegistration(true)}
                      data-testid="button-show-registration"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register Now
                    </Button>
                  </div>
                )}
                
                {showRegistration && !isRegistered && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-600 space-y-4"
                  >
                    <h4 className="font-semibold text-center flex items-center justify-center gap-2">
                      <UserPlus className="h-5 w-5 text-violet-400" />
                      Register with i2u.ai
                    </h4>
                    <p className="text-sm text-slate-400 text-center">
                      Sign in to get your personal referral link and start earning rewards!
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500"
                        onClick={handleRegister}
                        data-testid="button-register"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In & Get Referral Link
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowRegistration(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {/* Referral Link Display (if registered) */}
                {isRegistered && referralCode && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Your Referral Link:</span>
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-slate-800 px-2 py-1 rounded truncate">
                        {getReferralUrl()}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyShareLink}
                        data-testid="button-copy-link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Promo Message */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-400">
                      <Trophy className="h-5 w-5" />
                      🎁 Share & Win Big! 🎁
                      <Trophy className="h-5 w-5" />
                    </div>
                    <p className="text-slate-200">
                      Invite friends to take the Value Journey Quest and <span className="text-yellow-400 font-bold">earn +100 Gleams</span> for each referral!
                    </p>
                    <p className="text-sm text-pink-400 font-semibold">
                      Top referrers win exclusive prizes from i2u.ai! 🏆
                    </p>
                  </div>
                </div>
                
                {/* Enhanced Share Button */}
                <div className="space-y-3">
                  <p className="text-center text-slate-400 text-sm">Share with your network:</p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white h-16 text-lg font-bold shadow-lg shadow-violet-500/30"
                      onClick={() => setShowEnhancedShareModal(true)}
                      data-testid="button-enhanced-share"
                    >
                      <Share2 className="h-6 w-6 mr-3" />
                      Share & Gift Bonus Gleams
                    </Button>
                  </motion.div>
                  <p className="text-center text-xs text-yellow-400">
                    🎁 Gift Gleams to friends • 🔥 Earn 2x back when they join!
                  </p>
                  
                  {/* Quick Share Buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-slate-700"
                      onClick={shareOnX}
                      data-testid="button-share-x"
                    >
                      <span className="text-lg">𝕏</span>
                      <span className="text-[10px] text-slate-400">X</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-blue-600/20"
                      onClick={shareOnLinkedIn}
                      data-testid="button-share-linkedin"
                    >
                      <span className="text-lg font-bold text-blue-500">in</span>
                      <span className="text-[10px] text-slate-400">LinkedIn</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-green-600/20"
                      onClick={shareOnWhatsApp}
                      data-testid="button-share-whatsapp"
                    >
                      <MessageCircle className="h-5 w-5 text-green-400" />
                      <span className="text-[10px] text-slate-400">WhatsApp</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-violet-600/20"
                      onClick={copyShareLink}
                      data-testid="button-copy-share"
                    >
                      <Copy className="h-5 w-5 text-violet-400" />
                      <span className="text-[10px] text-slate-400">Copy</span>
                    </Button>
                  </div>
                </div>
                
                {/* Your Referral Stats */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="text-sm text-slate-400">Your Referral Link</p>
                        <p className="text-emerald-400 font-semibold">{isRegistered ? "Active & Ready!" : "Register to Activate"}</p>
                      </div>
                    </div>
                    {isRegistered && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Potential Earnings</p>
                        <p className="text-xl font-bold text-yellow-400">∞ Gleams</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
            
            {/* Comprehensive Assessment Profile with Multiple Charts */}
            <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-emerald-500/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-cyan-400">
                  <Target className="h-5 w-5" />
                  Your Assessment Profile
                  <BarChart2 className="h-5 w-5" />
                </CardTitle>
                <CardDescription className="text-center">
                  Comprehensive view of your assessment journey with shareable charts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Level Radar Chart */}
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    💡 <span className="italic">Your current self-assessment shows where you stand today</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">Current Level: {getLevelDisplayName(state.currentLevel)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-400 hover:bg-green-500/20 h-8 px-3"
                      onClick={() => {
                        const text = `🎯 My ${getLevelDisplayName(state.currentLevel)} Assessment Profile on Value Journey Quest!\n\n${GLEAM_SYMBOL} ${formatGleams(calculateGleams(state.answers[`${state.currentLevel}_cur`] || {}, state.currentLevel))} Gleams earned!\n\n🔥 Think you can beat my score? Take the challenge!\n\n${getReferralUrl()}`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Copied!", description: "Current level chart with referral link copied!" });
                      }}
                      data-testid="button-share-current-chart"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Share
                    </Button>
                  </div>
                  {Object.keys(state.answers[`${state.currentLevel}_cur`] || {}).length > 0 ? (
                    <SimpleRadarChart 
                      data={Object.entries(state.answers[`${state.currentLevel}_cur`] || {}).map(([code, score]) => ({
                        subject: code,
                        A: score as number,
                        fullMark: 5
                      }))} 
                      color="#22c55e" 
                    />
                  ) : (
                    <div className="text-center py-6">
                      <Target className="h-10 w-10 mx-auto mb-2 text-green-400/30" />
                      <p className="text-slate-400 text-sm">Complete your assessment to see your chart</p>
                      <p className="text-green-400 text-xs mt-1">Sample data shown for illustration</p>
                      <SimpleRadarChart 
                        data={[
                          { subject: "P1", A: 4, fullMark: 5 },
                          { subject: "P2", A: 3, fullMark: 5 },
                          { subject: "P3", A: 5, fullMark: 5 },
                          { subject: "P4", A: 2, fullMark: 5 },
                          { subject: "P5", A: 4, fullMark: 5 },
                        ]} 
                        color="#22c55e" 
                      />
                    </div>
                  )}
                </div>

                {/* Aspirational Level Radar Chart */}
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    💡 <span className="italic">Your aspirational view shows where you want to be - the gap reveals growth opportunities</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-violet-400" />
                      <span className="text-violet-400 font-semibold">Aspirational: {getLevelDisplayName(state.aspirationalLevel)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-violet-400 hover:bg-violet-500/20 h-8 px-3"
                      onClick={() => {
                        const text = `🚀 My Aspirational ${getLevelDisplayName(state.aspirationalLevel)} Profile on Value Journey Quest!\n\n${ALICORN_SYMBOL} Aiming for ${gleamsToAlicorns(calculateGleams(state.answers[`${state.aspirationalLevel}_asp`] || {}, state.aspirationalLevel))} Alicorns!\n\n💪 Join me on the journey to unicorn status!\n\n${getReferralUrl()}`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Copied!", description: "Aspirational chart with referral link copied!" });
                      }}
                      data-testid="button-share-aspirational-chart"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Share
                    </Button>
                  </div>
                  {Object.keys(state.answers[`${state.aspirationalLevel}_asp`] || {}).length > 0 ? (
                    <SimpleRadarChart 
                      data={Object.entries(state.answers[`${state.aspirationalLevel}_asp`] || {}).map(([code, score]) => ({
                        subject: code,
                        A: score as number,
                        fullMark: 5
                      }))} 
                      color="#8b5cf6" 
                    />
                  ) : (
                    <div className="text-center py-6">
                      <Rocket className="h-10 w-10 mx-auto mb-2 text-violet-400/30" />
                      <p className="text-slate-400 text-sm">Complete aspirational assessment to unlock</p>
                      <p className="text-violet-400 text-xs mt-1">Sample aspirational data shown</p>
                      <SimpleRadarChart 
                        data={[
                          { subject: "P1", A: 5, fullMark: 5 },
                          { subject: "P2", A: 4, fullMark: 5 },
                          { subject: "P3", A: 5, fullMark: 5 },
                          { subject: "P4", A: 4, fullMark: 5 },
                          { subject: "P5", A: 5, fullMark: 5 },
                        ]} 
                        color="#8b5cf6" 
                      />
                    </div>
                  )}
                </div>

                {/* Best Performers Till Date - Competitive Section */}
                <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/50">
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    💡 <span className="italic">See how top performers scored - use this as your benchmark to beat!</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      <span className="text-amber-400 font-bold">🏆 Best Performers Till Date</span>
                      <span className="text-[10px] text-slate-500 italic">Illustration</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-amber-400 hover:bg-amber-500/20 h-8 px-3"
                      onClick={() => {
                        const text = `🏆 Can YOU beat the top performers on Value Journey Quest?\n\n🥇 Current Leader: 9,500 Gleams (95 Alicorns)\n🥈 Runner Up: 8,800 Gleams\n🥉 Third Place: 8,200 Gleams\n\n💪 I'm climbing the leaderboard - join me and let's compete!\n\n🎁 Take the challenge now:\n${getReferralUrl()}`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Copied!", description: "Best performers challenge with referral link copied!" });
                      }}
                      data-testid="button-share-best-performers"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Share Challenge
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {[
                      { rank: 1, name: "TechVenture_Alpha", gleams: 9500, level: "L5" },
                      { rank: 2, name: "StartupNinja_Pro", gleams: 8800, level: "L4" },
                      { rank: 3, name: "GrowthHacker_X", gleams: 8200, level: "L4" },
                    ].map((entry, idx) => (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          idx === 0 ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400/50' :
                          idx === 1 ? 'bg-slate-400/10 border border-slate-400/30' :
                          'bg-orange-700/20 border border-orange-700/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                          <div>
                            <span className="font-bold">{entry.name}</span>
                            <Badge className="ml-2 text-[10px]">{entry.level}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">{GLEAM_SYMBOL} {entry.gleams.toLocaleString()}</div>
                          <div className="text-violet-400 text-xs">{ALICORN_SYMBOL} {(entry.gleams / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Competitive Promo Message */}
                  <motion.div
                    animate={{ 
                      boxShadow: ["0 0 0 0 rgba(251, 191, 36, 0)", "0 0 20px 5px rgba(251, 191, 36, 0.3)", "0 0 0 0 rgba(251, 191, 36, 0)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-yellow-500/50"
                  >
                    <div className="text-center space-y-2">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-3xl"
                      >
                        🔥
                      </motion.div>
                      <p className="text-lg font-bold text-yellow-400">
                        You can easily beat the present toppers!
                      </p>
                      <p className="text-slate-300 text-sm">
                        The leaderboard is waiting for a champion like you. Take the assessment and claim your spot!
                      </p>
                      <p className="text-pink-400 text-xs font-semibold">
                        🎁 Share with friends - you BOTH earn +100 Gleams for each referral!
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Current Updates Section */}
                <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    💡 <span className="italic">Stay updated with platform news - share to help friends discover the quest!</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      <span className="text-pink-400 font-semibold">🆕 Current Updates</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-pink-400 hover:bg-pink-500/20 h-8 px-3"
                      onClick={() => {
                        const text = `🚀 Exciting updates on Value Journey Quest!\n\n✨ New: L0-L8 assessments now live\n🏆 500+ founders already on the leaderboard\n🎁 Earn +100 Gleams for every friend you invite\n💎 Top referrers win exclusive prizes!\n\n👉 Join the quest now:\n${getReferralUrl()}`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Copied!", description: "Updates with referral link copied!" });
                      }}
                      data-testid="button-share-updates"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Share
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                      <span className="text-green-400">✅</span>
                      <span className="text-sm">L0 (Spark) to L8 (Masters/Jedi) assessments now live!</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                      <span className="text-yellow-400">🏆</span>
                      <span className="text-sm">500+ founders already climbing the leaderboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                      <span className="text-pink-400">🎁</span>
                      <span className="text-sm">Referral rewards: +100 Gleams per friend invited!</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                      <span className="text-violet-400">💎</span>
                      <span className="text-sm">Top referrers win exclusive i2u.ai prizes</span>
                    </div>
                  </div>
                </div>

                {/* Master Share All Button */}
                <div className="text-xs text-slate-500 mb-2 flex items-center justify-center gap-1">
                  💡 <span className="italic">Share your complete profile + challenge friends - you both earn rewards!</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-teal-500"
                    onClick={() => {
                      const hasData = Object.keys(state.answers[`${state.currentLevel}_cur`] || {}).length > 0;
                      const gleams = hasData ? calculateGleams(state.answers[`${state.currentLevel}_cur`] || {}, state.currentLevel) : 0;
                      const text = `🦄 My Value Journey Quest Progress!\n\n📊 Level: ${getLevelDisplayName(state.currentLevel)}\n${GLEAM_SYMBOL} Gleams: ${formatGleams(gleams)}\n${ALICORN_SYMBOL} Alicorns: ${gleamsToAlicorns(gleams)}\n\n🔥 The current toppers have ~9,500 Gleams - I'm coming for that #1 spot!\n\n💪 Think you can beat me? Join the challenge:\n${getReferralUrl()}\n\n🎁 We BOTH earn +100 Gleams when you sign up!`;
                      navigator.clipboard.writeText(text);
                      toast({ title: "Copied!", description: "Full profile with competitive challenge copied!" });
                    }}
                    data-testid="button-share-all"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Full Profile + Challenge
                  </Button>
                  <Button
                    variant="outline"
                    className="border-pink-500/50 text-pink-400"
                    onClick={() => {
                      const text = `🔥 Can you beat the top performers on Value Journey Quest?\n\n🥇 Leader: 9,500 Gleams\n\n💪 I'm climbing - join me!\n${getReferralUrl()}`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
                    }}
                    data-testid="button-share-x-challenge"
                  >
                    <span className="mr-2">𝕏</span>
                    Share Challenge on X
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-500/50 text-green-400"
                    onClick={() => {
                      const text = `🦄 I'm on the Value Journey Quest earning Gleams & Alicorns! Current toppers have 9,500 Gleams - think you can beat them? Join me: ${getReferralUrl()} 🎁 We both earn +100 Gleams!`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    data-testid="button-share-whatsapp-challenge"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Leaderboard */}
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-amber-400">
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
                <CardDescription className="text-center">
                  Top performers in the Value Journey Quest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboardEntries.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboardEntries.slice(0, 5).map((entry, idx) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          idx === 0 ? 'bg-amber-500/20 border border-amber-500/30' :
                          idx === 1 ? 'bg-slate-400/10 border border-slate-400/30' :
                          idx === 2 ? 'bg-orange-700/20 border border-orange-700/30' :
                          'bg-slate-800/50 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${
                            idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="font-medium">{entry.displayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-violet-400">{ALICORN_SYMBOL} {formatLeaderboardScore(parseFloat(entry.score))}</span>
                          <Badge className="text-xs">{entry.phase ? `L${entry.phase}` : 'L0'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-4">Be the first on the leaderboard!</p>
                )}
                
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
                  onClick={() => setShowLeaderboard(true)}
                  data-testid="button-join-leaderboard"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Join the Leaderboard
                </Button>
              </CardContent>
            </Card>

            {/* Growth Milestone Badges */}
            <Card className="border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/10 to-rose-500/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-fuchsia-400">
                  <Star className="h-5 w-5" />
                  Growth Milestone Badges
                  <Trophy className="h-5 w-5" />
                </CardTitle>
                <CardDescription className="text-center">
                  Collect and share badges as you achieve milestones on your journey!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                  💡 <span className="italic">Earn badges by reaching milestones - share to inspire others and earn bonus Gleams!</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {MILESTONE_BADGES.map((badge, idx) => {
                    const totalGleams = Object.entries(state.answers).reduce((sum, [key, answers]) => {
                      const level = key.split('_')[0];
                      return sum + calculateGleams(answers, level);
                    }, 0);
                    const avgScore = Object.values(state.answers).length > 0 
                      ? Object.values(state.answers).reduce((sum, answers) => sum + calculateLevelScore(answers), 0) / Object.values(state.answers).length
                      : 0;
                    
                    const isUnlocked = 
                      (badge.id === "first_spark" && state.currentCompleted) ||
                      (badge.id === "dual_vision" && state.currentCompleted && state.aspirationalCompleted) ||
                      (badge.id === "level_up" && state.currentLevel !== "L0") ||
                      (badge.id === "gleam_hunter" && totalGleams >= 500) ||
                      (badge.id === "alicorn_rider" && (totalGleams / 100) >= 10) ||
                      (badge.id === "speed_demon" && elapsedTime > 0 && elapsedTime < 300) ||
                      (badge.id === "perfectionist" && avgScore >= 90);
                    
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`relative p-3 rounded-xl border text-center cursor-pointer transition-all ${
                          isUnlocked 
                            ? `bg-gradient-to-br ${badge.gradient} border-white/20 shadow-lg` 
                            : 'bg-slate-800/50 border-slate-700 opacity-60'
                        }`}
                        onClick={() => {
                          if (isUnlocked) {
                            const text = `${badge.shareMessage}\n\n🎁 Join the quest and earn your own badges:\n${getReferralUrl()}`;
                            navigator.clipboard.writeText(text);
                            toast({ title: `${badge.icon} Badge Shared!`, description: `${badge.name} badge copied with referral link!` });
                          } else {
                            toast({ title: "🔒 Badge Locked", description: `${badge.requirement} to unlock this badge!` });
                          }
                        }}
                        data-testid={`badge-${badge.id}`}
                      >
                        {isUnlocked && (
                          <motion.div
                            className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: idx * 0.1 }}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        )}
                        <motion.div 
                          className="text-3xl mb-1"
                          animate={isUnlocked ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.5, repeat: isUnlocked ? 1 : 0 }}
                        >
                          {badge.icon}
                        </motion.div>
                        <div className={`text-xs font-bold mb-0.5 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                          {badge.name}
                        </div>
                        <div className={`text-[10px] ${isUnlocked ? 'text-white/80' : 'text-slate-500'}`}>
                          {isUnlocked ? "Tap to share!" : badge.requirement}
                        </div>
                        {isUnlocked && (
                          <div className="absolute bottom-1 right-1">
                            <Share2 className="h-3 w-3 text-white/60" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 border border-fuchsia-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏅</span>
                      <div>
                        <p className="text-sm font-semibold text-fuchsia-400">
                          {MILESTONE_BADGES.filter(badge => {
                            const totalGleams = Object.entries(state.answers).reduce((sum, [key, answers]) => {
                              const level = key.split('_')[0];
                              return sum + calculateGleams(answers, level);
                            }, 0);
                            const avgScore = Object.values(state.answers).length > 0 
                              ? Object.values(state.answers).reduce((sum, answers) => sum + calculateLevelScore(answers), 0) / Object.values(state.answers).length
                              : 0;
                            return (badge.id === "first_spark" && state.currentCompleted) ||
                              (badge.id === "dual_vision" && state.currentCompleted && state.aspirationalCompleted) ||
                              (badge.id === "level_up" && state.currentLevel !== "L0") ||
                              (badge.id === "gleam_hunter" && totalGleams >= 500) ||
                              (badge.id === "alicorn_rider" && (totalGleams / 100) >= 10) ||
                              (badge.id === "speed_demon" && elapsedTime > 0 && elapsedTime < 300) ||
                              (badge.id === "perfectionist" && avgScore >= 90);
                          }).length} / {MILESTONE_BADGES.length} Badges Unlocked
                        </p>
                        <p className="text-xs text-slate-400">Keep going to collect them all!</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-fuchsia-400 hover:bg-fuchsia-500/20 h-8 px-3"
                      onClick={() => {
                        const unlockedBadges = MILESTONE_BADGES.filter(badge => {
                          const totalGleams = Object.entries(state.answers).reduce((sum, [key, answers]) => {
                            const level = key.split('_')[0];
                            return sum + calculateGleams(answers, level);
                          }, 0);
                          const avgScore = Object.values(state.answers).length > 0 
                            ? Object.values(state.answers).reduce((sum, answers) => sum + calculateLevelScore(answers), 0) / Object.values(state.answers).length
                            : 0;
                          return (badge.id === "first_spark" && state.currentCompleted) ||
                            (badge.id === "dual_vision" && state.currentCompleted && state.aspirationalCompleted) ||
                            (badge.id === "level_up" && state.currentLevel !== "L0") ||
                            (badge.id === "gleam_hunter" && totalGleams >= 500) ||
                            (badge.id === "alicorn_rider" && (totalGleams / 100) >= 10) ||
                            (badge.id === "speed_demon" && elapsedTime > 0 && elapsedTime < 300) ||
                            (badge.id === "perfectionist" && avgScore >= 90);
                        });
                        const badgeIcons = unlockedBadges.map(b => b.icon).join(' ');
                        const text = `🏆 My Value Journey Quest Badge Collection!\n\n${badgeIcons}\n\nI've unlocked ${unlockedBadges.length}/${MILESTONE_BADGES.length} badges!\n\n💪 Can you collect them all? Start your journey:\n${getReferralUrl()}\n\n🎁 We both earn +100 Gleams!`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Badge Collection Shared!", description: "Your badge collection with referral link copied!" });
                      }}
                      data-testid="button-share-all-badges"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Share All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Progress Chart */}
            <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-cyan-500/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-indigo-400">
                  <Target className="h-5 w-5" />
                  Your Journey Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {LEVELS.slice(0, currentLevelIndex + 1).map((level, idx) => {
                    const levelKey = `${level.level}_cur`;
                    const lvlAnswers = state.answers[levelKey] || {};
                    const hasAnswers = Object.keys(lvlAnswers).length > 0;
                    const score = hasAnswers ? calculateLevelScore(lvlAnswers) : 0;
                    const lvlGleams = hasAnswers ? calculateGleams(lvlAnswers, level.level) : 0;
                    const isCurrent = level.level === state.currentLevel;
                    
                    return (
                      <div key={level.level} className="flex items-center gap-3">
                        <Badge className={`w-20 justify-center ${isCurrent ? 'bg-gradient-to-r from-green-500 to-emerald-500' : hasAnswers ? 'bg-slate-600' : 'bg-slate-700'}`}>
                          {getLevelDisplayName(level.level)}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-slate-300">{level.levelName}</span>
                            <span className="text-xs text-slate-500">{level.levelFocus}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(score, 100)}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={`h-full rounded-full ${isCurrent ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-500'}`}
                            />
                          </div>
                        </div>
                        <span className={`text-sm font-bold w-20 text-right ${hasAnswers ? 'text-green-400' : 'text-slate-600'}`}>
                          {hasAnswers ? `${level.level === "L0" ? GLEAM_SYMBOL : ALICORN_SYMBOL} ${level.level === "L0" ? formatGleams(lvlGleams) : gleamsToAlicorns(lvlGleams)}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                  <p className="text-center text-sm">
                    <span className="text-violet-400 font-semibold">🚀 Pro Tip:</span>
                    <span className="text-slate-300"> Complete all foundation levels to maximize your startup readiness score!</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!state.aspirationalCompleted && state.currentCompleted && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                  onClick={continueToAspirational}
                  data-testid="button-continue-aspirational"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Now Assess Your Aspirations
                </Button>
              )}
              {earlierLevels.length > 0 && completedEarlierLevels.length < earlierLevels.length && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                  onClick={() => {
                    const nextIncomplete = earlierLevelScores.find(l => !l.completed);
                    if (nextIncomplete) {
                      startEarlierLevelAssessment(nextIncomplete.level);
                    }
                  }}
                  data-testid="button-continue-foundations"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Complete Foundation Levels ({completedEarlierLevels.length}/{earlierLevels.length})
                </Button>
              )}
              <motion.div
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
                  onClick={resetWizard}
                  data-testid="button-start-new-assessment"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Start New Assessment
                </Button>
              </motion.div>
            </div>
            
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/30">
              <h3 className="text-xl font-bold mb-2">Ready to take the next step?</h3>
              <p className="text-slate-400 mb-4">
                Register at i2u.ai to save your results, unlock AI coaching, and connect with the startup ecosystem!
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-500"
                onClick={() => {
                  const stakeholder = state.stakeholder || "Founder";
                  const roleMap: Record<string, string> = {
                    "Founder": "startup",
                    "Investor": "investor-vc",
                    "Mentor": "mentor-advisor",
                    "Accelerator": "accelerator-incubator",
                    "Service Provider": "service-provider",
                    "Supplier": "suppliers-vendors",
                    "Government": "government-ngo",
                    "Professional": "professional",
                    "Ecosystem Builder": "accelerator-incubator"
                  };
                  const role = encodeURIComponent(roleMap[stakeholder] || "startup");
                  const refParam = referralCode ? referralCode : "valuehub";
                  window.open(`https://i2u.ai/register?ref=${refParam}&role=${role}`, "_blank");
                }}
                data-testid="button-register-cta"
              >
                Register Now & Earn 500 Bonus Points!
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Comprehensive Leaderboard Modal */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <ResizableDialogContent 
          className="bg-slate-900 border-amber-500/30"
          defaultWidth={900}
          defaultHeight={700}
          minWidth={500}
          minHeight={400}
          maxWidth={1200}
          maxHeight={900}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="h-8 w-8 text-amber-400" />
              </motion.span>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Global Leaderboards
              </span>
              <span className="text-[10px] text-slate-500 italic ml-2">Illustration purposes</span>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="overall" className="w-full">
            <TabsList className="grid grid-cols-6 w-full bg-slate-800/50 mb-4">
              <TabsTrigger value="overall" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" /> Overall
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-xs">
                <BarChart2 className="h-3 w-3 mr-1" /> Charts
              </TabsTrigger>
              <TabsTrigger value="level" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" /> By Level
              </TabsTrigger>
              <TabsTrigger value="stakeholder" className="text-xs">
                <Users className="h-3 w-3 mr-1" /> Stakeholder
              </TabsTrigger>
              <TabsTrigger value="geography" className="text-xs">
                <Globe className="h-3 w-3 mr-1" /> Geography
              </TabsTrigger>
              <TabsTrigger value="sector" className="text-xs">
                <Building className="h-3 w-3 mr-1" /> Sector
              </TabsTrigger>
            </TabsList>
            
            {/* Overall Leaderboard */}
            <TabsContent value="overall" className="space-y-4">
              {/* Your Position Section - 5 ranks above and below */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                    <Star className="h-4 w-4" /> Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {[
                    { rank: 37, name: "InnovatePro", gleams: 4800, isYou: false },
                    { rank: 38, name: "StartupBuilder", gleams: 4650, isYou: false },
                    { rank: 39, name: "VisionaryMind", gleams: 4500, isYou: false },
                    { rank: 40, name: "TechDreamer", gleams: 4350, isYou: false },
                    { rank: 41, name: "ScaleupGenius", gleams: 4200, isYou: false },
                    { rank: 42, name: fancyName || user?.firstName || "You", gleams: totalGleams, isYou: true },
                    { rank: 43, name: "GrowthMaster", gleams: Math.max(totalGleams - 50, 0), isYou: false },
                    { rank: 44, name: "UnicornChaser", gleams: Math.max(totalGleams - 100, 0), isYou: false },
                    { rank: 45, name: "FounderX", gleams: Math.max(totalGleams - 200, 0), isYou: false },
                    { rank: 46, name: "DisruptorPro", gleams: Math.max(totalGleams - 350, 0), isYou: false },
                    { rank: 47, name: "VentureSeeker", gleams: Math.max(totalGleams - 500, 0), isYou: false },
                  ].map((entry, i) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: entry.isYou ? 0 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        entry.isYou 
                          ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400/50 scale-105" 
                          : "bg-slate-800/50"
                      }`}
                    >
                      <span className={`text-sm w-8 font-bold ${entry.isYou ? "text-amber-400" : "text-slate-400"}`}>#{entry.rank}</span>
                      <span className={`flex-1 text-sm truncate ${entry.isYou ? "text-amber-300 font-bold" : ""}`}>
                        {entry.isYou && "⭐ "}{entry.name}
                      </span>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${entry.isYou ? "text-yellow-300" : "text-yellow-400"}`}>
                          ✨ {entry.gleams.toLocaleString()}
                        </div>
                        <div className="text-violet-400 text-xs">🦄 {(entry.gleams / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="border-green-500/30 bg-green-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                      <Target className="h-4 w-4" /> Current Reality Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { rank: 1, name: "TechVenture_Alpha", gleams: 9200 },
                      { rank: 2, name: "StartupNinja", gleams: 8750 },
                      { rank: 3, name: "GrowthHacker_Pro", gleams: 8400 },
                      { rank: 4, name: "UnicornSeeker", gleams: 8100 },
                      { rank: 5, name: "VentureBuilder", gleams: 7850 },
                    ].map((entry, i) => (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50"
                      >
                        <span className="text-lg w-8">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${entry.rank}.`}</span>
                        <span className="flex-1 text-sm truncate">{entry.name}</span>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold text-sm">✨ {entry.gleams.toLocaleString()}</div>
                          <div className="text-violet-400 text-xs">🦄 {(entry.gleams / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card className="border-violet-500/30 bg-violet-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-violet-400 flex items-center gap-2">
                      <Rocket className="h-4 w-4" /> Aspirational Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { rank: 1, name: "VisionaryFounder", gleams: 9500 },
                      { rank: 2, name: "MoonShot_Team", gleams: 9100 },
                      { rank: 3, name: "DisruptorX", gleams: 8800 },
                      { rank: 4, name: "FutureUnicorn", gleams: 8500 },
                      { rank: 5, name: "ScaleUp_Master", gleams: 8200 },
                    ].map((entry, i) => (
                      <motion.div
                        key={entry.rank}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50"
                      >
                        <span className="text-lg w-8">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${entry.rank}.`}</span>
                        <span className="flex-1 text-sm truncate">{entry.name}</span>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold text-sm">✨ {entry.gleams.toLocaleString()}</div>
                          <div className="text-violet-400 text-xs">🦄 {(entry.gleams / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Charts Tab - Individual Charts for Levels, Dimensions, Aspirations */}
            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Current Level Chart */}
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                      <Target className="h-4 w-4" /> Current Level: {getLevelDisplayName(state.currentLevel)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(state.answers[`${state.currentLevel}_cur`] || {}).length > 0 ? (
                      <SimpleRadarChart 
                        data={Object.entries(state.answers[`${state.currentLevel}_cur`] || {}).map(([code, score]) => ({
                          subject: code,
                          A: score as number,
                          fullMark: 5
                        }))} 
                        color="#22c55e" 
                      />
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Complete your current level assessment to see the chart</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Aspirational Level Chart */}
                <Card className="border-violet-500/30 bg-violet-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-violet-400 flex items-center gap-2">
                      <Rocket className="h-4 w-4" /> Aspirational: {getLevelDisplayName(state.aspirationalLevel)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(state.answers[`${state.aspirationalLevel}_asp`] || {}).length > 0 ? (
                      <SimpleRadarChart 
                        data={Object.entries(state.answers[`${state.aspirationalLevel}_asp`] || {}).map(([code, score]) => ({
                          subject: code,
                          A: score as number,
                          fullMark: 5
                        }))} 
                        color="#8b5cf6" 
                      />
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Rocket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Complete your aspirational assessment to see the chart</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Dimension Breakdown */}
              <Card className="border-cyan-500/30 bg-cyan-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" /> Dimension Breakdown by Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {LEVELS.slice(0, 5).map((level) => {
                      const curAnswers = state.answers[`${level.level}_cur`] || {};
                      const aspAnswers = state.answers[`${level.level}_asp`] || {};
                      const curScore = Object.keys(curAnswers).length > 0 ? calculateLevelScore(curAnswers) : 0;
                      const aspScore = Object.keys(aspAnswers).length > 0 ? calculateLevelScore(aspAnswers) : 0;
                      const hasData = curScore > 0 || aspScore > 0;
                      
                      return (
                        <div key={level.level} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <Badge className={`bg-gradient-to-r ${LEVEL_THEMES[level.level]?.gradient || 'from-slate-500 to-slate-600'} text-[10px]`}>
                              {getLevelDisplayName(level.level)}
                            </Badge>
                            <span className="text-slate-400">{level.levelName}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <div className="text-[10px] text-green-400 mb-1">Current</div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${curScore}%` }}
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-slate-500">{hasData ? `${curScore.toFixed(0)}%` : '-'}</span>
                            </div>
                            <div className="relative">
                              <div className="text-[10px] text-violet-400 mb-1">Aspirational</div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${aspScore}%` }}
                                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                />
                              </div>
                              <span className="text-[10px] text-slate-500">{hasData ? `${aspScore.toFixed(0)}%` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              {/* Gleams/Alicorns by Level */}
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Gleams & Alicorns by Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {LEVELS.slice(0, 6).map((level) => {
                      const curAnswers = state.answers[`${level.level}_cur`] || {};
                      const gleams = Object.keys(curAnswers).length > 0 ? calculateGleams(curAnswers, level.level) : 0;
                      const alicorns = gleams / 100;
                      
                      return (
                        <div key={level.level} className="p-3 rounded-lg bg-slate-800/50 text-center">
                          <Badge className={`bg-gradient-to-r ${LEVEL_THEMES[level.level]?.gradient || 'from-slate-500 to-slate-600'} text-[10px] mb-2`}>
                            {getLevelDisplayName(level.level)}
                          </Badge>
                          <div className="text-yellow-400 font-bold text-sm">✨ {gleams.toLocaleString()}</div>
                          <div className="text-violet-400 text-xs">🦄 {alicorns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Level-wise Leaderboard */}
            <TabsContent value="level" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {LEVELS.slice(0, 6).map((level, idx) => (
                  <Card key={level.level} className={`border-slate-600 bg-gradient-to-br ${LEVEL_THEMES[level.level]?.gradient || 'from-slate-500 to-slate-600'}/10`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-2">
                        <Badge className={`bg-gradient-to-r ${LEVEL_THEMES[level.level]?.gradient || 'from-slate-500 to-slate-600'} text-[10px]`}>
                          {getLevelDisplayName(level.level)}
                        </Badge>
                        <span className="text-slate-400 truncate text-[10px]">{level.levelName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {[
                        { rank: 1, name: `${level.level}_Champion`, gleams: 9000 - idx * 500 },
                        { rank: 2, name: `${level.level}_Master`, gleams: 8500 - idx * 500 },
                        { rank: 3, name: `${level.level}_Expert`, gleams: 8000 - idx * 500 },
                      ].map((entry) => (
                        <div key={entry.rank} className="flex items-center gap-2 text-xs p-1 rounded bg-slate-800/30">
                          <span>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
                          <span className="flex-1 truncate">{entry.name}</span>
                          <span className="text-yellow-400">✨{entry.gleams.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Stakeholder Leaderboard */}
            <TabsContent value="stakeholder" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {STAKEHOLDERS.slice(0, 6).map((stakeholder, idx) => (
                  <Card key={stakeholder.id} className="border-slate-600 bg-slate-800/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-2">
                        <span className="text-lg">{stakeholder.emoji}</span>
                        <span className="text-slate-300 truncate">{stakeholder.id}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {[
                        { rank: 1, name: `Top${stakeholder.id.slice(0,3)}1`, gleams: 8500 + Math.floor(Math.random() * 1500) },
                        { rank: 2, name: `Top${stakeholder.id.slice(0,3)}2`, gleams: 7800 + Math.floor(Math.random() * 1200) },
                        { rank: 3, name: `Top${stakeholder.id.slice(0,3)}3`, gleams: 7200 + Math.floor(Math.random() * 1000) },
                      ].map((entry) => (
                        <div key={entry.rank} className="flex items-center gap-2 text-xs p-1 rounded bg-slate-800/50">
                          <span>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
                          <span className="flex-1 truncate">{entry.name}</span>
                          <span className="text-yellow-400">✨{entry.gleams.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Geography Leaderboard */}
            <TabsContent value="geography" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { region: "🇺🇸 North America", entries: [{ name: "SiliconDreamer", gleams: 9100 }, { name: "NYCFounder", gleams: 8700 }, { name: "TexasVenture", gleams: 8300 }] },
                  { region: "🇪🇺 Europe", entries: [{ name: "LondonTech", gleams: 8900 }, { name: "BerlinStartup", gleams: 8500 }, { name: "ParisInno", gleams: 8100 }] },
                  { region: "🇮🇳 India", entries: [{ name: "BangaloreBuilder", gleams: 8800 }, { name: "MumbaiMaster", gleams: 8400 }, { name: "DelhiDreamer", gleams: 8000 }] },
                  { region: "🌏 Asia Pacific", entries: [{ name: "SingaporeScale", gleams: 8700 }, { name: "TokyoTech", gleams: 8300 }, { name: "SydneyStartup", gleams: 7900 }] },
                ].map((region) => (
                  <Card key={region.region} className="border-cyan-500/30 bg-cyan-500/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-cyan-400">{region.region}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {region.entries.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                          <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                          <span className="flex-1 text-sm">{entry.name}</span>
                          <span className="text-yellow-400 font-bold text-sm">✨ {entry.gleams.toLocaleString()}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Sector Leaderboard */}
            <TabsContent value="sector" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { sector: "🤖 AI/ML", entries: [{ name: "AIInnovator", gleams: 9300 }, { name: "MLMaster", gleams: 8900 }, { name: "DeepTechPro", gleams: 8500 }] },
                  { sector: "💰 FinTech", entries: [{ name: "FinanceFirst", gleams: 9100 }, { name: "PaymentPro", gleams: 8700 }, { name: "BankingBoss", gleams: 8300 }] },
                  { sector: "🏥 HealthTech", entries: [{ name: "HealthHero", gleams: 8900 }, { name: "MedTechMaster", gleams: 8500 }, { name: "WellnessWiz", gleams: 8100 }] },
                  { sector: "🌱 CleanTech", entries: [{ name: "GreenGenius", gleams: 8700 }, { name: "SustainStar", gleams: 8300 }, { name: "EcoExpert", gleams: 7900 }] },
                ].map((sector) => (
                  <Card key={sector.sector} className="border-emerald-500/30 bg-emerald-500/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-emerald-400">{sector.sector}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {sector.entries.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                          <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                          <span className="flex-1 text-sm">{entry.name}</span>
                          <div className="text-right">
                            <div className="text-yellow-400 font-bold text-sm">✨ {entry.gleams.toLocaleString()}</div>
                            <div className="text-violet-400 text-xs">🦄 {(entry.gleams / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  🏆
                </motion.div>
                <div>
                  <p className="text-amber-400 font-bold">Want to climb the leaderboard?</p>
                  <p className="text-slate-400 text-sm">Complete your assessment and earn more Gleams & Alicorns!</p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500"
                onClick={() => setShowLeaderboard(false)}
              >
                Take Assessment
              </Button>
            </div>
          </div>
        </ResizableDialogContent>
      </Dialog>

      {/* Results Popup Dialog */}
      <Dialog open={showResultsPopup} onOpenChange={setShowResultsPopup}>
        <ResizableDialogContent 
          className="bg-slate-900 border-violet-500/50"
          defaultWidth={650}
          defaultHeight={600}
          minWidth={400}
          minHeight={400}
          maxWidth={900}
          maxHeight={800}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Your Assessment Results
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-center">
                <span className="text-3xl block mb-2">🦄</span>
                <div className="text-2xl font-bold text-violet-400">{gleamsToAlicorns(totalGleams)}</div>
                <div className="text-sm text-slate-400">Alicorns Earned</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <span className="text-3xl block mb-2 font-bold">{GLEAM_SYMBOL}</span>
                <div className="text-2xl font-bold text-amber-400">{totalGleams.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Total Gleams</div>
              </div>
            </div>
            
            {/* Level Info */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Current Level:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                      {getLevelDisplayName(state.currentLevel)}
                    </Badge>
                    <span className="text-xs text-slate-500">{getQuestionsForLevel(state.currentLevel)?.levelName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Aspirational Level:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-500">
                      {getLevelDisplayName(state.aspirationalLevel)}
                    </Badge>
                    <span className="text-xs text-slate-500">{getQuestionsForLevel(state.aspirationalLevel)?.levelName}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stakeholder:</span>
                  <span className="font-medium">{STAKEHOLDERS.find(s => s.id === state.stakeholder)?.emoji} {state.stakeholder}</span>
                </div>
              </div>
            </div>
            
            {/* Timestamp & IP */}
            {completionTimestamp && (
              <div className="text-center text-xs text-slate-500 space-x-3">
                <span>📅 {completionTimestamp}</span>
                {userIp && <span>🌐 {userIp}</span>}
              </div>
            )}
            
            {/* Chart Preview */}
            {Object.keys(currentAnswers).length > 0 && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-cyan-500/30">
                <h4 className="text-center text-cyan-400 font-semibold mb-2">Assessment Profile</h4>
                <SimpleRadarChart 
                  data={Object.entries(currentAnswers).map(([code, score]) => ({
                    subject: code,
                    A: score as number,
                    fullMark: 5
                  }))} 
                  color="#22d3ee" 
                />
              </div>
            )}
            
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowResultsPopup(false)}>
                Close
              </Button>
              <Button 
                className="bg-gradient-to-r from-violet-600 to-purple-600"
                onClick={() => {
                  setShowResultsPopup(false);
                  copyShareLink();
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
            </div>
          </div>
        </ResizableDialogContent>
      </Dialog>

      {/* Unicorn Coach - Hidden for now */}
      {/* <UnicornCoach 
        context={step === "results" ? "results" : step === "assessment" ? "assessment" : step === "stakeholder" ? "stakeholder" : step === "current_level" || step === "aspirational_level" ? "level" : "home"}
        stakeholder={state.stakeholder || undefined}
        level={state.currentLevel}
      /> */}

      {/* Drill-down Popup: Rank Details */}
      <ResizableModal
        isOpen={showRankDrilldown}
        onClose={() => setShowRankDrilldown(false)}
        title="Your Ranking Details"
        subtitle="See where you stand among fellow unicorn builders"
        icon={<Trophy className="h-5 w-5 text-white" />}
        defaultWidth={500}
        defaultHeight={550}
      >
        <div className="space-y-4">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
            <span className="text-6xl block mb-2">🏆</span>
            <div className="text-4xl font-bold text-cyan-400">#42</div>
            <div className="text-slate-400 mt-1">Your Current Rank</div>
            <Badge className="mt-2">{getLevelDisplayName(state.currentLevel)}</Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300">Rankings by Level</h4>
            {LEVELS.slice(0, 5).map((level, idx) => (
              <div key={level.level} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{LEVEL_THEMES[level.level]?.emoji}</span>
                  <span className="text-sm">{level.levelName}</span>
                </div>
                <div className="text-cyan-400 font-semibold">#{40 + idx * 3}</div>
              </div>
            ))}
          </div>
          
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
              <Flame className="h-4 w-4" /> How to Climb the Leaderboard
            </h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Complete more levels to earn more Gleams</li>
              <li>• Answer questions thoughtfully for higher scores</li>
              <li>• Take the aspirational assessment for bonus points</li>
              <li>• Return weekly to reassess as your startup grows</li>
            </ul>
          </div>
          
          <p className="text-xs text-slate-500 text-center italic">
            Rankings update in real-time as the community grows
          </p>
        </div>
      </ResizableModal>

      {/* Drill-down Popup: Score/Gleams Details */}
      <ResizableModal
        isOpen={showScoreDrilldown}
        onClose={() => setShowScoreDrilldown(false)}
        title={totalGleams >= 100 ? "Your Alicorn Collection" : "Your Gleam Treasury"}
        subtitle="Track your progress toward unicorn status"
        icon={<Sparkles className="h-5 w-5 text-white" />}
        defaultWidth={520}
        defaultHeight={600}
      >
        <div className="space-y-4">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
            <span className="text-6xl block mb-2">{totalGleams >= 100 ? ALICORN_SYMBOL : GLEAM_SYMBOL}</span>
            <div className="text-4xl font-bold text-violet-400">
              {totalGleams >= 100 ? gleamsToAlicorns(totalGleams) : totalGleams.toLocaleString()}
            </div>
            <div className="text-slate-400 mt-1">{totalGleams >= 100 ? "Alicorns Earned" : "Gleams Collected"}</div>
            {totalGleams >= 100 && (
              <div className="text-xs text-amber-400 mt-2">({totalGleams.toLocaleString()} total Gleams)</div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <div className="text-2xl font-bold text-green-400">{GLEAM_SYMBOL} {formatGleams(calculateGleams(currentAnswers, state.currentLevel))}</div>
              <div className="text-xs text-slate-400">Current Level</div>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-center">
              <div className="text-2xl font-bold text-violet-400">{ALICORN_SYMBOL} {gleamsToAlicorns(calculateGleams(aspirationalAnswers, state.aspirationalLevel))}</div>
              <div className="text-xs text-slate-400">Aspirational</div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Scoring System</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">L0 Parameters:</span>
                <span className="text-amber-400">10 Gleams max each</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">L1+ Parameters:</span>
                <span className="text-violet-400">100 Gleams max each</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conversion:</span>
                <span className="text-cyan-400">100 Gleams = 1 Alicorn</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <h4 className="text-amber-400 font-semibold mb-2">Next Milestone</h4>
            <Progress value={totalGleams % 100} className="h-2 mb-2" />
            <p className="text-xs text-slate-300">
              {100 - (totalGleams % 100)} more Gleams until your next Alicorn!
            </p>
          </div>
        </div>
      </ResizableModal>

      {/* Drill-down Popup: Current Level Chart */}
      <ResizableModal
        isOpen={showCurrentChartDrilldown}
        onClose={() => setShowCurrentChartDrilldown(false)}
        title={`Current Level: ${getLevelDisplayName(state.currentLevel)}`}
        subtitle="Your self-assessment of where you stand today"
        icon={<Target className="h-5 w-5 text-white" />}
        defaultWidth={600}
        defaultHeight={650}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <SimpleRadarChart 
              data={Object.entries(state.answers[`${state.currentLevel}_cur`] || {}).map(([code, score]) => ({
                subject: code,
                A: score as number,
                fullMark: 5
              }))} 
              color="#22c55e" 
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-400">Parameter Breakdown</h4>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {Object.entries(state.answers[`${state.currentLevel}_cur`] || {}).map(([code, score]) => (
                <div key={code} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                  <span className="text-xs text-slate-300">{code}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-400">{score as number}/5</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i <= (score as number) ? 'bg-green-500' : 'bg-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {GLEAM_SYMBOL} {formatGleams(calculateGleams(state.answers[`${state.currentLevel}_cur`] || {}, state.currentLevel))}
            </div>
            <div className="text-xs text-slate-400">Gleams from this level</div>
          </div>
          
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            onClick={() => {
              setShowCurrentChartDrilldown(false);
              setShowEnhancedShareModal(true);
            }}
          >
            <Share2 className="mr-2 h-4 w-4" /> Share This Chart
          </Button>
        </div>
      </ResizableModal>

      {/* Drill-down Popup: Aspirational Chart */}
      <ResizableModal
        isOpen={showAspirationalChartDrilldown}
        onClose={() => setShowAspirationalChartDrilldown(false)}
        title={`Aspirational: ${getLevelDisplayName(state.aspirationalLevel)}`}
        subtitle="Your vision of where you want to be"
        icon={<Rocket className="h-5 w-5 text-white" />}
        defaultWidth={600}
        defaultHeight={650}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <SimpleRadarChart 
              data={Object.entries(state.answers[`${state.aspirationalLevel}_asp`] || {}).map(([code, score]) => ({
                subject: code,
                A: score as number,
                fullMark: 5
              }))} 
              color="#8b5cf6" 
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-violet-400">Aspirational Targets</h4>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {Object.entries(state.answers[`${state.aspirationalLevel}_asp`] || {}).map(([code, score]) => (
                <div key={code} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                  <span className="text-xs text-slate-300">{code}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-violet-400">{score as number}/5</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i <= (score as number) ? 'bg-violet-500' : 'bg-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <div className="text-2xl font-bold text-violet-400">
              {ALICORN_SYMBOL} {gleamsToAlicorns(calculateGleams(state.answers[`${state.aspirationalLevel}_asp`] || {}, state.aspirationalLevel))}
            </div>
            <div className="text-xs text-slate-400">Potential Alicorns at this level</div>
          </div>
          
          <Button
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
            onClick={() => {
              setShowAspirationalChartDrilldown(false);
              setShowEnhancedShareModal(true);
            }}
          >
            <Share2 className="mr-2 h-4 w-4" /> Share This Chart
          </Button>
        </div>
      </ResizableModal>

      {/* Drill-down Popup: Gap Analysis Details */}
      <ResizableModal
        isOpen={showGapDrilldown}
        onClose={() => setShowGapDrilldown(false)}
        title="Gap Analysis Deep Dive"
        subtitle="Understanding your growth journey"
        icon={<Scale className="h-5 w-5 text-white" />}
        defaultWidth={650}
        defaultHeight={700}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-green-500/10 border-2 border-green-500/50">
              <div className="text-sm text-green-300 mb-1 font-medium">Current Reality</div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 mb-2">
                {getLevelDisplayName(state.currentLevel)}
              </Badge>
              <div className="text-2xl font-bold text-green-400">
                {state.currentLevel === "L0" ? GLEAM_SYMBOL : ALICORN_SYMBOL} {state.currentLevel === "L0" 
                  ? formatGleams(calculateGleams(currentAnswers, state.currentLevel))
                  : gleamsToAlicorns(calculateGleams(currentAnswers, state.currentLevel))}
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-violet-500/10 border-2 border-violet-500/50">
              <div className="text-sm text-violet-300 mb-1 font-medium">Aspiration</div>
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 mb-2">
                {getLevelDisplayName(state.aspirationalLevel)}
              </Badge>
              <div className="text-2xl font-bold text-violet-400">
                {ALICORN_SYMBOL} {gleamsToAlicorns(calculateGleams(aspirationalAnswers, state.aspirationalLevel))}
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 via-amber-500/10 to-violet-500/10 border border-amber-500/30">
            <h4 className="text-amber-400 font-semibold mb-3 text-center">Your Growth Path</h4>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{LEVEL_THEMES[state.currentLevel]?.emoji}</span>
              <ChevronRight className="h-5 w-5 text-amber-400" />
              {LEVELS.slice(
                LEVELS.findIndex(l => l.level === state.currentLevel) + 1,
                LEVELS.findIndex(l => l.level === state.aspirationalLevel) + 1
              ).map((level, idx) => (
                <span key={level.level} className="flex items-center gap-1">
                  <span className="text-xl">{LEVEL_THEMES[level.level]?.emoji}</span>
                  {idx < LEVELS.findIndex(l => l.level === state.aspirationalLevel) - LEVELS.findIndex(l => l.level === state.currentLevel) - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              {LEVELS.findIndex(l => l.level === state.aspirationalLevel) - LEVELS.findIndex(l => l.level === state.currentLevel)} levels to bridge
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300">Key Focus Areas</h4>
            <div className="space-y-2">
              {["Product-Market Fit", "Team Building", "Funding Strategy", "Go-to-Market"].map((area, idx) => (
                <div key={area} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{area}</span>
                    <span className="text-xs text-amber-400">{["High", "Medium", "High", "Medium"][idx]} Priority</span>
                  </div>
                  <Progress value={[45, 70, 30, 60][idx]} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <h4 className="text-violet-400 font-semibold mb-2">Recommended Next Steps</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Strengthen your {getQuestionsForLevel(state.currentLevel)?.levelFocus?.toLowerCase() || "core foundation"}</li>
              <li>• Review case studies from successful {getLevelDisplayName(state.aspirationalLevel)} companies</li>
              <li>• Connect with mentors who've made this transition</li>
              <li>• Reassess quarterly to track your progress</li>
            </ul>
          </div>
        </div>
      </ResizableModal>

      {/* Start Aspirational Assessment Modal */}
      <Dialog open={showStartAspirationalModal} onOpenChange={setShowStartAspirationalModal}>
        <DialogContent className="bg-slate-900 border-violet-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-400">
              <Rocket className="h-5 w-5" />
              Aspirational Assessment
            </DialogTitle>
            <DialogDescription>
              Chart your path to {getLevelDisplayName(state.aspirationalLevel)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <span className="text-4xl block mb-2">{LEVEL_THEMES[state.aspirationalLevel]?.emoji || "🚀"}</span>
              <h3 className="text-lg font-semibold text-violet-300">{getLevelDisplayName(state.aspirationalLevel)}</h3>
              <p className="text-xs text-slate-400 mt-1">{getQuestionsForLevel(state.aspirationalLevel)?.levelFocus}</p>
            </div>
            
            <p className="text-sm text-slate-300 text-center">
              Assess where you want your startup to be. This helps identify the gap between your current reality and aspirations.
            </p>
            
            <div className="space-y-2">
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                onClick={() => {
                  setShowStartAspirationalModal(false);
                  setState(prev => ({ ...prev, assessmentType: 'aspirational' }));
                  setStep('assessment');
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Aspirational Assessment
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                onClick={() => {
                  setShowStartAspirationalModal(false);
                  toast({
                    title: "Saved for Later",
                    description: "You can return to take the aspirational assessment anytime.",
                  });
                }}
              >
                <Pause className="mr-2 h-4 w-4" />
                Maybe Later
              </Button>
              
              <Button
                variant="ghost"
                className="w-full text-slate-400 hover:text-slate-300"
                onClick={() => setShowStartAspirationalModal(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Aspirational Level Picker Modal */}
      <Dialog open={showAspirationalLevelPicker} onOpenChange={setShowAspirationalLevelPicker}>
        <DialogContent className="bg-slate-900 border-violet-500/30 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-400">
              <Rocket className="h-5 w-5" />
              Change Aspirational Level
            </DialogTitle>
            <DialogDescription>
              Select where you want your startup to be. This defines your growth target.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="text-xs text-slate-400 mb-2">
              Current Goal: <span className="text-violet-400 font-semibold">{getLevelDisplayName(state.aspirationalLevel)}</span>
            </div>
            
            {LEVELS.filter(level => {
              const currentIdx = LEVELS.findIndex(l => l.level === state.currentLevel);
              const levelIdx = LEVELS.findIndex(l => l.level === level.level);
              return levelIdx > currentIdx;
            }).map((level) => (
              <motion.div
                key={level.level}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  state.aspirationalLevel === level.level
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-violet-500/50 hover:bg-violet-500/10"
                }`}
                onClick={() => {
                  setState(prev => ({ ...prev, aspirationalLevel: level.level }));
                  setShowAspirationalLevelPicker(false);
                  toast({
                    title: "Aspirational Level Updated!",
                    description: `Your new goal is ${getLevelDisplayName(level.level)}`,
                  });
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{LEVEL_THEMES[level.level]?.emoji}</span>
                    <div>
                      <div className="font-semibold text-slate-200">{level.levelName}</div>
                      <div className="text-xs text-slate-400">{level.level}</div>
                    </div>
                  </div>
                  {state.aspirationalLevel === level.level && (
                    <Badge className="bg-violet-500">Current Goal</Badge>
                  )}
                </div>
              </motion.div>
            ))}
            
            <div className="pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAspirationalLevelPicker(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
