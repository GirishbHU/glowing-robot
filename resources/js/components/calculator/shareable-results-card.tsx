import React, { forwardRef } from "react";
import { motion } from "framer-motion";

interface ShareableResultsCardProps {
  score: number;
  formattedScore: string;
  dimensionScore: number;
  thriveScore: number;
  badge: { name: string; emoji: string; color: string };
  phaseName: string;
  phase: number;
  isAspirational: boolean;
  timestamp: string;
}

const VIBGYOR_COLORS = [
  "#8B5CF6", // Violet
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#22C55E", // Green
  "#EAB308", // Yellow
  "#F97316", // Orange
  "#EF4444", // Red
];

const ShareableResultsCard = forwardRef<HTMLDivElement, ShareableResultsCardProps>(
  ({ score, formattedScore, dimensionScore, thriveScore, badge, phaseName, phase, isAspirational, timestamp }, ref) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    return (
      <div
        ref={ref}
        className="w-[400px] h-[500px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
        data-testid="shareable-results-card"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            {VIBGYOR_COLORS.map((color, i) => (
              <div
                key={i}
                className="absolute rounded-full blur-3xl"
                style={{
                  background: color,
                  width: `${150 + i * 20}px`,
                  height: `${150 + i * 20}px`,
                  top: `${10 + i * 8}%`,
                  left: `${-20 + i * 15}%`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                i2u.ai
              </span>
              <span className="text-xs text-white/50">Value Hub</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/10 text-xs">
              {isAspirational ? "Aspiration" : "Reality"}
            </div>
          </div>

          <div className="text-center flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-2"
            >
              {badge.emoji}
            </motion.div>
            <div className={`text-2xl font-bold bg-gradient-to-r ${badge.color} bg-clip-text text-transparent mb-4`}>
              {badge.name} Status
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-5xl font-bold font-mono tracking-tight">
                  {formattedScore}
                </div>
                <div className="text-sm text-white/60 mt-1">Total Score</div>
              </div>

              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatNumber(dimensionScore)}</div>
                  <div className="text-xs text-white/50">Growth</div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{formatNumber(thriveScore)}</div>
                  <div className="text-xs text-white/50">Thrive</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: VIBGYOR_COLORS[phase - 1] || VIBGYOR_COLORS[0] }}
              />
              <span className="text-sm text-white/70">Phase {phase}: {phaseName.split('(')[0].trim()}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-white/40">
              <span>i2u.ai/value-stories/calculator</span>
              <span>{new Date(timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-1 rounded-full overflow-hidden"
            style={{
              background: `linear-gradient(to right, ${VIBGYOR_COLORS.join(", ")})`,
            }}
          />
        </div>
      </div>
    );
  }
);

ShareableResultsCard.displayName = "ShareableResultsCard";

export default ShareableResultsCard;
