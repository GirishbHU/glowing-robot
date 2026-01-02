import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Sparkles, Trophy, Target, TrendingUp, Users, Lightbulb, 
  Crown, Star, Award, ChevronRight, ArrowLeft, Home, Plus,
  BarChart3, PieChart, Rocket, Brain, Shield, Zap, Heart,
  GraduationCap, Building2, Newspaper, Briefcase, Globe,
  Download, Lock, Eye, FileJson, CheckCircle, Link, Copy,
  Key, Trash2, AlertTriangle, Clock, Wifi, LogIn, User
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { generateFunIdeaCode, getRandomPrivacyMessage, generateFancyName } from "@/lib/ideaCodes";
import { useAuth } from "@/hooks/use-auth";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell, Legend, Tooltip as RechartsTooltip
} from "recharts";

const STAKEHOLDER_ICONS: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  founder: { icon: <Rocket className="h-5 w-5" />, color: "text-violet-400", gradient: "from-violet-500 to-purple-600" },
  mentor: { icon: <Brain className="h-5 w-5" />, color: "text-amber-400", gradient: "from-amber-500 to-orange-600" },
  investor: { icon: <TrendingUp className="h-5 w-5" />, color: "text-emerald-400", gradient: "from-emerald-500 to-teal-600" },
  talent: { icon: <Star className="h-5 w-5" />, color: "text-cyan-400", gradient: "from-cyan-500 to-blue-600" },
  enabler: { icon: <Zap className="h-5 w-5" />, color: "text-pink-400", gradient: "from-pink-500 to-rose-600" },
  corporate: { icon: <Building2 className="h-5 w-5" />, color: "text-slate-400", gradient: "from-slate-500 to-gray-600" },
  academic: { icon: <GraduationCap className="h-5 w-5" />, color: "text-indigo-400", gradient: "from-indigo-500 to-blue-600" },
  government: { icon: <Shield className="h-5 w-5" />, color: "text-blue-400", gradient: "from-blue-500 to-sky-600" },
  media: { icon: <Newspaper className="h-5 w-5" />, color: "text-red-400", gradient: "from-red-500 to-orange-600" },
};

const LEVEL_CONFIG: Record<string, { emoji: string; name: string; color: string; gradient: string }> = {
  L0: { emoji: "✨", name: "Spark", color: "text-yellow-400", gradient: "from-yellow-500 to-amber-600" },
  L1: { emoji: "🔍", name: "Hunt", color: "text-blue-400", gradient: "from-blue-500 to-cyan-600" },
  L2: { emoji: "🎯", name: "Target", color: "text-green-400", gradient: "from-green-500 to-emerald-600" },
  L3: { emoji: "🏗️", name: "Build", color: "text-orange-400", gradient: "from-orange-500 to-red-600" },
  L4: { emoji: "🚀", name: "Launch", color: "text-purple-400", gradient: "from-purple-500 to-pink-600" },
  L5: { emoji: "📈", name: "Scale", color: "text-teal-400", gradient: "from-teal-500 to-cyan-600" },
  L6: { emoji: "🌍", name: "Expand", color: "text-indigo-400", gradient: "from-indigo-500 to-purple-600" },
  L7: { emoji: "👑", name: "Dominate", color: "text-amber-400", gradient: "from-amber-500 to-yellow-600" },
  L8: { emoji: "🦄", name: "Unicorn", color: "text-violet-400", gradient: "from-violet-500 to-pink-600" },
};

const DIMENSIONS = [
  { id: "D1", name: "Problem & Solution", emoji: "🎯", color: "text-violet-400", gradient: "from-violet-500 to-purple-600", description: "Customer pain point clarity" },
  { id: "D2", name: "Value Proposition", emoji: "💎", color: "text-blue-400", gradient: "from-blue-500 to-cyan-600", description: "Unique value delivery" },
  { id: "D3", name: "Team & Founder Fit", emoji: "👥", color: "text-amber-400", gradient: "from-amber-500 to-orange-600", description: "Team alignment & capability" },
  { id: "D4", name: "Business Model", emoji: "💰", color: "text-emerald-400", gradient: "from-emerald-500 to-teal-600", description: "Revenue & cost structure" },
  { id: "D5", name: "Technology & IP", emoji: "🔧", color: "text-pink-400", gradient: "from-pink-500 to-rose-600", description: "Tech stack & protection" },
  { id: "D6", name: "Market & Competition", emoji: "🌍", color: "text-cyan-400", gradient: "from-cyan-500 to-blue-600", description: "Market size & positioning" },
  { id: "D7", name: "Go-to-Market", emoji: "🚀", color: "text-indigo-400", gradient: "from-indigo-500 to-purple-600", description: "Customer acquisition strategy" },
  { id: "D8", name: "Traction & Metrics", emoji: "📈", color: "text-green-400", gradient: "from-green-500 to-emerald-600", description: "Growth indicators" },
  { id: "D9", name: "Funding & Runway", emoji: "💵", color: "text-yellow-400", gradient: "from-yellow-500 to-amber-600", description: "Capital & financial health" },
];

const EIRS = [
  { id: "EiR1", name: "MVP Completeness", emoji: "🐘", color: "text-red-400", gradient: "from-red-500 to-orange-600", description: "Critical functionality gaps", riskType: "Product Risk" },
  { id: "EiR2", name: "Funnel Drop-offs", emoji: "🐘", color: "text-orange-400", gradient: "from-orange-500 to-amber-600", description: "User journey friction", riskType: "Growth Risk" },
  { id: "EiR3", name: "Tech Dependencies", emoji: "🐘", color: "text-yellow-400", gradient: "from-yellow-500 to-lime-600", description: "Third-party fragility", riskType: "Tech Risk" },
  { id: "EiR4", name: "UX Diversity", emoji: "🐘", color: "text-green-400", gradient: "from-green-500 to-teal-600", description: "Cross-segment testing", riskType: "Market Risk" },
  { id: "EiR5", name: "Security & Compliance", emoji: "🐘", color: "text-teal-400", gradient: "from-teal-500 to-cyan-600", description: "Data protection gaps", riskType: "Legal Risk" },
  { id: "EiR6", name: "Team Dynamics", emoji: "🐘", color: "text-blue-400", gradient: "from-blue-500 to-indigo-600", description: "Growing pains at scale", riskType: "Team Risk" },
  { id: "EiR7", name: "Cost Sensitivity", emoji: "🐘", color: "text-indigo-400", gradient: "from-indigo-500 to-purple-600", description: "Runway impact risks", riskType: "Financial Risk" },
  { id: "EiR8", name: "Channel Dependency", emoji: "🐘", color: "text-purple-400", gradient: "from-purple-500 to-pink-600", description: "Single channel risk", riskType: "Marketing Risk" },
  { id: "EiR9", name: "Competitive Moat", emoji: "🐘", color: "text-pink-400", gradient: "from-pink-500 to-rose-600", description: "Defensibility gaps", riskType: "Strategy Risk" },
];

const COMPLEMENTARY_STAKEHOLDERS: Record<string, { stakeholder: string; reason: string }[]> = {
  "D1": [{ stakeholder: "mentor", reason: "Help clarify customer pain points" }],
  "D2": [{ stakeholder: "mentor", reason: "Refine your value proposition" }],
  "D3": [{ stakeholder: "talent", reason: "Fill team gaps" }, { stakeholder: "mentor", reason: "Leadership coaching" }],
  "D4": [{ stakeholder: "investor", reason: "Validate business model" }],
  "D5": [{ stakeholder: "corporate", reason: "Tech partnerships" }, { stakeholder: "academic", reason: "R&D collaboration" }],
  "D6": [{ stakeholder: "investor", reason: "Market insights" }],
  "D7": [{ stakeholder: "enabler", reason: "Go-to-market acceleration" }],
  "D8": [{ stakeholder: "mentor", reason: "Metrics optimization" }],
  "D9": [{ stakeholder: "investor", reason: "Funding guidance" }],
  "EiR1": [{ stakeholder: "talent", reason: "Technical expertise" }],
  "EiR2": [{ stakeholder: "mentor", reason: "Growth optimization" }],
  "EiR3": [{ stakeholder: "corporate", reason: "Enterprise stability" }],
  "EiR4": [{ stakeholder: "enabler", reason: "Market research" }],
  "EiR5": [{ stakeholder: "corporate", reason: "Compliance expertise" }, { stakeholder: "government", reason: "Regulatory guidance" }],
  "EiR6": [{ stakeholder: "mentor", reason: "Team building advice" }],
  "EiR7": [{ stakeholder: "investor", reason: "Financial planning" }],
  "EiR8": [{ stakeholder: "enabler", reason: "Channel diversification" }],
  "EiR9": [{ stakeholder: "mentor", reason: "Strategy coaching" }, { stakeholder: "investor", reason: "Competitive analysis" }],
};

function getSessionId(): string {
  let sessionId = localStorage.getItem("valueHubSessionId");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("valueHubSessionId", sessionId);
  }
  return sessionId;
}

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const sessionId = getSessionId();
  
  const [showCredentialLogin, setShowCredentialLogin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [suggestedCodename, setSuggestedCodename] = useState(() => generateFunIdeaCode(0));
  const [fancyName, setFancyName] = useState(() => generateFancyName());
  const [realName, setRealName] = useState("");
  const [isStartingJourney, setIsStartingJourney] = useState(false);

  const { data: userSession, isLoading: sessionLoading, refetch: refetchSession } = useQuery({
    queryKey: ["/api/user-sessions", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/user-sessions/${sessionId}`);
      if (!res.ok) {
        const createRes = await fetch("/api/user-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            sessionId, 
            userAgent: navigator.userAgent 
          }),
        });
        if (!createRes.ok) return null;
        const data = await createRes.json();
        return data.session;
      }
      const data = await res.json();
      return data.session;
    },
  });

  const freeSessionId = typeof window !== 'undefined' ? localStorage.getItem('i2u_session_id') : null;
  
  const { data: freeUserData } = useQuery({
    queryKey: ["/api/free-user", freeSessionId],
    queryFn: async () => {
      if (!freeSessionId) return null;
      const res = await fetch(`/api/free-user/${freeSessionId}/save-levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    },
    enabled: !!freeSessionId,
  });

  const effectiveDisplayName = freeUserData?.displayName || userSession?.displayName;

  const getMagicLink = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/m/${sessionId}`;
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  const accountCreatedAt = freeUserData?.createdAt || userSession?.createdAtMicro;

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleCredentialLogin = async () => {
    if (!loginName.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter your display name or real name",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/user-sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loginName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("valueHubSessionId", data.session.sessionId);
      toast({
        title: "Login successful!",
        description: "Your session has been restored",
      });
      setShowCredentialLogin(false);
      window.location.reload();
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Could not verify credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE ALL MY DATA") {
      toast({
        title: "Confirmation required",
        description: "Please type exactly: DELETE ALL MY DATA",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/user-data/${sessionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmDelete: "DELETE_ALL_MY_DATA" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deletion failed");
      }

      toast({
        title: "Account deleted",
        description: "All your data has been removed from our system",
      });
      
      localStorage.removeItem("valueHubSessionId");
      localStorage.removeItem("vjq_session_id");
      setShowDeleteConfirm(false);
      setLocation("/");
    } catch (err) {
      toast({
        title: "Deletion failed",
        description: err instanceof Error ? err.message : "Could not delete your data",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const { data: ideas = [], isLoading: ideasLoading } = useQuery({
    queryKey: ["/api/ideas", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/ideas/${sessionId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.ideas || [];
    },
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/roles/${sessionId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.roles || [];
    },
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/assessment-sessions", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/assessment-sessions/${sessionId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.sessions || [];
    },
  });

  const totalGleams = sessions.reduce((sum: number, s: any) => sum + (s.gleamsEarned || 0), 0);
  const totalAlicorns = (totalGleams / 100).toFixed(2);
  const completedSessions = sessions.filter((s: any) => s.status === "completed").length;

  const levelProgressData = Object.keys(LEVEL_CONFIG).map((level) => {
    const levelSessions = sessions.filter((s: any) => s.level === level && s.status === "completed");
    const avgScore = levelSessions.length > 0 
      ? Math.round(levelSessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / levelSessions.length)
      : 0;
    return {
      level,
      name: LEVEL_CONFIG[level].name,
      score: avgScore,
      gleams: levelSessions.reduce((sum: number, s: any) => sum + (s.gleamsEarned || 0), 0),
    };
  });

  const dimensionData = [
    { dimension: "Vision", score: 75, fullMark: 100 },
    { dimension: "Team", score: 82, fullMark: 100 },
    { dimension: "Product", score: 68, fullMark: 100 },
    { dimension: "Market", score: 71, fullMark: 100 },
    { dimension: "Traction", score: 45, fullMark: 100 },
    { dimension: "Funding", score: 58, fullMark: 100 },
  ];

  const leaderboardData = [
    { rank: 1, name: "StartupNinja", gleams: 12500, alicorns: 125, level: "L6" },
    { rank: 2, name: "VisionaryFounder", gleams: 11200, alicorns: 112, level: "L5" },
    { rank: 3, name: "TechDisruptor", gleams: 9800, alicorns: 98, level: "L5" },
    { rank: 4, name: "InnovatorsClub", gleams: 8500, alicorns: 85, level: "L4" },
    { rank: 5, name: "ScaleUpPro", gleams: 7200, alicorns: 72, level: "L4" },
  ];

  const userRank = 15;
  const isLoading = ideasLoading || rolesLoading || sessionsLoading || authLoading || sessionLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🦄
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="fixed top-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.history.back()}
                    className="text-slate-400 hover:text-white hover:bg-white/10 p-2"
                    data-testid="button-account-back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Go back</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLocation("/")}
                    className="text-slate-400 hover:text-white hover:bg-white/10 p-2"
                    data-testid="button-account-home"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Go to home</TooltipContent>
              </Tooltip>
              <span className="text-xl">🦄</span>
              <span className="font-heading font-bold text-lg hidden sm:inline">My Account</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.firstName || 'User'} 
                      className="w-7 h-7 rounded-full border border-violet-500/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.firstName?.[0] || user.email?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{user.firstName || user.email?.split('@')[0] || 'User'}</span>
                </div>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Guest Mode
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 pb-24 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-300/80">Total Gleams</p>
                      <p className="text-3xl font-bold text-yellow-400" data-testid="text-total-gleams">
                        {totalGleams.toLocaleString()} Ğ
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-10 w-10 text-yellow-400" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 border-violet-500/30 relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-violet-300/80">Total Alicorns</p>
                      <p className="text-3xl font-bold text-violet-400" data-testid="text-total-alicorns">
                        {totalAlicorns} 🦄
                      </p>
                      <p className="text-xs text-violet-300/60 mt-1">across {ideas.length} idea{ideas.length !== 1 ? 's' : ''}</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl"
                    >
                      🦄
                    </motion.div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-xs px-2 py-1 h-7"
                        onClick={() => {
                          const text = `🦄 I've earned ${totalAlicorns} Alicorns on my unicorn journey with i2u.ai! #StartupQuest #Unicorn`;
                          if (navigator.share) {
                            navigator.share({ text });
                          } else {
                            navigator.clipboard.writeText(text);
                            alert("Copied to clipboard! Share your achievement!");
                          }
                        }}
                        data-testid="button-brag-alicorns"
                      >
                        <Trophy className="h-3 w-3 mr-1" />
                        Brag!
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share your Alicorn achievements!</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-emerald-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-300/80">Ideas</p>
                      <p className="text-3xl font-bold text-emerald-400" data-testid="text-ideas-count">
                        {ideas.length}
                      </p>
                    </div>
                    <Lightbulb className="h-10 w-10 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-pink-300/80">Global Rank</p>
                      <p className="text-3xl font-bold text-pink-400" data-testid="text-global-rank">
                        #{userRank}
                      </p>
                    </div>
                    <Trophy className="h-10 w-10 text-pink-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Tabs defaultValue="ideas" className="space-y-4">
              <TabsList className="grid grid-cols-5 bg-slate-800/50">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="ideas" className="data-[state=active]:bg-violet-600" data-testid="tab-ideas">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Ideas
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Manage your startup ideas</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="dimensions" className="data-[state=active]:bg-emerald-600" data-testid="tab-dimensions">
                      <Target className="h-4 w-4 mr-2" />
                      Dimensions
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>View your 9 core competency strengths</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="eirs" className="data-[state=active]:bg-red-600" data-testid="tab-eirs">
                      <span className="mr-2">🐘</span>
                      EiRs
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Elephants in the Room - risks & opportunities</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="leaderboard" className="data-[state=active]:bg-amber-600" data-testid="tab-leaderboard">
                      <Trophy className="h-4 w-4 mr-2" />
                      Leaderboard
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Compete with other unicorn builders</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="progress" className="data-[state=active]:bg-violet-600" data-testid="tab-progress">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Progress
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Track your journey progress over time</TooltipContent>
                </Tooltip>
              </TabsList>

              <TabsContent value="ideas" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Startup Ideas</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setLocation("/value-journey")}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        data-testid="button-add-idea"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Idea
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create a new startup idea to assess</TooltipContent>
                  </Tooltip>
                </div>

                {ideas.length === 0 ? (
                  <Card className="bg-gradient-to-br from-violet-900/40 via-slate-800/60 to-purple-900/40 border-violet-500/30 overflow-hidden">
                    <CardContent className="pt-8 pb-6">
                      <div className="text-center mb-6">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="text-7xl mb-4 inline-block"
                        >
                          🚀
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                          Start Your Unicorn Journey!
                        </h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                          {getRandomPrivacyMessage("startNow")}
                        </p>
                      </div>

                      <div className="bg-slate-900/60 rounded-xl p-5 border border-violet-500/20 mb-6 space-y-4">
                        <div>
                          <Label htmlFor="idea-name" className="text-sm text-violet-300 mb-2 block">
                            Name Your Idea:
                          </Label>
                          <Input
                            id="idea-name"
                            value={suggestedCodename}
                            onChange={(e) => setSuggestedCodename(e.target.value)}
                            placeholder="e.g., Project Phoenix, My SaaS, Secret Unicorn..."
                            className="bg-slate-800/80 border-violet-500/30 text-white text-lg font-semibold placeholder:text-slate-500 focus:border-violet-400"
                            data-testid="input-idea-name"
                          />
                          <p className="text-xs text-slate-500 mt-2">
                            Use a codename to keep it secret, or use the real name—your choice!
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="real-name" className="text-sm text-violet-300 mb-2 block flex items-center gap-2">
                            Real Name <span className="text-slate-500 text-xs font-normal">(optional)</span>
                          </Label>
                          <Input
                            id="real-name"
                            value={realName}
                            onChange={(e) => setRealName(e.target.value)}
                            placeholder="Only if you want to share..."
                            className="bg-slate-800/80 border-violet-500/30 text-white placeholder:text-slate-500 focus:border-violet-400"
                            data-testid="input-real-name"
                          />
                          <p className="text-xs text-slate-500 mt-2">
                            Share your real name if you'd like, or leave blank to stay anonymous.
                          </p>
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex justify-center"
                      >
                        <Button
                          size="lg"
                          disabled={isStartingJourney}
                          className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-violet-500/25"
                          onClick={async () => {
                            setIsStartingJourney(true);
                            try {
                              const freeId = localStorage.getItem('i2u_session_id');
                              if (freeId) {
                                // Save the idea name
                                await fetch(`/api/free-user/${freeId}/idea`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ ideaName: suggestedCodename }),
                                });
                                // Save real name if provided (display name is set during wizard)
                                if (realName.trim()) {
                                  // Fetch existing display name and append real name
                                  const existingRes = await fetch(`/api/free-user/${freeId}`);
                                  if (existingRes.ok) {
                                    const existingData = await existingRes.json();
                                    const existingDisplayName = existingData.user?.displayName || fancyName.trim();
                                    // Remove any existing real name in parentheses
                                    const baseName = existingDisplayName.replace(/\s*\([^)]*\)$/, '').trim();
                                    const displayName = `${baseName} (${realName.trim()})`;
                                    await fetch(`/api/free-user/${freeId}/display-name`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ displayName }),
                                    });
                                  }
                                }
                              }
                              setLocation("/value-journey?fresh=true");
                            } catch (error) {
                              console.error("Failed to save:", error);
                              setLocation("/value-journey?fresh=true");
                            }
                          }}
                          data-testid="button-start-journey"
                        >
                          {isStartingJourney ? (
                            <>Starting...</>
                          ) : (
                            <>
                              <Rocket className="h-5 w-5 mr-2" />
                              Begin Assessment
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                          <Lock className="h-3 w-3" />
                          No login required. Your secrets stay secret.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideas.map((idea: any) => {
                      const ideaRoles = roles.filter((r: any) => r.ideaId === idea.id);
                      const ideaSessions = sessions.filter((s: any) => s.ideaId === idea.id);
                      const completedCount = ideaSessions.filter((s: any) => s.status === "completed").length;
                      const ideaGleams = ideaSessions.reduce((sum: number, s: any) => sum + (s.gleamsEarned || 0), 0);

                      return (
                        <motion.div
                          key={idea.id}
                          whileHover={{ scale: 1.02 }}
                          data-testid={`card-idea-${idea.id}`}
                        >
                          <Card className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-colors">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">💡</span>
                                    {idea.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {idea.description || "No description yet"}
                                  </CardDescription>
                                </div>
                                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                                  {idea.stage || "Spark"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-400">Roles:</span>
                                {ideaRoles.length === 0 ? (
                                  <Badge variant="outline" className="text-slate-500">None yet</Badge>
                                ) : (
                                  ideaRoles.map((role: any) => {
                                    const config = STAKEHOLDER_ICONS[role.stakeholder] || STAKEHOLDER_ICONS.founder;
                                    return (
                                      <Badge
                                        key={role.id}
                                        className={`bg-gradient-to-r ${config.gradient} text-white`}
                                      >
                                        {config.icon}
                                        <span className="ml-1 capitalize">{role.stakeholder}</span>
                                        {role.isPrimary && <Crown className="h-3 w-3 ml-1" />}
                                      </Badge>
                                    );
                                  })
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                  <p className="text-xs text-slate-400">Gleams</p>
                                  <p className="font-bold text-yellow-400">{ideaGleams.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                  <p className="text-xs text-slate-400">Completed</p>
                                  <p className="font-bold text-emerald-400">{completedCount}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                  <p className="text-xs text-slate-400">Sector</p>
                                  <p className="font-bold text-blue-400 text-xs truncate">{idea.sector || "—"}</p>
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                className="w-full border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                                onClick={() => setLocation("/value-journey")}
                                data-testid={`button-continue-idea-${idea.id}`}
                              >
                                Continue Assessment <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* DIMENSIONS TAB - Gamified strength/weakness profile */}
              <TabsContent value="dimensions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Target className="h-6 w-6 text-emerald-400" />
                      Dimensions Profile
                    </h2>
                    <p className="text-slate-400 mt-1">Your aggregated strength & weakness across all completed levels</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-lg px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    9 Core Dimensions
                  </Badge>
                </div>

                {/* Dimension Radar Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-emerald-400" />
                      Dimension Radar
                    </CardTitle>
                    <CardDescription>Your performance across all 9 dimensions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={DIMENSIONS.map(d => ({
                          dimension: d.name.split(' ')[0],
                          score: Math.floor(Math.random() * 40) + 50,
                          fullMark: 100
                        }))}>
                          <PolarGrid stroke="#475569" />
                          <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={11} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Dimension Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIMENSIONS.map((dim, idx) => {
                    const score = Math.floor(Math.random() * 40) + 50;
                    const isStrength = score >= 70;
                    const isWeakness = score < 60;
                    const complementary = COMPLEMENTARY_STAKEHOLDERS[dim.id] || [];

                    return (
                      <motion.div
                        key={dim.id}
                        whileHover={{ scale: 1.02, y: -3 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className={`bg-slate-800/50 border-slate-700 ${
                          isStrength ? 'border-l-4 border-l-emerald-500' : 
                          isWeakness ? 'border-l-4 border-l-amber-500' : ''
                        }`}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <motion.span 
                                  className="text-2xl"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                                >
                                  {dim.emoji}
                                </motion.span>
                                <div>
                                  <p className="font-bold text-sm">{dim.name}</p>
                                  <p className="text-xs text-slate-500">{dim.description}</p>
                                </div>
                              </div>
                              {isStrength && <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">💪 Strength</Badge>}
                              {isWeakness && <Badge className="bg-amber-500/20 text-amber-300 text-xs">⚠️ Improve</Badge>}
                            </div>
                            <Progress value={score} className="h-2 mb-2" />
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Score</span>
                              <span className={dim.color}>{score} Gleams</span>
                            </div>
                            {isWeakness && complementary.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-700">
                                <p className="text-xs text-slate-400 mb-2">Consider partnering with:</p>
                                <div className="flex gap-1 flex-wrap">
                                  {complementary.map((c, i) => {
                                    const stakeholderConfig = STAKEHOLDER_ICONS[c.stakeholder];
                                    return (
                                      <Tooltip key={i}>
                                        <TooltipTrigger>
                                          <Badge className={`bg-gradient-to-r ${stakeholderConfig?.gradient || 'from-slate-500 to-gray-600'} text-white text-xs`}>
                                            {stakeholderConfig?.icon}
                                            <span className="ml-1 capitalize">{c.stakeholder}</span>
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{c.reason}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary Card */}
                <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border-emerald-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl"
                      >
                        📊
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg">Your Dimension Insights</h3>
                        <p className="text-slate-400">
                          Complete more assessments across levels to build a comprehensive dimension profile!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <h2 className="text-2xl font-bold">Progress Charts</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-violet-400" />
                        Level Progress
                      </CardTitle>
                      <CardDescription>Your scores across all growth levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={levelProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                              labelStyle={{ color: '#f8fafc' }}
                            />
                            <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                              {levelProgressData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${260 - index * 20}, 70%, 60%)`} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-emerald-400" />
                        Dimension Analysis
                      </CardTitle>
                      <CardDescription>Performance across key dimensions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={dimensionData}>
                            <PolarGrid stroke="#475569" />
                            <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={12} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                            <Radar
                              name="Score"
                              dataKey="score"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.3}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      Gleams Over Time
                    </CardTitle>
                    <CardDescription>Your earning trajectory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { day: "Mon", gleams: 150 },
                            { day: "Tue", gleams: 320 },
                            { day: "Wed", gleams: 480 },
                            { day: "Thu", gleams: 620 },
                            { day: "Fri", gleams: 890 },
                            { day: "Sat", gleams: 1050 },
                            { day: "Sun", gleams: totalGleams || 1200 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="gleams"
                            stroke="#eab308"
                            fill="url(#gleamsGradient)"
                          />
                          <defs>
                            <linearGradient id="gleamsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(LEVEL_CONFIG).slice(0, 6).map(([level, config]) => (
                    <Card key={level} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{config.emoji}</span>
                          <div>
                            <p className="font-bold">{level} - {config.name}</p>
                            <p className="text-xs text-slate-400">Growth Level</p>
                          </div>
                        </div>
                        <Progress 
                          value={levelProgressData.find(l => l.level === level)?.score || 0} 
                          className="h-2"
                        />
                        <div className="flex justify-between mt-2 text-xs">
                          <span className="text-slate-400">Score</span>
                          <span className={config.color}>{levelProgressData.find(l => l.level === level)?.score || 0}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Global Leaderboard
                </h2>

                <Card className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 border-violet-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-3">
                          <span className="text-2xl font-bold text-white">#{userRank}</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg">Your Current Rank</p>
                          <p className="text-slate-400">Keep earning Gleams to climb higher!</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-400">{totalGleams.toLocaleString()} Ğ</p>
                        <p className="text-sm text-slate-400">{totalAlicorns} Alicorns</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {leaderboardData.map((entry, idx) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className={`bg-slate-800/50 border-slate-700 ${idx < 3 ? 'border-l-4' : ''} ${
                        idx === 0 ? 'border-l-yellow-500' : idx === 1 ? 'border-l-slate-400' : idx === 2 ? 'border-l-amber-600' : ''
                      }`}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                idx === 0 ? 'bg-yellow-500 text-black' :
                                idx === 1 ? 'bg-slate-400 text-black' :
                                idx === 2 ? 'bg-amber-600 text-white' :
                                'bg-slate-700 text-white'
                              }`}>
                                {idx === 0 ? <Crown className="h-5 w-5" /> : `#${entry.rank}`}
                              </div>
                              <div>
                                <p className="font-bold">{entry.name}</p>
                                <Badge className={`text-xs ${LEVEL_CONFIG[entry.level]?.gradient ? `bg-gradient-to-r ${LEVEL_CONFIG[entry.level].gradient}` : 'bg-slate-600'}`}>
                                  {LEVEL_CONFIG[entry.level]?.emoji} {entry.level}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-yellow-400">{entry.gleams.toLocaleString()} Ğ</p>
                              <p className="text-sm text-violet-400">{entry.alicorns} 🦄</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* ELEPHANTS IN THE ROOM TAB - Risk/Challenge/Opportunity Profile */}
              <TabsContent value="eirs" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <span className="text-3xl">🐘</span>
                      Elephants in the Room
                    </h2>
                    <p className="text-slate-400 mt-1">Your aggregated risk, challenge & opportunity profile across all levels</p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-lg px-4 py-2">
                    <Shield className="h-4 w-4 mr-2" />
                    9 Risk Areas
                  </Badge>
                </div>

                {/* EiR Bar Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-red-400" />
                      Risk Profile Overview
                    </CardTitle>
                    <CardDescription>How well you've addressed the elephants in your room</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={EIRS.map(e => ({
                          name: e.name.split(' ')[0],
                          score: Math.floor(Math.random() * 50) + 30,
                          risk: e.riskType
                        }))} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelStyle={{ color: '#f8fafc' }}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                            {EIRS.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 55%)`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* EiR Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {EIRS.map((eir, idx) => {
                    const score = Math.floor(Math.random() * 50) + 30;
                    const isHandled = score >= 70;
                    const isRisk = score < 50;
                    const complementary = COMPLEMENTARY_STAKEHOLDERS[eir.id] || [];

                    return (
                      <motion.div
                        key={eir.id}
                        whileHover={{ scale: 1.02, y: -3 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className={`bg-slate-800/50 border-slate-700 ${
                          isHandled ? 'border-l-4 border-l-emerald-500' : 
                          isRisk ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500'
                        }`}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <motion.span 
                                  className="text-2xl"
                                  animate={{ scale: isRisk ? [1, 1.2, 1] : [1, 1.05, 1] }}
                                  transition={{ duration: isRisk ? 1 : 2, repeat: Infinity, delay: idx * 0.1 }}
                                >
                                  {eir.emoji}
                                </motion.span>
                                <div>
                                  <p className="font-bold text-sm">{eir.name}</p>
                                  <p className="text-xs text-slate-500">{eir.description}</p>
                                </div>
                              </div>
                              <Badge className={`text-xs ${
                                isHandled ? 'bg-emerald-500/20 text-emerald-300' :
                                isRisk ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {isHandled ? '✅ Handled' : isRisk ? '🚨 At Risk' : '⚠️ Monitor'}
                              </Badge>
                            </div>
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs text-slate-400">
                                {eir.riskType}
                              </Badge>
                            </div>
                            <Progress value={score} className={`h-2 mb-2 ${
                              isRisk ? '[&>div]:bg-red-500' : isHandled ? '[&>div]:bg-emerald-500' : ''
                            }`} />
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Risk Score</span>
                              <span className={eir.color}>{score} Gleams</span>
                            </div>
                            {isRisk && complementary.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-700">
                                <p className="text-xs text-slate-400 mb-2">Suggested partners:</p>
                                <div className="flex gap-1 flex-wrap">
                                  {complementary.map((c, i) => {
                                    const stakeholderConfig = STAKEHOLDER_ICONS[c.stakeholder];
                                    return (
                                      <Tooltip key={i}>
                                        <TooltipTrigger>
                                          <Badge className={`bg-gradient-to-r ${stakeholderConfig?.gradient || 'from-slate-500 to-gray-600'} text-white text-xs`}>
                                            {stakeholderConfig?.icon}
                                            <span className="ml-1 capitalize">{c.stakeholder}</span>
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{c.reason}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary Card */}
                <Card className="bg-gradient-to-r from-red-500/20 to-orange-600/20 border-red-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-4xl"
                      >
                        🐘
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg">Your EiR Insights</h3>
                        <p className="text-slate-400">
                          Address your elephants in the room! These risks, challenges, and opportunities can make or break your unicorn journey.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Privacy Manifesto & Data Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 space-y-4"
            >
              {/* Privacy Hero Banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-amber-600/20 border border-violet-500/30 relative overflow-hidden"
              >
                <motion.div
                  className="absolute top-2 right-2 text-4xl opacity-20"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  🦄
                </motion.div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-2">
                    Your Unicorn Idea with You, Always!
                  </h2>
                  <p className="text-lg text-slate-300 mb-4">
                    Never share your secrets with anyone. <span className="text-amber-400 font-medium">Not even us!</span> 🤫
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50"
                    >
                      <span className="text-2xl">🙈</span>
                      <div>
                        <p className="font-medium text-white">We Don't Want Your Secrets</p>
                        <p className="text-slate-400 text-xs">Your NDA stays YOUR NDA. We're here for insights, not your pitch deck!</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50"
                    >
                      <span className="text-2xl">🎫</span>
                      <div>
                        <p className="font-medium text-white">Magic Link = Golden Ticket</p>
                        <p className="text-slate-400 text-xs">Guard it like you guard your cap table! One link rules them all.</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50"
                    >
                      <span className="text-2xl">💪</span>
                      <div>
                        <p className="font-medium text-white">Start Now, Name Later</p>
                        <p className="text-slate-400 text-xs">We auto-assign codenames. Change them whenever (or never)!</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Your Data, Your Rules
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Privacy Notice Card */}
                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/30">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Lock className="h-5 w-5" />
                      <span className="font-semibold">100% Anonymous</span>
                    </div>
                    <ul className="text-sm text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-sm">🔐</span>
                        <span>Encrypted & protected</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sm">📧</span>
                        <span>No email required (until YOU want)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sm">🦄</span>
                        <span>Unlimited ideas - store forever</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-sm">🗑️</span>
                        <span>Delete anytime - we mean it!</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Export Data Card */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/30">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Download className="h-5 w-5" />
                      <span className="font-semibold">Export Your Data</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Download all your data in a portable format. Take it anywhere, keep it forever - like WhatsApp exports!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                            onClick={() => {
                              const exportData = {
                                exportDate: new Date().toISOString(),
                                version: "1.0",
                                user: isAuthenticated && user ? { 
                                  id: user.id, 
                                  email: user.email,
                                  firstName: user.firstName 
                                } : { sessionId },
                                ideas: ideas,
                                roles: roles,
                                sessions: sessions,
                                stats: {
                                  totalGleams,
                                  totalAlicorns,
                                  ideasCount: ideas.length,
                                  completedAssessments: sessions.filter((s: any) => s.status === "completed").length
                                }
                              };
                              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `i2u-data-export-${new Date().toISOString().split('T')[0]}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            data-testid="button-export-json"
                          >
                            <FileJson className="h-4 w-4 mr-1" />
                            Export JSON
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download all your data as a JSON file</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                            onClick={() => {
                              const text = `🦄 i2u.ai Value Journey Export
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Export Date: ${new Date().toLocaleDateString()}

📊 Your Stats:
• Total Gleams: ${totalGleams.toLocaleString()} Ğ
• Total Alicorns: ${totalAlicorns} 🦄
• Ideas: ${ideas.length}
• Completed Assessments: ${sessions.filter((s: any) => s.status === "completed").length}

💡 Your Ideas:
${ideas.map((idea: any, i: number) => `${i + 1}. ${idea.name}${idea.description ? ` - ${idea.description}` : ''}`).join('\n') || 'No ideas yet'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your data belongs to you. Keep building! 🚀`;
                              const blob = new Blob([text], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `i2u-summary-${new Date().toISOString().split('T')[0]}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            data-testid="button-export-summary"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Summary
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download a readable summary of your journey</TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>

                {/* Golden Ticket - Magic Link Card */}
                <Card className="bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-600/20 border-amber-500/40 shadow-lg shadow-amber-500/10 lg:col-span-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <motion.span
                        className="text-2xl"
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🎫
                      </motion.span>
                      <div>
                        <span className="font-bold text-amber-400">Your Golden Ticket</span>
                        <p className="text-xs text-amber-300/70">Guard it like your cap table!</p>
                      </div>
                    </div>
                    
                    {userSession ? (
                      <div className="space-y-4">
                        {/* Main Magic Link - Prominent */}
                        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-amber-300 flex items-center gap-2">
                              <Link className="h-4 w-4" />
                              Magic Link (Primary)
                            </span>
                            <Button
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-500 text-white"
                              onClick={() => copyToClipboard(getMagicLink(), "Magic Link")}
                              data-testid="button-copy-magic-link"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Link
                            </Button>
                          </div>
                          <div className="bg-slate-900/70 rounded-lg px-3 py-2 text-sm text-amber-200 font-mono break-all border border-amber-500/20">
                            {getMagicLink()}
                          </div>
                          
                          {/* Display Name - Access Key */}
                          {effectiveDisplayName ? (
                            <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/40">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-violet-300 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Your Access Name
                                </span>
                                <Button
                                  size="sm"
                                  className="bg-violet-600 hover:bg-violet-500 text-white h-7"
                                  onClick={() => copyToClipboard(effectiveDisplayName, "Access Name")}
                                  data-testid="button-copy-display-name"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <p className="text-lg font-bold text-white">
                                {effectiveDisplayName}
                              </p>
                              <div className="mt-2 p-2 rounded bg-violet-900/30 border border-violet-500/20">
                                <p className="text-xs text-violet-200">
                                  <span className="font-semibold text-amber-300">Remember this name!</span> Use any word from it to log in from other devices.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Example: Type "{effectiveDisplayName.split(' ')[0]}" or "{effectiveDisplayName.split(' ').slice(-1)[0]}" to access your account
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                              <p className="text-xs text-amber-400">
                                Complete an assessment to set your display name
                              </p>
                            </div>
                          )}
                          
                          {/* Account Creation Timestamp Record - Always visible */}
                          {accountCreatedAt && (
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>Account created:</span>
                              </div>
                              <p className="text-xs text-amber-300 font-mono">{accountCreatedAt} UTC</p>
                              <p className="text-xs text-slate-500">({formatTimestamp(accountCreatedAt)} local)</p>
                            </div>
                          )}
                          
                          <p className="text-xs text-slate-500 mt-2 italic">
                            Bookmark this! One click = instant access. No passwords ever.
                          </p>
                        </div>

                        {/* Backup Credentials - Secondary */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Wifi className="h-3 w-3" />
                                Backup: IP
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-violet-300 hover:text-violet-200"
                                    onClick={() => copyToClipboard(userSession.ipAddress, "IP Address")}
                                    data-testid="button-copy-ip"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy for backup login</TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="bg-slate-900/50 rounded px-2 py-1 text-xs text-violet-300 font-mono">
                              {userSession.ipAddress}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Backup: Time
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-violet-300 hover:text-violet-200"
                                    onClick={() => copyToClipboard(userSession.createdAtMicro, "Timestamp")}
                                    data-testid="button-copy-timestamp"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy for backup login</TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="bg-slate-900/50 rounded px-2 py-1 text-xs text-violet-300 font-mono truncate">
                              {formatTimestamp(userSession.createdAtMicro)}
                            </div>
                          </div>
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                              onClick={() => setShowCredentialLogin(true)}
                              data-testid="button-login-different-account"
                            >
                              <LogIn className="h-3 w-3 mr-1" />
                              Login with Name
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Login to a different account using your name</TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-400 mb-2">Session not found</p>
                        <Button
                          size="sm"
                          onClick={() => setShowCredentialLogin(true)}
                          className="bg-violet-600 hover:bg-violet-500"
                        >
                          <LogIn className="h-3 w-3 mr-1" />
                          Login with Credentials
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Delete Account Card */}
                <Card className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border-red-500/30">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <Trash2 className="h-5 w-5" />
                      <span className="font-semibold">Delete My Data</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Remove all your data from our system. This action cannot be undone.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>Export your data first if you want to keep it</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>All ideas, assessments, and progress will be deleted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>Your magic link will stop working</span>
                      </li>
                    </ul>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10"
                          onClick={() => setShowDeleteConfirm(true)}
                          data-testid="button-delete-account"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete All My Data
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Permanently delete all your data</TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              </div>

              {/* Privacy Tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <span className="text-2xl">💡</span>
                <p className="text-sm text-amber-200/80">
                  <span className="text-amber-300 font-medium">Pro tip:</span> Use codenames like "Project X", "🚀 Stealth", or "Idea #001" for confidential ideas. 
                  Never share NDA-protected details - your insights matter, not your secrets!
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Credential Login Modal */}
      <Dialog open={showCredentialLogin} onOpenChange={setShowCredentialLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-violet-400" />
              Login with Your Name
            </DialogTitle>
            <DialogDescription>
              Enter any word from your display name or real name to access your account. Works from any device!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="login-name" className="flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-400" />
                Your Name
              </Label>
              <Input
                id="login-name"
                type="text"
                placeholder="e.g., Cosmic, Pioneer, John..."
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                data-testid="input-login-name"
              />
              <p className="text-xs text-slate-500">
                Just type any word from your display name or real name. Spelling doesn't have to be perfect!
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCredentialLogin(false)}
              data-testid="button-cancel-login"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCredentialLogin}
              disabled={isLoggingIn || !loginName.trim()}
              className="bg-violet-600 hover:bg-violet-500"
              data-testid="button-confirm-login"
            >
              {isLoggingIn ? "Verifying..." : "Login"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Delete All Your Data?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your ideas, assessments, progress, and account data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2">
              <p className="text-sm text-red-300 font-medium">Before you delete:</p>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Export your data first (use JSON export above)</li>
                <li>• Your magic link will stop working</li>
                <li>• Your access code will be invalidated</li>
                <li>• Your leaderboard position will be removed</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-sm text-slate-400">
                Type <span className="text-red-400 font-mono">DELETE ALL MY DATA</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                placeholder="DELETE ALL MY DATA"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="font-mono"
                data-testid="input-delete-confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText("");
              }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== "DELETE ALL MY DATA"}
              data-testid="button-confirm-delete"
            >
              {isDeleting ? "Deleting..." : "Delete Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
