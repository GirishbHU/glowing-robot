import { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Globe, TrendingUp, DollarSign, Zap, Trophy } from "lucide-react";

const NEWS_ITEMS = [
    { type: "deal", icon: DollarSign, text: "FinTech Sector: 3 new Unicorns minted in SE Asia this week." },
    { type: "trend", icon: TrendingUp, text: "GreenTech Momentum: Carbon capture investments up 200% QoQ." },
    { type: "event", icon: Zap, text: "Global Summit: i2u.ai announcing new AI Concierge features." },
    { type: "milestone", icon: Trophy, text: "Ecosystem Milestone: 10,000 Ideas validated on the platform." },
    { type: "market", icon: Globe, text: "Market Shift: SaaS valuations stabilizing across EU markets." },
    { type: "deal", icon: DollarSign, text: "PropTech: 'BuildSmart' raises $50M Series B." },
];

export default function GlobalNewsTicker() {
    return (
        <div className="fixed bottom-5 left-0 w-full z-50 pointer-events-none">
            {/* Transparent Container, Opaque Items */}
            <div className="w-full overflow-hidden">
                <div className="flex w-[200%] animate-marquee">
                    {/* Double the items for seamless loop */}
                    {[...NEWS_ITEMS, ...NEWS_ITEMS, ...NEWS_ITEMS].map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 mx-4 pointer-events-auto">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-lg text-sm text-slate-300">
                                <item.icon className={`w-3 h-3 ${item.type === 'deal' ? 'text-emerald-400' :
                                        item.type === 'trend' ? 'text-blue-400' :
                                            item.type === 'event' ? 'text-amber-400' :
                                                'text-violet-400'
                                    }`} />
                                <span className="font-medium text-white">{item.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS Animation for Marquee */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
