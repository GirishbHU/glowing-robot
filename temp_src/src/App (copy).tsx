import { Switch, Route, useRoute, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Trophy, Share2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import ValueStoriesLanding from "@/pages/value-stories/index";
import StoryDetail from "@/components/ValueStories/StoryDetail";
import CalculatorLanding from "@/pages/calculator/index";
import ValueJourneyWizard from "@/components/ValueJourney/ValueJourneyWizard";
import InsightsPage from "@/pages/insights/index";
import InsightDetail from "@/pages/insights/[id]";
import DisclaimerPage from "@/pages/disclaimer";
import IntegrationDemo from "@/pages/integration-demo";
import HomePage from "@/pages/home";
import LevelsPage from "@/pages/levels";
import LeaderboardPage from "@/pages/leaderboard";
import ScoringPage from "@/pages/scoring";
import ScorecardsPage from "@/pages/scorecards";
import ChartsPage from "@/pages/charts";
import SharePage from "@/pages/share";
import AuthComplete from "@/pages/AuthComplete";
import SettingsPage from "@/pages/settings";
import AccountPage from "@/pages/account";
import MagicLinkPage from "@/pages/magic-link";
import { mockStories } from "@/lib/mockData";
import { initializeStorage } from "@/lib/storage";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import FloatingActionBar from "@/components/FloatingActionBar";
import GlobalNewsTicker from "@/components/GlobalNewsTicker";
import EcosystemDashboard from "@/components/ValueJourney/EcosystemDashboard";
import StakeholdersPage from "@/pages/stakeholders";

function BetaTab() {
  const [isVisible, setIsVisible] = useState(true);
  const [isPulsing, setIsPulsing] = useState(true);
  
  useEffect(() => {
    const pulseTimer = setTimeout(() => setIsPulsing(false), 30000);
    const fadeTimer = setTimeout(() => setIsVisible(false), 60000);
    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(fadeTimer);
    };
  }, []);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed top-20 left-0 z-[60]"
          initial={{ x: -100, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: isPulsing ? [0.7, 1, 0.7] : 1,
            scale: isPulsing ? [1, 1.08, 1] : 1
          }}
          exit={{ x: -100, opacity: 0 }}
          transition={isPulsing ? {
            opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            default: { type: "spring", stiffness: 200, damping: 20 }
          } : { duration: 0.5 }}
        >
          <motion.div 
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-r-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
            style={{
              boxShadow: isPulsing ? "0 0 20px rgba(245, 158, 11, 0.6)" : "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}
            whileHover={{ scale: 1.05, x: 5 }}
            onClick={() => setIsVisible(false)}
          >
            <motion.div
              animate={isPulsing ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="h-3 w-3" />
            </motion.div>
            <span className="text-xs font-semibold">Public Beta</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FooterDisclaimer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 py-2 px-4">
        <p className="text-center text-xs text-slate-400">
          Some of the Data shown is for illustration purposes. Live data integration is being implemented.
        </p>
      </div>
    </div>
  );
}

function FloatingPromoRibbon() {
  const [location] = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(0);
  
  const promos = [
    { text: "🎁 Take the Value Journey Quest and earn Gleams!", cta: "Start Now", link: "/value-journey" },
    { text: "🏆 Join 500+ founders on the leaderboard!", cta: "View Leaderboard", link: "/value-journey" },
    { text: "🚀 Share, Invite, Challenge & earn +100 Gleams per referral!", cta: "Get Referral Link", link: "/value-journey" },
    { text: "⭐ Daily Challenge: Complete assessment for +500 Gleams!", cta: "Take Challenge", link: "/value-journey" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  if (dismissed || location === "/value-journey") return null;
  
  const promo = promos[currentPromo];
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 py-3 px-4 shadow-lg shadow-violet-500/20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPromo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white font-medium"
              >
                {promo.text}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-white text-violet-600 hover:bg-violet-100 font-bold"
              onClick={() => window.location.href = promo.link}
            >
              {promo.cta}
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FloatingSidePromos() {
  const [location] = useLocation();
  
  // Don't show on value-journey page (has its own UI)
  if (location === "/value-journey") return null;
  
  return (
    <>
      {/* Left Side Promos */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="hidden xl:block fixed left-4 top-20 z-40 space-y-4"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-amber-500/90 to-orange-600/90 rounded-xl p-4 shadow-lg shadow-amber-500/20 cursor-pointer w-44"
              onClick={() => window.location.href = "/value-journey"}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl text-center mb-2"
              >
                🏆
              </motion.div>
              <div className="text-white text-center">
                <div className="font-bold text-sm">Top Performer?</div>
                <div className="text-xs opacity-90">Climb the leaderboard!</div>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-52">
            <p>Compete with other founders! Complete assessments to climb the global leaderboard.</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-emerald-500/90 to-teal-600/90 rounded-xl p-4 shadow-lg shadow-emerald-500/20 cursor-pointer w-44"
              onClick={() => window.location.href = "/value-journey"}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="text-3xl text-center mb-2"
              >
                🦄
              </motion.div>
              <div className="text-white text-center">
                <div className="font-bold text-sm">Earn Alicorns</div>
                <div className="text-xs opacity-90">Level up & collect!</div>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-52">
            <p>Progress from L0 (Spark) to L8 (Masters/Jedi). 100 Gleams = 1 Alicorn!</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
      
      {/* Right Side Promos */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="hidden xl:block fixed right-4 top-20 z-40 space-y-4"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(236, 72, 153, 0)",
                  "0 0 20px 5px rgba(236, 72, 153, 0.4)",
                  "0 0 0 0 rgba(236, 72, 153, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-pink-500/90 to-rose-600/90 rounded-xl p-4 cursor-pointer w-44"
              onClick={() => window.location.href = "/value-journey"}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl text-center mb-2"
              >
                🎁
              </motion.div>
              <div className="text-white text-center">
                <div className="font-bold text-sm">Earn Gleams!</div>
                <div className="text-xs opacity-90">Share & get rewards</div>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-52">
            <p>Gleams (Ğ) are points earned per question. Share your results to earn +100 Gleams per referral!</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-cyan-500/90 to-blue-600/90 rounded-xl p-4 shadow-lg shadow-cyan-500/20 cursor-pointer w-44"
              onClick={() => window.location.href = "/value-journey"}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl text-center mb-2"
              >
                🚀
              </motion.div>
              <div className="text-white text-center">
                <div className="font-bold text-sm">Start Quest</div>
                <div className="text-xs opacity-90">Begin your journey!</div>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-52">
            <p>Take the Value Journey Assessment! 9 stakeholder types, 9 growth levels (L0 Spark → L8 Masters/Jedi).</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </>
  );
}

function Router() {
  const [matchStory, paramsStory] = useRoute("/value-stories/story/:id");
  const [matchInsight, paramsInsight] = useRoute("/insights/:id");

  if (matchStory && paramsStory) {
    const story = mockStories.find(s => s.id === paramsStory.id);
    if (story) {
      return <StoryDetail story={story} />;
    }
    return <NotFound />;
  }

  if (matchInsight && paramsInsight) {
    return <InsightDetail />;
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/demo" component={IntegrationDemo} />
      <Route path="/levels" component={LevelsPage} />
      <Route path="/levels/:levelId" component={LevelsPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/scoring" component={ScoringPage} />
      <Route path="/scorecards" component={ScorecardsPage} />
      <Route path="/charts" component={ChartsPage} />
      <Route path="/value-stories" component={ValueStoriesLanding} />
      <Route path="/value-stories/calculator" component={CalculatorLanding} />
      <Route path="/value-journey" component={ValueJourneyWizard} />
      <Route path="/ecosystem">{() => <EcosystemDashboard />}</Route>
      <Route path="/stakeholders" component={StakeholdersPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/m/:sessionId" component={MagicLinkPage} />
      <Route path="/share" component={SharePage} />
      <Route path="/auth-complete" component={AuthComplete} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AssessmentProvider>
          <TooltipProvider>
            <BetaTab />
            <FooterDisclaimer />
            <div className="pb-16">
              <Toaster />
              <Router />
              <FloatingSidePromos />
              <FloatingActionBar />
              <GlobalNewsTicker />
            </div>
          </TooltipProvider>
        </AssessmentProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
