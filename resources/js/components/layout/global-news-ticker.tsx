import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Maximize2, Minimize2, Newspaper, Sparkles, Rocket, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NewsItem {
    id: string;
    title: string;
    source: string;
    url?: string;
    category: "ai" | "startup" | "unicorn" | "tech";
    timestamp: Date;
}

const NEWS_CATEGORIES = {
    ai: { icon: Sparkles, color: "text-cyan-400", bg: "bg-slate-900/70 backdrop-blur-sm border border-cyan-500/40", label: "AI" },
    startup: { icon: Rocket, color: "text-amber-400", bg: "bg-slate-900/70 backdrop-blur-sm border border-amber-500/40", label: "Startup" },
    unicorn: { icon: TrendingUp, color: "text-violet-400", bg: "bg-slate-900/70 backdrop-blur-sm border border-violet-500/40", label: "Unicorn" },
    tech: { icon: Globe, color: "text-green-400", bg: "bg-slate-900/70 backdrop-blur-sm border border-green-500/40", label: "Tech" },
};

const SAMPLE_NEWS: NewsItem[] = [
    { id: "1", title: "OpenAI announces GPT-5 with multimodal reasoning capabilities", source: "TechCrunch", url: "https://techcrunch.com", category: "ai", timestamp: new Date() },
    { id: "2", title: "New unicorn minted in fintech space with $2B valuation", source: "Bloomberg", url: "https://bloomberg.com", category: "unicorn", timestamp: new Date() },
    { id: "3", title: "Y Combinator W25 batch breaks record with 500 startups", source: "The Verge", url: "https://theverge.com", category: "startup", timestamp: new Date() },
    { id: "4", title: "Anthropic raises $4B as Claude adoption accelerates", source: "Reuters", url: "https://reuters.com", category: "ai", timestamp: new Date() },
    { id: "5", title: "SpaceX becomes most valuable private company at $350B", source: "CNBC", url: "https://cnbc.com", category: "unicorn", timestamp: new Date() },
    { id: "6", title: "Global startup funding rebounds with $78B in Q4 2024", source: "Crunchbase", url: "https://crunchbase.com", category: "startup", timestamp: new Date() },
    { id: "7", title: "Google DeepMind achieves breakthrough in protein folding AI", source: "Nature", url: "https://nature.com", category: "ai", timestamp: new Date() },
    { id: "8", title: "India produces 3 new unicorns this week in SaaS sector", source: "Economic Times", url: "https://economictimes.com", category: "unicorn", timestamp: new Date() },
    { id: "9", title: "Europe's startup ecosystem raises €50B in record year", source: "Sifted", url: "https://sifted.eu", category: "startup", timestamp: new Date() },
    { id: "10", title: "Meta unveils next-gen AI chip competing with NVIDIA", source: "Wired", url: "https://wired.com", category: "tech", timestamp: new Date() },
    { id: "11", title: "Stripe valuation rises to $70B following new funding round", source: "Forbes", url: "https://forbes.com", category: "unicorn", timestamp: new Date() },
    { id: "12", title: "AI startups now represent 40% of all seed funding globally", source: "PitchBook", url: "https://pitchbook.com", category: "ai", timestamp: new Date() },
];

interface PopupWindow {
    id: string;
    url: string;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
}

export function GlobalNewsTicker() {
    const [news, setNews] = useState<NewsItem[]>(SAMPLE_NEWS);
    const [isPaused, setIsPaused] = useState(false);
    const [popupWindows, setPopupWindows] = useState<PopupWindow[]>([]);
    const [tickerRound, setTickerRound] = useState(0);
    const tickerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const scrollPositionRef = useRef(0);

    useEffect(() => {
        // In production, we'd fetch real news here
        // For now we use the sample data
    }, []);

    useEffect(() => {
        const ticker = tickerRef.current;
        if (!ticker || isPaused) return;

        // Use a simpler animation loop for stability
        const animate = () => {
            // Logic would go here to smoothly scroll
            // but for simplicity in this restored version we'll keep it static or rely on CSS loops if possible
            // or re-implement the JS scroll if critical.
            // Re-implementing basic JS scroll:
            if (ticker) {
                ticker.scrollLeft += 0.5;
                if (ticker.scrollLeft >= ticker.scrollWidth / 2) {
                    ticker.scrollLeft = 0;
                    setTickerRound(r => r + 1);
                }
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPaused]);

    const openPopupWindow = (item: NewsItem) => {
        if (!item.url) return;

        // Check if exists
        const existingPopup = popupWindows.find(p => p.url === item.url);
        if (existingPopup) {
            setPopupWindows(prev => prev.map(p =>
                p.id === existingPopup.id ? { ...p, isMinimized: false } : p
            ));
            return;
        }

        const newPopup: PopupWindow = {
            id: `popup-${Date.now()}`,
            url: item.url,
            title: item.title,
            x: 100 + popupWindows.length * 30,
            y: 100 + popupWindows.length * 30,
            width: 800,
            height: 600,
            isMinimized: false,
            isMaximized: false,
        };

        setPopupWindows(prev => [...prev, newPopup]);
    };

    const closePopup = (id: string) => {
        setPopupWindows(prev => prev.filter(p => p.id !== id));
    };

    const toggleMinimize = (id: string) => {
        setPopupWindows(prev => prev.map(p =>
            p.id === id ? { ...p, isMinimized: !p.isMinimized } : p
        ));
    };

    const toggleMaximize = (id: string) => {
        setPopupWindows(prev => prev.map(p =>
            p.id === id ? { ...p, isMaximized: !p.isMaximized, isMinimized: false } : p
        ));
    };

    const duplicatedNews = [...news, ...news];

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-transparent border-t-2 border-violet-500">
                <div
                    className="flex items-center"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex-shrink-0 px-4 py-2 bg-violet-600/30 backdrop-blur-sm flex items-center gap-2 border-r-2 border-violet-500 cursor-help">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Newspaper className="h-4 w-4 text-amber-300" />
                                </motion.div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Global News</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>📰 Live AI, Startup & Unicorn news. Hover to pause.</p>
                        </TooltipContent>
                    </Tooltip>

                    <div
                        ref={tickerRef}
                        className="flex-1 overflow-hidden whitespace-nowrap py-2"
                        style={{ scrollBehavior: 'auto' }}
                    >
                        <div className="inline-flex gap-8">
                            {duplicatedNews.map((item, idx) => {
                                const category = NEWS_CATEGORIES[item.category];
                                const CategoryIcon = category.icon;

                                return (
                                    <button
                                        key={`${item.id}-${idx}`}
                                        onClick={() => openPopupWindow(item)}
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${category.bg} hover:brightness-110 transition-all`}
                                    >
                                        <CategoryIcon className={`h-3 w-3 ${category.color}`} />
                                        <span className={`text-xs font-medium ${category.color}`}>{category.label}</span>
                                        <span className="text-xs text-slate-300 max-w-[300px] truncate">{item.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-shrink-0 px-3 py-2 border-l border-slate-700 flex items-center gap-2">
                        <span className="text-[10px] text-violet-300">i2u.ai</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {popupWindows.map((popup) => (
                    !popup.isMinimized && (
                        <motion.div
                            key={popup.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                x: popup.isMaximized ? 0 : popup.x,
                                y: popup.isMaximized ? 0 : popup.y,
                                width: popup.isMaximized ? "100vw" : popup.width,
                                height: popup.isMaximized ? "100vh" : popup.height,
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`fixed z-[60] bg-slate-900 rounded-lg border border-slate-600 shadow-2xl overflow-hidden ${popup.isMaximized ? "inset-0 rounded-none top-0 left-0" : ""
                                }`}
                            style={{
                                top: 0, left: 0 // Handled by motion animate
                            }}
                        >
                            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
                                <span className="text-sm font-medium text-slate-200 truncate flex-1">{popup.title}</span>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleMinimize(popup.id)}><Minimize2 className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleMaximize(popup.id)}><Maximize2 className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-400" onClick={() => closePopup(popup.id)}><X className="h-3 w-3" /></Button>
                                </div>
                            </div>

                            <div className="w-full h-[calc(100%-40px)] bg-white">
                                <iframe
                                    src={popup.url}
                                    className="w-full h-full border-0"
                                    title={popup.title}
                                // sandbox="allow-same-origin allow-scripts allow-popups allow-forms" // Relaxed for news sites
                                />
                            </div>
                        </motion.div>
                    )
                ))}
            </AnimatePresence>

            {/* Minimized Dock */}
            <div className="fixed bottom-12 left-4 z-50 flex gap-2">
                {popupWindows.filter(p => p.isMinimized).map(popup => (
                    <button
                        key={popup.id}
                        onClick={() => toggleMinimize(popup.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600/90 backdrop-blur-lg border border-violet-400/40 shadow-lg"
                    >
                        <ExternalLink className="h-3 w-3 text-white" />
                        <span className="text-xs text-white max-w-[150px] truncate">{popup.title}</span>
                    </button>
                ))}
            </div>
        </>
    );
}

export default GlobalNewsTicker;
