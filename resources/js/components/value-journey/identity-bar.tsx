import { motion } from "framer-motion";
import { Lightbulb, User, Sparkles, Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

interface IdentityBarProps {
  ideaName?: string;
  fancyName?: string;
  realName?: string;
  compact?: boolean;
  className?: string;
}

export function IdentityBar({
  ideaName,
  fancyName,
  realName,
  compact = false,
  className = ""
}: IdentityBarProps) {
  const [time, setTime] = useState(new Date());
  const [userIp, setUserIp] = useState<string>("Loading...");

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 100); // 10Hz update for milliseconds
    return () => clearInterval(timer);
  }, []);

  // IP Fetch
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Unavailable'));
  }, []);

  if (compact) {
    // Compact mode - keeping it simple for now, or add clock if space permits?
    // User requested "Clock on the top (identity bar)".
    // Let's add it to compact too?
    return (
      <TooltipProvider>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 ${className}`}
        >
          {/* Existing compact content */}
          {ideaName && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-300 max-w-[100px] truncate">
                    {ideaName}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Your Idea: {ideaName}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Add Clock Mini */}
          <div className="h-4 w-px bg-slate-600 mx-1" />
          <span className="text-[10px] text-slate-400 font-mono">
            {time.toLocaleTimeString([], { hour12: false })}
          </span>
        </motion.div>
      </TooltipProvider>
    );
  }

  // Full Mode
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-wrap items-center gap-4 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-violet-500/20 backdrop-blur-sm ${className}`}
    >
      {/* Identity Section */}
      <div className="flex items-center gap-3">
        {ideaName && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Lightbulb className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Idea</div>
              <div className="text-sm font-semibold text-amber-300">{ideaName}</div>
            </div>
          </div>
        )}

        {ideaName && fancyName && (
          <div className="h-8 w-px bg-slate-700" />
        )}

        {fancyName && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/20">
              <Sparkles className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {realName ? 'Name' : 'Explorer'}
              </div>
              <div className="text-sm font-semibold text-violet-300">
                {fancyName}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" /> {/* Spacer */}

      {/* Clock & IP Section */}
      <div className="flex items-center gap-4 border-l border-slate-700 pl-4">
        {/* IP Address */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider">
            <Globe className="w-3 h-3" />
            IP Address
          </div>
          <div className="text-xs font-mono text-slate-300">{userIp}</div>
        </div>

        {/* Time */}
        <div className="flex flex-col items-end min-w-[140px]">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            System Time (UTC)
          </div>
          <div className="text-xs font-mono text-emerald-400">
            {time.toISOString().split('T')[1].replace('Z', '')}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Local: {time.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default IdentityBar;
