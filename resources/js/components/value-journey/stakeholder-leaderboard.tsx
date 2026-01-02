import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { STAKEHOLDERS } from "@/lib/value-journey-types";

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

interface StakeholderLeaderboardProps {
  stakeholder?: string;
  variant?: "compact" | "full";
  showNewsfeed?: boolean;
  limit?: number;
  compact?: boolean; // legacy support
  initialFilters?: {
    country?: string;
    sector?: string;
    level?: string;
    region?: string;
    stakeholder?: string;
  };
  hideFilters?: boolean;
}

export function StakeholderLeaderboard({
  stakeholder = "Founder",
  variant = "compact",
  showNewsfeed = true,
  limit = 10,
  compact = false,
  initialFilters = {},
  hideFilters = false
}: StakeholderLeaderboardProps) {
  const [filters, setFilters] = useState({
    country: initialFilters.country || "",
    sector: initialFilters.sector || "",
    level: initialFilters.level || "",
    region: initialFilters.region || "",
    stakeholder: initialFilters.stakeholder || stakeholder
  });

  // Handle legacy compact prop
  const effectiveVariant = compact ? "compact" : variant;

  const stakeholderData = STAKEHOLDERS.find(s => s.name === stakeholder || s.id === stakeholder);

  // Use React Query for Leaderboard
  const { data: leaderboard = [], refetch: refetchLeaderboard, isRefetching: isRefetchingLeaderboard } = useQuery({
    queryKey: ['leaderboard', filters, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        stakeholder: filters.stakeholder,
        country: filters.country,
        sector: filters.sector,
        level: filters.level,
        region: filters.region,
        limit: limit.toString()
      });
      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Use React Query for News
  const { data: newsFeed = [], refetch: refetchNews } = useQuery({
    queryKey: ['news', stakeholder],
    queryFn: async () => {
      const res = await fetch(`/api/news?stakeholder=${stakeholder}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: showNewsfeed
  });

  const isRefreshing = isRefetchingLeaderboard;

  const refreshData = () => {
    refetchLeaderboard();
    if (showNewsfeed) refetchNews();
  };

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

      {/* Filters */}
      {!hideFilters && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          <input
            placeholder="Country..."
            className="bg-slate-800/50 text-white text-[10px] rounded-lg px-3 py-2 border border-slate-700/50 focus:border-violet-500 outline-none transition-colors"
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
          />
          <input
            placeholder="Sector..."
            className="bg-slate-800/50 text-white text-[10px] rounded-lg px-3 py-2 border border-slate-700/50 focus:border-violet-500 outline-none transition-colors"
            value={filters.sector}
            onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
          />
          <select
            className="bg-slate-800/50 text-white text-[10px] rounded-lg px-3 py-2 border border-slate-700/50 focus:border-violet-500 outline-none transition-colors appearance-none"
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
          >
            <option value="">All Levels</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(l => <option key={l} value={`L${l}`}>Level {l}</option>)}
          </select>
          <input
            placeholder="Region..."
            className="hidden md:block bg-slate-800/50 text-white text-[10px] rounded-lg px-3 py-2 border border-slate-700/50 focus:border-violet-500 outline-none transition-colors"
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
          />
        </div>
      )}

      {/* Leaderboard List */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="max-h-96 overflow-y-auto pr-2">
          {leaderboard.map((entry: LeaderboardEntry, i: number) => (
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
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
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
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold ${entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500" :
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
            {newsFeed.slice(0, 3).map((item: NewsFeedItem) => (
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
