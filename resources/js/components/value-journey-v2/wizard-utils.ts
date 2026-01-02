export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
export const OPTION_COLORS = [
    { bg: "bg-blue-500/10", border: "border-blue-500/50", glow: "shadow-blue-500/20", hover: "hover:bg-blue-500/20", accent: "text-blue-400" },
    { bg: "bg-cyan-500/10", border: "border-cyan-500/50", glow: "shadow-cyan-500/20", hover: "hover:bg-cyan-500/20", accent: "text-cyan-400" },
    { bg: "bg-teal-500/10", border: "border-teal-500/50", glow: "shadow-teal-500/20", hover: "hover:bg-teal-500/20", accent: "text-teal-400" },
    { bg: "bg-emerald-500/10", border: "border-emerald-500/50", glow: "shadow-emerald-500/20", hover: "hover:bg-emerald-500/20", accent: "text-emerald-400" },
    { bg: "bg-violet-500/10", border: "border-violet-500/50", glow: "shadow-violet-500/20", hover: "hover:bg-violet-500/20", accent: "text-violet-400" },
];

export const shuffleWithSeed = (array: any[], seed: string): any[] => {
    const result = [...array];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
    }
    for (let i = result.length - 1; i > 0; i--) {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        const j = hash % (i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

export const formatGleams = (gleams: number) => Math.round(gleams).toLocaleString();
export const gleamsToAlicornsNum = (gleams: number): number => Math.round((gleams / 100) * 100) / 100;
export const gleamsToAlicorns = (gleams: number): string => {
    const alicorns = gleamsToAlicornsNum(gleams);
    return alicorns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
