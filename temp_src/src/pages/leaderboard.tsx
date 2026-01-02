import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, Trophy, Globe, Building2, Layers, 
  ChevronDown, Search, Filter, Medal, Crown,
  TrendingUp, Users, Sparkles, Info, ExternalLink, Star, Maximize2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

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

const COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "United States", count: 450 },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", count: 320 },
  { code: "IN", flag: "🇮🇳", name: "India", count: 280 },
  { code: "DE", flag: "🇩🇪", name: "Germany", count: 180 },
  { code: "JP", flag: "🇯🇵", name: "Japan", count: 150 },
  { code: "CA", flag: "🇨🇦", name: "Canada", count: 140 },
  { code: "AU", flag: "🇦🇺", name: "Australia", count: 120 },
  { code: "FR", flag: "🇫🇷", name: "France", count: 110 },
  { code: "SG", flag: "🇸🇬", name: "Singapore", count: 95 },
  { code: "IL", flag: "🇮🇱", name: "Israel", count: 88 },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", count: 76 },
  { code: "SE", flag: "🇸🇪", name: "Sweden", count: 65 },
];

const SECTORS = [
  { id: "fintech", name: "FinTech", count: 280, emoji: "💳", hint: "Financial technology and payments" },
  { id: "healthtech", name: "HealthTech", count: 220, emoji: "🏥", hint: "Healthcare and medical technology" },
  { id: "edtech", name: "EdTech", count: 180, emoji: "📚", hint: "Education and learning platforms" },
  { id: "saas", name: "SaaS", count: 350, emoji: "☁️", hint: "Software as a Service products" },
  { id: "ecommerce", name: "E-Commerce", count: 190, emoji: "🛒", hint: "Online retail and marketplaces" },
  { id: "ai", name: "AI/ML", count: 240, emoji: "🤖", hint: "Artificial intelligence and machine learning" },
  { id: "cleantech", name: "CleanTech", count: 120, emoji: "🌱", hint: "Clean energy and sustainability" },
  { id: "enterprise", name: "Enterprise", count: 160, emoji: "🏢", hint: "B2B enterprise solutions" },
  { id: "gaming", name: "Gaming", count: 95, emoji: "🎮", hint: "Gaming and interactive entertainment" },
  { id: "proptech", name: "PropTech", count: 78, emoji: "🏠", hint: "Real estate technology" },
];

const LEVELS = ["All", "L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8"];

const mockLeaderboard = [
  { rank: 1, name: "Galactic Champion", gleams: 12450, country: "🇺🇸", countryName: "USA", sector: "SaaS", level: "L5", change: 0, bio: "Serial entrepreneur with 3 exits" },
  { rank: 2, name: "Stellar Voyager", gleams: 11200, country: "🇬🇧", countryName: "UK", sector: "FinTech", level: "L4", change: 1, bio: "Former Goldman Sachs, building the future of payments" },
  { rank: 3, name: "Nova Architect", gleams: 10800, country: "🇮🇳", countryName: "India", sector: "AI/ML", level: "L5", change: -1, bio: "AI researcher turned founder" },
  { rank: 4, name: "Quantum Dreamer", gleams: 9500, country: "🇩🇪", countryName: "Germany", sector: "HealthTech", level: "L4", change: 2, bio: "Doctor and tech innovator" },
  { rank: 5, name: "Eclipse Visionary", gleams: 8900, country: "🇯🇵", countryName: "Japan", sector: "EdTech", level: "L3", change: 0, bio: "Making education accessible globally" },
  { rank: 6, name: "Cosmic Pioneer", gleams: 8500, country: "🇨🇦", countryName: "Canada", sector: "CleanTech", level: "L4", change: 3, bio: "Climate tech evangelist" },
  { rank: 7, name: "Nebula Builder", gleams: 8200, country: "🇦🇺", countryName: "Australia", sector: "SaaS", level: "L3", change: -2, bio: "Building productivity tools" },
  { rank: 8, name: "Astral Founder", gleams: 7800, country: "🇫🇷", countryName: "France", sector: "E-Commerce", level: "L3", change: 1, bio: "D2C brand builder" },
  { rank: 9, name: "Horizon Seeker", gleams: 7500, country: "🇮🇳", countryName: "India", sector: "FinTech", level: "L4", change: 0, bio: "Digital lending pioneer" },
  { rank: 10, name: "Starlight Innovator", gleams: 7200, country: "🇺🇸", countryName: "USA", sector: "Enterprise", level: "L3", change: -1, bio: "Enterprise SaaS specialist" },
];

export default function LeaderboardPage() {
  const [, setLocation] = useLocation();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<typeof mockLeaderboard[0] | null>(null);

  const filteredLeaderboard = mockLeaderboard.filter((entry) => {
    if (searchQuery && !entry.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedLevel !== "All" && entry.level !== selectedLevel) {
      return false;
    }
    return true;
  });

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
          <TooltipContent>
            <p>Return to home page</p>
          </TooltipContent>
        </Tooltip>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Trophy className="h-8 w-8 text-amber-400" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white">Global Leaderboard</h1>
          </div>
          <p className="text-slate-400">
            Compete with founders worldwide - filter by Country, Sector, or Level
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div 
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              animate={{ boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 10px rgba(139, 92, 246, 0.1)", "0 0 0 rgba(139, 92, 246, 0)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search founders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-900/50 border-slate-700"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search by founder name</p>
                </TooltipContent>
              </Tooltip>

              <div className="space-y-3">
                <FilterSection
                  icon={Globe}
                  title="Countries"
                  subtitle="156+ represented"
                  items={COUNTRIES.map(c => ({ id: c.code, label: `${c.flag} ${c.name}`, count: c.count, hint: `Founders from ${c.name}` }))}
                  selected={selectedCountry}
                  onSelect={setSelectedCountry}
                />

                <FilterSection
                  icon={Building2}
                  title="Sectors"
                  subtitle="52+ industries"
                  items={SECTORS.map(s => ({ id: s.id, label: `${s.emoji} ${s.name}`, count: s.count, hint: s.hint }))}
                  selected={selectedSector}
                  onSelect={setSelectedSector}
                />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-semibold text-white">Level</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {LEVELS.map((level, i) => (
                      <Tooltip key={level}>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedLevel(level)}
                            className={`px-2 py-1 text-xs rounded-md transition-all ${
                              selectedLevel === level
                                ? "bg-violet-500 text-white"
                                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {level}
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filter by {level === "All" ? "all levels" : level}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div 
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              whileHover={{ scale: 1.02 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between cursor-pointer hover:bg-slate-700/30 p-1 rounded">
                      <span className="text-slate-400">Total Founders</span>
                      <span className="text-white font-semibold"><AnimatedCounter target={2847} /></span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Active founders on the platform</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between cursor-pointer hover:bg-slate-700/30 p-1 rounded">
                      <span className="text-slate-400">Total Gleams</span>
                      <span className="text-amber-400 font-semibold"><AnimatedCounter target={1247892} /> {GLEAM_SYMBOL}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Gleams earned by community</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between cursor-pointer hover:bg-slate-700/30 p-1 rounded">
                      <span className="text-slate-400">Countries</span>
                      <span className="text-white font-semibold">156+</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Global reach across continents</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between cursor-pointer hover:bg-slate-700/30 p-1 rounded">
                      <span className="text-slate-400">Sectors</span>
                      <span className="text-white font-semibold">52+</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Industries represented</p></TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          </div>

          {/* Leaderboard Table */}
          <div className="lg:col-span-3">
            <motion.div 
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
              animate={{ boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 15px rgba(139, 92, 246, 0.1)", "0 0 0 rgba(139, 92, 246, 0)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="h-5 w-5 text-amber-400" />
                  </motion.div>
                  <span className="font-semibold text-white">Top Performers</span>
                  <span className="text-xs text-slate-400">({filteredLeaderboard.length} founders)</span>
                </div>
              </div>

              <div className="divide-y divide-slate-700/50">
                {filteredLeaderboard.map((entry, i) => (
                  <Dialog key={entry.rank}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.01, x: 5, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                            className="flex items-center gap-4 p-4 hover:bg-slate-700/20 transition-colors cursor-pointer"
                            data-testid={`row-leaderboard-${entry.rank}`}
                          >
                            <motion.div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black" :
                                entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-black" :
                                entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                                "bg-slate-700 text-slate-300"
                              }`}
                              animate={entry.rank <= 3 ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity, delay: entry.rank * 0.2 }}
                            >
                              {entry.rank}
                            </motion.div>

                            <div className="text-2xl">{entry.country}</div>

                            <div className="flex-1">
                              <div className="font-semibold text-white">{entry.name}</div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{entry.sector}</span>
                                <span>•</span>
                                <span>{entry.level}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-amber-400">
                                {GLEAM_SYMBOL} {entry.gleams.toLocaleString()}
                              </div>
                              <div className="text-xs text-slate-500">
                                {(entry.gleams / 100).toFixed(1)} {ALICORN_SYMBOL}
                              </div>
                            </div>

                            <div className={`w-8 text-center text-sm font-medium ${
                              entry.change > 0 ? "text-green-400" : 
                              entry.change < 0 ? "text-red-400" : 
                              "text-slate-500"
                            }`}>
                              {entry.change > 0 && "↑"}
                              {entry.change < 0 && "↓"}
                              {entry.change === 0 && "−"}
                            </div>

                            <Maximize2 className="h-4 w-4 text-slate-500" />
                          </motion.div>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Click to view {entry.name}'s profile</p>
                      </TooltipContent>
                    </Tooltip>

                    <ResizableDialogContent className="bg-slate-900 border-violet-500/50 max-w-lg">
                      <div className="p-2">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                            entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black" :
                            entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-black" :
                            entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                            "bg-slate-700 text-slate-300"
                          }`}>
                            #{entry.rank}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">{entry.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span>{entry.country} {entry.countryName}</span>
                              <span>•</span>
                              <span>{entry.sector}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                          <p className="text-slate-300 text-sm">{entry.bio}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="text-amber-400 font-bold text-lg">{GLEAM_SYMBOL} {entry.gleams.toLocaleString()}</div>
                            <div className="text-xs text-slate-400">Gleams</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
                            <div className="text-violet-400 font-bold text-lg">{(entry.gleams / 100).toFixed(1)} {ALICORN_SYMBOL}</div>
                            <div className="text-xs text-slate-400">Alicorns</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                            <div className="text-white font-bold text-lg">{entry.level}</div>
                            <div className="text-xs text-slate-400">Level</div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-2 mb-4">
                          <Info className="h-3 w-3" />
                          <span>Profile data for illustration purposes</span>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                          onClick={() => setLocation("/value-journey")}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Start Your Journey
                        </Button>
                      </div>
                    </ResizableDialogContent>
                  </Dialog>
                ))}
              </div>

              <div className="p-4 border-t border-slate-700/50 text-center">
                <Button variant="ghost" className="text-violet-400 hover:text-violet-300">
                  Load More
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}

function FilterSection({ 
  icon: Icon, 
  title, 
  subtitle,
  items, 
  selected, 
  onSelect 
}: { 
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  items: { id: string; label: string; count: number; hint?: string }[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, 4);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-semibold text-white">{title}</span>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
      {/* ADDED CLASS BELOW: dropdown-scroll-fix */}
      <div className={`space-y-1 ${expanded ? "dropdown-scroll-fix pr-2" : ""}`}>
        {displayItems.map((item, i) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, x: 3 }}
                onClick={() => onSelect(selected === item.id ? null : item.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                  selected === item.id
                    ? "bg-violet-500/20 border border-violet-500/50 text-violet-300"
                    : "bg-slate-700/30 text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-slate-500">{item.count}</span>
              </motion.button>
            </TooltipTrigger>
            {item.hint && (
              <TooltipContent side="right">
                <p>{item.hint}</p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
        {items.length > 4 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs text-violet-400 hover:text-violet-300 py-1"
          >
            {expanded ? "Show less" : `+${items.length - 4} more`}
          </motion.button>
        )}
      </div>
    </div>
  );
}