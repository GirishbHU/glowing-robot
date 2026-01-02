import { motion } from "framer-motion";
import { Lightbulb, User, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  if (!ideaName && !fancyName) {
    return null;
  }

  if (compact) {
    return (
      <TooltipProvider>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 ${className}`}
        >
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
          
          {ideaName && fancyName && (
            <span className="text-slate-600">|</span>
          )}
          
          {fancyName && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-medium text-violet-300 max-w-[100px] truncate">
                    {fancyName}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Display Name: {fancyName}{realName ? ` (${realName})` : ''}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </motion.div>
      </TooltipProvider>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-wrap items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-violet-500/20 backdrop-blur-sm ${className}`}
    >
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
              {realName && (
                <span className="text-slate-400 font-normal ml-1">({realName})</span>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default IdentityBar;
