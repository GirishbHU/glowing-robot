import React, { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, Rocket, Target, Zap, Crown, Award, Share2, Copy, Check, ExternalLink, Sparkles } from "lucide-react";

export interface MilestoneBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  requirement: string;
  points: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export const MILESTONE_BADGES: MilestoneBadge[] = [
  {
    id: "first_assessment",
    name: "First Steps",
    description: "Completed your first assessment",
    emoji: "🎯",
    icon: <Target className="h-6 w-6" />,
    color: "text-blue-500",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500",
    requirement: "Complete 1 assessment",
    points: 100,
    rarity: "common",
  },
  {
    id: "phase_explorer",
    name: "Phase Explorer",
    description: "Completed assessments in 3 different phases",
    emoji: "🗺️",
    icon: <Rocket className="h-6 w-6" />,
    color: "text-green-500",
    bgGradient: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500",
    requirement: "Complete 3 phases",
    points: 300,
    rarity: "uncommon",
  },
  {
    id: "high_achiever",
    name: "High Achiever",
    description: "Scored above 50,000 points in a single assessment",
    emoji: "⭐",
    icon: <Star className="h-6 w-6" />,
    color: "text-yellow-500",
    bgGradient: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500",
    requirement: "Score 50,000+ points",
    points: 500,
    rarity: "rare",
  },
  {
    id: "reality_check",
    name: "Reality Check",
    description: "Completed a Current Reality assessment",
    emoji: "🔍",
    icon: <Target className="h-6 w-6" />,
    color: "text-indigo-500",
    bgGradient: "from-indigo-500/20 to-violet-500/20",
    borderColor: "border-indigo-500",
    requirement: "Complete Reality mode",
    points: 150,
    rarity: "common",
  },
  {
    id: "visionary",
    name: "Visionary",
    description: "Completed an Aspiration assessment",
    emoji: "🔮",
    icon: <Sparkles className="h-6 w-6" />,
    color: "text-purple-500",
    bgGradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500",
    requirement: "Complete Aspiration mode",
    points: 150,
    rarity: "common",
  },
  {
    id: "growth_master",
    name: "Growth Master",
    description: "Achieved Unicorn or Decacorn status",
    emoji: "🦄",
    icon: <Crown className="h-6 w-6" />,
    color: "text-violet-500",
    bgGradient: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500",
    requirement: "Reach Unicorn status",
    points: 1000,
    rarity: "epic",
  },
  {
    id: "full_journey",
    name: "Full Journey",
    description: "Completed all 7 growth phases",
    emoji: "🏆",
    icon: <Trophy className="h-6 w-6" />,
    color: "text-amber-500",
    bgGradient: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500",
    requirement: "Complete all 7 phases",
    points: 2000,
    rarity: "legendary",
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Completed an assessment in under 2 minutes",
    emoji: "⚡",
    icon: <Zap className="h-6 w-6" />,
    color: "text-orange-500",
    bgGradient: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500",
    requirement: "Finish in under 2 min",
    points: 250,
    rarity: "uncommon",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Answered all questions with maximum confidence (5/5)",
    emoji: "💎",
    icon: <Award className="h-6 w-6" />,
    color: "text-cyan-500",
    bgGradient: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500",
    requirement: "All 5/5 answers",
    points: 750,
    rarity: "rare",
  },
];

const RARITY_COLORS = {
  common: "from-gray-400 to-gray-500",
  uncommon: "from-green-400 to-green-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 via-yellow-500 to-orange-500",
};

const RARITY_GLOW = {
  common: "shadow-gray-500/30",
  uncommon: "shadow-green-500/30",
  rare: "shadow-blue-500/30",
  epic: "shadow-purple-500/30",
  legendary: "shadow-amber-500/50",
};

interface ShareableBadgeCardProps {
  badge: MilestoneBadge;
  earnedAt?: string;
  userName?: string;
}

export const ShareableBadgeCard = forwardRef<HTMLDivElement, ShareableBadgeCardProps>(
  ({ badge, earnedAt, userName }, ref) => {
    const rarityGradient = RARITY_COLORS[badge.rarity];
    const rarityGlow = RARITY_GLOW[badge.rarity];

    return (
      <div
        ref={ref}
        className={`relative w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl ${rarityGlow}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${badge.bgGradient} opacity-30`} />
        
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rarityGradient}`} />
        
        <div className="relative p-6 text-center">
          <div className="absolute top-2 right-2">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full bg-gradient-to-r ${rarityGradient} text-white`}>
              {badge.rarity}
            </span>
          </div>
          
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-6xl mb-4"
          >
            {badge.emoji}
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{badge.name}</h3>
          <p className="text-sm text-slate-300 mb-4">{badge.description}</p>
          
          <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="font-bold">{badge.points} points</span>
          </div>
          
          {userName && (
            <p className="text-xs text-slate-400">Earned by {userName}</p>
          )}
          {earnedAt && (
            <p className="text-xs text-slate-500 mt-1">{earnedAt}</p>
          )}
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-center gap-2">
              <img src="https://i2u.ai/favicon.ico" alt="i2u.ai" className="h-4 w-4" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="text-xs text-slate-400">i2u.ai Value Hub</span>
            </div>
          </div>
        </div>
        
        {badge.rarity === "legendary" && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent" />
          </motion.div>
        )}
      </div>
    );
  }
);

ShareableBadgeCard.displayName = "ShareableBadgeCard";

interface BadgeDisplayProps {
  badge: MilestoneBadge;
  isEarned: boolean;
  onClick?: () => void;
}

export function BadgeDisplay({ badge, isEarned, onClick }: BadgeDisplayProps) {
  const rarityGradient = RARITY_COLORS[badge.rarity];

  return (
    <motion.button
      whileHover={{ scale: isEarned ? 1.05 : 1 }}
      whileTap={{ scale: isEarned ? 0.95 : 1 }}
      onClick={isEarned ? onClick : undefined}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isEarned
          ? `${badge.borderColor} bg-gradient-to-br ${badge.bgGradient} cursor-pointer`
          : "border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed grayscale"
      }`}
      data-testid={`badge-${badge.id}`}
    >
      {isEarned && (
        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r ${rarityGradient} flex items-center justify-center`}>
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      
      <div className="text-center">
        <span className="text-3xl block mb-2">{badge.emoji}</span>
        <h4 className={`text-sm font-bold ${isEarned ? badge.color : "text-slate-500"}`}>
          {badge.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {badge.requirement}
        </p>
      </div>
    </motion.button>
  );
}

interface BadgeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: MilestoneBadge;
  earnedAt?: string;
}

export function BadgeShareModal({ isOpen, onClose, badge, earnedAt }: BadgeShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const referralUrl = "https://i2u.ai/register?ref=valuehub";
  const shareUrl = "https://i2u.ai/value-stories/calculator";

  const shareMessage = `${badge.emoji} I just earned the "${badge.name}" badge on i2u.ai Value Hub!\n\n${badge.description}\n\n🎁 REFERRAL BONUS: Take the assessment via my link and we both earn rewards!\n• 100 pts per assessment\n• 500 pts when you register\n• 1000 pts for all 7 phases\n\nStart your journey: ${referralUrl}`;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    toast({ title: "Copied!", description: "Badge message copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `${badge.emoji} I just earned the "${badge.name}" badge on @i2uai Value Hub! ${badge.description} Take the challenge:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`, "_blank");
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, "_blank");
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Share Your Achievement
          </DialogTitle>
          <DialogDescription>
            Show off your {badge.name} badge and invite others to join!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <ShareableBadgeCard badge={badge} earnedAt={earnedAt} />

          <div className="w-full space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
              {shareMessage}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={copyMessage}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-[#1DA1F2]/10 border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 text-[#1DA1F2]"
                onClick={shareToTwitter}
              >
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 text-[#0A66C2]"
                onClick={shareToLinkedIn}
              >
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366]"
                onClick={shareToWhatsApp}
              >
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function checkBadgeEligibility(
  completedPhases: number[],
  totalScore: number,
  isAspirational: boolean,
  allMaxAnswers: boolean,
  completionTimeSeconds?: number
): string[] {
  const earnedBadges: string[] = [];

  if (completedPhases.length >= 1) {
    earnedBadges.push("first_assessment");
  }

  if (completedPhases.length >= 3) {
    earnedBadges.push("phase_explorer");
  }

  if (completedPhases.length >= 7) {
    earnedBadges.push("full_journey");
  }

  if (totalScore >= 50000) {
    earnedBadges.push("high_achiever");
  }

  if (totalScore >= 100000) {
    earnedBadges.push("growth_master");
  }

  if (!isAspirational) {
    earnedBadges.push("reality_check");
  }

  if (isAspirational) {
    earnedBadges.push("visionary");
  }

  if (allMaxAnswers) {
    earnedBadges.push("perfectionist");
  }

  if (completionTimeSeconds && completionTimeSeconds < 120) {
    earnedBadges.push("speed_demon");
  }

  return earnedBadges;
}

export function getNewlyEarnedBadges(
  previousBadges: string[],
  currentBadges: string[]
): MilestoneBadge[] {
  const newBadgeIds = currentBadges.filter(id => !previousBadges.includes(id));
  return MILESTONE_BADGES.filter(badge => newBadgeIds.includes(badge.id));
}
