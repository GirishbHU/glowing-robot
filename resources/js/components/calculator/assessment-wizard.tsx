import { Link } from "wouter";
import React, { useState, useEffect } from "react";
import { questions, calculateResult, formatLargeNumber, PHASE_SCALE, AssessmentResult } from "@/lib/questionnaire";
import { safeGetItem, safeSetItem } from "@/lib/storage";
import { mockStories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle2, ChevronRight, ChevronLeft, BarChart3, Share2, Plus, Target, TrendingUp, Sparkles, Rocket, Lightbulb, Trophy, Zap, Frown, Meh, Smile, ThumbsUp, Star, Award } from "lucide-react";
import StoryCard from "@/components/value-stories/story-card";
import { SimpleRadarChart } from "@/components/ui/simple-radar-chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import CoachingChat from "./CoachingChat";
import ShareResultsModal from "./ShareResultsModal";
import { MILESTONE_BADGES, BadgeDisplay, BadgeShareModal, checkBadgeEligibility, getNewlyEarnedBadges, MilestoneBadge } from "./MilestoneBadges";

const ANSWER_OPTIONS = [
  { value: 1, label: "Not at all", emoji: "😰", icon: Frown, color: "from-red-500 to-red-600", bg: "bg-red-500/10", border: "border-red-500", text: "text-red-500" },
  { value: 2, label: "Slightly", emoji: "😕", icon: Meh, color: "from-orange-500 to-orange-600", bg: "bg-orange-500/10", border: "border-orange-500", text: "text-orange-500" },
  { value: 3, label: "Somewhat", emoji: "😐", icon: Meh, color: "from-yellow-500 to-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500", text: "text-yellow-500" },
  { value: 4, label: "Mostly", emoji: "😊", icon: Smile, color: "from-lime-500 to-lime-600", bg: "bg-lime-500/10", border: "border-lime-500", text: "text-lime-500" },
  { value: 5, label: "Completely", emoji: "🌟", icon: Star, color: "from-green-500 to-emerald-600", bg: "bg-green-500/10", border: "border-green-500", text: "text-green-500" },
];

// Score milestone badges - playful progression
const SCORE_BADGES = [
  { threshold: 0, name: "Bronze", emoji: "🥉", color: "from-amber-600 to-amber-700", message: "Every journey starts somewhere! Keep going!" },
  { threshold: 1000, name: "Silver", emoji: "🥈", color: "from-slate-400 to-slate-500", message: "You're warming up! The adventure continues!" },
  { threshold: 10000, name: "Gold", emoji: "🥇", color: "from-yellow-400 to-amber-500", message: "Golden potential! You're on fire!" },
  { threshold: 100000, name: "Platinum", emoji: "🏆", color: "from-slate-300 to-slate-400", message: "Platinum status! Rare and valuable!" },
  { threshold: 1000000, name: "Diamond", emoji: "💎", color: "from-cyan-400 to-blue-500", message: "Diamond in the rough - brilliance unlocked!" },
  { threshold: 10000000, name: "Moon", emoji: "🌙", color: "from-indigo-400 to-purple-500", message: "Shooting for the moon! Dreamers become doers!" },
  { threshold: 100000000, name: "Star", emoji: "⭐", color: "from-yellow-300 to-orange-400", message: "Star power! The universe is watching!" },
  { threshold: 500000000, name: "Soonicorn", emoji: "🦄✨", color: "from-pink-400 to-purple-500", message: "Almost there! Soonicorn status - unicorn incoming!" },
  { threshold: 1000000000, name: "Unicorn", emoji: "🦄", color: "from-purple-500 to-pink-600", message: "LEGENDARY! You've reached Unicorn status! $1B+ potential!" },
];

const getScoreBadge = (score: number) => {
  let badge = SCORE_BADGES[0];
  for (const b of SCORE_BADGES) {
    if (score >= b.threshold) badge = b;
  }
  return badge;
};

// Mid-question encouragement messages
const getMilestoneMessage = (progress: number, questionNum: number, totalQuestions: number): { show: boolean; message: string; emoji: string } | null => {
  if (questionNum === 1) {
    return { show: true, message: "Great start! You're on your way!", emoji: "🚀" };
  }
  if (progress >= 25 && progress < 35) {
    return { show: true, message: "Quarter way there! You're doing amazing!", emoji: "💪" };
  }
  if (progress >= 50 && progress < 60) {
    return { show: true, message: "Halfway hero! Keep that momentum going!", emoji: "🔥" };
  }
  if (progress >= 75 && progress < 85) {
    return { show: true, message: "Almost there! The finish line is in sight!", emoji: "🎯" };
  }
  if (questionNum === totalQuestions) {
    return { show: true, message: "Last question! You've got this!", emoji: "🏁" };
  }
  return null;
};

// Fancy name generator
const FANCY_PREFIXES = ["Rocket", "Moon", "Star", "Dream", "Vision", "Thunder", "Phoenix", "Cosmic", "Quantum", "Stellar", "Blaze", "Storm", "Solar", "Nova", "Titan"];
const FANCY_SUFFIXES = ["Rider", "Chaser", "Hunter", "Blazer", "Pioneer", "Voyager", "Seeker", "Builder", "Maker", "Founder", "Captain", "Wizard", "Ninja", "Sage", "Hero"];

const generateFancyName = (): string => {
  const prefix = FANCY_PREFIXES[Math.floor(Math.random() * FANCY_PREFIXES.length)];
  const suffix = FANCY_SUFFIXES[Math.floor(Math.random() * FANCY_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
};

const generateAnonName = (): string => {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `Anonymous #${num}`;
};

interface PhaseResult {
  phase: number;
  phaseName: string;
  result: AssessmentResult;
  answers: Record<string, number>;
  isAspirational: boolean;
  reflectionNotes?: {
    whatChanged: string;
    challenges: string;
    inspirations: string;
  };
}

const PHASE_NAMES: Record<number, string> = {
  1: "Idea Validation (Pre-Seed)",
  2: "Product Development (Seed)",
  3: "Market Entry (Series A)",
  4: "Growth & Scaling (Series B/C)",
  5: "Maturity & Profitability (Series C+)",
  6: "Leadership & Innovation (Pre-IPO)",
  7: "Unicorn & Beyond (Post-IPO)",
};

const PHASES = [
  { id: "1", short: "Idea", full: "Idea Validation", color: "amber" },
  { id: "2", short: "Product", full: "Product Dev", color: "orange" },
  { id: "3", short: "Market", full: "Market Entry", color: "green" },
  { id: "4", short: "Growth", full: "Growth & Scale", color: "blue" },
  { id: "5", short: "Mature", full: "Maturity", color: "indigo" },
  { id: "6", short: "Lead", full: "Leadership", color: "purple" },
  { id: "7", short: "Unicorn", full: "Unicorn+", color: "pink" },
];

const PHASE_COLORS: Record<string, string> = {
  "1": "bg-amber-500",
  "2": "bg-orange-500",
  "3": "bg-green-500",
  "4": "bg-blue-500",
  "5": "bg-indigo-500",
  "6": "bg-purple-500",
  "7": "bg-yellow-500",
};

interface EncouragementMessage {
  icon: React.ReactNode;
  title: string;
  message: string;
  action: string;
  gradient: string;
  borderColor: string;
}

const getEncouragementMessages = (
  hasCompletedReality: boolean,
  hasCompletedAspiration: boolean,
  highestCompletedPhase: number,
  currentPhase: number,
  totalScore: number
): EncouragementMessage[] => {
  const messages: EncouragementMessage[] = [];

  if (hasCompletedReality && !hasCompletedAspiration) {
    messages.push({
      icon: <Target className="h-5 w-5" />,
      title: "Dream Bigger!",
      message: "You've assessed your reality - now imagine your future! Take an Aspirational assessment to see the gap between where you are and where you want to be. The bigger the gap, the bigger the opportunity!",
      action: "Try Aspirational Mode",
      gradient: "from-purple-500/10 via-violet-500/5 to-transparent",
      borderColor: "border-purple-500/30"
    });
  }

  if (hasCompletedAspiration && !hasCompletedReality) {
    messages.push({
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Ground Your Dreams!",
      message: "Great aspirations! Now take a Reality Check to see where you truly stand today. Understanding your current position is the first step to reaching your goals!",
      action: "Take Reality Check",
      gradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
      borderColor: "border-blue-500/30"
    });
  }

  if (highestCompletedPhase < 7 && highestCompletedPhase >= 1) {
    const nextPhase = highestCompletedPhase + 1;
    const phaseMultipliers: Record<number, string> = {
      2: "10x",
      3: "100x",
      4: "1,000x",
      5: "10,000x",
      6: "100,000x",
      7: "1,000,000x"
    };
    messages.push({
      icon: <Rocket className="h-5 w-5" />,
      title: `Unlock ${phaseMultipliers[nextPhase] || 'Bigger'} Scores!`,
      message: `Ready to think bigger? Phase ${nextPhase} assessments reveal what it takes to reach the next level. Higher phases = exponentially higher scores to brag about! Challenge your friends with an impressive number!`,
      action: `Explore Phase ${nextPhase}`,
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      borderColor: "border-amber-500/30"
    });
  }

  if (totalScore > 0) {
    messages.push({
      icon: <Trophy className="h-5 w-5" />,
      title: "You're Building Something Amazing!",
      message: `Your combined score of ${totalScore.toLocaleString()} shows real potential! Share it with fellow founders and see how you compare. Every assessment you complete adds to your story and strengthens your journey!`,
      action: "Share & Challenge Others",
      gradient: "from-green-500/10 via-emerald-500/5 to-transparent",
      borderColor: "border-green-500/30"
    });
  }

  if (hasCompletedReality && hasCompletedAspiration) {
    messages.push({
      icon: <Sparkles className="h-5 w-5" />,
      title: "You're a Strategic Thinker!",
      message: "Comparing reality vs aspiration is how unicorn founders think! Keep exploring different phases to build a complete picture of your journey. Each assessment reveals new insights!",
      action: "Continue Exploring",
      gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
      borderColor: "border-indigo-500/30"
    });
  }

  if (messages.length === 0) {
    messages.push({
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Every Journey Starts with Self-Awareness",
      message: "The most successful founders regularly assess where they stand. Take your first assessment to unlock personalized insights and join a community of ambitious builders!",
      action: "Start Your Journey",
      gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
      borderColor: "border-cyan-500/30"
    });
  }

  return messages;
};

// Pre-generated confetti particles (static to avoid recreation)
const CONFETTI_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 3.33) % 100,
  delay: (i * 0.02) % 0.5,
  duration: 2 + (i % 3),
  color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6', '#10B981', '#F59E0B'][i % 7],
  size: 8 + (i % 8),
  rotation: i % 2 === 0 ? 360 : -360,
  isCircle: i % 2 === 0,
}));

// Confetti component for celebrations
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {CONFETTI_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: p.rotation }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

export default function AssessmentWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(0); // 0 = Setup, 1 = Questions, 2 = Results
  const [showConfetti, setShowConfetti] = useState(false);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [lastAnswerTime, setLastAnswerTime] = useState<number | null>(null);
  const [registrationPopup, setRegistrationPopup] = useState<Window | null>(null);
  const [showNextHint, setShowNextHint] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('earnedBadges');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newBadges, setNewBadges] = useState<MilestoneBadge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);

  // Open registration in a popup window
  const openRegistrationPopup = (params: URLSearchParams) => {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;

    const popup = window.open(
      `https://i2u.ai/register?${params.toString()}`,
      'i2u_registration',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (popup && !popup.closed) {
      setRegistrationPopup(popup);

      // Check if popup is closed periodically
      const checkClosed = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkClosed);
          setRegistrationPopup(null);
          toast({
            title: "Welcome back!",
            description: "Continue exploring your assessment results.",
          });
        }
      }, 500);

      // Cleanup on unmount or when popup reference changes
      return () => clearInterval(checkClosed);
    } else {
      // Fallback if popup is blocked - no interval to clear
      window.open(`https://i2u.ai/register?${params.toString()}`, '_blank');
      toast({
        title: "Registration opened",
        description: "Complete registration and return here to continue.",
      });
    }
  };
  // Get last selected phase from storage, default to "2" (Product Development)
  const [phase, setPhase] = useState<string>(() => {
    const saved = safeGetItem('lastSelectedPhase');
    if (saved && parseInt(saved) >= 1 && parseInt(saved) <= 7) {
      return saved;
    }
    return "2";
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phaseResults, setPhaseResults] = useState<PhaseResult[]>([]);
  const [isAspirational, setIsAspirational] = useState(false);
  const [reflectionNotes, setReflectionNotes] = useState({
    whatChanged: "",
    challenges: "",
    inspirations: ""
  });

  // Save phase selection to storage whenever it changes
  useEffect(() => {
    safeSetItem('lastSelectedPhase', phase);
  }, [phase]);

  const [timestamp] = useState(() => {
    const now = new Date();
    const iso = now.toISOString();
    const micros = Math.floor(Math.random() * 1000);
    return iso.replace("Z", `${micros.toString().padStart(3, "0")}Z`);
  });
  const [ipAddress] = useState(`192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);

  const relevantQuestions = questions.filter(q => q.phaseId.toString() === phase);
  const totalQuestions = relevantQuestions.length;

  // Show hint after delay when no answer is selected
  useEffect(() => {
    if (step !== 1) return;

    const q = relevantQuestions[currentQuestionIndex];
    if (!q || answers[q.id]) {
      setShowNextHint(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowNextHint(true);
    }, 4000); // Show hint after 4 seconds of inactivity

    return () => clearTimeout(timer);
  }, [step, currentQuestionIndex, answers, relevantQuestions]);

  // Calculate visible window for phase toggle (show 3 phases centered on selection)
  const getVisibleRange = (phaseStr: string) => {
    const idx = parseInt(phaseStr) - 1;
    let start = Math.max(0, idx - 1);
    let end = start + 3;
    if (end > 7) {
      end = 7;
      start = 4;
    }
    return { start, end };
  };

  const { start: visibleStart, end: visibleEnd } = getVisibleRange(phase);
  const visiblePhases = PHASES.slice(visibleStart, visibleEnd);

  const canScrollLeft = visibleStart > 0;
  const canScrollRight = visibleEnd < 7;

  const scrollPhaseLeft = () => {
    const current = parseInt(phase);
    if (current > 1) {
      setPhase(String(current - 1));
    }
  };

  const scrollPhaseRight = () => {
    const current = parseInt(phase);
    if (current < 7) {
      setPhase(String(current + 1));
    }
  };

  const handleAnswer = (val: number) => {
    const q = relevantQuestions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  };

  // Track streaks only when advancing to next question
  const trackStreak = () => {
    const now = Date.now();
    if (lastAnswerTime && now - lastAnswerTime < 10000) {
      const newStreak = answerStreak + 1;
      setAnswerStreak(newStreak);
      if (newStreak >= 3 && newStreak % 3 === 0) {
        setShowStreakBonus(true);
        setTimeout(() => setShowStreakBonus(false), 2000);
        toast({
          title: `🔥 ${newStreak} Answer Streak!`,
          description: "You're on fire! Keep that momentum going!",
        });
      }
    } else {
      setAnswerStreak(1);
    }
    setLastAnswerTime(now);
  };

  const nextQuestion = () => {
    trackStreak(); // Track streak when advancing
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Save this phase's result - allow both current and aspirational for same phase
      const phaseNum = parseInt(phase);
      const phaseResult = calculateResult(answers, phaseNum);
      setPhaseResults(prev => [
        // Filter out only if same phase AND same type (current/aspirational)
        ...prev.filter(p => !(p.phase === phaseNum && p.isAspirational === isAspirational)),
        {
          phase: phaseNum,
          phaseName: PHASE_NAMES[phaseNum],
          result: phaseResult,
          answers: { ...answers },
          isAspirational,
          reflectionNotes: { ...reflectionNotes }
        }
      ]);
      // Trigger celebration!
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);

      // Check for newly earned badges
      const completedPhaseNumbers = [...phaseResults.map(pr => pr.phase), parseInt(phase)];
      const uniquePhases = Array.from(new Set(completedPhaseNumbers));
      const allMaxAnswers = Object.values(answers).every(v => v === 5);
      const currentBadges = checkBadgeEligibility(
        uniquePhases,
        phaseResult.score,
        isAspirational,
        allMaxAnswers
      );
      const newlyEarned = getNewlyEarnedBadges(earnedBadges, currentBadges);
      if (newlyEarned.length > 0) {
        setNewBadges(newlyEarned);
        const updatedBadges = Array.from(new Set([...earnedBadges, ...currentBadges]));
        setEarnedBadges(updatedBadges);
        try { localStorage.setItem('earnedBadges', JSON.stringify(updatedBadges)); } catch { }
      }

      setStep(2); // Finish
    }
  };

  const addAnotherPhase = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsAspirational(true); // Default to aspirational for additional phases
    setReflectionNotes({ whatChanged: "", challenges: "", inspirations: "" });
    setAnswerStreak(0);
    setLastAnswerTime(null);
    setStep(0);
  };

  const resetAll = () => {
    setPhaseResults([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsAspirational(false);
    setReflectionNotes({ whatChanged: "", challenges: "", inspirations: "" });
    setPhase("2"); // Default to Product Development
    setAnswerStreak(0);
    setLastAnswerTime(null);
    setStep(0);
  };

  // Quick switch to a phase from results
  const switchToPhase = (newPhase: string) => {
    setPhase(newPhase);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setReflectionNotes({ whatChanged: "", challenges: "", inspirations: "" });
    setAnswerStreak(0);
    setLastAnswerTime(null);
    setStep(0);
  };

  // Calculate journey progress
  const completedPhases = new Set(phaseResults.map(p => p.phase));
  const remainingPhases = [1, 2, 3, 4, 5, 6, 7].filter(p => !completedPhases.has(p));
  const journeyProgress = (completedPhases.size / 7) * 100;

  // Get motivational message based on current phase
  const getMotivationalMessage = (phaseNum: number): { icon: React.ReactNode; title: string; message: string } => {
    const messages: Record<number, { icon: React.ReactNode; title: string; message: string }> = {
      1: { icon: <Lightbulb className="h-5 w-5" />, title: "Dream Big!", message: "Every unicorn started with a bold idea. Your journey begins here!" },
      2: { icon: <Zap className="h-5 w-5" />, title: "Build It!", message: "Transform your vision into reality. The best products solve real problems." },
      3: { icon: <Rocket className="h-5 w-5" />, title: "Launch!", message: "Time to meet your market! Growth awaits those who dare to ship." },
      4: { icon: <TrendingUp className="h-5 w-5" />, title: "Scale Up!", message: "You've proven product-market fit. Now it's time to accelerate!" },
      5: { icon: <Trophy className="h-5 w-5" />, title: "Dominate!", message: "You're becoming a market leader. Keep pushing boundaries!" },
      6: { icon: <Sparkles className="h-5 w-5" />, title: "Innovate!", message: "Lead your industry through continuous innovation and excellence." },
      7: { icon: <Trophy className="h-5 w-5 text-amber-400" />, title: "Unicorn Status!", message: "You're playing in the big leagues now. The world is watching!" }
    };
    return messages[phaseNum] || messages[3];
  };

  const result = step === 2 ? calculateResult(answers, parseInt(phase)) : null;

  // Calculate aggregated totals across all phases
  const aggregatedScore = phaseResults.reduce((sum, pr) => sum + pr.result.score, 0);
  const aggregatedDimensionScore = phaseResults.reduce((sum, pr) => sum + pr.result.dimensionScore, 0);
  const aggregatedThriveScore = phaseResults.reduce((sum, pr) => sum + pr.result.riskScore, 0);
  const currentPhases = phaseResults.filter(p => !p.isAspirational);
  const aspirationalPhases = phaseResults.filter(p => p.isAspirational);

  // Calculate for dynamic encouragement
  const hasCompletedReality = currentPhases.length > 0;
  const hasCompletedAspiration = aspirationalPhases.length > 0;
  const highestCompletedPhase = phaseResults.length > 0
    ? Math.max(...phaseResults.map(p => p.phase))
    : 0;

  // Get personalized encouragement messages
  const encouragementMessages = getEncouragementMessages(
    hasCompletedReality,
    hasCompletedAspiration,
    highestCompletedPhase,
    parseInt(phase),
    aggregatedScore
  );

  // Stakeholder types for sharing
  const stakeholderTypes = [
    { id: "founder", label: "Fellow Founders", icon: <Rocket className="h-4 w-4" />, message: "Fellow founders, I scored {score}! Can you beat me?" },
    { id: "investor", label: "Investors", icon: <TrendingUp className="h-4 w-4" />, message: "Investors, check out my startup readiness score: {score}!" },
    { id: "mentor", label: "Mentors & Advisors", icon: <Lightbulb className="h-4 w-4" />, message: "Mentors, I need your guidance! My current score is {score}." },
    { id: "team", label: "Team Members", icon: <Target className="h-4 w-4" />, message: "Team, let's assess our startup together! My score: {score}" },
    { id: "family", label: "Friends & Family", icon: <Sparkles className="h-4 w-4" />, message: "I'm building something amazing! My startup score: {score}" }
  ];

  const [selectedStakeholder, setSelectedStakeholder] = useState("founder");

  // Leaderboard state
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<any[]>([]);
  const [displayType, setDisplayType] = useState<'real' | 'fancy' | 'anonymous'>('fancy');
  const [realName, setRealName] = useState('');
  const [fancyName, setFancyName] = useState(generateFancyName());
  const [anonName, setAnonName] = useState(generateAnonName());
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [hasClaimedSpot, setHasClaimedSpot] = useState(false);

  // Calculate best available score from phaseResults or current result
  const getLeaderboardScore = () => {
    // First try the current result
    if (result?.score) return { score: result.score, phase: parseInt(phase), isAspirational };
    // Fall back to aggregated score from phaseResults
    if (phaseResults.length > 0) {
      const latestPhase = phaseResults[phaseResults.length - 1];
      return {
        score: latestPhase.result.score,
        phase: latestPhase.phase,
        isAspirational: latestPhase.isAspirational
      };
    }
    return null;
  };

  // Fetch leaderboard entries
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?limit=20');
      const data = await response.json();
      if (data.success) {
        setLeaderboardEntries(data.entries);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Submit to leaderboard
  const submitToLeaderboard = async () => {
    const scoreData = getLeaderboardScore();
    if (!scoreData) {
      toast({ title: "No score available", description: "Complete an assessment first!", variant: "destructive" });
      return;
    }

    setIsSubmittingScore(true);
    try {
      let displayName = '';
      if (displayType === 'real') {
        displayName = realName || 'Anonymous';
      } else if (displayType === 'fancy') {
        displayName = fancyName;
      } else {
        displayName = anonName;
      }

      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayType,
          displayName,
          score: scoreData.score.toString(),
          phase: scoreData.phase,
          isAspirational: scoreData.isAspirational,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: "You're on the board!", description: `Welcome to the leaderboard, ${displayName}!` });
        setHasClaimedSpot(true);
        setShowLeaderboardModal(false);
        fetchLeaderboard();
      }
    } catch (error) {
      toast({ title: "Oops!", description: "Couldn't save your score. Try again!", variant: "destructive" });
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Generate shareable message with scores
  const getShareMessage = () => {
    const currentScore = currentPhases.length > 0
      ? currentPhases.reduce((sum, p) => sum + p.result.score, 0)
      : result?.score || 0;
    const aspirationScore = aspirationalPhases.length > 0
      ? aspirationalPhases.reduce((sum, p) => sum + p.result.score, 0)
      : 0;

    const stakeholder = stakeholderTypes.find(s => s.id === selectedStakeholder);
    let baseMessage = stakeholder?.message.replace("{score}", currentScore.toLocaleString()) || "";

    if (aspirationScore > 0) {
      baseMessage += ` My aspiration: ${aspirationScore.toLocaleString()}! Join my journey.`;
    }

    return `${baseMessage} Take the assessment: https://i2u.ai/value-stories/calculator`;
  };

  const handleShare = (platform: string) => {
    const message = encodeURIComponent(getShareMessage());
    const url = encodeURIComponent("https://i2u.ai/value-stories/calculator");

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${message}`,
      copy: ""
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(getShareMessage());
      toast({ title: "Copied!", description: "Share message copied to clipboard" });
    } else {
      window.open(shareUrls[platform], "_blank");
    }
    setShowShareModal(false);
  };

  // Modals Container Component (modals only, no header cards)
  const PersistentCTAHeader = () => (
    <>
      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLeaderboardModal(false)}>
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Claim Your Leaderboard Spot!
              </CardTitle>
              <CardDescription>Choose how you want to appear on the global leaderboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Identity Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">How do you want to be known?</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDisplayType('real')}
                    className={`p-3 rounded-lg text-center transition-all ${displayType === 'real'
                        ? "bg-blue-500 text-white ring-2 ring-blue-500/50"
                        : "bg-muted hover:bg-muted/80"
                      }`}
                    data-testid="button-display-real"
                  >
                    <span className="text-xl">👤</span>
                    <div className="text-xs mt-1 font-medium">Real Name</div>
                  </button>
                  <button
                    onClick={() => { setDisplayType('fancy'); setFancyName(generateFancyName()); }}
                    className={`p-3 rounded-lg text-center transition-all ${displayType === 'fancy'
                        ? "bg-violet-500 text-white ring-2 ring-violet-500/50"
                        : "bg-muted hover:bg-muted/80"
                      }`}
                    data-testid="button-display-fancy"
                  >
                    <span className="text-xl">🦸</span>
                    <div className="text-xs mt-1 font-medium">Display Name</div>
                  </button>
                  <button
                    onClick={() => setDisplayType('anonymous')}
                    className={`p-3 rounded-lg text-center transition-all ${displayType === 'anonymous'
                        ? "bg-slate-500 text-white ring-2 ring-slate-500/50"
                        : "bg-muted hover:bg-muted/80"
                      }`}
                    data-testid="button-display-anonymous"
                  >
                    <span className="text-xl">🎭</span>
                    <div className="text-xs mt-1 font-medium">Anonymous</div>
                  </button>
                </div>
              </div>

              {/* Name Input based on selection */}
              {displayType === 'real' && (
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="Enter your name..."
                    data-testid="input-real-name"
                  />
                </div>
              )}

              {displayType === 'fancy' && (
                <div className="space-y-2">
                  <Label>Your Superhero Alias</Label>
                  <div className="flex gap-2">
                    <Input
                      value={fancyName}
                      readOnly
                      className="bg-muted"
                      data-testid="input-fancy-name"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setFancyName(generateFancyName())}
                      data-testid="button-regenerate-fancy"
                    >
                      🎲
                    </Button>
                  </div>
                </div>
              )}

              {displayType === 'anonymous' && (
                <div className="space-y-2">
                  <Label>Your Secret Identity</Label>
                  <div className="flex gap-2">
                    <Input
                      value={anonName}
                      readOnly
                      className="bg-muted"
                      data-testid="input-anon-name"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setAnonName(generateAnonName())}
                      data-testid="button-regenerate-anon"
                    >
                      🎲
                    </Button>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/30">
                <div className="text-xs text-muted-foreground mb-1">Preview on leaderboard:</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    {displayType === 'real' ? (realName || 'Your Name') : displayType === 'fancy' ? fancyName : anonName}
                  </span>
                  <Badge className="bg-amber-500">{getLeaderboardScore()?.score.toLocaleString() || '0'}</Badge>
                </div>
              </div>

              {/* Submit */}
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                onClick={submitToLeaderboard}
                disabled={isSubmittingScore || (displayType === 'real' && !realName.trim()) || !getLeaderboardScore()}
                data-testid="button-submit-leaderboard"
              >
                {isSubmittingScore ? "Saving..." : !getLeaderboardScore() ? "Complete an assessment first" : "🏆 Claim My Spot!"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );

  if (step === 0) {
    const motivation = getMotivationalMessage(parseInt(phase));
    const hasCompletedAny = phaseResults.length > 0;

    return (
      <div className="space-y-6">
        <PersistentCTAHeader />

        {/* First-Timer Welcome */}
        {!hasCompletedAny && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-dashed border-violet-500/30 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-cyan-500/5 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="p-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Sparkles className="h-6 w-6" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold font-heading mb-2">
                      Welcome, Future Unicorn! 🦄
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      You're about to discover where you stand on your startup journey.
                      Answer honestly - this isn't a test, it's a mirror! In just 2 minutes,
                      you'll get personalized insights and unlock your potential score.
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="px-3 py-1 bg-violet-500/10 text-violet-600 rounded-full flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Quick & Fun
                      </span>
                      <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> No Right/Wrong Answers
                      </span>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Earn Your Badge
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Prominent Current Stage Indicator */}
        <Card className="border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20">
                  {motivation.icon}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">You're Assessing</p>
                  <h2 className="text-2xl font-bold font-heading text-primary">Phase {phase}: {PHASE_NAMES[parseInt(phase)]}</h2>
                </div>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">BETA</Badge>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2 text-primary">
                {motivation.icon}
                <span className="font-bold">{motivation.title}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{motivation.message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Journey Progress Tracker */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Your Unicorn Journey</span>
              </div>
              <span className="text-sm font-bold text-amber-600">{completedPhases.size} of 7 Phases</span>
            </div>
            <Progress value={journeyProgress} className="h-3 mb-3" />
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                <Badge
                  key={p}
                  variant="outline"
                  className={completedPhases.has(p)
                    ? "bg-green-500/20 text-green-500 border-green-500/30"
                    : "bg-muted/50 text-muted-foreground border-muted"
                  }
                >
                  {completedPhases.has(p) ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                  P{p}
                </Badge>
              ))}
            </div>
            {remainingPhases.length > 0 && remainingPhases.length < 7 && (
              <p className="text-xs text-amber-600 mt-3">
                Complete {remainingPhases.length} more phase{remainingPhases.length > 1 ? 's' : ''} to unlock your full potential!
              </p>
            )}
            <motion.p
              className="text-xs text-pink-500/80 mt-3 italic flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="text-lg">⚠️</span> Warning: Unicorn building can be addictive!
            </motion.p>
          </CardContent>
        </Card>

        {/* Completed Assessments */}
        {hasCompletedAny && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Completed Assessments ({phaseResults.length})</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  Total Score: {formatLargeNumber(aggregatedScore)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {phaseResults.map((pr) => (
                  <Badge
                    key={`${pr.phase}-${pr.isAspirational ? 'asp' : 'cur'}`}
                    variant="outline"
                    className={pr.isAspirational ? "bg-purple-500/10 text-purple-500 border-purple-500/30" : "bg-blue-500/10 text-blue-500 border-blue-500/30"}
                  >
                    {pr.isAspirational ? <Target className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                    Phase {pr.phase}: {formatLargeNumber(pr.result.score)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <h2 className="text-xl font-bold font-heading">
              {hasCompletedAny ? "Add Another Phase Assessment" : "Configure Your Assessment"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {hasCompletedAny
                ? "Speculate on different phases - compare your current reality vs aspirations!"
                : "Select your growth stage to receive relevant questions."}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scrollable Phase Toggle - showing 3 at a time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">Growth Phase</label>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={scrollPhaseLeft}
                  disabled={!canScrollLeft}
                  className={`p-2 rounded-full transition-all ${canScrollLeft
                      ? "bg-muted hover:bg-muted/80 text-foreground"
                      : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                    }`}
                  data-testid="button-phase-scroll-left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex gap-2">
                  {visiblePhases.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPhase(p.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-w-[90px] ${phase === p.id
                          ? `${PHASE_COLORS[p.id]} text-white shadow-lg scale-105`
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      data-testid={`button-setup-phase-${p.id}`}
                    >
                      <div className="text-xs opacity-70">Phase {p.id}</div>
                      <div>{p.short}</div>
                    </button>
                  ))}
                </div>

                {phase === "7" ? (
                  <span className="p-2 text-xs text-muted-foreground italic whitespace-nowrap">Coming Soon</span>
                ) : (
                  <button
                    onClick={scrollPhaseRight}
                    disabled={!canScrollRight}
                    className={`p-2 rounded-full transition-all ${canScrollRight
                        ? "bg-muted hover:bg-muted/80 text-foreground"
                        : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                      }`}
                    data-testid="button-phase-scroll-right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Selected: <span className={`font-medium ${(PHASE_COLORS[phase] || 'bg-primary').replace('bg-', 'text-')}`}>
                  Phase {phase}: {PHASES[parseInt(phase) - 1]?.full || 'Unknown'}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Assessment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsAspirational(false)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${!isAspirational
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border hover:border-blue-500/50"
                    }`}
                  data-testid="button-current-reality"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className={`h-5 w-5 ${!isAspirational ? "text-blue-500" : "text-muted-foreground"}`} />
                    <span className="font-medium">Current Reality</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Where you are today - be honest!</p>
                </button>
                <button
                  onClick={() => setIsAspirational(true)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${isAspirational
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border hover:border-purple-500/50"
                    }`}
                  data-testid="button-aspiration"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Target className={`h-5 w-5 ${isAspirational ? "text-purple-500" : "text-muted-foreground"}`} />
                    <span className="font-medium">Aspiration</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Where you want to be - dream big!</p>
                </button>
              </div>
            </div>

            {/* Reflection Notes Section */}
            {hasCompletedAny && (
              <Card className="border-indigo-500/20 bg-indigo-500/5">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-indigo-600">Self-Improvement Journal</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Record your progress since your last assessment. This helps track your growth journey!
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="whatChanged" className="text-xs font-medium text-indigo-600">
                        What changed since your last assessment?
                      </Label>
                      <Textarea
                        id="whatChanged"
                        placeholder="New milestones achieved, pivots made, team changes..."
                        value={reflectionNotes.whatChanged}
                        onChange={(e) => setReflectionNotes(prev => ({ ...prev, whatChanged: e.target.value }))}
                        className="min-h-[60px] text-sm resize-none"
                        data-testid="input-what-changed"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="challenges" className="text-xs font-medium text-orange-600">
                        Current challenges you're facing
                      </Label>
                      <Textarea
                        id="challenges"
                        placeholder="Obstacles, blockers, areas needing improvement..."
                        value={reflectionNotes.challenges}
                        onChange={(e) => setReflectionNotes(prev => ({ ...prev, challenges: e.target.value }))}
                        className="min-h-[60px] text-sm resize-none"
                        data-testid="input-challenges"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="inspirations" className="text-xs font-medium text-green-600">
                        Inspirations & next goals
                      </Label>
                      <Textarea
                        id="inspirations"
                        placeholder="What inspires you? What are you aiming for next?"
                        value={reflectionNotes.inspirations}
                        onChange={(e) => setReflectionNotes(prev => ({ ...prev, inspirations: e.target.value }))}
                        className="min-h-[60px] text-sm resize-none"
                        data-testid="input-inspirations"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-gradient-to-r from-primary/10 via-violet-500/10 to-cyan-500/10 rounded-lg border border-primary/20 text-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-bold text-primary">Your Journey, Your Story!</p>
              </div>
              <p className="text-muted-foreground">
                {hasCompletedAny
                  ? "You're doing amazing! Each phase you assess adds depth to your founder story. Compare Reality vs Aspiration, challenge friends to beat your score, and track your growth over time!"
                  : "Join thousands of founders who've discovered insights about their startup journey. Every great company started with honest self-reflection!"}
              </p>
            </motion.div>
          </CardContent>
          <CardFooter className="flex gap-3">
            {hasCompletedAny && (
              <Button variant="outline" onClick={() => {
                // Load the most recent result to display
                const lastResult = phaseResults[phaseResults.length - 1];
                setPhase(lastResult.phase.toString());
                setAnswers(lastResult.answers);
                setIsAspirational(lastResult.isAspirational);
                setStep(2);
              }} className="flex-1" data-testid="button-view-results">
                View Results
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Floating Start Assessment Button */}
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <Button
            onClick={() => { setCurrentQuestionIndex(0); setAnswers({}); setStep(1); }}
            size="lg"
            className="h-14 px-10 text-lg rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl shadow-green-500/40 transition-all"
            data-testid="button-begin-assessment"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {hasCompletedAny ? "Assess This Phase" : "Begin Assessment"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Dynamic Encouragement Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {encouragementMessages.slice(0, 3).map((msg, idx) => (
              <motion.div
                key={msg.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <Card className={`border-dashed border-2 ${msg.borderColor} bg-gradient-to-r ${msg.gradient} overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="p-3 rounded-full bg-background/80 shadow-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: idx * 0.5 }}
                      >
                        {msg.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg mb-1">{msg.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {msg.message}
                        </p>
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {msg.action.includes("Aspirational") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-500/50 text-purple-600 hover:bg-purple-500/10"
                              onClick={() => {
                                setIsAspirational(true);
                                setCurrentQuestionIndex(0);
                                setAnswers({});
                                setStep(1);
                              }}
                              data-testid="button-try-aspirational"
                            >
                              <Target className="h-4 w-4 mr-1" /> {msg.action}
                            </Button>
                          )}
                          {msg.action.includes("Reality") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
                              onClick={() => {
                                setIsAspirational(false);
                                setCurrentQuestionIndex(0);
                                setAnswers({});
                                setStep(1);
                              }}
                              data-testid="button-try-reality"
                            >
                              <TrendingUp className="h-4 w-4 mr-1" /> {msg.action}
                            </Button>
                          )}
                          {msg.action.includes("Phase") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                              onClick={() => {
                                const nextPhase = highestCompletedPhase + 1;
                                if (nextPhase <= 7) {
                                  setPhase(nextPhase.toString());
                                }
                              }}
                              data-testid="button-explore-phase"
                            >
                              <Rocket className="h-4 w-4 mr-1" /> {msg.action}
                            </Button>
                          )}
                          {msg.action.includes("Share") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/50 text-green-600 hover:bg-green-500/10"
                              onClick={() => setShowShareModal(true)}
                              data-testid="button-share-encourage"
                            >
                              <Share2 className="h-4 w-4 mr-1" /> {msg.action}
                            </Button>
                          )}
                          {msg.action.includes("Continue") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-indigo-500/50 text-indigo-600 hover:bg-indigo-500/10"
                              onClick={() => addAnotherPhase()}
                              data-testid="button-continue-exploring"
                            >
                              <Sparkles className="h-4 w-4 mr-1" /> {msg.action}
                            </Button>
                          )}
                          {msg.action.includes("Start") && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90"
                              onClick={() => {
                                setCurrentQuestionIndex(0);
                                setAnswers({});
                                setStep(1);
                              }}
                              data-testid="button-start-journey"
                            >
                              <Lightbulb className="h-4 w-4 mr-1" /> {msg.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (step === 1) {
    const q = relevantQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / totalQuestions) * 100;
    const currentVal = answers[q.id] || 3; // Default to mid-point
    const motivation = getMotivationalMessage(parseInt(phase));
    const milestoneMsg = getMilestoneMessage(progress, currentQuestionIndex + 1, totalQuestions);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <PersistentCTAHeader />

        {/* Mid-Question Encouragement */}
        <AnimatePresence>
          {milestoneMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent rounded-lg border border-amber-500/30 text-center"
            >
              <motion.span
                className="text-2xl mr-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {milestoneMsg.emoji}
              </motion.span>
              <span className="font-bold text-amber-600">{milestoneMsg.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prominent Stage Indicator During Assessment */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isAspirational ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
              {isAspirational ? <Target className="h-5 w-5 text-purple-500" /> : <TrendingUp className="h-5 w-5 text-blue-500" />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {isAspirational ? 'Aspirational Assessment' : 'Current Reality'}
              </p>
              <p className="font-bold text-primary">Phase {phase}: {PHASE_NAMES[parseInt(phase)]}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Journey Progress</p>
            <p className="font-bold text-amber-600">{completedPhases.size}/7 Phases</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">BETA</Badge>
            {answerStreak >= 2 && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: showStreakBonus ? 1.2 : 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-1"
              >
                <Badge className={`text-white text-xs ${showStreakBonus ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-bounce' : 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse'}`}>
                  🔥 {answerStreak} Streak {showStreakBonus && '🎉'}
                </Badge>
              </motion.div>
            )}
          </div>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}% Completed</span>
        </div>
        <Progress value={progress} className="h-2" />

        <Card className="border-border bg-card shadow-lg min-h-[500px] flex flex-col">
          <CardContent className="p-6 md:p-10 space-y-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <Badge variant={q.category === "Dimension" ? "default" : "destructive"} className="mb-2">
                    {q.category === "Dimension" ? "Growth Dimension" : "Elephant in the Room (Risk)"}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    Tap to select your answer
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold leading-tight">
                  {q.text}
                </h2>
                <p className="text-muted-foreground italic text-sm">
                  Rate your confidence level based on your gut feeling.
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-5 gap-2 md:gap-4 mt-8">
              {ANSWER_OPTIONS.map((option, idx) => {
                const isSelected = answers[q.id] === option.value;
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(option.value)}
                    data-testid={`button-answer-${option.value}`}
                    className={`relative flex flex-col items-center justify-center p-3 md:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group overflow-hidden ${isSelected
                        ? `${option.border} ${option.bg} shadow-lg ring-2 ring-offset-2 ring-offset-background ${option.border.replace('border-', 'ring-')}`
                        : "border-border hover:border-muted-foreground/50 bg-card hover:bg-muted/50"
                      }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selectedGlow"
                        className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-20`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}

                    <motion.div
                      animate={isSelected ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                      className="relative z-10"
                    >
                      <span className="text-2xl md:text-4xl">{option.emoji}</span>
                    </motion.div>

                    <motion.div
                      className={`mt-2 font-bold text-xs md:text-sm text-center relative z-10 ${isSelected ? option.text : "text-muted-foreground group-hover:text-foreground"}`}
                    >
                      {option.value}
                    </motion.div>

                    <motion.div
                      className={`text-[10px] md:text-xs text-center relative z-10 ${isSelected ? option.text : "text-muted-foreground/70"}`}
                    >
                      {option.label}
                    </motion.div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-br ${option.color}`}
                      >
                        <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {answers[q.id] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-4"
              >
                <p className={`text-lg font-bold ${ANSWER_OPTIONS[answers[q.id] - 1]?.text || 'text-primary'}`}>
                  Your answer: {ANSWER_OPTIONS[answers[q.id] - 1]?.emoji} {ANSWER_OPTIONS[answers[q.id] - 1]?.label}
                </p>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="p-6 md:p-10 pt-0 flex justify-center items-center">
            <div className="text-sm text-muted-foreground">
              {!answers[q.id] && <span className="animate-pulse">Select an answer above</span>}
            </div>
          </CardFooter>
        </Card>

        {/* Floating Navigation Bar - Always Visible */}
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background/95 backdrop-blur-md rounded-full px-6 py-4 shadow-2xl border border-border/50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{currentQuestionIndex + 1}/{totalQuestions}</span>
          </div>

          <div className="w-px h-8 bg-border/50" />

          {/* Previous Button */}
          {currentQuestionIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="rounded-full"
              data-testid="button-prev-question"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {/* Next/Finish Button with Hint */}
          <div
            className="relative group"
            onMouseEnter={() => {
              if (!answers[q.id]) {
                setShowNextHint(true);
              }
            }}
            onMouseLeave={() => setShowNextHint(false)}
          >
            <AnimatePresence>
              {!answers[q.id] && showNextHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block mr-1"
                  >
                    👆
                  </motion.span>
                  Pick an option above first!
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                    <div className="border-8 border-transparent border-t-amber-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={nextQuestion}
              size="lg"
              className={`px-8 rounded-full transition-all ${answers[q.id] ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              disabled={!answers[q.id]}
              data-testid="button-next-question"
            >
              {!answers[q.id] ? (
                <>
                  <span className="mr-2">👆</span>
                  Click the Right Answer Above
                </>
              ) : currentQuestionIndex === totalQuestions - 1 ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Finish Assessment
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 2 && result) {
    const recommendedStories = mockStories.filter(s => result.recommendedStories.includes(s.id));
    const scoreBadge = getScoreBadge(result.score);

    // Prepare data for Radar Charts
    const dimensionQuestions = relevantQuestions.filter(q => q.category === "Dimension");
    const eirQuestions = relevantQuestions.filter(q => q.category === "EiR");

    const dimensionData = dimensionQuestions.map(q => ({
      subject: q.code,
      A: answers[q.id] || 0,
      fullMark: 5
    }));

    const eirData = eirQuestions.map(q => ({
      subject: q.code,
      A: answers[q.id] || 0,
      fullMark: 5
    }));

    return (
      <div className="space-y-10 animate-in fade-in zoom-in duration-500">
        <Confetti active={showConfetti} />
        <PersistentCTAHeader />

        {/* Share Results Modal */}
        <ShareResultsModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          result={result}
          badge={scoreBadge}
          phase={parseInt(phase)}
          phaseName={PHASE_NAMES[parseInt(phase)] || `Phase ${phase}`}
          isAspirational={isAspirational}
          timestamp={timestamp}
          onRegister={openRegistrationPopup}
        />

        {/* AI Coaching Chatbot */}
        <CoachingChat
          assessmentContext={{
            phase: parseInt(phase),
            phaseName: PHASE_NAMES[parseInt(phase)] || `Phase ${phase}`,
            isAspirational,
            score: result.score,
            dimensionScore: result.dimensionScore,
            thriveScore: result.riskScore,
            badge: scoreBadge.name,
          }}
        />

        {/* Badge Share Modal */}
        {selectedBadge && (
          <BadgeShareModal
            isOpen={showBadgeModal}
            onClose={() => { setShowBadgeModal(false); setSelectedBadge(null); }}
            badge={selectedBadge}
            earnedAt={timestamp}
          />
        )}

        {/* Newly Earned Badges Celebration */}
        <AnimatePresence>
          {newBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setNewBadges([])}
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center border border-amber-500/30 shadow-2xl shadow-amber-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {newBadges.length === 1 ? "New Badge Earned!" : `${newBadges.length} New Badges Earned!`}
                </h3>
                <div className="flex flex-wrap justify-center gap-3 my-6">
                  {newBadges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${badge.bgGradient} border-2 ${badge.borderColor}`}
                    >
                      <span className="text-4xl block">{badge.emoji}</span>
                      <span className={`text-sm font-bold ${badge.color} mt-2 block`}>{badge.name}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setNewBadges([])}
                  >
                    Continue
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-purple-600"
                    onClick={() => {
                      setSelectedBadge(newBadges[0]);
                      setShowBadgeModal(true);
                      setNewBadges([]);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Badge
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className={`inline-flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br ${scoreBadge.color} text-white shadow-xl`}>
            <motion.span
              className="text-5xl md:text-6xl"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {scoreBadge.emoji}
            </motion.span>
            <span className="text-2xl font-bold mt-2">{scoreBadge.name} Status!</span>
            <span className="text-sm opacity-90 mt-1">{scoreBadge.message}</span>
          </div>
        </motion.div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">Assessment Completed!</Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">BETA</Badge>
          </div>
          <h2 className="text-4xl font-heading font-bold">Your Assessment Results</h2>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground font-mono mt-2 flex-wrap">
            <span>Generated: {timestamp}</span>
            <span className="hidden sm:inline">•</span>
            <span>IP: {ipAddress}</span>
          </div>
        </div>

        {/* Multi-Phase Summary */}
        {phaseResults.length > 1 && (
          <Card className="border-gradient bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-heading">Combined Assessment Summary</CardTitle>
              <CardDescription>Aggregated scores across {phaseResults.length} phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-3xl font-mono font-bold text-green-500">{formatLargeNumber(aggregatedDimensionScore)}</div>
                  <div className="text-sm text-muted-foreground">Total Growth Potential</div>
                </div>
                <div className="text-center p-4 bg-amber-500/10 rounded-lg">
                  <div className="text-3xl font-mono font-bold text-amber-500">{formatLargeNumber(aggregatedThriveScore)}</div>
                  <div className="text-sm text-muted-foreground">Total Thrive Factor</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-3xl font-mono font-bold text-primary">{formatLargeNumber(aggregatedScore)}</div>
                  <div className="text-sm text-muted-foreground">Combined Total</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Phases Assessed:</h4>
                <div className="grid gap-2">
                  {phaseResults.sort((a, b) => a.phase - b.phase).map((pr) => (
                    <div
                      key={`${pr.phase}-${pr.isAspirational ? 'asp' : 'cur'}`}
                      className={`flex items-center justify-between p-3 rounded-lg border ${pr.isAspirational
                          ? "bg-purple-500/5 border-purple-500/20"
                          : "bg-blue-500/5 border-blue-500/20"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {pr.isAspirational ? (
                          <Target className="h-5 w-5 text-purple-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <span className="font-medium">Phase {pr.phase}: {pr.phaseName}</span>
                          <Badge
                            variant="outline"
                            className={`ml-2 text-xs ${pr.isAspirational ? "text-purple-500 border-purple-500/30" : "text-blue-500 border-blue-500/30"}`}
                          >
                            {pr.isAspirational ? "Aspiration" : "Current"}
                          </Badge>
                        </div>
                      </div>
                      <span className="font-mono font-bold">{formatLargeNumber(pr.result.score)}</span>
                    </div>
                  ))}
                </div>

                {currentPhases.length > 0 && aspirationalPhases.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-dashed">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      Reality Check: Aspiration Gap
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your aspirational scores are{" "}
                      <span className="font-bold text-purple-500">
                        {formatLargeNumber(aspirationalPhases.reduce((sum, p) => sum + p.result.score, 0))}
                      </span>{" "}
                      vs current reality of{" "}
                      <span className="font-bold text-blue-500">
                        {formatLargeNumber(currentPhases.reduce((sum, p) => sum + p.result.score, 0))}
                      </span>
                      . Use this gap to set goals and track your growth journey!
                    </p>
                  </div>
                )}

                {/* Self-Improvement Journal Display */}
                {phaseResults.some(pr => pr.reflectionNotes && (pr.reflectionNotes.whatChanged || pr.reflectionNotes.challenges || pr.reflectionNotes.inspirations)) && (
                  <div className="mt-6">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-indigo-500" />
                      Your Growth Journal
                    </h4>
                    <div className="space-y-3">
                      {phaseResults.filter(pr => pr.reflectionNotes && (pr.reflectionNotes.whatChanged || pr.reflectionNotes.challenges || pr.reflectionNotes.inspirations)).map((pr) => (
                        <Card key={`journal-${pr.phase}-${pr.isAspirational ? 'asp' : 'cur'}`} className="border-indigo-500/20 bg-indigo-500/5">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              {pr.isAspirational ? (
                                <Target className="h-4 w-4 text-purple-500" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="font-medium text-sm">
                                Phase {pr.phase}: {pr.phaseName}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {pr.isAspirational ? 'Aspiration' : 'Current'}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              {pr.reflectionNotes?.whatChanged && (
                                <div className="p-2 bg-indigo-500/10 rounded">
                                  <span className="font-medium text-indigo-600">What Changed: </span>
                                  <span className="text-muted-foreground">{pr.reflectionNotes.whatChanged}</span>
                                </div>
                              )}
                              {pr.reflectionNotes?.challenges && (
                                <div className="p-2 bg-orange-500/10 rounded">
                                  <span className="font-medium text-orange-600">Challenges: </span>
                                  <span className="text-muted-foreground">{pr.reflectionNotes.challenges}</span>
                                </div>
                              )}
                              {pr.reflectionNotes?.inspirations && (
                                <div className="p-2 bg-green-500/10 rounded">
                                  <span className="font-medium text-green-600">Inspirations: </span>
                                  <span className="text-muted-foreground">{pr.reflectionNotes.inspirations}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Phase Results */}
        <div className="space-y-4">
          <h3 className="text-xl font-heading font-bold text-center">
            Phase {phase} Results: {PHASE_NAMES[parseInt(phase)]}
            {isAspirational && (
              <Badge variant="outline" className="ml-2 text-purple-500 border-purple-500/30">Aspirational</Badge>
            )}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-green-500/20 shadow-lg shadow-green-500/10">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-2">
                <div className="text-4xl font-mono font-bold text-green-500">{result.formattedDimensionScore}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Growth Potential</div>
                <div className="text-xs text-muted-foreground">of {formatLargeNumber(result.phaseMax)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-amber-500/20 shadow-lg shadow-amber-500/10">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-2">
                <div className="text-4xl font-mono font-bold text-amber-500">{result.formattedThriveScore}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Thrive Factor</div>
                <div className="text-xs text-muted-foreground">of {formatLargeNumber(result.phaseMax)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-primary/20 shadow-lg shadow-primary/10">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-2">
                <div className="text-4xl font-mono font-bold text-primary">{result.formattedTotalScore}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Total Score</div>
                <div className="text-xs text-muted-foreground">of {formatLargeNumber(result.phaseMax * 2)}</div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Phase Selection Toggle - Matching Landing Page Style */}
        <div className="max-w-lg mx-auto p-4 bg-card/50 backdrop-blur border rounded-2xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-medium">Select Your Growth Phase</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={scrollPhaseLeft}
              disabled={parseInt(phase) <= 1}
              className={`p-2 rounded-full transition-all ${parseInt(phase) > 1
                  ? "bg-muted hover:bg-muted/80 text-foreground"
                  : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {visiblePhases.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPhase(p.id);
                    safeSetItem('lastSelectedPhase', p.id);
                    setStep(0);
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-w-[100px] ${phase === p.id
                      ? `${PHASE_COLORS[p.id]} text-white shadow-lg scale-105`
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <div className="text-xs opacity-70">Phase {p.id}</div>
                  <div>{p.short}</div>
                </button>
              ))}
            </div>

            {phase === "7" ? (
              <span className="p-2 text-xs text-muted-foreground italic whitespace-nowrap">Coming Soon</span>
            ) : (
              <button
                onClick={scrollPhaseRight}
                disabled={parseInt(phase) >= 7}
                className={`p-2 rounded-full transition-all ${parseInt(phase) < 7
                    ? "bg-muted hover:bg-muted/80 text-foreground"
                    : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                  }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Selected: <span className={`font-medium ${(PHASE_COLORS[phase] || 'bg-primary').replace('bg-', 'text-')}`}>
              Phase {phase}: {PHASES[parseInt(phase) - 1]?.full || 'Unknown'}
            </span>
          </p>
        </div>

        {/* New Assessment Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <Button
            onClick={() => {
              setAnswers({});
              setCurrentQuestionIndex(0);
              setStep(0);
            }}
            size="lg"
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all group"
            data-testid="button-new-assessment"
          >
            <motion.span
              className="mr-2"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            >
              🚀
            </motion.span>
            Launch New Assessment
            <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
          </Button>
        </motion.div>

        {/* Polar Charts Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-blue-600">Growth Dimensions</CardTitle>
              <CardDescription>Strength across key value drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <SimpleRadarChart data={dimensionData} color="#2563eb" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-amber-600">Thrive Factor!</CardTitle>
              <CardDescription>Your ability to overcome challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <SimpleRadarChart data={eirData} color="#f59e0b" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inline Assessment CTA - After Charts */}
        <div className="flex justify-center py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setAnswers({}); setCurrentQuestionIndex(0); setStep(0); }}
            className="border-violet-500/30 hover:bg-violet-500/10 text-violet-600 group"
            data-testid="button-new-assessment-inline-1"
          >
            <Rocket className="mr-2 h-4 w-4 group-hover:animate-bounce" />
            Try Another Phase
          </Button>
        </div>

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold font-heading mb-2 flex items-center gap-2">
              <BarChart3 className="text-primary" /> Analysis
            </h3>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {result.summary}
            </p>
          </CardContent>
        </Card>

        {/* Smart Next Steps Panel */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 15 }}
        >
          <Card className="border-2 border-dashed border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 overflow-hidden">
            <CardContent className="p-6">
              <motion.h3
                className="text-xl font-bold font-heading mb-4 flex items-center gap-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                >
                  <Zap className="h-5 w-5 text-amber-500" />
                </motion.span>
                Your Next Power Move
              </motion.h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Next Phase Suggestion */}
                {parseInt(phase) < 7 && (
                  <motion.div
                    initial={{ opacity: 0, x: -50, rotateY: -20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)" }}
                    className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        className={`w-8 h-8 rounded-full ${PHASE_COLORS[(parseInt(phase) + 1).toString()]} text-white flex items-center justify-center font-bold text-sm`}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        {parseInt(phase) + 1}
                      </motion.div>
                      <motion.span
                        className="font-bold text-violet-600"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 1, repeatDelay: 2 }}
                      >
                        Level Up!
                      </motion.span>
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 1, type: "spring", stiffness: 200 }}
                      >
                        <Badge className="bg-amber-500 text-white text-xs animate-pulse">10X POINTS</Badge>
                      </motion.div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ready for <span className="font-bold">{PHASE_NAMES[parseInt(phase) + 1]}</span>?
                      Each phase multiplies your potential score by 10X!
                    </p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        onClick={() => {
                          const nextPhase = (parseInt(phase) + 1).toString();
                          setPhase(nextPhase);
                          safeSetItem('lastSelectedPhase', nextPhase);
                          setAnswers({});
                          setCurrentQuestionIndex(0);
                          setStep(0);
                        }}
                        data-testid="button-next-phase"
                      >
                        <motion.span
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="mr-2"
                        >
                          <Rocket className="h-4 w-4" />
                        </motion.span>
                        Start Phase {parseInt(phase) + 1}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Aspiration Mode Suggestion */}
                {!isAspirational && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, rotateY: 20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 120 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(6, 182, 212, 0.3)" }}
                    className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      >
                        <Target className="h-6 w-6 text-cyan-500" />
                      </motion.div>
                      <motion.span
                        className="font-bold text-cyan-600"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        Dream Bigger!
                      </motion.span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2, type: "spring" }}
                      >
                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-600 text-xs">COMPARE</Badge>
                      </motion.div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      You assessed your <span className="font-bold">Current Reality</span>.
                      Now see where you <span className="italic">aspire</span> to be and reveal your ambition gap!
                    </p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10"
                        onClick={() => {
                          setIsAspirational(true);
                          setAnswers({});
                          setCurrentQuestionIndex(0);
                          setStep(0);
                        }}
                        data-testid="button-aspiration-mode"
                      >
                        <motion.span
                          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                          transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                          className="mr-2"
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.span>
                        Take Aspiration Assessment
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* If Aspiration mode was used, suggest Reality */}
                {isAspirational && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                      <span className="font-bold text-blue-600">Ground Truth!</span>
                      <Badge variant="outline" className="border-blue-500/50 text-blue-600 text-xs">COMPARE</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      You assessed your <span className="font-bold">Aspirations</span>.
                      Now check your <span className="italic">current reality</span> to measure the gap!
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
                      onClick={() => {
                        setIsAspirational(false);
                        setAnswers({});
                        setCurrentQuestionIndex(0);
                        setStep(0);
                      }}
                      data-testid="button-reality-mode"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Take Reality Assessment
                    </Button>
                  </motion.div>
                )}

                {/* Phase 7 Completed - Celebration */}
                {parseInt(phase) === 7 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🦄</span>
                      <span className="font-bold text-amber-600">Unicorn Territory!</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      You've reached the pinnacle! Share your legendary journey with the world!
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                      onClick={() => setShowShareModal(true)}
                      data-testid="button-share-unicorn"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Your Unicorn Status
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestone Badges Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-violet-500" />
                Growth Milestone Badges
              </CardTitle>
              <CardDescription>
                Collect badges as you progress through your startup journey. Click earned badges to share!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {MILESTONE_BADGES.map((badge) => (
                  <BadgeDisplay
                    key={badge.id}
                    badge={badge}
                    isEarned={earnedBadges.includes(badge.id)}
                    onClick={() => {
                      setSelectedBadge(badge);
                      setShowBadgeModal(true);
                    }}
                  />
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <span className="font-medium text-violet-500">{earnedBadges.length}</span> of {MILESTONE_BADGES.length} badges earned
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        >
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <motion.span
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                  >
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </motion.div>
                  Global Leaderboard
                </motion.span>
                {!hasClaimedSpot && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white animate-pulse"
                      onClick={() => setShowLeaderboardModal(true)}
                      data-testid="button-claim-spot"
                    >
                      🏆 Claim Your Spot!
                    </Button>
                  </motion.div>
                )}
              </CardTitle>
              <CardDescription>Top performers across all phases</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboardEntries.length > 0 ? (
                <div className="space-y-2">
                  {leaderboardEntries.slice(0, 10).map((entry, idx) => {
                    const badge = getScoreBadge(parseFloat(entry.score));
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.8 + idx * 0.08, type: "spring", stiffness: 150 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${idx === 0 ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30' :
                            idx === 1 ? 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border border-slate-400/30' :
                              idx === 2 ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border border-amber-600/30' :
                                'bg-muted/30'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500 text-white' :
                                idx === 1 ? 'bg-slate-400 text-white' :
                                  idx === 2 ? 'bg-amber-700 text-white' :
                                    'bg-muted text-muted-foreground'
                              }`}
                            animate={idx < 3 ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2, delay: idx * 0.3 }}
                          >
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                          </motion.span>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {entry.displayName}
                              {entry.displayType === 'fancy' && <span className="text-xs">🦸</span>}
                              {entry.displayType === 'anonymous' && <span className="text-xs">🎭</span>}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Phase {entry.phase} • {entry.isAspirational ? 'Aspiration' : 'Reality'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.div
                            className="font-bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 + idx * 0.1 }}
                          >
                            {parseFloat(entry.score).toLocaleString()}
                          </motion.div>
                          <div className="text-xs">{badge.emoji} {badge.name}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Be the first on the leaderboard!</p>
                  <p className="text-sm">Claim your spot and start the competition.</p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                    onClick={() => setShowLeaderboardModal(true)}
                    data-testid="button-claim-spot-empty"
                  >
                    🏆 Claim First Place!
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-amber-500/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-bl-lg">
            JOIN i2u.ai
          </div>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-heading flex items-center justify-center gap-2">
                  <Trophy className="text-amber-500 h-6 w-6" /> Become an i2u.ai Member
                </h3>
                <p className="text-muted-foreground">
                  Save your assessment results forever, unlock personalized startup coaching, and join the community of aspiring unicorn founders!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center py-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-500">{result.formattedDimensionScore}</div>
                  <div className="text-xs text-muted-foreground">Growth Score</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-amber-500">{result.formattedThriveScore}</div>
                  <div className="text-xs text-muted-foreground">Thrive Factor</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-violet-500">{scoreBadge.emoji}</div>
                  <div className="text-xs text-muted-foreground">{scoreBadge.name} Status</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-4 rounded-lg border border-violet-500/20">
                <p className="text-sm font-medium text-violet-600 mb-2">What you'll get as an i2u.ai member:</p>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Permanent storage of all your assessments</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> AI-powered personalized startup coaching</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Unique referral link to challenge your network</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Access to unicorn case studies and insights</li>
                </ul>
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg w-full"
                onClick={() => {
                  const params = new URLSearchParams({
                    score: result.score.toString(),
                    phase: phase,
                    phaseName: PHASE_NAMES[parseInt(phase)] || `Phase ${phase}`,
                    dimensionScore: result.dimensionScore.toString(),
                    thriveScore: result.riskScore.toString(),
                    badge: scoreBadge.name,
                    isAspirational: isAspirational.toString(),
                    timestamp: timestamp,
                    source: 'valuehub_assessment'
                  });
                  openRegistrationPopup(params);
                }}
                data-testid="button-register-save"
              >
                <Rocket className="mr-2 h-5 w-5" /> Register at i2u.ai & Save Your Results
              </Button>

              <p className="text-xs text-muted-foreground">
                Your assessment data will be linked to your i2u.ai account for future reference and tracking
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h3 className="text-xl font-bold font-heading flex items-center justify-center gap-2">
                <Share2 className="text-violet-500 h-5 w-5" /> Share Your Results
              </h3>
              <p className="text-sm text-muted-foreground mb-2">Share your graphical results with your network:</p>

              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                onClick={() => setShowShareModal(true)}
                data-testid="button-open-share-modal"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Share Visual Results Card
              </Button>

              <p className="text-xs text-muted-foreground">
                Target investors, co-founders, team members, or challenge friends with customized messages
              </p>

              <div className="border-t w-full pt-4 mt-2">
                <p className="text-xs text-muted-foreground mb-3">Quick share with referral link:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1DA1F2]/10 border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 text-[#1DA1F2]"
                    onClick={() => {
                      const referralUrl = 'https://i2u.ai/register?ref=valuehub';
                      const text = `${scoreBadge.emoji} I scored ${result.formattedTotalScore} on @i2uai! Think you can beat that? Take the challenge & earn referral rewards:`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`, '_blank');
                    }}
                    data-testid="button-share-twitter"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 text-[#0A66C2]"
                    onClick={() => {
                      const referralUrl = 'https://i2u.ai/register?ref=valuehub';
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, '_blank');
                    }}
                    data-testid="button-share-linkedin"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366]"
                    onClick={() => {
                      const referralUrl = 'https://i2u.ai/register?ref=valuehub';
                      const referralBonus = `\n\n🎁 REFERRAL BONUS:\n• 100 pts per assessment\n• 500 pts when they register\n• 1000 pts for all 7 phases`;
                      const text = `${scoreBadge.emoji} I scored ${result.formattedTotalScore} on the i2u.ai Startup Assessment!\n\nThink you can beat that? Take the challenge via my referral: ${referralUrl}${referralBonus}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    data-testid="button-share-whatsapp"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#EA4335]/10 border-[#EA4335]/30 hover:bg-[#EA4335]/20 text-[#EA4335]"
                    onClick={() => {
                      const referralUrl = 'https://i2u.ai/register?ref=valuehub';
                      const subject = `Can You Beat My Startup Score? ${result.formattedTotalScore} ${scoreBadge.emoji}`;
                      const body = `Hey!\n\nI just scored ${result.formattedTotalScore} on the i2u.ai Startup Assessment and got ${scoreBadge.name} status!\n\nI challenge you to beat it via my referral link: ${referralUrl}\n\n🎁 REFERRAL BONUS:\n• 100 points per referral who takes the assessment\n• 500 bonus points when they register\n• 1000 points when they complete all 7 phases\n• Redeem points for premium coaching, case studies & more!\n\nLet me know your score!`;
                      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                    }}
                    data-testid="button-share-email"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Phase Switch Dropdown */}
        <Card className="border-primary/20 bg-card/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                <span className="font-medium">Jump to Another Phase:</span>
              </div>
              <Select value={phase} onValueChange={switchToPhase}>
                <SelectTrigger className="w-[280px]" data-testid="select-switch-phase">
                  <SelectValue placeholder="Select Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Phase 1: Idea Validation</SelectItem>
                  <SelectItem value="2">Phase 2: Product Development</SelectItem>
                  <SelectItem value="3">Phase 3: Market Entry</SelectItem>
                  <SelectItem value="4">Phase 4: Growth & Scaling</SelectItem>
                  <SelectItem value="5">Phase 5: Maturity & Profitability</SelectItem>
                  <SelectItem value="6">Phase 6: Leadership & Innovation</SelectItem>
                  <SelectItem value="7">Phase 7: Unicorn & Beyond</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4 gap-4 flex-wrap">
          <Link href="/value-stories">
            <Button variant="outline">
              Back to Insights
            </Button>
          </Link>
          <Button variant="outline" onClick={resetAll}>
            Start Over
          </Button>
        </div>

        {/* Floating Controls - Always Visible */}
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-background/95 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl border border-border/50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          {/* Phase Quick Selector */}
          <div className="flex items-center gap-1">
            {PHASES.slice(0, 7).map((p, idx) => {
              const phaseNum = (idx + 1).toString();
              const isActive = phase === phaseNum;
              const isCompleted = phaseResults.some(pr => pr.phase === idx + 1);
              const isSuggestedNext = highestCompletedPhase > 0 && idx + 1 === highestCompletedPhase + 1;
              return (
                <motion.button
                  key={phaseNum}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setPhase(phaseNum);
                    safeSetItem('lastSelectedPhase', phaseNum);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setStep(0);
                  }}
                  className={`relative w-8 h-8 rounded-full text-xs font-bold transition-all ${isActive
                      ? `${PHASE_COLORS[phaseNum]} text-white shadow-lg ring-2 ring-white/50`
                      : isCompleted
                        ? `${PHASE_COLORS[phaseNum]} text-white opacity-70`
                        : isSuggestedNext
                          ? `${PHASE_COLORS[phaseNum]} text-white`
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  title={`Phase ${phaseNum}: ${p.short}${isCompleted ? ' ✓' : isSuggestedNext ? ' (Suggested!)' : ''}`}
                  data-testid={`button-floating-phase-${phaseNum}`}
                >
                  {phaseNum}
                  {isCompleted && !isActive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-[8px]">✓</span>
                  )}
                  {isSuggestedNext && !isActive && (
                    <>
                      <motion.span
                        className="absolute inset-0 rounded-full"
                        style={{ boxShadow: `0 0 12px 4px var(--phase-glow)` }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 0.3, 0.8]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <motion.span
                        className="absolute -top-2 -right-2 text-xs"
                        animate={{ y: [0, -3, 0], scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      >
                        ⬆️
                      </motion.span>
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="w-px h-8 bg-border/50" />

          {/* Start Next Phase Button - Only show when there's a suggested next phase */}
          {highestCompletedPhase > 0 && highestCompletedPhase < 7 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            >
              <Button
                onClick={() => {
                  const nextPhase = (highestCompletedPhase + 1).toString();
                  setPhase(nextPhase);
                  safeSetItem('lastSelectedPhase', nextPhase);
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setIsAspirational(false);
                  setAnswerStreak(0);
                  setLastAnswerTime(null);
                  setStep(1); // Skip setup, go directly to quiz
                }}
                size="sm"
                className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 transition-all group animate-pulse"
                data-testid="button-start-next-phase"
              >
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="mr-1"
                >
                  ▶️
                </motion.span>
                <span className="hidden sm:inline">Start Phase {highestCompletedPhase + 1}</span>
                <span className="sm:hidden">Start P{highestCompletedPhase + 1}</span>
              </Button>
            </motion.div>
          )}

          <div className="w-px h-8 bg-border/50" />

          {/* New Assessment Button */}
          <Button
            onClick={() => { setAnswers({}); setCurrentQuestionIndex(0); setStep(0); }}
            size="sm"
            variant="ghost"
            className="rounded-full transition-all group"
            data-testid="button-new-assessment-floating"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              className="mr-1"
            >
              🔄
            </motion.span>
            <span className="hidden sm:inline">Redo</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}
