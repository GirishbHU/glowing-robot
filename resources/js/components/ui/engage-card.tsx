import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { HelpCircle, ExternalLink, Maximize2 } from "lucide-react";

export type AnimationType = "float" | "pulse" | "glow" | "shake" | "bounce" | "rotate" | "none";
export type HighlightStyle = "violet" | "amber" | "emerald" | "cyan" | "pink" | "gradient";

const ANIMATION_VARIANTS: Record<AnimationType, any> = {
  float: {
    y: [0, -4, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
  },
  pulse: {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
  },
  glow: {
    boxShadow: [
      "0 0 0 rgba(139, 92, 246, 0)",
      "0 0 20px rgba(139, 92, 246, 0.3)",
      "0 0 0 rgba(139, 92, 246, 0)"
    ],
    transition: { duration: 3, repeat: Infinity }
  },
  shake: {
    rotate: [0, 2, -2, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
  },
  bounce: {
    y: [0, -6, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeOut" as const }
  },
  rotate: {
    rotate: [0, 5, -5, 0],
    transition: { duration: 4, repeat: Infinity }
  },
  none: {}
};

const HIGHLIGHT_COLORS = {
  violet: {
    border: "border-violet-500/50",
    hoverBorder: "hover:border-violet-400",
    bg: "hover:bg-violet-500/10",
    glow: "rgba(139, 92, 246, 0.3)"
  },
  amber: {
    border: "border-amber-500/50",
    hoverBorder: "hover:border-amber-400",
    bg: "hover:bg-amber-500/10",
    glow: "rgba(245, 158, 11, 0.3)"
  },
  emerald: {
    border: "border-emerald-500/50",
    hoverBorder: "hover:border-emerald-400",
    bg: "hover:bg-emerald-500/10",
    glow: "rgba(16, 185, 129, 0.3)"
  },
  cyan: {
    border: "border-cyan-500/50",
    hoverBorder: "hover:border-cyan-400",
    bg: "hover:bg-cyan-500/10",
    glow: "rgba(6, 182, 212, 0.3)"
  },
  pink: {
    border: "border-pink-500/50",
    hoverBorder: "hover:border-pink-400",
    bg: "hover:bg-pink-500/10",
    glow: "rgba(236, 72, 153, 0.3)"
  },
  gradient: {
    border: "border-violet-500/30",
    hoverBorder: "hover:border-violet-400",
    bg: "hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-purple-500/10",
    glow: "rgba(139, 92, 246, 0.25)"
  }
};

interface EngageCardProps {
  children: ReactNode;
  hint?: string;
  animation?: AnimationType;
  highlight?: HighlightStyle;
  delay?: number;
  onClick?: () => void;
  popupContent?: ReactNode;
  popupTitle?: string;
  className?: string;
  showHintIcon?: boolean;
  disabled?: boolean;
  testId?: string;
}

export function EngageCard({
  children,
  hint,
  animation = "float",
  highlight = "violet",
  delay = 0,
  onClick,
  popupContent,
  popupTitle,
  className = "",
  showHintIcon = false,
  disabled = false,
  testId
}: EngageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  
  const colors = HIGHLIGHT_COLORS[highlight];
  const animationVariant = !disabled && !isHovered ? ANIMATION_VARIANTS[animation] : {};
  
  const baseClasses = `
    relative rounded-xl border transition-all cursor-pointer
    bg-slate-800/50 ${colors.border} ${colors.hoverBorder} ${colors.bg}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
  `;
  
  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.1 }}
      animate={animationVariant}
      whileHover={{ 
        scale: disabled ? 1 : 1.02, 
        y: disabled ? 0 : -3,
        boxShadow: disabled ? "none" : `0 8px 30px ${colors.glow}`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={disabled ? undefined : (popupContent ? () => setPopupOpen(true) : onClick)}
      className={`${baseClasses} ${className}`}
      data-testid={testId}
    >
      {children}
      
      {showHintIcon && hint && (
        <motion.div
          className="absolute top-2 right-2 text-slate-500 hover:text-violet-400 transition-colors"
          animate={{ opacity: isHovered ? 1 : 0.5 }}
        >
          <HelpCircle className="h-4 w-4" />
        </motion.div>
      )}
      
      {popupContent && (
        <motion.div
          className="absolute top-2 right-2 text-slate-500 hover:text-violet-400 transition-colors"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <Maximize2 className="h-4 w-4" />
        </motion.div>
      )}
    </motion.div>
  );
  
  if (popupContent) {
    return (
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                {CardContent}
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">{hint}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <DialogTrigger asChild>
            {CardContent}
          </DialogTrigger>
        )}
        <ResizableDialogContent className="bg-slate-900 border-violet-500/50">
          {popupTitle && (
            <h2 className="text-xl font-bold text-white mb-4">{popupTitle}</h2>
          )}
          {popupContent}
        </ResizableDialogContent>
      </Dialog>
    );
  }
  
  if (hint) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {CardContent}
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm">{hint}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return CardContent;
}

interface AnimatedIconProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

export function AnimatedIcon({
  children,
  animation = "pulse",
  delay = 0,
  className = ""
}: AnimatedIconProps) {
  const animationVariant = ANIMATION_VARIANTS[animation];
  
  return (
    <motion.div
      animate={animationVariant}
      transition={{ ...animationVariant.transition, delay: delay * 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HintWrapperProps {
  children: ReactNode;
  hint: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function HintWrapper({ children, hint, side = "top" }: HintWrapperProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>
        <p className="text-sm">{hint}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface PopupLinkProps {
  children: ReactNode;
  title: string;
  content: ReactNode;
  hint?: string;
  className?: string;
}

export function PopupLink({ children, title, content, hint, className = "" }: PopupLinkProps) {
  const [open, setOpen] = useState(false);
  
  const trigger = (
    <motion.div
      whileHover={{ scale: 1.02, x: 3 }}
      className={`cursor-pointer ${className}`}
      onClick={() => setOpen(true)}
    >
      {children}
    </motion.div>
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {hint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              {trigger}
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hint}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <ResizableDialogContent className="bg-slate-900 border-violet-500/50 max-w-4xl">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        {content}
      </ResizableDialogContent>
    </Dialog>
  );
}

interface EngageButtonProps {
  children: ReactNode;
  hint?: string;
  animation?: AnimationType;
  highlight?: HighlightStyle;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function EngageButton({
  children,
  hint,
  animation = "none",
  highlight = "violet",
  onClick,
  className = "",
  disabled = false
}: EngageButtonProps) {
  const colors = HIGHLIGHT_COLORS[highlight];
  const animationVariant = !disabled ? ANIMATION_VARIANTS[animation] : {};
  
  const button = (
    <motion.button
      animate={animationVariant}
      whileHover={{ 
        scale: disabled ? 1 : 1.05, 
        boxShadow: disabled ? "none" : `0 4px 20px ${colors.glow}`
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg border transition-all
        ${colors.border} ${colors.hoverBorder} ${colors.bg}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
  
  if (hint) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{hint}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return button;
}

interface EngageListItemProps {
  children: ReactNode;
  hint?: string;
  onClick?: () => void;
  highlight?: HighlightStyle;
  index?: number;
  className?: string;
}

export function EngageListItem({
  children,
  hint,
  onClick,
  highlight = "violet",
  index = 0,
  className = ""
}: EngageListItemProps) {
  const colors = HIGHLIGHT_COLORS[highlight];
  
  const item = (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.01, 
        x: 5,
        backgroundColor: "rgba(139, 92, 246, 0.1)"
      }}
      onClick={onClick}
      className={`
        p-3 rounded-lg cursor-pointer transition-all
        hover:border-l-2 ${colors.hoverBorder.replace("hover:", "")}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
  
  if (hint) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {item}
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{hint}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return item;
}
