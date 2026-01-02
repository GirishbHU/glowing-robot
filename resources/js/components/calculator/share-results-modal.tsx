import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, Share2, Twitter, Linkedin, Send, Mail, Check, ExternalLink, Sparkles } from "lucide-react";
import ShareableResultsCard from "./ShareableResultsCard";

interface ShareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    score: number;
    formattedTotalScore: string;
    dimensionScore: number;
    riskScore: number;
  };
  badge: { name: string; emoji: string; color: string };
  phase: number;
  phaseName: string;
  isAspirational: boolean;
  timestamp: string;
  onRegister: (params: URLSearchParams) => void;
}

export default function ShareResultsModal({
  isOpen,
  onClose,
  result,
  badge,
  phase,
  phaseName,
  isAspirational,
  timestamp,
  onRegister,
}: ShareResultsModalProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [stakeholderType, setStakeholderType] = useState<string>("investor");

  const shareUrl = "https://i2u.ai/value-stories/calculator";
  const referralUrl = "https://i2u.ai/register?ref=valuehub";
  
  const referralBonusInfo = `\n\n🎁 REFERRAL BONUS: Register at i2u.ai and earn rewards!\n• 100 points per referral who takes the assessment\n• 500 bonus points when they register\n• 1000 points when they complete all 7 phases\n• Redeem points for premium coaching, case studies & more!`;
  
  const getShareMessage = (platform: string) => {
    const baseMessages: Record<string, Record<string, string>> = {
      investor: {
        twitter: `Just assessed my startup's ${badge.name} potential with @i2uai! ${badge.emoji} Score: ${result.formattedTotalScore}. Investors, let's talk! Take yours & earn referral rewards: ${referralUrl} #StartupAssessment #VentureCapital`,
        linkedin: `Excited to share my startup assessment results from i2u.ai Value Hub!\n\n${badge.emoji} ${badge.name} Status\nTotal Score: ${result.formattedTotalScore}\nPhase: ${phaseName}\n\nLooking to connect with investors who see potential in data-driven founders.\n\nTake your own assessment via my referral link: ${referralUrl}${referralBonusInfo}`,
        whatsapp: `Hey! I just took the i2u.ai Startup Assessment and scored ${result.formattedTotalScore}! ${badge.emoji}\n\nPhase: ${phaseName}\nStatus: ${badge.name}\n\nCheck yours via my referral: ${referralUrl}${referralBonusInfo}`,
        email: `Subject: My Startup Assessment Results - ${badge.name} Status!\n\nHi,\n\nI recently completed the i2u.ai Startup Assessment and wanted to share my results:\n\n${badge.emoji} ${badge.name} Status\nTotal Score: ${result.formattedTotalScore}\nPhase: ${phaseName}\nGrowth Potential: ${result.dimensionScore}\nThrive Factor: ${result.riskScore}\n\nTake your own assessment via my referral link: ${referralUrl}${referralBonusInfo}\n\nBest regards`,
      },
      cofounder: {
        twitter: `Looking for a co-founder who can match this energy! ${badge.emoji} Just scored ${result.formattedTotalScore} on @i2uai assessment. Join via my link & we both earn: ${referralUrl} #Cofounder #Startup`,
        linkedin: `Building something big and looking for the right co-founder!\n\nJust completed my startup assessment:\n${badge.emoji} ${badge.name} Status\nScore: ${result.formattedTotalScore}\nPhase: ${phaseName}\n\nIf you're a builder looking to join a high-potential venture, let's connect!\n\nUse my referral link to take the assessment: ${referralUrl}${referralBonusInfo}`,
        whatsapp: `Know anyone looking to co-found a startup? Just got my assessment: ${result.formattedTotalScore} ${badge.emoji}\n\nPhase: ${phaseName}\n\nTake yours via my referral & we both earn rewards: ${referralUrl}${referralBonusInfo}`,
        email: `Subject: Co-founder Opportunity - ${badge.name} Status Startup\n\nHi,\n\nI'm building something exciting and looking for the right co-founder. My recent startup assessment:\n\n${badge.emoji} ${badge.name} Status\nScore: ${result.formattedTotalScore}\nPhase: ${phaseName}\n\nInterested in learning more? Take the assessment via my referral: ${referralUrl}${referralBonusInfo}`,
      },
      team: {
        twitter: `My startup journey just got real! ${badge.emoji} ${badge.name} status on @i2uai assessment. Score: ${result.formattedTotalScore}. Join the journey: ${referralUrl} #Hiring #Startup`,
        linkedin: `Excited about my startup's trajectory!\n\n${badge.emoji} ${badge.name} Status\nScore: ${result.formattedTotalScore}\nPhase: ${phaseName}\n\nWe're building something special and looking for talented people to join our journey.\n\nCheck out our assessment & take yours: ${referralUrl}${referralBonusInfo}`,
        whatsapp: `Team update! Just assessed our startup potential: ${result.formattedTotalScore} ${badge.emoji}\n\n${badge.name} Status in ${phaseName}\n\nTry it via my referral link: ${referralUrl}${referralBonusInfo}`,
        email: `Subject: Join Our ${badge.name} Status Startup Journey!\n\nHi,\n\nWe're building something exciting! Our recent assessment:\n\n${badge.emoji} ${badge.name} Status\nScore: ${result.formattedTotalScore}\nPhase: ${phaseName}\n\nWe're looking for talented individuals to join our team.\n\nTake the assessment via my referral: ${referralUrl}${referralBonusInfo}`,
      },
      challenge: {
        twitter: `${badge.emoji} I scored ${result.formattedTotalScore} on @i2uai! Think you can beat that? Take the challenge via my referral & we both earn: ${referralUrl} #StartupChallenge`,
        linkedin: `CHALLENGE ACCEPTED ${badge.emoji}\n\nJust scored ${result.formattedTotalScore} on the i2u.ai Startup Assessment!\n\nI challenge my network: Can you beat my score?\n\nTake the assessment via my referral: ${referralUrl}${referralBonusInfo}`,
        whatsapp: `${badge.emoji} I scored ${result.formattedTotalScore} on the startup assessment! Think you can beat that?\n\nTake the challenge via my referral: ${referralUrl}${referralBonusInfo}`,
        email: `Subject: Can You Beat My Startup Score? ${result.formattedTotalScore} ${badge.emoji}\n\nHey!\n\nI just scored ${result.formattedTotalScore} on the i2u.ai Startup Assessment and got ${badge.name} status!\n\nI challenge you to beat it via my referral link: ${referralUrl}${referralBonusInfo}\n\nLet me know your score!`,
      },
    };

    return baseMessages[stakeholderType]?.[platform] || baseMessages.challenge[platform];
  };

  const [messageCopied, setMessageCopied] = useState(false);

  const copyToClipboard = async () => {
    const message = `${badge.emoji} ${badge.name} Status - Score: ${result.formattedTotalScore}\n\nPhase: ${phaseName}\nGrowth: ${result.dimensionScore}\nThrive: ${result.riskScore}\n\nTake your assessment: ${shareUrl}`;
    
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast({ title: "Copied!", description: "Results copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyShareMessage = async () => {
    const message = getShareMessage("linkedin");
    await navigator.clipboard.writeText(message + "\n" + shareUrl);
    setMessageCopied(true);
    toast({ title: "Message Copied!", description: "Paste this on any platform" });
    setTimeout(() => setMessageCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = getShareMessage("twitter");
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareToWhatsApp = () => {
    const text = getShareMessage("whatsapp");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareViaEmail = () => {
    const emailContent = getShareMessage("email");
    const [subjectLine, ...bodyParts] = emailContent.split("\n\n");
    const subject = subjectLine.replace("Subject: ", "");
    const body = bodyParts.join("\n\n");
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const handleRegister = () => {
    const params = new URLSearchParams({
      score: result.score.toString(),
      phase: phase.toString(),
      phaseName: phaseName,
      dimensionScore: result.dimensionScore.toString(),
      thriveScore: result.riskScore.toString(),
      badge: badge.name,
      isAspirational: isAspirational.toString(),
      timestamp: timestamp,
      source: "valuehub_share",
    });
    onRegister(params);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Share2 className="h-6 w-6 text-violet-500" />
            Share Your Results
          </DialogTitle>
          <DialogDescription>
            Share your assessment results with your network and become part of the i2u.ai community
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="transform scale-75 origin-top">
              <ShareableResultsCard
                ref={cardRef}
                score={result.score}
                formattedScore={result.formattedTotalScore}
                dimensionScore={result.dimensionScore}
                thriveScore={result.riskScore}
                badge={badge}
                phaseName={phaseName}
                phase={phase}
                isAspirational={isAspirational}
                timestamp={timestamp}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="button-copy-results">
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy Text"}
              </Button>
            </div>
            
            <div className="w-full p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
              <h4 className="font-semibold text-amber-600 flex items-center gap-2 text-sm mb-2">
                <span>🎁</span> Share, Invite, Challenge...
              </h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Your referral link: <span className="font-mono text-amber-600 break-all">{referralUrl}</span></p>
                <ul className="mt-2 space-y-1">
                  <li>• 100 pts per referral assessment</li>
                  <li>• 500 pts when they register</li>
                  <li>• 1000 pts for all 7 phases</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Who are you sharing with?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "investor", label: "Investors", emoji: "💰" },
                  { id: "cofounder", label: "Co-founders", emoji: "🤝" },
                  { id: "team", label: "Team/Talent", emoji: "👥" },
                  { id: "challenge", label: "Challenge Friends", emoji: "🎯" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setStakeholderType(type.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      stakeholderType === type.id
                        ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30"
                        : "border-border hover:border-violet-500/50"
                    }`}
                    data-testid={`button-stakeholder-${type.id}`}
                  >
                    <span className="text-lg mr-2">{type.emoji}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Your tailored message</Label>
              <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground max-h-24 overflow-y-auto whitespace-pre-wrap">
                {getShareMessage("linkedin")}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyShareMessage}
                  data-testid="button-copy-share-message"
                >
                  {messageCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {messageCopied ? "Copied!" : "Copy Message"}
                </Button>
                <p className="text-xs text-muted-foreground italic">
                  Paste on any platform (LinkedIn, etc.)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Share on</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="bg-[#1DA1F2]/10 border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] justify-start"
                  onClick={shareToTwitter}
                  data-testid="button-modal-share-twitter"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X (Twitter)
                </Button>

                <Button
                  variant="outline"
                  className="bg-[#0A66C2]/10 border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 text-[#0A66C2] justify-start"
                  onClick={shareToLinkedIn}
                  data-testid="button-modal-share-linkedin"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </Button>

                <Button
                  variant="outline"
                  className="bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] justify-start"
                  onClick={shareToWhatsApp}
                  data-testid="button-modal-share-whatsapp"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </Button>

                <Button
                  variant="outline"
                  className="bg-[#EA4335]/10 border-[#EA4335]/30 hover:bg-[#EA4335]/20 text-[#EA4335] justify-start"
                  onClick={shareViaEmail}
                  data-testid="button-modal-share-email"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30"
              >
                <h4 className="font-semibold text-amber-600 flex items-center gap-2 mb-3">
                  <span className="text-xl">🎁</span> Referral Bonus Scheme
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-amber-500/10 text-center">
                    <div className="font-bold text-amber-600 text-lg">100</div>
                    <div className="text-muted-foreground">points per referral assessment</div>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 text-center">
                    <div className="font-bold text-amber-600 text-lg">500</div>
                    <div className="text-muted-foreground">bonus when they register</div>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 text-center">
                    <div className="font-bold text-amber-600 text-lg">1000</div>
                    <div className="text-muted-foreground">when all 7 phases complete</div>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 text-center">
                    <div className="font-bold text-amber-600 text-lg">∞</div>
                    <div className="text-muted-foreground">redeem for premium perks</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-violet-600">
                      Get Your Personal Referral Link
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Register at i2u.ai to get your unique referral link and start earning rewards when friends take the assessment!
                    </p>
                    <Button
                      onClick={handleRegister}
                      className="mt-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                      data-testid="button-modal-register"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Register & Get Referral Link
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
