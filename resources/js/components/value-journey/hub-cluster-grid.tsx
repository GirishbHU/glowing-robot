import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import { CLUSTER_CATEGORIES } from "@/constants/ecosystem-clusters";

export default function HubClusterGrid({ compact = false }: { compact?: boolean }) {
    const Container = compact ? "div" : "section";
    const containerClasses = compact ? "py-4" : "py-24 bg-slate-950 relative overflow-hidden";

    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 10 // Offset slightly above
        });
    };

    return (
        <Container className={containerClasses}>
            {!compact && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-950 to-slate-950" />
            )}

            <div className={`relative ${compact ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} `}>
                {!compact && (
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            The 9x9x9 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Hub Clusters</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Navigate the ecosystem through 9 dimensions of value creation.
                        </p>
                    </div>
                )}

                <div className={`grid grid - cols - 1 ${compact ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'} `}>
                    {CLUSTER_CATEGORIES.map((category) => (
                        <div key={category.id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-violet-500/30 transition-colors group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                                    <category.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white">{category.title}</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {category.items.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        onMouseMove={handleMouseMove}
                                        className={`
aspect - square rounded - xl relative overflow - hidden group / item
                                            border border - white / 10 hover: border - white / 40 transition - all duration - 300
shadow - lg shadow - black / 20
    `}
                                    >
                                        {/* Vibrant Image Background (Placeholder using picsum with seed for consistency) */}
                                        <img
                                            src={`https://picsum.photos/seed/${item.label.replace(/\s/g, '')}${category.id}/200/200?blur=2`}
                                            alt={item.label}
                                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-opacity duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-1 z-10">
                                            <item.icon className="w-5 h-5 text-white drop-shadow-md mb-1" />
                                            <span className="text-[10px] font-bold text-white text-center leading-tight drop-shadow-md px-1">
                                                {item.label}
                                            </span>
                                        </div>

                                        {/* Dynamic Tooltip (Right above cursor) */}
                                        <div
                                            className="absolute pointer-events-none z-50 px-3 py-2 bg-slate-950/90 border border-violet-500/50 rounded-lg shadow-2xl backdrop-blur-md opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 w-40 whitespace-normal"
                                            style={{
                                                left: cursorPos.x,
                                                top: cursorPos.y,
                                                transform: 'translate(-50%, -110%)'
                                            }}
                                        >
                                            <p className="text-[10px] text-fuchsia-300 font-bold mb-0.5">{item.label}</p>
                                            <div className="h-px w-full bg-gradient-to-r from-violet-500/50 to-transparent mb-1" />
                                            <p className="text-[9px] text-white leading-tight">"{item.hint}"</p>
                                        </div>
                                    </Link >
                                ))}
                            </div >
                        </div >
                    ))}
                </div >
            </div >
        </Container >
    );
}
