import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sparkles, Lightbulb, Target, Rocket, Star, HelpCircle, Zap, TrendingUp, Compass, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

type VisitorJourney = "idea" | "building" | "scaling" | "exploring" | null;

const DISCOVERY_JOURNEYS = [
  {
    id: "idea" as const,
    emoji: "💡",
    title: "I have an idea",
    subtitle: "Spark stage - validating my concept",
    icon: Zap,
    color: "from-amber-500 to-yellow-500",
    levels: ["L0", "L1"],
    guidance: [
      "Perfect! L0 Spark is where every unicorn begins! Let's validate your idea together.",
      "Start with our Spark assessment to discover your idea's unicorn potential!",
      "I'll guide you through problem-solution fit and early validation.",
      "The unicorns are especially excited about new ideas - they love fresh carrots AND fresh concepts!",
    ],
    cta: "Start Spark Assessment",
    ctaLink: "/value-journey"
  },
  {
    id: "building" as const,
    emoji: "🔨",
    title: "I'm building",
    subtitle: "Hunt to Launch - developing my product",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    levels: ["L1", "L2", "L3"],
    guidance: [
      "Excellent! You're in the exciting Hunt-Build-Launch zone!",
      "Let's assess your product-market fit and go-to-market readiness.",
      "The L1-L3 assessments will reveal your blind spots before investors do!",
      "My unicorns love builders - they respect anyone who works as hard as they do!",
    ],
    cta: "Assess My Progress",
    ctaLink: "/value-journey"
  },
  {
    id: "scaling" as const,
    emoji: "🚀",
    title: "I'm scaling",
    subtitle: "Grow to Icon - expanding my venture",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-500",
    levels: ["L4", "L5", "L6", "L7"],
    guidance: [
      "Impressive! You're on the path from Growth to Unicorn status!",
      "L4-L7 assessments focus on scaling, efficiency, and market leadership.",
      "Let's identify what separates good companies from legendary unicorns!",
      "The unicorns pulling my coach? They started where you are now! 🦄",
    ],
    cta: "Scale Assessment",
    ctaLink: "/value-journey"
  },
  {
    id: "exploring" as const,
    emoji: "🧭",
    title: "Just exploring",
    subtitle: "Learn about the Value Journey",
    icon: Compass,
    color: "from-emerald-500 to-teal-500",
    levels: [],
    guidance: [
      "Welcome, curious explorer! The Value Journey has 9 levels from Spark to Jedi.",
      "Take a look around - learn from unicorn case studies and success patterns.",
      "When you're ready, I'll be here to guide you through your first assessment!",
      "The unicorns appreciate a thoughtful explorer - no rush, enjoy the ride! 🎠",
    ],
    cta: "Explore Value Journey",
    ctaLink: "/value-journey"
  }
];

const COACH_PERSONALITY = {
  name: "Unicorn Coach",
  tagline: "Your Coach Drawn by Unicorns 🦄🎠",
  humor: [
    "I'm your Unicorn Coach! Yes, I'm literally pulled by unicorns. The irony isn't lost on me.",
    "Being a coach drawn by unicorns means I've seen it all... from behind! 😅",
    "They say I'm the brains, but honestly? The unicorns do all the heavy lifting.",
    "Fun fact: Unicorns are terrible at following GPS. We take the scenic route EVERY time.",
    "I've been coaching since before it was cool. Back then we called it 'getting lost together'.",
    "The unicorns wanted me to tell you: they believe in you. Also, they want carrots.",
    "Some coaches have fancy offices. I have a carriage and very opinionated unicorns.",
  ]
};

const COACH_TIPS = {
  home: [
    "Welcome aboard the Unicorn Coach Express! 🎠 Ready to discover your unicorn potential?",
    "Every unicorn founder started exactly where you are. I should know - I've given them all rides!",
    "Pro tip from your Coach: 90% of successful founders assess their readiness. The other 10% are too busy running unicorns!",
    "Complete all 9 levels to unlock your full founder potential score! I'll be here cheering from my carriage!",
    "Your journey from Spark to Unicorn starts with a single assessment. Hop on, the unicorns are warmed up! 🦄",
  ],
  assessment: [
    "Take your time with each question. The unicorns are patient... mostly.",
    "Stuck? Think about real examples. I once got stuck in a dragon's cave. Very educational!",
    "Remember: There are no wrong answers! Unlike that time I took the wrong turn into a volcano...",
    "Tip: Rating 3-4 is common. 5s are for true mastery! (The unicorns gave me a 2 for navigation)",
    "Each Gleam you earn brings you closer to Alicorn status! That's basically unicorn royalty!",
  ],
  stakeholder: [
    "Your role shapes your journey. Choose what fits - unlike my hat, which never quite fits.",
    "Different stakeholders see the ecosystem differently. I see it from a bouncing carriage!",
    "As a founder? Focus on vision. As your Coach? Focus on not falling off the carriage!",
    "All 9 stakeholder types contribute to the unicorn ecosystem! Even us coaches pulled by them!",
    "Your stakeholder choice unlocks personalized questions. My choice unlocked chronic back pain. 🎠",
  ],
  level: [
    "Each level is a milestone. Like when I graduated from 'terrible driver' to 'slightly less terrible'!",
    "L0 Spark is where ideas ignite. L8 Jedi is legacy mastery! I'm somewhere around L2: Lost Again.",
    "Don't skip levels - each builds on the previous one. Trust me, I tried skipping gravity once.",
    "The gap between current and aspirational levels shows growth opportunity! And possibly a canyon.",
    "Masters complete all levels. I mastered napping while the unicorns do the work! 😴",
  ],
  results: [
    "Congratulations! 🎉 Even the unicorns are doing a little dance (it's quite majestic)!",
    "Share your results! When I share mine, people usually laugh... at me, not with me.",
    "Compare your scores over time. I compare my bruises over time. Carriage life!",
    "Each completed level adds to your lifetime Alicorn count! That's like frequent flyer miles, but cooler!",
    "Ready for the next challenge? The unicorns are pawing the ground! They're excited! Or hungry!",
  ],
};

type CoachContext = keyof typeof COACH_TIPS;

interface UnicornCoachProps {
  context?: CoachContext;
  stakeholder?: string;
  level?: string;
  className?: string;
  autoShow?: boolean;
}

export function UnicornCoach({ 
  context = "home", 
  stakeholder,
  level,
  className = "",
  autoShow = true 
}: UnicornCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showCenterPopup, setShowCenterPopup] = useState(false);
  const [helpCheckPhase, setHelpCheckPhase] = useState<"idle" | "jumping" | "asking" | "response">("idle");
  const [humorIndex, setHumorIndex] = useState(0);
  const [floatPosition, setFloatPosition] = useState({ x: 0, y: 0 });
  const [isExcited, setIsExcited] = useState(false);
  
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<VisitorJourney>(null);
  const [discoveryStep, setDiscoveryStep] = useState<"welcome" | "select" | "guidance">("welcome");
  const [journeyTipIndex, setJourneyTipIndex] = useState(0);
  
  const tips = selectedJourney 
    ? DISCOVERY_JOURNEYS.find(j => j.id === selectedJourney)?.guidance || COACH_TIPS[context] || COACH_TIPS.home
    : COACH_TIPS[context] || COACH_TIPS.home;
  
  useEffect(() => {
    const hasSeenDiscovery = localStorage.getItem('unicornCoachDiscoverySeen');
    if (!hasSeenDiscovery && autoShow) {
      const timer = setTimeout(() => {
        setShowDiscovery(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (autoShow) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [autoShow]);
  
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, tips.length]);

  useEffect(() => {
    const floatInterval = setInterval(() => {
      setFloatPosition({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 20,
      });
    }, 3000);
    
    return () => clearInterval(floatInterval);
  }, []);

  useEffect(() => {
    const exciteInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsExcited(true);
        setTimeout(() => setIsExcited(false), 2000);
      }
    }, 10000);
    
    return () => clearInterval(exciteInterval);
  }, []);

  const jumpToCenter = useCallback(() => {
    if (helpCheckPhase !== "idle") return;
    
    setHelpCheckPhase("jumping");
    setHumorIndex((prev) => (prev + 1) % COACH_PERSONALITY.humor.length);
    
    setTimeout(() => {
      setHelpCheckPhase("asking");
      setShowCenterPopup(true);
    }, 600);
  }, [helpCheckPhase]);

  const handleHelpResponse = (needsHelp: boolean) => {
    setHelpCheckPhase("response");
    
    setTimeout(() => {
      setShowCenterPopup(false);
      setHelpCheckPhase("idle");
      if (needsHelp) {
        setIsOpen(true);
      }
    }, 1500);
  };

  useEffect(() => {
    const helpCheckInterval = setInterval(() => {
      if (!isOpen && helpCheckPhase === "idle" && Math.random() > 0.8) {
        jumpToCenter();
      }
    }, 60000);
    
    return () => clearInterval(helpCheckInterval);
  }, [isOpen, helpCheckPhase, jumpToCenter]);

  const contextIcons: Record<CoachContext, typeof Sparkles> = {
    home: Sparkles,
    assessment: Target,
    stakeholder: MessageCircle,
    level: Rocket,
    results: Star,
  };
  
  const ContextIcon = contextIcons[context] || Sparkles;

  const handleJourneySelect = (journeyId: VisitorJourney) => {
    setSelectedJourney(journeyId);
    setDiscoveryStep("guidance");
    setJourneyTipIndex(0);
  };

  const handleDiscoveryComplete = () => {
    localStorage.setItem('unicornCoachDiscoverySeen', 'true');
    if (selectedJourney) {
      localStorage.setItem('unicornCoachJourney', selectedJourney);
    }
    setShowDiscovery(false);
    setIsOpen(true);
  };

  const selectedJourneyData = DISCOVERY_JOURNEYS.find(j => j.id === selectedJourney);

  return (
    <>
      <AnimatePresence>
        {showDiscovery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => {}}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative bg-gradient-to-br from-slate-900 via-violet-950 to-purple-950 rounded-3xl p-8 border-2 border-amber-500/40 shadow-2xl shadow-violet-500/30 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="absolute -top-16 left-1/2 -translate-x-1/2"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-8xl drop-shadow-2xl">🦄</div>
              </motion.div>
              
              <motion.div
                className="absolute -top-4 -right-4"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-4xl">🎠</span>
              </motion.div>

              <div className="pt-8">
                {discoveryStep === "welcome" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                  >
                    <div>
                      <motion.h2 
                        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 mb-2"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Welcome to Value Journey! 🦄
                      </motion.h2>
                      <p className="text-violet-300 text-lg italic">{COACH_PERSONALITY.tagline}</p>
                    </div>
                    
                    <motion.p 
                      className="text-xl text-violet-100 leading-relaxed max-w-md mx-auto"
                      animate={{ opacity: [0.9, 1, 0.9] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      "I'm your Unicorn Coach! Let me help you get the most out of your journey. First, tell me..."
                    </motion.p>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setDiscoveryStep("select")}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-xl px-8 py-6 h-auto rounded-xl shadow-lg shadow-amber-500/30"
                      >
                        <Sparkles className="mr-2 h-6 w-6" />
                        Let's Begin!
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {discoveryStep === "select" && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-amber-300 mb-2">What brings you to i2u.ai?</h3>
                      <p className="text-violet-300">Choose the option that best describes your situation</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {DISCOVERY_JOURNEYS.map((journey) => {
                        const JourneyIcon = journey.icon;
                        return (
                          <motion.button
                            key={journey.id}
                            whileHover={{ scale: 1.03, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleJourneySelect(journey.id)}
                            className={`p-5 rounded-xl border-2 text-left transition-all bg-slate-800/50 hover:bg-slate-700/50 border-slate-600 hover:border-violet-500`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <motion.span 
                                className="text-3xl"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                              >
                                {journey.emoji}
                              </motion.span>
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${journey.color} flex items-center justify-center`}>
                                <JourneyIcon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="font-bold text-lg text-white mb-1">{journey.title}</div>
                            <p className="text-sm text-slate-400">{journey.subtitle}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {discoveryStep === "guidance" && selectedJourneyData && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <motion.span 
                        className="text-5xl inline-block mb-3"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {selectedJourneyData.emoji}
                      </motion.span>
                      <h3 className="text-2xl font-bold text-amber-300 mb-2">{selectedJourneyData.title}</h3>
                      <div className="flex items-center justify-center gap-2">
                        {selectedJourneyData.levels.length > 0 && (
                          <span className="text-sm text-violet-400">
                            Recommended levels: {selectedJourneyData.levels.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <motion.div 
                      className="bg-violet-800/30 rounded-2xl p-6 border border-violet-500/30"
                      animate={{ 
                        boxShadow: ["0 0 10px rgba(139, 92, 246, 0.2)", "0 0 25px rgba(139, 92, 246, 0.4)", "0 0 10px rgba(139, 92, 246, 0.2)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={journeyTipIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-lg text-violet-100 text-center leading-relaxed"
                        >
                          "{selectedJourneyData.guidance[journeyTipIndex]}"
                        </motion.p>
                      </AnimatePresence>
                      
                      <div className="flex justify-center gap-2 mt-4">
                        {selectedJourneyData.guidance.map((_, i) => (
                          <motion.button
                            key={i}
                            onClick={() => setJourneyTipIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === journeyTipIndex ? "bg-amber-400 w-6" : "bg-violet-600 hover:bg-violet-500"
                            }`}
                            whileHover={{ scale: 1.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                    
                    <div className="flex gap-3 justify-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDiscoveryStep("select");
                            setSelectedJourney(null);
                          }}
                          className="border-violet-500/50 text-violet-300 hover:bg-violet-800/50"
                        >
                          ← Back
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleDiscoveryComplete}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-2 rounded-xl shadow-lg shadow-amber-500/30"
                        >
                          <Rocket className="mr-2 h-5 w-5" />
                          {selectedJourneyData.cta}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <motion.div
                className="absolute -bottom-3 left-10 text-3xl"
                animate={{ rotate: [-5, 5, -5], y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🦄
              </motion.div>
              <motion.div
                className="absolute -bottom-3 right-10 text-3xl"
                animate={{ rotate: [5, -5, 5], y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                🦄
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCenterPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={() => handleHelpResponse(false)}
          >
            <motion.div
              initial={{ scale: 0, y: 200, rotate: -20 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                rotate: 0,
                transition: { type: "spring", damping: 12, stiffness: 200 }
              }}
              exit={{ scale: 0, y: -200, rotate: 20 }}
              className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 rounded-3xl p-10 border-4 border-amber-500/50 shadow-2xl shadow-violet-500/40 max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="absolute -top-20 left-1/2 -translate-x-1/2"
                animate={{ 
                  y: [0, -15, 0], 
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-[100px] drop-shadow-2xl">🦄</div>
              </motion.div>
              
              <motion.div
                className="absolute -top-6 -right-6"
                animate={{ 
                  rotate: [0, 20, -20, 0], 
                  scale: [1, 1.2, 1],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                <span className="text-5xl">🎠</span>
              </motion.div>
              
              <div className="pt-12 text-center space-y-6">
                <div className="space-y-2">
                  <motion.h3 
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {COACH_PERSONALITY.name}
                  </motion.h3>
                  <p className="text-lg text-violet-300 italic">{COACH_PERSONALITY.tagline}</p>
                </div>
                
                {helpCheckPhase === "asking" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <motion.p 
                      className="text-violet-100 text-xl leading-relaxed"
                      animate={{ opacity: [0.9, 1, 0.9] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      "{COACH_PERSONALITY.humor[humorIndex]}"
                    </motion.p>
                    
                    <motion.div 
                      className="bg-violet-800/50 rounded-2xl p-6 border-2 border-violet-500/40"
                      animate={{ 
                        boxShadow: ["0 0 20px rgba(139, 92, 246, 0.3)", "0 0 40px rgba(139, 92, 246, 0.5)", "0 0 20px rgba(139, 92, 246, 0.3)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex items-center gap-3 justify-center text-amber-300 mb-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <HelpCircle className="h-7 w-7" />
                        </motion.div>
                        <span className="font-bold text-xl">Need a hand... or a hoof?</span>
                      </div>
                      <p className="text-violet-200 text-lg">
                        The unicorns sensed you might need guidance. Shall I help?
                      </p>
                    </motion.div>
                    
                    <div className="flex gap-4 justify-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleHelpResponse(true)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-xl px-8 py-6 h-auto rounded-xl shadow-lg shadow-amber-500/30"
                        >
                          <Sparkles className="mr-2 h-6 w-6" />
                          Yes, coach me!
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={() => handleHelpResponse(false)}
                          className="border-2 border-violet-500/50 text-violet-300 hover:bg-violet-800/50 text-xl px-8 py-6 h-auto rounded-xl"
                        >
                          I'm good, thanks!
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                
                {helpCheckPhase === "response" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    className="text-6xl py-6"
                  >
                    🎉 The unicorns approve! 🦄✨
                  </motion.div>
                )}
              </div>
              
              <motion.div
                className="absolute -bottom-4 left-12 text-4xl"
                animate={{ rotate: [-8, 8, -8], y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🦄
              </motion.div>
              <motion.div
                className="absolute -bottom-4 right-12 text-4xl"
                animate={{ rotate: [8, -8, 8], y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                🦄
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className={`fixed bottom-24 right-6 z-50 ${className}`}
        animate={{
          x: floatPosition.x,
          y: floatPosition.y,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotate: [0, 1, -1, 0],
              }}
              exit={{ opacity: 0, y: 30, scale: 0.8 }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute bottom-28 right-0 w-96 bg-gradient-to-br from-violet-900/98 via-purple-900/98 to-fuchsia-900/98 backdrop-blur-xl rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl shadow-violet-500/30"
            >
              <motion.div
                className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.span 
                    className="text-4xl"
                    animate={{ 
                      scale: [1, 1.15, 1], 
                      rotate: [0, 15, -15, 0],
                      y: [0, -5, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    🦄
                  </motion.span>
                  <div>
                    <span className="font-bold text-amber-300 text-xl">{COACH_PERSONALITY.name}</span>
                    <div className="text-xs text-violet-400 italic flex items-center gap-1">
                      <span>Coach drawn by unicorns</span>
                      <motion.span 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🎠
                      </motion.span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-violet-300 hover:text-white hover:bg-violet-700/50"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTipIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-base text-violet-100 leading-relaxed"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Lightbulb className="h-6 w-6 text-amber-400 mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <p className="text-lg">{tips[currentTipIndex]}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-violet-500/30">
                <div className="flex gap-1.5">
                  {tips.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTipIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentTipIndex 
                          ? "bg-amber-400 w-6" 
                          : "w-2 bg-violet-500/50 hover:bg-violet-400"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-violet-400">
                  <ContextIcon className="h-4 w-4" />
                  <span className="capitalize font-medium">{context}</span>
                </div>
              </div>
              
              {stakeholder && (
                <div className="mt-3 text-sm text-violet-400 flex items-center gap-2">
                  <span>Guiding:</span>
                  <span className="text-violet-200 font-semibold bg-violet-700/30 px-2 py-0.5 rounded">{stakeholder}</span>
                </div>
              )}
              
              {level && (
                <div className="mt-2 text-sm text-violet-400 flex items-center gap-2">
                  <span>Level:</span>
                  <span className="text-violet-200 font-semibold bg-violet-700/30 px-2 py-0.5 rounded">{level}</span>
                </div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={jumpToCenter}
                  className="w-full mt-4 text-sm text-amber-300 hover:bg-amber-500/20 border-2 border-amber-500/40 rounded-xl py-3"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                  <span className="mx-2">Summon Unicorn Coach!</span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  >
                    ✨
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={() => isOpen ? setIsOpen(false) : jumpToCenter()}
          className="relative"
          animate={helpCheckPhase === "jumping" ? {
            x: -window.innerWidth / 2 + 150,
            y: -window.innerHeight / 2 + 150,
            scale: 1.5,
          } : isExcited ? {
            scale: [1, 1.3, 1],
            rotate: [0, -15, 15, -10, 10, 0],
            y: [0, -30, 0, -20, 0],
          } : {
            x: 0,
            y: 0,
            scale: 1,
          }}
          transition={helpCheckPhase === "jumping" ? { 
            duration: 0.6, 
            type: "spring",
            damping: 12 
          } : isExcited ? {
            duration: 2,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1]
          } : {
            duration: 0.3
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div 
            className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-2xl shadow-violet-500/50 flex items-center justify-center relative overflow-hidden"
            animate={{
              boxShadow: [
                "0 0 20px rgba(139, 92, 246, 0.5)",
                "0 0 40px rgba(139, 92, 246, 0.8)",
                "0 0 20px rgba(139, 92, 246, 0.5)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.span 
              className="text-5xl relative z-10"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 8, -8, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🦄
            </motion.span>
          </motion.div>
          
          {!isOpen && (
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
          )}
          
          <motion.div
            className="absolute -bottom-1 -left-1 text-2xl"
            animate={{ 
              rotate: [0, 15, -15, 0],
              y: [0, -3, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎠
          </motion.div>
          
          <motion.div
            className="absolute -top-1 -left-2 text-lg"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1, 0.8],
              y: [0, -10, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -right-1 text-lg"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1, 0.8],
              y: [0, 5, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            ✨
          </motion.div>
        </motion.button>
      </motion.div>
    </>
  );
}

export default UnicornCoach;
