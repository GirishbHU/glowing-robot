import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, TrendingUp, Globe, Newspaper, ExternalLink, 
  Users, Sparkles, Crown, Medal, ArrowUpRight, RefreshCw,
  Rss, BookOpen, Briefcase, Target, Rocket, Building2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { Button } from "@/components/ui/button";
import { STAKEHOLDERS } from "@/lib/valueJourneyTypes";

const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

interface LeaderboardEntry {
  rank: number;
  name: string;
  country: string;
  sector: string;
  gleams: number;
  alicorns: number;
  level: string;
  trend: "up" | "down" | "same";
}

interface NewsFeedItem {
  id: string;
  title: string;
  source: string;
  category: string;
  time: string;
  url: string;
  emoji: string;
}

const generateLeaderboard = (stakeholder: string, count: number = 10): LeaderboardEntry[] => {
  const names = [
    "Cosmic Pioneer", "Epic Voyager", "Brilliant Dragon", "Dynamic Titan", "Fierce Phoenix",
    "Galactic Sage", "Heroic Legend", "Infinite Star", "Jovial Maverick", "Keen Visionary",
    "Luminous Oracle", "Mystic Founder", "Noble Crusader", "Omega Builder", "Prime Catalyst",
    "Quantum Thinker", "Rising Unicorn", "Stellar Achiever", "Titan Maker", "Ultimate Dreamer"
  ];
  const countries = ["🇺🇸", "🇬🇧", "🇮🇳", "🇩🇪", "🇯🇵", "🇫🇷", "🇨🇦", "🇦🇺", "🇧🇷", "🇨🇳", "🇸🇬", "🇮🇱", "🇳🇱", "🇸🇪", "🇪🇸"];
  const sectors = ["AI/ML", "FinTech", "HealthTech", "EdTech", "SaaS", "E-commerce", "CleanTech", "Biotech"];
  const levels = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8"];
  const trends: ("up" | "down" | "same")[] = ["up", "up", "up", "same", "down"];
  
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    name: names[Math.floor(Math.random() * names.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    sector: sectors[Math.floor(Math.random() * sectors.length)],
    gleams: Math.floor(50000 - (i * 3500) + Math.random() * 1000),
    alicorns: parseFloat((500 - (i * 35) + Math.random() * 10).toFixed(1)),
    level: levels[Math.max(0, 7 - Math.floor(i / 2))],
    trend: trends[Math.floor(Math.random() * trends.length)],
  }));
};

const generateNewsFeed = (stakeholder: string): NewsFeedItem[] => {
  const stakeholderNews: Record<string, NewsFeedItem[]> = {
    "Founder": [
      { id: "1", title: "YC Winter 2025 Batch Announced: 200+ Startups", source: "TechCrunch", category: "Funding", time: "2h ago", url: "#", emoji: "🚀" },
      { id: "2", title: "AI Startup Valuations Hit New Highs in Q1", source: "Bloomberg", category: "Market", time: "4h ago", url: "#", emoji: "📈" },
      { id: "3", title: "The Future of Founder-Led Sales in 2025", source: "i2u.ai Blog", category: "Strategy", time: "6h ago", url: "https://i2u.ai/blog", emoji: "💡" },
      { id: "4", title: "Remote-First Startups Outperform by 23%", source: "Harvard Business Review", category: "Research", time: "8h ago", url: "#", emoji: "🏠" },
      { id: "5", title: "How to Build in Public: A Founder's Guide", source: "i2u.ai Blog", category: "Growth", time: "12h ago", url: "https://i2u.ai/blog", emoji: "🔨" },
    ],
    "Investor": [
      { id: "1", title: "VC Dry Powder Reaches $1.2 Trillion Globally", source: "PitchBook", category: "Market", time: "1h ago", url: "#", emoji: "💰" },
      { id: "2", title: "AI Investment Thesis for 2025: What's Next", source: "a16z", category: "Thesis", time: "3h ago", url: "#", emoji: "🤖" },
      { id: "3", title: "Due Diligence in the Age of AI", source: "i2u.ai Blog", category: "Process", time: "5h ago", url: "https://i2u.ai/blog", emoji: "🔍" },
      { id: "4", title: "Emerging Markets: The Next Unicorn Frontier", source: "Sequoia", category: "Geography", time: "7h ago", url: "#", emoji: "🌍" },
      { id: "5", title: "SPV Structures for Angel Syndicates", source: "AngelList", category: "Legal", time: "10h ago", url: "#", emoji: "📜" },
    ],
    "Mentor": [
      { id: "1", title: "The Art of Asking the Right Questions", source: "i2u.ai Blog", category: "Coaching", time: "2h ago", url: "https://i2u.ai/blog", emoji: "❓" },
      { id: "2", title: "Building Mentorship Programs That Scale", source: "First Round Review", category: "Program", time: "4h ago", url: "#", emoji: "📚" },
      { id: "3", title: "From Operator to Advisor: The Transition", source: "Medium", category: "Career", time: "6h ago", url: "#", emoji: "🔄" },
      { id: "4", title: "How to Give Feedback That Actually Helps", source: "i2u.ai Blog", category: "Skills", time: "9h ago", url: "https://i2u.ai/blog", emoji: "💬" },
      { id: "5", title: "The ROI of Mentorship: Data-Driven Insights", source: "Stanford GSB", category: "Research", time: "12h ago", url: "#", emoji: "📊" },
    ],
  };
  
  return stakeholderNews[stakeholder] || stakeholderNews["Founder"];
};

interface StakeholderLeaderboardProps {
  stakeholder: string;
  variant?: "compact" | "full";
  showNewsfeed?: boolean;
}

export function StakeholderLeaderboard({ 
  stakeholder, 
  variant = "compact",
  showNewsfeed = true 
}: StakeholderLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [newsFeed, setNewsFeed] = useState<NewsFeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"global" | "sector" | "country">("global");
  
  const stakeholderData = STAKEHOLDERS.find(s => s.name === stakeholder || s.id === stakeholder);
  
  useEffect(() => {
    setLeaderboard(generateLeaderboard(stakeholder));
    setNewsFeed(generateNewsFeed(stakeholder));
  }, [stakeholder]);
  
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLeaderboard(generateLeaderboard(stakeholder));
      setNewsFeed(generateNewsFeed(stakeholder));
      setIsRefreshing(false);
    }, 1000);
  };
  
  const leaderboardTypes = [
    { id: "global", label: "Global", icon: Globe, hint: "Top performers worldwide" },
    { id: "sector", label: "By Sector", icon: Briefcase, hint: "Leaders in your industry" },
    { id: "country", label: "By Country", icon: Target, hint: "Regional champions" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span 
            className="text-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {stakeholderData?.emoji || "🏆"}
          </motion.span>
          <div>
            <h3 className="font-bold text-white">{stakeholderData?.name || stakeholder} Leaderboard</h3>
            <p className="text-xs text-slate-400">{stakeholderData?.description || "Top performers"}</p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={refreshData}
            >
              <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 1 }}>
                <RefreshCw className="h-4 w-4 text-slate-400" />
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Refresh leaderboard</p></TooltipContent>
        </Tooltip>
      </div>
      
      {/* Leaderboard Tabs */}
      <div className="flex gap-2">
        {leaderboardTypes.map((type) => (
          <Tooltip key={type.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveTab(type.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === type.id
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/50"
                    : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <type.icon className="h-3 w-3" />
                {type.label}
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{type.hint}</p></TooltipContent>
          </Tooltip>
        ))}
      </div>
      
      {/* Leaderboard List */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          {leaderboard.slice(0, variant === "compact" ? 5 : 10).map((entry, i) => (
            <Dialog key={entry.rank}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)", x: 3 }}
                      className="flex items-center gap-3 p-3 border-b border-slate-700/30 cursor-pointer"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
                        entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800" :
                        entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                        "bg-slate-700 text-slate-300"
                      }`}>
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? <Crown className="h-3.5 w-3.5" /> :
                          entry.rank === 2 ? <Medal className="h-3.5 w-3.5" /> :
                          <Trophy className="h-3.5 w-3.5" />
                        ) : entry.rank}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">{entry.name}</span>
                          <span className="text-sm">{entry.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{entry.sector}</span>
                          <span>•</span>
                          <span>{entry.level}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-amber-400 font-semibold text-sm">
                          {entry.gleams.toLocaleString()} {GLEAM_SYMBOL}
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-xs text-violet-400">{entry.alicorns} {ALICORN_SYMBOL}</span>
                          {entry.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                        </div>
                      </div>
                    </motion.div>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent><p>Click to view profile</p></TooltipContent>
              </Tooltip>
              
              <ResizableDialogContent className="bg-slate-900 border-violet-500/50 max-w-md">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold ${
                    entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                    entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400" :
                    entry.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-700" :
                    "bg-gradient-to-br from-violet-500 to-purple-600"
                  }`}>
                    #{entry.rank}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4">{entry.name}</h3>
                  <p className="text-slate-400">{entry.country} • {entry.sector}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-amber-400 font-bold">{entry.gleams.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Gleams {GLEAM_SYMBOL}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-violet-400 font-bold">{entry.alicorns}</div>
                      <div className="text-xs text-slate-400">Alicorns {ALICORN_SYMBOL}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-emerald-400 font-bold">{entry.level}</div>
                      <div className="text-xs text-slate-400">Level</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-4">Player data for illustration purposes</p>
                </div>
              </ResizableDialogContent>
            </Dialog>
          ))}
        </div>
      </div>
      
      {/* News Feed */}
      {showNewsfeed && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Rss className="h-4 w-4 text-amber-400" />
            <span className="font-medium text-white text-sm">{stakeholderData?.name} News Feed</span>
          </div>
          
          <div className="space-y-2">
            {newsFeed.slice(0, 3).map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <motion.a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 3, backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                    className="block p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-violet-500/30 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium line-clamp-1">{item.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-slate-500 flex-shrink-0 mt-1" />
                    </div>
                  </motion.a>
                </TooltipTrigger>
                <TooltipContent><p>Read article on {item.source}</p></TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-violet-400 hover:text-violet-300"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View All {stakeholderData?.name} Articles
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Browse 224+ articles on i2u.ai/blog</p></TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default StakeholderLeaderboard;
