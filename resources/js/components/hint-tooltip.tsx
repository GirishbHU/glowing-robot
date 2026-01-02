import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, HelpCircle, Lightbulb, Sparkles } from "lucide-react";

type HintType = "gleam" | "alicorn" | "level" | "dimension" | "eir" | "stakeholder" | "score" | "custom";

interface HintTooltipProps {
  type: HintType;
  children: ReactNode;
  customContent?: ReactNode;
  showIcon?: boolean;
  iconPosition?: "left" | "right";
  side?: "top" | "bottom" | "left" | "right";
}

const hintContent: Record<HintType, { title: string; description: string; icon: ReactNode }> = {
  gleam: {
    title: "Gleams (Ğ)",
    description: "Points earned per question at L0 (Spark level). Each parameter awards 0-10 Gleams based on your confidence level. Collect Gleams to measure your startup readiness!",
    icon: <span className="text-xl">✨</span>
  },
  alicorn: {
    title: "Alicorns (🦄)",
    description: "Achievement tokens earned at L1+ levels. 100 Gleams = 1 Alicorn. Alicorns represent your progress toward legendary unicorn status!",
    icon: <span className="text-xl">🦄</span>
  },
  level: {
    title: "Growth Levels (L0-L8)",
    description: "Your startup journey progresses through 9 levels: L0 Spark (Conception) → L1 Hunt (Initiation) → L2 Build (Formulation) → L3 Launch (Market Entry) → L4 Grow (Scaling) → L5 Profit (Efficiency) → L6 Lead (Leadership) → L7 Icon (Unicorn) → L8 Sustain (Stewardship)",
    icon: <span className="text-xl">🚀</span>
  },
  dimension: {
    title: "Dimensions (D1-D9)",
    description: "Each level has 9 core competency dimensions that define success. These cover areas like strategy, operations, team, market, technology, finance, leadership, innovation, and impact.",
    icon: <span className="text-xl">🎯</span>
  },
  eir: {
    title: "EiR: Elephants in the Room",
    description: "Risk factors that could derail your startup. These are the uncomfortable truths that must be addressed - market risks, team gaps, funding challenges, and more. Identifying your elephants is the first step to overcoming them!",
    icon: <span className="text-xl">🐘</span>
  },
  stakeholder: {
    title: "Stakeholder Types",
    description: "Choose your perspective: Founder, Investor, Mentor, Advisor, Partner, Customer, Employee, Board Member, or Analyst. Each stakeholder type sees the assessment through their unique lens.",
    icon: <span className="text-xl">👥</span>
  },
  score: {
    title: "Confidence Score",
    description: "Rate your confidence from 1-5 for each parameter. Higher confidence earns more Gleams. Be honest - the assessment helps identify gaps for improvement!",
    icon: <span className="text-xl">📊</span>
  },
  custom: {
    title: "",
    description: "",
    icon: null
  }
};

export default function HintTooltip({ 
  type, 
  children, 
  customContent,
  showIcon = true,
  iconPosition = "right",
  side = "top"
}: HintTooltipProps) {
  const hint = hintContent[type];
  
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {showIcon && iconPosition === "left" && (
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="text-violet-400/60 hover:text-violet-400"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </motion.span>
          )}
          {children}
          {showIcon && iconPosition === "right" && (
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="text-violet-400/60 hover:text-violet-400"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="max-w-xs bg-slate-800 border-violet-500/30 p-3"
      >
        {type === "custom" && customContent ? (
          customContent
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-violet-300">
              {hint.icon}
              <span>{hint.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {hint.description}
            </p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function InlineHint({ type, className = "" }: { type: HintType; className?: string }) {
  const hint = hintContent[type];
  
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 ${className}`}
        >
          <Info className="h-2.5 w-2.5" />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs bg-slate-800 border-violet-500/30 p-3"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-violet-300">
            {hint.icon}
            <span>{hint.title}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {hint.description}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function LearningTip({ 
  title, 
  content, 
  icon 
}: { 
  title: string; 
  content: string; 
  icon?: ReactNode;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg p-3"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 text-violet-400">
          {icon || <Lightbulb className="h-5 w-5" />}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-violet-300 mb-1">{title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function QuickHint({ 
  content,
  variant = "info" 
}: { 
  content: string;
  variant?: "info" | "success" | "warning";
}) {
  const variants = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-300"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${variants[variant]}`}
    >
      <Sparkles className="h-3 w-3" />
      <span>{content}</span>
    </motion.div>
  );
}
