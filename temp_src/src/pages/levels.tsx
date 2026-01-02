import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, ArrowRight, ChevronRight, Play, BookOpen, 
  Target, Users, Sparkles, Lock, CheckCircle, Info, ExternalLink, Maximize2, Globe
} from "lucide-react";
import { LEVEL_THEMES, LEVEL_NAMES, STAKEHOLDERS } from "@/lib/valueJourneyTypes";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import EcosystemDashboard from "@/components/ValueJourney/EcosystemDashboard";

const GLEAM_SYMBOL = "Ğ";

const GROWTH_LEVELS = [
  { 
    id: "L0", name: "Spark", description: "The idea ignites", 
    focus: "Vision & Problem Definition",
    hint: "Every unicorn starts with a spark of insight",
    dimensions: ["Problem Clarity", "Vision Alignment", "Market Understanding", "Team Readiness"],
    gleamsPerParam: 10,
    caseStudies: ["Airbnb's Origin Story", "Dropbox Problem Discovery"],
    founders: 847, trend: "+15%"
  },
  { 
    id: "L1", name: "Hunt", description: "Finding product-market fit", 
    focus: "Discovery & Validation",
    hint: "Hunt for the problem worth solving",
    dimensions: ["Customer Discovery", "Problem Validation", "Solution Hypothesis", "Market Sizing"],
    gleamsPerParam: 100,
    caseStudies: ["Slack's Pivot Journey", "Instagram's Focus Shift"],
    founders: 623, trend: "+22%"
  },
  { 
    id: "L2", name: "Build", description: "Creating the MVP", 
    focus: "Development & Launch Prep",
    hint: "Build fast, learn faster",
    dimensions: ["MVP Definition", "Tech Stack", "Build Velocity", "Quality Standards"],
    gleamsPerParam: 100,
    caseStudies: ["Stripe's Developer Focus", "Notion's Rebuild"],
    founders: 512, trend: "+18%"
  },
  { 
    id: "L3", name: "Launch", description: "Going to market", 
    focus: "Traction & Early Revenue",
    hint: "Launch is just the beginning",
    dimensions: ["Go-to-Market", "Customer Acquisition", "Revenue Model", "Feedback Loops"],
    gleamsPerParam: 100,
    caseStudies: ["Product Hunt Launches", "Superhuman's Waitlist"],
    founders: 389, trend: "+12%"
  },
  { 
    id: "L4", name: "Rocket", description: "Accelerating growth", 
    focus: "Scale & Team Building",
    hint: "Fuel your rocket with the right team",
    dimensions: ["Growth Metrics", "Team Scaling", "Process Optimization", "Capital Efficiency"],
    gleamsPerParam: 100,
    caseStudies: ["Uber's City Expansion", "Canva's Global Growth"],
    founders: 256, trend: "+28%"
  },
  { 
    id: "L5", name: "Optimize", description: "Refining operations", 
    focus: "Efficiency & Unit Economics",
    hint: "Efficiency unlocks profitability",
    dimensions: ["Operational Excellence", "Margin Improvement", "Automation", "Sustainability"],
    gleamsPerParam: 100,
    caseStudies: ["Netflix's Content Strategy", "Shopify's Platform Evolution"],
    founders: 145, trend: "+9%"
  },
  { 
    id: "L6", name: "Lead", description: "Dominating the market", 
    focus: "Market Leadership",
    hint: "Lead by creating new categories",
    dimensions: ["Market Position", "Competitive Moats", "Brand Authority", "Ecosystem Building"],
    gleamsPerParam: 100,
    caseStudies: ["Salesforce's CRM Dominance", "HubSpot's Inbound Movement"],
    founders: 78, trend: "+11%"
  },
  { 
    id: "L7", name: "Unicorn", description: "Reaching $1B+ valuation", 
    focus: "Valuation & Impact",
    hint: "Unicorn status is just a milestone",
    dimensions: ["Valuation Drivers", "Global Expansion", "Strategic Partnerships", "Exit Readiness"],
    gleamsPerParam: 100,
    caseStudies: ["SpaceX's Moonshot", "Stripe's Global Payments"],
    founders: 34, trend: "+5%"
  },
  { 
    id: "L8", name: "Jedi", description: "Legacy & stewardship", 
    focus: "Mastery & Giving Back",
    hint: "True masters create more masters",
    dimensions: ["Industry Influence", "Mentorship", "Philanthropy", "Legacy Building"],
    gleamsPerParam: 100,
    caseStudies: ["Patagonia's Purpose", "Salesforce's 1-1-1 Model"],
    founders: 12, trend: "+3%"
  },
];

function IllustrationDisclaimer() {
  const [visible, setVisible] = useState(true);
  
  useState(() => {
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 5000);
    return () => clearInterval(interval);
  });
  
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

export default function LevelsPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/levels/:levelId");
  const selectedLevelId = params?.levelId?.toUpperCase() || null;
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [popupLevel, setPopupLevel] = useState<typeof GROWTH_LEVELS[0] | null>(null);

  const selectedLevel = selectedLevelId 
    ? GROWTH_LEVELS.find(l => l.id === selectedLevelId) 
    : null;

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
              onClick={() => selectedLevel ? setLocation("/levels") : setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {selectedLevel ? "All Levels" : "Home"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go back to {selectedLevel ? "all levels" : "home"}</p>
          </TooltipContent>
        </Tooltip>

        {selectedLevel ? (
          <LevelDetail level={selectedLevel} onBack={() => setLocation("/levels")} />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-white mb-3">9 Growth Levels</h1>
              <p className="text-slate-400 max-w-xl mx-auto">
                From Spark to Jedi - explore each level's dimensions, case studies, and assessment criteria
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {GROWTH_LEVELS.map((level, i) => {
                const theme = LEVEL_THEMES[level.id];
                const isHovered = hoveredLevel === level.id;

                return (
                  <Tooltip key={level.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -3, 0] }}
                        transition={isHovered ? { delay: i * 0.05 } : { duration: 3, repeat: Infinity, delay: i * 0.2 }}
                        onMouseEnter={() => setHoveredLevel(level.id)}
                        onMouseLeave={() => setHoveredLevel(null)}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className={`relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                          isHovered 
                            ? "bg-slate-800 border-violet-500 shadow-xl shadow-violet-500/20" 
                            : "bg-slate-800/50 border-slate-700/50"
                        }`}
                        onClick={() => setLocation(`/levels/${level.id.toLowerCase()}`)}
                        data-testid={`card-level-${level.id}`}
                      >
                        <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div 
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl`}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                            >
                              {theme.emoji}
                            </motion.div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-violet-400">{level.id}</span>
                                <span className="text-lg font-bold text-white">{level.name}</span>
                              </div>
                              <p className="text-sm text-slate-400">{level.description}</p>
                            </div>
                          </div>

                          <div className="text-xs text-slate-300 mb-3">
                            <span className="text-violet-400">Focus:</span> {level.focus}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {level.dimensions.slice(0, 3).map((dim) => (
                              <span
                                key={dim}
                                className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-300"
                              >
                                {dim}
                              </span>
                            ))}
                            {level.dimensions.length > 3 && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-400">
                                +{level.dimensions.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs border-t border-slate-700/50 pt-3 mt-3">
                            <div className="flex items-center gap-2 text-amber-400">
                              <Sparkles className="h-3 w-3" />
                              {level.gleamsPerParam} {GLEAM_SYMBOL}/param
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400">
                                <Users className="h-3 w-3 inline mr-1" />
                                {level.founders}
                              </span>
                              <span className="text-emerald-400">{level.trend}</span>
                            </div>
                          </div>
                          
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            className="absolute top-3 right-3"
                          >
                            <Maximize2 className="h-4 w-4 text-violet-400" />
                          </motion.div>
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
          </>
        )}
      </div>
      
      <div className="h-20" />
    </div>
  );
}

function LevelDetail({ level, onBack }: { level: typeof GROWTH_LEVELS[0]; onBack: () => void }) {
  const [, setLocation] = useLocation();
  const [caseStudyPopup, setCaseStudyPopup] = useState<string | null>(null);
  const theme = LEVEL_THEMES[level.id];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      {/* Ecosystem Hero Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <Globe className="h-6 w-6 text-violet-400" />
            {level.name} Level Ecosystem
            <span className={`text-lg px-2 py-0.5 rounded bg-gradient-to-r ${theme.gradient} text-white`}>
              {level.id}
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Live activity, leaderboards, and connections at the {level.name} stage
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl overflow-hidden border border-violet-500/30 shadow-xl shadow-violet-500/10"
        >
          <iframe
            src={`/ecosystem?level=${level.id}`}
            className="w-full h-[550px] bg-slate-950"
            title={`${level.name} Level Ecosystem`}
            data-testid={`ecosystem-iframe-hero-${level.id}`}
          />
        </motion.div>
      </div>

      <motion.div 
        className={`h-3 rounded-t-xl bg-gradient-to-r ${theme.gradient} mb-0`}
        animate={{ boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 20px rgba(139, 92, 246, 0.3)", "0 0 0 rgba(139, 92, 246, 0)"] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className="bg-slate-800/50 rounded-b-xl border border-t-0 border-slate-700/50 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-3xl`}
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {theme.emoji}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-violet-400">{level.id}</span>
                <span className="text-2xl font-bold text-white">{level.name} Level</span>
              </div>
              <p className="text-slate-400">{level.description}</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-slate-400">Active Founders</div>
              <div className="text-2xl font-bold text-white">{level.founders}</div>
              <div className="text-xs text-emerald-400">{level.trend}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 hover:border-violet-500/50 cursor-pointer transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-violet-400" />
                    Focus Area
                  </h3>
                  <p className="text-slate-300">{level.focus}</p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Primary focus for this growth stage</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 hover:border-amber-500/50 cursor-pointer transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Rewards
                  </h3>
                  <p className="text-slate-300">
                    Earn up to <span className="text-amber-400 font-semibold">{level.gleamsPerParam} {GLEAM_SYMBOL}</span> per parameter
                  </p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gleams earned per assessment parameter</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-white mb-4 text-lg">Dimensions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {level.dimensions.map((dim, i) => (
                <Tooltip key={dim}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: [0, -2, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-violet-500/50 text-center cursor-pointer transition-all"
                    >
                      <div className="text-sm font-medium text-slate-200">{dim}</div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assessment dimension for {level.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-white mb-4 text-lg flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-400" />
              Case Studies
            </h3>
            <div className="space-y-2">
              {level.caseStudies.map((study, i) => (
                <Dialog key={study}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.01, x: 5, boxShadow: "0 4px 20px rgba(139, 92, 246, 0.2)" }}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-violet-500/50 cursor-pointer transition-all"
                        >
                          <span className="text-slate-300">{study}</span>
                          <div className="flex items-center gap-2">
                            <Maximize2 className="h-4 w-4 text-violet-400" />
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          </div>
                        </motion.div>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view case study details</p>
                    </TooltipContent>
                  </Tooltip>
                  <ResizableDialogContent className="bg-slate-900 border-violet-500/50 max-w-2xl">
                    <div className="p-2">
                      <div className={`h-2 rounded-t-lg bg-gradient-to-r ${theme.gradient} -mx-2 -mt-2 mb-4`} />
                      <h2 className="text-xl font-bold text-white mb-2">{study}</h2>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${theme.gradient} text-white`}>
                          {level.id} {level.name}
                        </span>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          This case study explores key lessons from <span className="text-white font-medium">{study}</span> relevant to the {level.name} stage. 
                          Learn how successful founders navigated {level.focus.toLowerCase()} challenges and applied insights to accelerate their growth journey.
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        <span>Detailed case study content for illustration purposes</span>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <Button
                          className={`flex-1 bg-gradient-to-r ${theme.gradient} text-white`}
                          onClick={() => window.open("https://i2u.ai/blog", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Full Story
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600"
                          onClick={() => setLocation("/value-journey")}
                        >
                          Start Assessment
                        </Button>
                      </div>
                    </div>
                  </ResizableDialogContent>
                </Dialog>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Button
              className={`flex-1 bg-gradient-to-r ${theme.gradient} text-white font-semibold`}
              onClick={() => setLocation("/value-journey")}
            >
              <Play className="h-4 w-4 mr-2" />
              Start {level.name} Assessment
            </Button>
            <Button
              variant="outline"
              className="border-slate-600"
              onClick={onBack}
            >
              View All Levels
            </Button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
