import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Rocket, ArrowRight, Trophy, Sparkles, Users, 
  TrendingUp, BarChart3, Share2, Globe, Building2,
  ChevronRight, Star, Zap, Target, Crown, Medal,
  Layers, BookOpen, Play, HelpCircle, Info, ExternalLink
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { STAKEHOLDERS, LEVEL_THEMES, LEVEL_NAMES } from "@/lib/valueJourneyTypes";
import { StakeholderLeaderboard } from "@/components/StakeholderLeaderboard";

const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

const GROWTH_LEVELS = [
  { id: "L0", name: "Spark", description: "The idea ignites", focus: "Vision & Problem", hint: "Every unicorn starts with a spark of insight" },
  { id: "L1", name: "Hunt", description: "Finding product-market fit", focus: "Discovery & Validation", hint: "Hunt for the problem worth solving" },
  { id: "L2", name: "Build", description: "Creating the MVP", focus: "Development & Launch", hint: "Build fast, learn faster" },
  { id: "L3", name: "Launch", description: "Going to market", focus: "Traction & Revenue", hint: "Launch is just the beginning" },
  { id: "L4", name: "Rocket", description: "Accelerating growth", focus: "Scale & Team", hint: "Fuel your rocket with the right team" },
  { id: "L5", name: "Optimize", description: "Refining operations", focus: "Efficiency & Margins", hint: "Efficiency unlocks profitability" },
  { id: "L6", name: "Lead", description: "Dominating the market", focus: "Market Leadership", hint: "Lead by creating new categories" },
  { id: "L7", name: "Unicorn", description: "Reaching $1B+", focus: "Valuation & Impact", hint: "Unicorn status is just a milestone" },
  { id: "L8", name: "Jedi", description: "Legacy & stewardship", focus: "Mastery & Giving Back", hint: "True masters create more masters" },
];

const COUNTRIES_LIST = [
  "🇺🇸 USA", "🇬🇧 UK", "🇮🇳 India", "🇩🇪 Germany", "🇯🇵 Japan", "🇫🇷 France", "🇨🇦 Canada", "🇦🇺 Australia",
  "🇧🇷 Brazil", "🇨🇳 China", "🇰🇷 South Korea", "🇸🇬 Singapore", "🇮🇱 Israel", "🇳🇱 Netherlands", "🇸🇪 Sweden",
  "🇪🇸 Spain", "🇮🇹 Italy", "🇵🇱 Poland", "🇨🇭 Switzerland", "🇦🇪 UAE", "🇲🇽 Mexico", "🇮🇩 Indonesia",
  "🇹🇭 Thailand", "🇻🇳 Vietnam", "🇵🇭 Philippines", "🇳🇬 Nigeria", "🇿🇦 South Africa", "🇰🇪 Kenya", "🇪🇬 Egypt"
];

const SECTORS_LIST = [
  "AI/ML", "FinTech", "HealthTech", "EdTech", "CleanTech", "SaaS", "E-commerce", "Cybersecurity",
  "Biotech", "AgriTech", "PropTech", "InsurTech", "LegalTech", "HRTech", "MarTech", "FoodTech",
  "Gaming", "AR/VR", "Robotics", "SpaceTech", "Quantum Computing", "IoT", "Blockchain", "Web3",
  "Supply Chain", "Logistics", "Manufacturing", "Media & Entertainment", "Social Impact", "Consumer",
  "B2B Software", "Developer Tools", "Cloud Infrastructure", "Data Analytics", "Mobile Apps",
  "Marketplace", "Subscription", "D2C", "Enterprise", "SMB", "Consumer Finance", "Payments",
  "Lending", "Insurance", "Wealth Management", "Digital Health", "Mental Health", "Telemedicine",
  "Diagnostics", "Drug Discovery", "Medical Devices"
];

const STAKEHOLDER_STATS = {
  "Founder": { count: 1847, trend: "+12%" },
  "Investor": { count: 523, trend: "+8%" },
  "Mentor": { count: 312, trend: "+15%" },
  "Employee": { count: 2156, trend: "+22%" },
  "Customer": { count: 4892, trend: "+31%" },
  "Partner": { count: 687, trend: "+9%" },
  "Advisor": { count: 234, trend: "+11%" },
  "Media": { count: 156, trend: "+18%" },
  "Regulator": { count: 89, trend: "+5%" },
};

const CASE_STUDIES = [
  {
    title: "Meta's Genesis: From Dorm to Empire",
    category: "Technology",
    description: "How Facebook evolved from a Harvard dorm project to a multi-billion dollar social media empire through strategic pivots.",
    source: "i2u.ai Blog",
    level: "L7",
    image: "https://i2u.ai/article-images/image17.jpeg"
  },
  {
    title: "DevRev: Bridging Developer-Customer Gap",
    category: "Business Strategy",
    description: "Reshaping the Enterprise CRM Market by connecting developers directly with customer feedback loops.",
    source: "i2u.ai Blog",
    level: "L4",
    image: "https://i2u.ai/article-images/image4.jpeg"
  },
  {
    title: "Netflix: From DVD to Streaming Dominance",
    category: "Business Strategy",
    description: "The transformation journey from mail-order DVDs to the world's leading streaming platform.",
    source: "i2u.ai Blog",
    level: "L6",
    image: "https://i2u.ai/article-images/image21.jpeg"
  },
  {
    title: "Satya Nadella Era: Cloud to AI Powerhouse",
    category: "Leadership",
    description: "Microsoft's transformation under Satya Nadella from cloud leader to AI innovation powerhouse.",
    source: "i2u.ai Blog",
    level: "L8",
    image: "https://i2u.ai/article-images/image27.jpeg"
  },
  {
    title: "The AI Era: Humanity's Multiverse Bang",
    category: "AI",
    description: "Exploring how AI represents a cognitive oxygenation event for humanity's evolution.",
    source: "Adventures in BM Terrain",
    level: "L0",
    image: null
  },
  {
    title: "Perplexity: The AI Era David",
    category: "AI Democratization",
    description: "How nimble challengers armed with disruptive AI innovation challenge established giants.",
    source: "Adventures in BM Terrain",
    level: "L3",
    image: null
  },
];

const mockLeaderboardUpdates = [
  { name: "Cosmic Pioneer", action: "completed L2", gleams: 1245, country: "🇺🇸", time: "2m ago" },
  { name: "Epic Unicorn", action: "earned 500 Gleams", gleams: 820, country: "🇬🇧", time: "5m ago" },
  { name: "Brilliant Dragon", action: "reached #3", gleams: 4580, country: "🇮🇳", time: "8m ago" },
  { name: "Dynamic Titan", action: "completed L1", gleams: 540, country: "🇩🇪", time: "12m ago" },
  { name: "Fierce Voyager", action: "earned 1000 Gleams", gleams: 1560, country: "🇯🇵", time: "15m ago" },
];

function AnimatedCounter({ 
  target, 
  duration = 2000, 
  prefix = "", 
  suffix = "",
  type = "smooth"
}: { 
  target: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
  type?: "smooth" | "bounce" | "spring" | "steps" | "cascade"
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      let easedProgress: number;
      switch (type) {
        case "bounce":
          easedProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          if (progress > 0.8) {
            easedProgress = 1 + Math.sin((progress - 0.8) * Math.PI * 10) * 0.02 * (1 - progress);
          }
          break;
        case "spring":
          easedProgress = 1 - Math.pow(Math.E, -6 * progress) * Math.cos(8 * progress);
          break;
        case "steps":
          easedProgress = Math.floor(progress * 10) / 10;
          break;
        case "cascade":
          easedProgress = Math.pow(progress, 0.5);
          break;
        default:
          easedProgress = 1 - Math.pow(1 - progress, 3);
      }
      
      setCount(Math.floor(startValue + (target - startValue) * easedProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, target, duration, type]);
  
  return (
    <div ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

function IllustrationDisclaimer() {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 4000);
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

function LiveTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockLeaderboardUpdates.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const update = mockLeaderboardUpdates[currentIndex];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div 
          className="bg-slate-800/50 border border-violet-500/30 rounded-xl p-4 cursor-pointer hover:border-violet-500/60 transition-all"
          whileHover={{ scale: 1.02 }}
          animate={{ boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 15px rgba(139, 92, 246, 0.3)", "0 0 0 rgba(139, 92, 246, 0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-violet-400 uppercase">Live Activity</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{update.country}</span>
                <span className="text-amber-400 font-semibold">{update.name}</span>
              </div>
              <div className="text-sm text-slate-300">{update.action}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span>{GLEAM_SYMBOL} {update.gleams.toLocaleString()}</span>
                <span>• {update.time}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Real-time updates from the global community</p>
      </TooltipContent>
    </Tooltip>
  );
}

function RunningAlicornCounter() {
  const [count, setCount] = useState(1_847_293_456_781);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 9_999_999) + 1_000_000);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="font-mono tabular-nums">{count.toLocaleString()}</span>
  );
}

function QuickStats() {
  const regularStats = [
    { label: "Active Founders", value: 2847, icon: Users, color: "from-violet-500 to-purple-500", counterType: "smooth" as const, hint: "Founders actively on their journey" },
    { label: "Countries", value: 156, icon: Globe, color: "from-emerald-500 to-teal-500", counterType: "bounce" as const, suffix: "+", hint: "Global reach across continents" },
    { label: "Sectors", value: 52, icon: Building2, color: "from-blue-500 to-cyan-500", counterType: "spring" as const, suffix: "+", hint: "Industries represented" },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {regularStats.slice(0, 1).map((stat, i) => (
        <Tooltip key={stat.label}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-violet-500/50 cursor-pointer transition-all"
            >
              <motion.div 
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </motion.div>
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter target={stat.value} type={stat.counterType} suffix={stat.suffix || ""} duration={2000 + i * 300} />
              </div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{stat.hint}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -3 }}
            className="bg-slate-800/50 rounded-xl p-4 border border-violet-500/50 hover:border-violet-400 cursor-pointer transition-all relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative z-10">
              <motion.div 
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-2"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-xl">🦄</span>
              </motion.div>
              <div className="text-lg font-bold text-violet-300">
                <RunningAlicornCounter />
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"
                />
                Alicorns Running
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>🦄 Global Alicorn count racing into the trillions!</p>
        </TooltipContent>
      </Tooltip>
      
      {regularStats.slice(1).map((stat, i) => (
        <Tooltip key={stat.label}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 2) * 0.1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-violet-500/50 cursor-pointer transition-all"
            >
              <motion.div 
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: (i + 2) * 0.5 }}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </motion.div>
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter target={stat.value} type={stat.counterType} suffix={stat.suffix || ""} duration={2000 + (i + 2) * 300} />
              </div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{stat.hint}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
      <IllustrationDisclaimer />
      
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6"
              animate={{ boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 20px rgba(139, 92, 246, 0.4)", "0 0 0 rgba(139, 92, 246, 0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                {ALICORN_SYMBOL}
              </motion.div>
              <span className="text-sm font-medium text-violet-200">Value Journey Quest</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-amber-200 bg-clip-text text-transparent">
              Democratizing Unicorn Building
            </h1>
            
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Navigate 9 growth levels, earn Gleams & Alicorns, climb the leaderboard, and build your startup success story.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30"
                onClick={() => setLocation("/value-journey")}
                data-testid="button-start-quest"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Your Quest
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                onClick={() => document.getElementById("levels-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Layers className="mr-2 h-5 w-5" />
                Explore Levels
              </Button>
            </div>
          </motion.div>
          
          <div className="mt-12">
            <QuickStats />
          </div>
        </div>
      </section>

      {/* Global Startup Ecosystem Section (iframe) */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Globe className="h-6 w-6 text-violet-400" />
              Global Startup Ecosystem
            </h2>
            <p className="text-slate-400 text-sm">
              Live dashboard with activity, leaderboards, and matching engine
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden border border-violet-500/30 shadow-xl shadow-violet-500/10"
          >
            <iframe
              src="/ecosystem"
              className="w-full h-[600px] bg-slate-950"
              title="Global Startup Ecosystem"
              data-testid="ecosystem-iframe"
            />
          </motion.div>
          
          <div className="text-center mt-4">
            <Button
              variant="outline"
              className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
              onClick={() => setLocation("/ecosystem")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Full Ecosystem View
            </Button>
          </div>
        </div>
      </section>

      {/* 9 Growth Levels Section */}
      <section id="levels-section" className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white mb-3">9 Growth Levels</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From Spark to Jedi - progress through each level, earn rewards, and unlock insights
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {GROWTH_LEVELS.map((level, i) => {
              const theme = LEVEL_THEMES[level.id];
              const isExpanded = expandedLevel === level.id;
              
              return (
                <Tooltip key={level.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      animate={!isExpanded ? { 
                        y: [0, -3, 0],
                        transition: { duration: 3, repeat: Infinity, delay: i * 0.3 }
                      } : {}}
                      className={`relative rounded-xl border transition-all cursor-pointer ${
                        isExpanded 
                          ? "bg-slate-800 border-violet-500 shadow-lg shadow-violet-500/20" 
                          : "bg-slate-800/50 border-slate-700/50 hover:border-violet-500/50"
                      }`}
                      onClick={() => setExpandedLevel(isExpanded ? null : level.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <motion.div 
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-lg`}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                          >
                            {theme.emoji}
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-violet-400">{level.id}</span>
                              <span className="text-white font-semibold">{level.name}</span>
                            </div>
                            <p className="text-xs text-slate-400">{level.description}</p>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-3 border-t border-slate-700 mt-3"
                            >
                              <div className="text-xs text-slate-300 mb-3">
                                <span className="text-violet-400">Focus:</span> {level.focus}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className={`flex-1 bg-gradient-to-r ${theme.gradient} text-white text-xs`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation(`/levels/${level.id.toLowerCase()}`);
                                  }}
                                >
                                  Explore
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-600 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation("/value-journey");
                                  }}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm">{level.hint}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9 Stakeholder Types Section */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white mb-3">9 Stakeholder Types</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Choose your perspective - assessments tailored to your role in the ecosystem
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {STAKEHOLDERS.map((stakeholder, i) => {
              const stats = STAKEHOLDER_STATS[stakeholder.name as keyof typeof STAKEHOLDER_STATS];
              const isHovered = hoveredStakeholder === stakeholder.id;
              
              return (
                <Tooltip key={stakeholder.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      animate={!isHovered ? {
                        y: [0, -2, 0],
                        transition: { duration: 2.5, repeat: Infinity, delay: i * 0.2 }
                      } : {}}
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/50 cursor-pointer text-center transition-all relative overflow-hidden"
                      onClick={() => setLocation("/value-journey")}
                      onMouseEnter={() => setHoveredStakeholder(stakeholder.id)}
                      onMouseLeave={() => setHoveredStakeholder(null)}
                      data-testid={`card-stakeholder-${stakeholder.name.toLowerCase()}`}
                    >
                      <motion.div 
                        className="text-3xl mb-2"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                      >
                        {stakeholder.emoji}
                      </motion.div>
                      <div className="font-semibold text-white text-sm">{stakeholder.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{stakeholder.description}</div>
                      
                      {stats && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: isHovered ? 1 : 0.7, y: 0 }}
                          className="mt-2 pt-2 border-t border-slate-700/50"
                        >
                          <div className="text-amber-400 font-bold text-sm">
                            <AnimatedCounter target={stats.count} type="spring" duration={1500} />
                          </div>
                          <div className="text-xs text-emerald-400">{stats.trend}</div>
                        </motion.div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tailored assessment for {stakeholder.name}s</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              <span>Total community:</span>
              <span className="text-amber-400 font-semibold">
                <AnimatedCounter target={10896} type="cascade" duration={2500} />
              </span>
              <span>active members</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white mb-3">Unicorn Case Studies</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Learn from real unicorn journeys - curated insights from i2u.ai research
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {CASE_STUDIES.map((study, i) => {
              const levelTheme = LEVEL_THEMES[study.level];
              
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      animate={{
                        boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 10px rgba(139, 92, 246, 0.2)", "0 0 0 rgba(139, 92, 246, 0)"]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                      className="bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-violet-500/50 cursor-pointer overflow-hidden group"
                      onClick={() => window.open("https://i2u.ai/blog", "_blank")}
                    >
                      {study.image ? (
                        <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                          <img 
                            src={study.image} 
                            alt={study.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                          />
                        </div>
                      ) : (
                        <div className={`h-32 bg-gradient-to-br ${levelTheme?.gradient || "from-violet-500 to-purple-500"} flex items-center justify-center`}>
                          <motion.span 
                            className="text-4xl"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {levelTheme?.emoji || "📚"}
                          </motion.span>
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${levelTheme?.gradient || "from-slate-500 to-slate-600"} text-white`}>
                            {study.level}
                          </span>
                          <span className="text-xs text-slate-500">{study.category}</span>
                        </div>
                        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">{study.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{study.description}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-violet-400">
                          <BookOpen className="h-3 w-3" />
                          <span>{study.source}</span>
                          <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Read full case study on {study.source}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Button
              variant="outline"
              className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
              onClick={() => window.open("https://i2u.ai/blog", "_blank")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Explore 224+ Articles
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Gleams & Alicorns Section */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white mb-3">Earn Gleams & Alicorns</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Complete assessments to earn rewards and climb the leaderboard
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  animate={{ boxShadow: ["0 0 0 rgba(245, 158, 11, 0)", "0 0 20px rgba(245, 158, 11, 0.2)", "0 0 0 rgba(245, 158, 11, 0)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-6 border border-amber-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {GLEAM_SYMBOL}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-400">Gleams</h3>
                      <p className="text-sm text-slate-300">Points per parameter</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      L0 parameters: 10 Gleams max each
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      L1+ parameters: 100 Gleams max each
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      Referrals: +100 Gleams bonus
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-4 bg-amber-500 hover:bg-amber-600"
                    onClick={() => setLocation("/scoring")}
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gleams are the core currency of progress</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  animate={{ boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 20px rgba(139, 92, 246, 0.2)", "0 0 0 rgba(139, 92, 246, 0)"] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-2xl p-6 border border-violet-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div 
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-2xl"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {ALICORN_SYMBOL}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-violet-400">Alicorns</h3>
                      <p className="text-sm text-slate-300">Achievement tokens</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-violet-400" />
                      100 Gleams = 1 Alicorn
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-violet-400" />
                      Earned at L1+ levels
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-violet-400" />
                      Track your unicorn progress
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-4 bg-violet-500 hover:bg-violet-600"
                    onClick={() => setLocation("/scoring")}
                  >
                    View Scoring
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Alicorns mark your path to unicorn status</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white mb-3">Global Leaderboard</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Compete with founders worldwide - filter by Country, Sector, Level
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <span className="font-semibold text-white">Top Performers</span>
                </div>
                <div className="flex gap-2">
                  {["All", "🇺🇸", "🇬🇧", "🇮🇳"].map((filter) => (
                    <button
                      key={filter}
                      className="px-2 py-1 text-xs rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {[
                  { rank: 1, name: "Galactic Champion", gleams: 12450, country: "🇺🇸", level: "L5" },
                  { rank: 2, name: "Stellar Voyager", gleams: 11200, country: "🇬🇧", level: "L4" },
                  { rank: 3, name: "Nova Architect", gleams: 10800, country: "🇮🇳", level: "L5" },
                  { rank: 4, name: "Quantum Dreamer", gleams: 9500, country: "🇩🇪", level: "L4" },
                  { rank: 5, name: "Eclipse Visionary", gleams: 8900, country: "🇯🇵", level: "L3" },
                ].map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black" :
                        entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-black" :
                        entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                        "bg-slate-700 text-slate-300"
                      }`}
                      animate={entry.rank <= 3 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, delay: entry.rank * 0.3 }}
                    >
                      {entry.rank}
                    </motion.div>
                    <span className="text-lg">{entry.country}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{entry.name}</div>
                      <div className="text-xs text-slate-400">{entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-amber-400">{GLEAM_SYMBOL} {entry.gleams.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">{(entry.gleams / 100).toFixed(1)} {ALICORN_SYMBOL}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 border-t border-slate-700/50">
                <Button 
                  variant="ghost" 
                  className="w-full text-violet-400 hover:text-violet-300"
                  onClick={() => setLocation("/leaderboard")}
                >
                  View Full Leaderboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <LiveTicker />
              
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-violet-400" />
                  Filter By
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Countries", count: 156, icon: Globe, suffix: "+" },
                    { label: "Sectors", count: 52, icon: Building2, suffix: "+" },
                    { label: "Levels", count: 9, icon: Layers, suffix: "" },
                  ].map((filter, i) => (
                    <Tooltip key={filter.label}>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.02, x: 3 }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors text-left"
                          onClick={() => setLocation("/leaderboard")}
                        >
                          <filter.icon className="h-4 w-4 text-slate-400" />
                          <span className="flex-1 text-sm text-slate-300">{filter.label}</span>
                          <span className="text-xs text-violet-400">
                            <AnimatedCounter target={filter.count} type="steps" suffix={filter.suffix} duration={1000 + i * 200} />
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Filter leaderboard by {filter.label.toLowerCase()}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Scorecards", icon: Target, color: "from-emerald-500 to-teal-500", route: "/scorecards", hint: "View your assessment history" },
              { label: "Charts", icon: BarChart3, color: "from-blue-500 to-cyan-500", route: "/charts", hint: "Visualize your progress" },
              { label: "Share", icon: Share2, color: "from-pink-500 to-rose-500", route: "/value-journey", hint: "Share your achievements" },
              { label: "Case Studies", icon: BookOpen, color: "from-purple-500 to-indigo-500", route: "/value-stories", hint: "Learn from unicorn journeys" },
            ].map((action, i) => (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    animate={{
                      y: [0, -3, 0],
                      transition: { duration: 3, repeat: Infinity, delay: i * 0.4 }
                    }}
                    className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-violet-500/50 cursor-pointer text-center transition-all"
                    onClick={() => setLocation(action.route)}
                  >
                    <motion.div 
                      className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                    >
                      <action.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className="font-semibold text-white">{action.label}</div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.hint}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
            animate={{ boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 30px rgba(139, 92, 246, 0.3)", "0 0 0 rgba(139, 92, 246, 0)"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="max-w-2xl mx-auto text-center bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-2xl p-8 border border-violet-500/30"
          >
            <motion.div 
              className="text-4xl mb-4"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {ALICORN_SYMBOL}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Begin Your Journey?</h2>
            <p className="text-slate-300 mb-6">
              Join thousands of founders navigating their path to unicorn status
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30"
              onClick={() => setLocation("/value-journey")}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Start Your Quest Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <div className="h-20" />
    </div>
  );
}
