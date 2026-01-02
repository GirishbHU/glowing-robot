import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Globe, Rocket, Target, Users, Zap, MessageSquare, Lightbulb, ThumbsUp, X, Sparkles, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRandomFancyName } from "@/constants/fancy-names";

// Types
interface PulseItem {
    id: number;
    type: string;
    category?: string;
    content: string;
    engagement_metrics: { likes: number; shares: number };
    virality_score: number;
    created_at: string;
    sector?: string;
    region?: string;
    author_name?: string;
    is_guest?: boolean;
    author_info?: {
        location?: string;
        tags?: string[];
        badges?: string[];
        is_fancy?: boolean;
    };
}

export default function GlobalEcosystemPulse({ simpleMode = false }: { simpleMode?: boolean }) {
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');
    const [items, setItems] = useState<PulseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('day');
    const [category, setCategory] = useState<string | null>(null);

    // Guest Post Modal State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [postCategory, setPostCategory] = useState<'idea' | 'opinion'>('idea');
    const [guestName, setGuestName] = useState('');
    const [guestLocation, setGuestLocation] = useState('Global');
    const [isFancyName, setIsFancyName] = useState(false);

    // Fetch Feed / Leaderboard
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let url = '/api/social/pulse';

                const params = new URLSearchParams();
                if (timeframe) params.append('timeframe', timeframe);
                if (category) params.append('category', category);

                // If leaderboard mode, force virality sort via controller logic (timeframe presence does this)
                // If activeTab is leaderboard but no timeframe set, force 'day'
                if (activeTab === 'leaderboard' && !timeframe) {
                    params.append('timeframe', 'day');
                }

                const res = await fetch(`${url}?${params.toString()}`);
                if (!res.ok) throw new Error('Network response was not ok');

                const data = await res.json();
                setItems(data);

            } catch (error) {
                console.error("Failed to fetch pulse:", error);
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [activeTab, timeframe, category]);

    const generateFancyName = () => {
        setGuestName(getRandomFancyName());
        setIsFancyName(true);
    };

    const handlePostSubmit = async () => {
        try {
            const res = await fetch('/api/social/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    content: postContent,
                    category: postCategory,
                    author_name: guestName,
                    author_info: {
                        location: guestLocation,
                        is_fancy: isFancyName
                    }
                })
            });

            if (res.ok) {
                setPostContent('');
                setIsPostModalOpen(false);
                window.location.reload();
            }
        } catch (e) {
            console.error("Post failed", e);
        }
    };

    return (
        <div className={cn("w-full mx-auto p-0", simpleMode ? "" : "max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 p-4")}>
            {/* Main Feed / Leaderboard */}
            <div className={cn("space-y-4", simpleMode ? "w-full" : "lg:col-span-2")}>
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative min-h-[500px]">
                    {/* Header & Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            <h3 className="text-xl font-bold text-white">
                                {activeTab === 'feed' ? 'Live Ecosystem' : 'Pulse Leaderboard'}
                            </h3>
                        </div>

                        <div className="flex bg-slate-800/50 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('feed')}
                                className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", activeTab === 'feed' ? "bg-violet-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
                            >
                                Live Feed
                            </button>
                            <button
                                onClick={() => setActiveTab('leaderboard')}
                                className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", activeTab === 'leaderboard' ? "bg-amber-500 text-slate-950 shadow-lg" : "text-slate-400 hover:text-white")}
                            >
                                Top Charts
                            </button>
                        </div>
                    </div>

                    {/* Filters (Leaderboard Only) */}
                    {activeTab === 'leaderboard' && (
                        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-slate-950/30 rounded-xl border border-white/5">
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-1 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="hour">🔥 Last Hour</option>
                                <option value="day">📅 Today</option>
                                <option value="week">🏆 This Week</option>
                            </select>

                            <div className="flex gap-2">
                                {[
                                    { id: 'idea', label: 'Ideas', icon: Lightbulb },
                                    { id: 'opinion', label: 'Opinions', icon: MessageSquare }
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(category === cat.id ? null : cat.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors",
                                            category === cat.id
                                                ? "bg-slate-800 border-slate-600 text-white"
                                                : "border-transparent text-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        <cat.icon className="w-3 h-3" /> {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content List */}
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 transition-colors group"
                                >
                                    {/* Rank/Icon */}
                                    <div className="flex-shrink-0">
                                        {activeTab === 'leaderboard' ? (
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                                                idx === 0 ? "bg-amber-400 text-slate-900 shadow-amber-500/20 shadow-lg" :
                                                    idx === 1 ? "bg-slate-300 text-slate-900" :
                                                        idx === 2 ? "bg-orange-700 text-white" : "bg-slate-700 text-slate-400"
                                            )}>
                                                {idx + 1}
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center relative">
                                                {item.type === 'news' ? '📰' : item.category === 'idea' ? '💡' : '💬'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {item.author_name ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className={cn(
                                                            "text-sm font-bold",
                                                            item.author_name === 'Ecosystem Concierge 🤖'
                                                                ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                                                : "text-violet-300"
                                                        )}>
                                                            {item.author_name}
                                                        </span>
                                                        {/* Badges (FUD Fighter, etc.) */}
                                                        {item.author_info?.badges?.map((badge, bIdx) => (
                                                            <span key={bIdx} className="text-[10px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                                                                {badge}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-400">System</span>
                                                )}

                                                {item.category && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-700 px-1.5 rounded">
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>

                                            {activeTab === 'leaderboard' && (
                                                <div className="flex items-center gap-1 text-xs text-amber-500 font-mono">
                                                    <Zap className="w-3 h-3" /> {item.virality_score}
                                                </div>
                                            )}
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: item.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} className="prose prose-invert prose-sm max-w-none text-slate-300 leading-snug" />
                                    </div>

                                    {/* Metrics Teaser */}
                                    <div className="flex flex-col items-end justify-center gap-1 text-xs text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" /> {item.engagement_metrics?.likes || 0}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Right Col: Static Stats & Post CTA (Only in Full Mode) */}
            {!simpleMode && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-center shadow-xl shadow-violet-900/20">
                        <div className="inline-flex p-3 rounded-full bg-white/10 mb-3 text-white">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Join the Conversation</h3>
                        <p className="text-indigo-100 text-sm mb-4">Post your ideas. Climb the ranks.</p>
                        <button
                            onClick={() => setIsPostModalOpen(true)}
                            className="w-full bg-white text-violet-700 font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm shadow-lg"
                        >
                            Post a Pulse
                        </button>
                    </div>
                </div>
            )}

            {/* Guest Post Modal */}
            <AnimatePresence>
                {isPostModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPostModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsPostModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-6">Broadcast to Ecosystem</h3>

                            {/* Identity Section */}
                            <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Your Identity (Optional)
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Display Name (or leave blank for Guest#...)"
                                        value={guestName}
                                        onChange={(e) => { setGuestName(e.target.value); setIsFancyName(false); }}
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                                    />
                                    <button
                                        onClick={generateFancyName}
                                        className="px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-lg border border-violet-500/30 transition-colors"
                                        title="Generate Fancy Name"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                                        <select
                                            value={guestLocation}
                                            onChange={(e) => setGuestLocation(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500 appearance-none"
                                        >
                                            <option value="Global">Global Citizen 🌍</option>
                                            <option value="North America">North America</option>
                                            <option value="Europe">Europe</option>
                                            <option value="Asia">Asia</option>
                                            <option value="LatAm">LatAm</option>
                                            <option value="MENA">MENA</option>
                                        </select>
                                    </div>
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                                        <select
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500 appearance-none"
                                        >
                                            <option>Member</option>
                                            <option>Founder</option>
                                            <option>Investor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Content Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Your Pulse
                                    </label>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder="Share an idea, opinion, or suggestion..."
                                        className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none mb-2"
                                        maxLength={280}
                                    />
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPostCategory('idea')}
                                                className={cn("px-2 py-1 rounded transition-colors", postCategory === 'idea' ? "bg-amber-500/20 text-amber-500" : "hover:text-slate-300")}
                                            >
                                                Idea
                                            </button>
                                            <button
                                                onClick={() => setPostCategory('opinion')}
                                                className={cn("px-2 py-1 rounded transition-colors", postCategory === 'opinion' ? "bg-cyan-500/20 text-cyan-500" : "hover:text-slate-300")}
                                            >
                                                Opinion
                                            </button>
                                        </div>
                                        <span>{postContent.length}/280</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePostSubmit}
                                    disabled={!postContent.trim()}
                                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Broadcast Pulse 🚀
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
