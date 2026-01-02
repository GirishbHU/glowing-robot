import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  RefreshCw,
  Clock,
  Users,
  Building,
  Briefcase,
  TrendingUp,
  Award,
  Rocket,
  Lightbulb,
  Target,
  HandshakeIcon,
  Megaphone,
  Landmark,
  Search,
  MapPin,
  Star,
  Zap,
  Activity,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Trophy,
  Crown,
  Medal,
  Newspaper,
  MessageSquare,
  FileText,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

interface Profile {
  id: string;
  name: string;
  avatar?: string;
  type: string;
  level: string;
  sector: string;
  location: string;
  alicornScore: number;
}

interface CategoryData {
  type: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  topProfiles: Profile[];
  gradient: string;
}

interface ActivityItem {
  id: string;
  type: "join" | "assessment" | "level_up" | "match";
  message: string;
  timestamp: Date;
  user?: string;
  level?: string;
}

interface NewsItem {
  id: string;
  headline: string;
  source: string;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  type: string;
  alicornScore: number;
  trend: "up" | "down" | "same";
}

const MOCK_NEWS: NewsItem[] = [
  { id: "1", headline: "TechCrunch: AI Startup Raises $50M Series B", source: "TechCrunch" },
  { id: "2", headline: "Forbes: Top 10 Emerging Startups to Watch in 2025", source: "Forbes" },
  { id: "3", headline: "Bloomberg: VC Funding Hits Record High in Q4", source: "Bloomberg" },
  { id: "4", headline: "Reuters: Climate Tech Startups See 300% Growth", source: "Reuters" },
  { id: "5", headline: "WSJ: Unicorn Club Expands to 1,500 Companies", source: "WSJ" },
  { id: "6", headline: "Crunchbase: Global Startup Ecosystem Report Released", source: "Crunchbase" },
];

interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  category: "news" | "opinion" | "blog";
  source: string;
  author?: string;
  date: string;
  imageUrl?: string;
  url?: string;
}

const MOCK_ARTICLES: ArticleItem[] = [
  { id: "1", title: "Meta's Genesis: From Dorm to Empire", excerpt: "How Facebook evolved from a Harvard dorm project to a multi-billion dollar social media empire.", category: "blog", source: "i2u.ai Blog", date: "2025-01-15", imageUrl: "https://i2u.ai/article-images/image17.jpeg", url: "https://about.meta.com/" },
  { id: "2", title: "The AI Era: Humanity's Multiverse Bang", excerpt: "Exploring how AI represents a cognitive oxygenation event for humanity's evolution.", category: "opinion", source: "Adventures in BM Terrain", author: "Dr. Anand", date: "2025-01-14", url: "https://www.linkedin.com/pulse/ai-era" },
  { id: "3", title: "AI Startup Raises $50M Series B", excerpt: "Leading AI company secures major funding round to expand global operations.", category: "news", source: "TechCrunch", date: "2025-01-13", url: "https://techcrunch.com/category/startups/" },
  { id: "4", title: "DevRev: Bridging Developer-Customer Gap", excerpt: "Reshaping the Enterprise CRM Market by connecting developers directly with customer feedback.", category: "blog", source: "i2u.ai Blog", date: "2025-01-12", imageUrl: "https://i2u.ai/article-images/image4.jpeg", url: "https://devrev.ai" },
  { id: "5", title: "Why VCs Are Betting Big on Climate Tech", excerpt: "Industry experts weigh in on the massive surge in climate tech investments.", category: "opinion", source: "Forbes", author: "Jane Doe", date: "2025-01-11", url: "https://www.forbes.com/innovation/" },
  { id: "6", title: "Netflix: From DVD to Streaming Dominance", excerpt: "The transformation journey from mail-order DVDs to the world's leading streaming platform.", category: "blog", source: "i2u.ai Blog", date: "2025-01-10", imageUrl: "https://i2u.ai/article-images/image21.jpeg", url: "https://about.netflix.com/en" },
  { id: "7", title: "VC Funding Hits Record High in Q4", excerpt: "Global venture capital investments reached unprecedented levels in the final quarter.", category: "news", source: "Bloomberg", date: "2025-01-09", url: "https://www.bloomberg.com/technology" },
  { id: "8", title: "The Future of Remote Work Startups", excerpt: "How the pandemic permanently reshaped the startup landscape.", category: "opinion", source: "WSJ", author: "Tech Reporter", date: "2025-01-08", url: "https://www.wsj.com/tech" },
  { id: "9", title: "Satya Nadella Era: Cloud to AI Powerhouse", excerpt: "Microsoft's transformation under Satya Nadella from cloud leader to AI innovation powerhouse.", category: "blog", source: "i2u.ai Blog", date: "2025-01-07", imageUrl: "https://i2u.ai/article-images/image27.jpeg", url: "https://news.microsoft.com/" },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: "1", type: "join", message: "Sarah Chen joined as Startup Founder", timestamp: new Date(Date.now() - 60000), user: "Sarah Chen", level: "L2" },
  { id: "2", type: "assessment", message: "TechVenture Inc completed L3 assessment", timestamp: new Date(Date.now() - 120000), user: "TechVenture Inc" },
  { id: "3", type: "level_up", message: "David Park advanced to L5 Investor", timestamp: new Date(Date.now() - 180000), user: "David Park", level: "L5" },
  { id: "4", type: "match", message: "New match: HealthAI × Sequoia Capital", timestamp: new Date(Date.now() - 240000) },
  { id: "5", type: "join", message: "GreenTech Labs joined the ecosystem", timestamp: new Date(Date.now() - 300000), user: "GreenTech Labs" },
  { id: "6", type: "assessment", message: "FinanceFlow completed L4 assessment", timestamp: new Date(Date.now() - 360000), user: "FinanceFlow" },
  { id: "7", type: "level_up", message: "Maria Santos advanced to L6 Mentor", timestamp: new Date(Date.now() - 420000), user: "Maria Santos", level: "L6" },
  { id: "8", type: "match", message: "New match: EduTech × Y Combinator", timestamp: new Date(Date.now() - 480000) },
];

const MOCK_PROFILES: Profile[] = [
  { id: "1", name: "Innovate Labs", avatar: "", type: "Startup", level: "L4", sector: "AI/ML", location: "San Francisco, CA", alicornScore: 8750 },
  { id: "2", name: "Sequoia Capital", avatar: "", type: "Investor", level: "L7", sector: "Multi-sector", location: "Menlo Park, CA", alicornScore: 15200 },
  { id: "3", name: "John Smith", avatar: "", type: "Mentor", level: "L5", sector: "SaaS", location: "New York, NY", alicornScore: 6420 },
  { id: "4", name: "TechCorp Global", avatar: "", type: "Corporate", level: "L6", sector: "Enterprise", location: "Seattle, WA", alicornScore: 9100 },
  { id: "5", name: "Y Combinator", avatar: "", type: "Accelerator", level: "L8", sector: "Multi-sector", location: "Mountain View, CA", alicornScore: 18500 },
];

const CATEGORY_CONFIG: Omit<CategoryData, "count" | "topProfiles">[] = [
  { type: "startup", label: "Startups", icon: <Rocket className="h-5 w-5" />, gradient: "from-violet-500 to-purple-600" },
  { type: "investor", label: "Investors", icon: <TrendingUp className="h-5 w-5" />, gradient: "from-emerald-500 to-teal-600" },
  { type: "mentor", label: "Mentors", icon: <Lightbulb className="h-5 w-5" />, gradient: "from-amber-500 to-orange-600" },
  { type: "corporate", label: "Corporates", icon: <Building className="h-5 w-5" />, gradient: "from-blue-500 to-indigo-600" },
  { type: "accelerator", label: "Accelerators", icon: <Zap className="h-5 w-5" />, gradient: "from-pink-500 to-rose-600" },
  { type: "facilitator", label: "Facilitators", icon: <HandshakeIcon className="h-5 w-5" />, gradient: "from-cyan-500 to-sky-600" },
  { type: "talent", label: "Talent", icon: <Users className="h-5 w-5" />, gradient: "from-fuchsia-500 to-purple-600" },
  { type: "influencer", label: "Influencers", icon: <Megaphone className="h-5 w-5" />, gradient: "from-red-500 to-orange-600" },
  { type: "government", label: "Government/NGOs", icon: <Landmark className="h-5 w-5" />, gradient: "from-slate-500 to-gray-600" },
];

const LEVELS = ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8"];

const SECTORS = [
  "All Sectors",
  "AI/ML",
  "FinTech",
  "HealthTech",
  "EdTech",
  "CleanTech",
  "SaaS",
  "E-commerce",
  "Biotech",
  "IoT",
  "Blockchain",
];

const LOCATIONS = [
  "All Locations",
  "San Francisco, CA",
  "New York, NY",
  "London, UK",
  "Singapore",
  "Berlin, Germany",
  "Tel Aviv, Israel",
  "Bangalore, India",
  "Tokyo, Japan",
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function NewsTicker({ news }: { news: NewsItem[] }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-violet-900/30 via-purple-900/20 to-violet-900/30 border-y border-violet-500/20 py-2">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: [0, -50 * news.length * 10],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: news.length * 10,
            ease: "linear",
          },
        }}
      >
        {[...news, ...news, ...news].map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs border-violet-500/50 text-violet-300">
              {item.source}
            </Badge>
            <span className="text-slate-300">{item.headline}</span>
            <span className="text-violet-500">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "join":
        return <UserPlus className="h-4 w-4 text-green-400" />;
      case "assessment":
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case "level_up":
        return <TrendingUp className="h-4 w-4 text-amber-400" />;
      case "match":
        return <HandshakeIcon className="h-4 w-4 text-pink-400" />;
    }
  };

  return (
    <Card className="h-full bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-violet-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-violet-400" />
          <span>Live Activity</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                  data-testid={`activity-item-${activity.id}`}
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 line-clamp-2">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ category }: { category: CategoryData }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-700/50 hover:border-violet-500/50 transition-colors"
        data-testid={`category-card-${category.type}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient}`}>
                {category.icon}
              </div>
              <div>
                <CardTitle className="text-base">{category.label}</CardTitle>
                <p className="text-2xl font-bold text-violet-400">{category.count.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex -space-x-2 mb-3">
            {category.topProfiles.slice(0, 5).map((profile, idx) => (
              <Avatar key={profile.id} className="border-2 border-slate-900 h-8 w-8">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className={`text-xs bg-gradient-to-br ${category.gradient}`}>
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {category.count > 5 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-800 border-2 border-slate-900 text-xs text-slate-400">
                +{category.count - 5}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full group"
            data-testid={`view-all-${category.type}`}
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-700/50 hover:border-violet-500/50 transition-all"
        data-testid={`profile-card-${profile.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-violet-500/30">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600">
                {profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{profile.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {profile.type}
                </Badge>
                <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                  {profile.level}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="truncate">{profile.sector}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{profile.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-amber-400">{profile.alicornScore.toLocaleString()}</span>
              <span className="text-xs text-slate-500">Alicorns</span>
            </div>
            <Button size="sm" data-testid={`connect-${profile.id}`}>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LeaderboardTab({ level }: { level: string }) {
  const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, id: "1", name: "Innovate Labs", type: "Startup", alicornScore: 18500, trend: "up" as const },
    { rank: 2, id: "2", name: "Sequoia Capital", type: "Investor", alicornScore: 15200, trend: "same" as const },
    { rank: 3, id: "3", name: "TechCorp Global", type: "Corporate", alicornScore: 12800, trend: "up" as const },
    { rank: 4, id: "4", name: "Y Combinator", type: "Accelerator", alicornScore: 11500, trend: "down" as const },
    { rank: 5, id: "5", name: "John Smith", type: "Mentor", alicornScore: 9420, trend: "up" as const },
  ];

  const { data } = useQuery<{ success: boolean; profiles: any[] }>({
    queryKey: ["/api/ecosystem/leaderboard/level", level],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const leaderboard = useMemo(() => {
    if (data?.profiles && data.profiles.length > 0) {
      return data.profiles.map((p, i) => ({
        rank: i + 1,
        id: String(p.id),
        name: p.displayName || p.name,
        avatar: p.imageUrl,
        type: p.entityType?.replace('_', ' ') || 'Unknown',
        alicornScore: p.totalAlicorns || 0,
        trend: 'same' as const,
      }));
    }
    return MOCK_LEADERBOARD;
  }, [data?.profiles]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-amber-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-slate-500 font-mono">{rank}</span>;
    }
  };

  return (
    <div className="space-y-2">
      {leaderboard?.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
          data-testid={`leaderboard-entry-${entry.id}`}
        >
          <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>
          <Avatar className="h-10 w-10 border border-violet-500/30">
            <AvatarImage src={entry.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-sm">
              {entry.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{entry.name}</p>
            <p className="text-xs text-slate-400">{entry.type}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-lg font-bold text-amber-400">{entry.alicornScore.toLocaleString()}</span>
              <span className="text-xs">🦄</span>
            </div>
            <motion.div
              animate={entry.trend === "up" ? { y: [-2, 0, -2] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {entry.trend === "up" && <TrendingUp className="h-3 w-3 text-green-400 inline" />}
              {entry.trend === "down" && <TrendingUp className="h-3 w-3 text-red-400 inline rotate-180" />}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MatchingEngine() {
  const [entityType, setEntityType] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [sector, setSector] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);

  const { data, refetch } = useQuery<{ success: boolean; profiles: any[] }>({
    queryKey: ["/api/ecosystem/profiles", { entityType, level, sector, location }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: false,
  });

  const profiles = useMemo(() => {
    if (data?.profiles && data.profiles.length > 0) {
      return data.profiles.map((p) => ({
        id: String(p.id),
        name: p.displayName || p.name,
        avatar: p.imageUrl,
        type: p.entityType?.replace('_', ' ') || 'Unknown',
        level: p.level || 'L0',
        sector: p.sector || 'Technology',
        location: `${p.city || 'Unknown'}, ${p.country || 'Global'}`,
        alicornScore: p.totalAlicorns || 0,
      }));
    }
    return MOCK_PROFILES;
  }, [data?.profiles]);

  const handleSearch = async () => {
    setIsSearching(true);
    await refetch();
    setTimeout(() => setIsSearching(false), 500);
  };

  return (
    <Card className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-violet-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-violet-400" />
          Matching Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Entity Type</label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger data-testid="filter-entity-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CATEGORY_CONFIG.map((cat) => (
                  <SelectItem key={cat.type} value={cat.type}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Level</label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger data-testid="filter-level">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Sector</label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger data-testid="filter-sector">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s === "All Sectors" ? "all" : s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger data-testid="filter-location">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc === "All Locations" ? "all" : loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSearch}
          className="w-full mb-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          disabled={isSearching}
          data-testid="find-matches-button"
        >
          {isSearching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Find Matches
            </>
          )}
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(profiles || MOCK_PROFILES).map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ArticlesSection() {
  const [activeTab, setActiveTab] = useState<"all" | "news" | "opinion" | "blog">("all");

  const filteredArticles = useMemo(() => {
    if (activeTab === "all") return MOCK_ARTICLES;
    return MOCK_ARTICLES.filter((a) => a.category === activeTab);
  }, [activeTab]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "news":
        return <Newspaper className="h-4 w-4" />;
      case "opinion":
        return <MessageSquare className="h-4 w-4" />;
      case "blog":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "news":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "opinion":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "blog":
        return "bg-violet-500/20 text-violet-400 border-violet-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <Card className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-violet-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-violet-400" />
          Articles & Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="all" data-testid="articles-tab-all">All</TabsTrigger>
            <TabsTrigger value="news" data-testid="articles-tab-news">
              <Newspaper className="h-3 w-3 mr-1" /> News
            </TabsTrigger>
            <TabsTrigger value="opinion" data-testid="articles-tab-opinion">
              <MessageSquare className="h-3 w-3 mr-1" /> Opinion
            </TabsTrigger>
            <TabsTrigger value="blog" data-testid="articles-tab-blog">
              <FileText className="h-3 w-3 mr-1" /> Blogs
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card
                    className="h-full bg-slate-800/50 border-slate-700/50 hover:border-violet-500/50 transition-all cursor-pointer overflow-hidden"
                    onClick={() => article.url && window.open(article.url, "_blank")}
                    data-testid={`article-card-${article.id}`}
                  >
                    {article.imageUrl && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getCategoryColor(article.category)}`}
                        >
                          {getCategoryIcon(article.category)}
                          <span className="ml-1 capitalize">{article.category}</span>
                        </Badge>
                        <span className="text-xs text-slate-500">{article.date}</span>
                      </div>
                      <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-violet-300 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{article.source}</span>
                        {article.author && <span>by {article.author}</span>}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface EcosystemDashboardProps {
  defaultLevel?: string;
  defaultStakeholder?: string;
  embedded?: boolean;
  params?: Record<string, string>;
}

const HUMOROUS_MESSAGES = [
  { emoji: "🦄", text: "Still hunting unicorns... aren't we all?" },
  { emoji: "☕", text: "Powered by coffee and unrealistic valuations" },
  { emoji: "📊", text: "These metrics won't lie to themselves" },
  { emoji: "🚀", text: "Launch scheduled for 'soon™'" },
  { emoji: "💡", text: "Ideas are cheap. Execution is expensive. Sleep is priceless." },
  { emoji: "🎯", text: "Our pivot strategy has a pivot strategy" },
  { emoji: "🔥", text: "Burning runway, one feature at a time" },
  { emoji: "😅", text: "Yes, we tested in production. No regrets. Some regrets." },
  { emoji: "🤔", text: "Disrupting the disruption industry" },
  { emoji: "📈", text: "Hockey stick growth... eventually" },
  { emoji: "🌙", text: "Building dreams at 2am. Again." },
  { emoji: "🎪", text: "Welcome to the startup circus!" },
  { emoji: "🧠", text: "Imposter syndrome? Never heard of her." },
  { emoji: "💸", text: "Revenue is just a suggestion, right?" },
  { emoji: "🎭", text: "Fake it till you... wait, what comes after?" },
  { emoji: "🦖", text: "Evolving faster than our business model" },
  { emoji: "⚡", text: "Move fast, break things, fix them later. Maybe." },
  { emoji: "🎲", text: "Strategy = educated gambling" },
  { emoji: "🌈", text: "Somewhere over the rainbow, there's product-market fit" },
  { emoji: "🔮", text: "Predicting the future. Badly." },
];

export default function EcosystemDashboard({ defaultLevel, defaultStakeholder, embedded = false }: EcosystemDashboardProps) {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const urlLevel = searchParams.get("level") || defaultLevel;
  const urlStakeholder = searchParams.get("stakeholder") || defaultStakeholder;

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [nextRefreshMinutes, setNextRefreshMinutes] = useState(60);
  const [selectedLeaderboardLevel, setSelectedLeaderboardLevel] = useState(urlLevel?.toUpperCase() || "L0");

  const [showSplash, setShowSplash] = useState(true);
  const [messageIndex, setMessageIndex] = useState(() => Math.floor(Math.random() * HUMOROUS_MESSAGES.length));

  useEffect(() => {
    if (showSplash) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % HUMOROUS_MESSAGES.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showSplash]);

  useEffect(() => {
    if (urlLevel) {
      setSelectedLeaderboardLevel(urlLevel.toUpperCase());
    }
  }, [urlLevel]);

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/ecosystem/dashboard"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 60000,
  });

  const { data: newsResponse } = useQuery<{ success: boolean; news: any[] }>({
    queryKey: ["/api/ecosystem/news"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const newsData = useMemo(() => {
    if (newsResponse?.news && newsResponse.news.length > 0) {
      return newsResponse.news;
    }
    return MOCK_NEWS;
  }, [newsResponse?.news]);

  const { data: activityResponse } = useQuery<{ success: boolean; activities: any[] }>({
    queryKey: ["/api/ecosystem/activity"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 30000,
  });

  const activityData = useMemo(() => {
    if (activityResponse?.activities && activityResponse.activities.length > 0) {
      return activityResponse.activities.map(a => ({
        ...a,
        timestamp: new Date(a.createdAt || a.timestamp),
      }));
    }
    return MOCK_ACTIVITIES;
  }, [activityResponse?.activities]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefreshMinutes((prev) => {
        if (prev <= 1) {
          setLastUpdated(new Date());
          return 60;
        }
        return prev - 1;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const categories: CategoryData[] = useMemo(() => {
    return CATEGORY_CONFIG.map((config) => ({
      ...config,
      count: Math.floor(Math.random() * 5000) + 500,
      topProfiles: MOCK_PROFILES.slice(0, 5),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Humorous Splash Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950/50 to-slate-950"
            onClick={() => setShowSplash(false)}
          >
            <div className="text-center px-8 max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mb-8"
                >
                  <motion.div
                    className="text-8xl md:text-9xl mb-6"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {HUMOROUS_MESSAGES[messageIndex]?.emoji}
                  </motion.div>
                  <motion.h1
                    className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                    animate={{ opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {HUMOROUS_MESSAGES[messageIndex]?.text}
                  </motion.h1>
                </motion.div>
              </AnimatePresence>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-slate-400 text-lg md:text-xl mb-8"
              >
                Click anywhere to explore the ecosystem
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex justify-center gap-2"
              >
                {HUMOROUS_MESSAGES.slice(0, 5).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i === messageIndex % 5 ? 'bg-violet-400 w-6' : 'bg-slate-600'
                      }`}
                  />
                ))}
              </motion.div>
            </div>

            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ delay: 2, y: { duration: 1.5, repeat: Infinity } }}
            >
              <div className="text-slate-500 text-sm flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                Tap to continue
                <ChevronDown className="h-4 w-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-b border-violet-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="h-8 w-8 text-violet-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Global Startup Ecosystem
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span>Live at this hour</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Next refresh in {nextRefreshMinutes}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewsTicker news={newsData} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ActivityFeed activities={activityData} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                Ecosystem Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.type} category={category} />
                ))}
              </div>
            </div>

            <Card className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-violet-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Level-based Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedLeaderboardLevel} onValueChange={setSelectedLeaderboardLevel}>
                  <TabsList className="grid grid-cols-9 w-full mb-4">
                    {LEVELS.map((level) => (
                      <TabsTrigger
                        key={level}
                        value={level}
                        className="text-xs"
                        data-testid={`leaderboard-tab-${level}`}
                      >
                        {level}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {LEVELS.map((level) => (
                    <TabsContent key={level} value={level}>
                      <LeaderboardTab level={level} />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            <MatchingEngine />

            <ArticlesSection />
          </div>
        </div>
      </div>
    </div>
  );
}
