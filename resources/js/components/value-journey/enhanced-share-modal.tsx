import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResizableDialogContent } from "@/components/ui/resizable-dialog-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SimpleRadarChart } from "@/components/ui/simple-radar-chart";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, Copy, Mail, MessageCircle, Check, Gift, Sparkles,
  Image, BarChart2, Trophy, Star, Zap, ArrowRight, Send, Globe
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

interface ShareGraphicOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface EnhancedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalGleams: number;
  currentLevel: string;
  aspirationalLevel?: string;
  stakeholder: string;
  radarData?: { subject: string; A: number; fullMark: number }[];
  aspirationalRadarData?: { subject: string; A: number; fullMark: number }[];
  badges?: { id: string; name: string; emoji: string; unlocked: boolean }[];
  referralCode?: string;
  userName?: string;
}

const BONUS_OPTIONS = [
  { value: 50, label: "50 Gleams", description: "Starter gift" },
  { value: 100, label: "100 Gleams", description: "Nice boost" },
  { value: 250, label: "250 Gleams", description: "Generous gift" },
  { value: 500, label: "500 Gleams", description: "Premium gift" },
];

const GRAPHIC_OPTIONS: ShareGraphicOption[] = [
  { id: "radar", name: "Radar Chart", icon: <BarChart2 className="h-5 w-5" />, description: "Your current level assessment" },
  { id: "score", name: "Score Card", icon: <Trophy className="h-5 w-5" />, description: "Gleams & Alicorns earned" },
  { id: "badges", name: "Badges", icon: <Star className="h-5 w-5" />, description: "Your achievement badges" },
  { id: "journey", name: "Journey Map", icon: <Zap className="h-5 w-5" />, description: "Your progress across levels" },
];

const gleamsToAlicorns = (gleams: number): string => {
  const alicorns = Math.round((gleams / 100) * 100) / 100;
  return alicorns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const hasProgressedBeyondL0 = (level: string): boolean => {
  return Boolean(level && level !== "L0");
};

export default function EnhancedShareModal({
  isOpen,
  onClose,
  totalGleams,
  currentLevel,
  aspirationalLevel,
  stakeholder,
  radarData,
  aspirationalRadarData,
  badges,
  referralCode,
  userName,
}: EnhancedShareModalProps) {
  const { toast } = useToast();
  const [selectedBonus, setSelectedBonus] = useState(100);
  const [selectedGraphic, setSelectedGraphic] = useState("score");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("message");
  
  const userDisplayName = userName || "A fellow quester";
  const refCode = referralCode || `quest_${Date.now().toString(36)}`;
  
  const getReferralUrl = () => {
    return `https://i2u.ai?ref=${refCode}&gift=${selectedBonus}`;
  };
  
  const getDefaultMessage = () => {
    const scoreDisplay = hasProgressedBeyondL0(currentLevel) 
      ? `${gleamsToAlicorns(totalGleams)} ${ALICORN_SYMBOL}` 
      : `${totalGleams.toLocaleString()} ${GLEAM_SYMBOL}`;
    
    return `🚀 I'm on the Value Journey Quest at i2u.ai!

${ALICORN_SYMBOL} My Score: ${scoreDisplay}
📊 Level: ${currentLevel}
🎁 I'm gifting you ${selectedBonus} Gleams to start!

Can you beat my score? Join via my link and we BOTH earn rewards!

✨ You get: ${selectedBonus} Gleams to start
🔥 I too get Gleams when you join!

Let's see who becomes the ultimate unicorn! 🦄

👉 Join here: https://i2u.ai?ref=${refCode}&gift=${selectedBonus}`;
  };
  
  const [customMessage, setCustomMessage] = useState(getDefaultMessage());
  
  const updateMessageWithBonus = (bonus: number) => {
    setSelectedBonus(bonus);
    setCustomMessage(prev => {
      const scoreDisplay = hasProgressedBeyondL0(currentLevel) 
        ? `${gleamsToAlicorns(totalGleams)} ${ALICORN_SYMBOL}` 
        : `${totalGleams.toLocaleString()} ${GLEAM_SYMBOL}`;
      
      return `🚀 I'm on the Value Journey Quest at i2u.ai!

${ALICORN_SYMBOL} My Score: ${scoreDisplay}
📊 Level: ${currentLevel}
🎁 I'm gifting you ${bonus} Gleams to start!

Can you beat my score? Join via my link and we BOTH earn rewards!

✨ You get: ${bonus} Gleams to start
🔥 I too get Gleams when you join!

Let's see who becomes the ultimate unicorn! 🦄

👉 Join here: https://i2u.ai?ref=${refCode}&gift=${bonus}`;
    });
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      toast({ title: "Copied!", description: "Message with referral link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };
  
  const copyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(getReferralUrl());
      toast({ title: "Link copied!", description: "Referral link copied to clipboard" });
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };
  
  const shareOnPlatform = (platform: string) => {
    const message = encodeURIComponent(customMessage);
    const shortMessage = encodeURIComponent(`🦄 I'm on the Value Journey Quest! My score: ${totalGleams} ${GLEAM_SYMBOL}. Join me and get ${selectedBonus} Gleams free!`);
    const url = encodeURIComponent(getReferralUrl());
    const title = encodeURIComponent("Join Value Journey Quest - Earn Gleams & Alicorns!");
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${shortMessage}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${message}`,
      telegram: `https://t.me/share/url?url=${url}&text=${message}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shortMessage}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
      threads: `https://threads.net/intent/post?text=${shortMessage}%20${url}`,
      email: `mailto:?subject=${encodeURIComponent("Join me on Value Journey Quest!")}&body=${message}`,
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=600,noopener,noreferrer');
    }
  };
  
  const renderGraphicPreview = () => {
    switch (selectedGraphic) {
      case "radar":
        return (
          <div className="w-full h-48 flex items-center justify-center bg-slate-800/50 rounded-xl p-4">
            {radarData && radarData.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <SimpleRadarChart data={radarData} color="#8B5CF6" />
              </div>
            ) : (
              <div className="text-slate-500 text-sm">Complete an assessment to see your radar chart</div>
            )}
          </div>
        );
      case "score":
        return (
          <div className="w-full h-48 bg-gradient-to-br from-violet-900/50 to-purple-900/50 rounded-xl p-6 flex flex-col items-center justify-center border border-violet-500/30">
            <div className="text-4xl mb-2">
              {hasProgressedBeyondL0(currentLevel) ? ALICORN_SYMBOL : "✨"}
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {hasProgressedBeyondL0(currentLevel) 
                ? gleamsToAlicorns(totalGleams)
                : totalGleams.toLocaleString()}
            </div>
            <div className="text-sm text-violet-300">
              {hasProgressedBeyondL0(currentLevel) ? "Alicorns" : "Gleams"}
            </div>
            <div className="mt-3 px-3 py-1 bg-violet-500/20 rounded-full text-xs text-violet-300">
              Level {currentLevel}
            </div>
          </div>
        );
      case "badges":
        return (
          <div className="w-full h-48 bg-slate-800/50 rounded-xl p-4 flex flex-wrap gap-2 items-center justify-center">
            {badges && badges.filter(b => b.unlocked).length > 0 ? (
              badges.filter(b => b.unlocked).slice(0, 6).map(badge => (
                <div key={badge.id} className="flex flex-col items-center p-2 bg-slate-700/50 rounded-lg">
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{badge.name}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-sm text-center">
                Complete achievements to unlock badges!
              </div>
            )}
          </div>
        );
      case "journey":
        return (
          <div className="w-full h-48 bg-slate-800/50 rounded-xl p-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
              {["L0", "L1", "L2", "L3", "L4"].map((level, index) => (
                <div key={level} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                    level === currentLevel 
                      ? "bg-violet-500 text-white ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-800" 
                      : parseInt(level.slice(1)) < parseInt(currentLevel.slice(1))
                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                        : "bg-slate-700 text-slate-500"
                  }`}>
                    {level}
                  </div>
                  {index < 4 && (
                    <div className={`w-8 h-0.5 ${
                      parseInt(level.slice(1)) < parseInt(currentLevel.slice(1))
                        ? "bg-green-500/50"
                        : "bg-slate-700"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <ResizableDialogContent 
        className="bg-slate-900 border-violet-500/50 text-white"
        defaultWidth={500}
        defaultHeight={650}
        minWidth={400}
        minHeight={450}
        maxWidth={800}
        maxHeight={850}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="h-5 w-5 text-violet-400" />
            Share & Earn Together
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="message" className="text-xs data-[state=active]:bg-violet-600">
              Message
            </TabsTrigger>
            <TabsTrigger value="graphics" className="text-xs data-[state=active]:bg-violet-600">
              Graphics
            </TabsTrigger>
            <TabsTrigger value="bonus" className="text-xs data-[state=active]:bg-violet-600">
              Gift Bonus
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="message" className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">Your Share Message</Label>
              <Textarea 
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="mt-2 bg-slate-800 border-slate-700 text-white min-h-[180px] text-sm"
                placeholder="Customize your message..."
              />
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm">Your Referral Link</Label>
              <div className="mt-2 p-3 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-between gap-2">
                <code className="text-xs text-violet-400 break-all flex-1">{getReferralUrl()}</code>
                <Button size="sm" variant="ghost" onClick={copyLinkOnly} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm mb-1">
                <Gift className="h-4 w-4" />
                Double Benefits!
              </div>
              <p className="text-xs text-yellow-300/80">
                You're gifting <span className="font-bold">{selectedBonus} {GLEAM_SYMBOL}</span> to whoever joins.
                When they do, <span className="font-bold">you earn {selectedBonus * 2} {GLEAM_SYMBOL}</span> - double the gift!
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="graphics" className="space-y-4 mt-4">
            <Label className="text-slate-300 text-sm">Choose a graphic to share</Label>
            <div className="grid grid-cols-2 gap-2">
              {GRAPHIC_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedGraphic(option.id)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedGraphic === option.id
                      ? "border-violet-500 bg-violet-500/20"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={selectedGraphic === option.id ? "text-violet-400" : "text-slate-400"}>
                      {option.icon}
                    </span>
                    <span className="text-sm font-medium">{option.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{option.description}</p>
                </button>
              ))}
            </div>
            
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Preview</Label>
              {renderGraphicPreview()}
            </div>
            
            <p className="text-xs text-slate-500 text-center">
              💡 The selected graphic will be included as a visual with your share
            </p>
          </TabsContent>
          
          <TabsContent value="bonus" className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm mb-3 block">
                How many Gleams do you want to gift?
              </Label>
              <RadioGroup 
                value={selectedBonus.toString()} 
                onValueChange={(v) => updateMessageWithBonus(parseInt(v))}
                className="space-y-2"
              >
                {BONUS_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedBonus === option.value
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }`}
                    onClick={() => updateMessageWithBonus(option.value)}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`bonus-${option.value}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-yellow-400">{option.label}</span>
                        <span className="text-xs text-slate-500">({option.description})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-green-400">You earn</div>
                      <div className="font-bold text-green-400">{option.value * 2} {GLEAM_SYMBOL}</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">Friend receives</div>
                  <div className="text-2xl font-bold text-yellow-400">{selectedBonus} {GLEAM_SYMBOL}</div>
                </div>
                <ArrowRight className="h-6 w-6 text-slate-500" />
                <div className="text-right">
                  <div className="text-sm text-slate-300">You earn (2x)</div>
                  <div className="text-2xl font-bold text-green-400">{selectedBonus * 2} {GLEAM_SYMBOL}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border-t border-slate-700 pt-4 mt-4">
          <Label className="text-slate-300 text-sm mb-3 block">Share Your Achievement</Label>
          <TooltipProvider>
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('twitter')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <span className="text-lg font-bold">𝕏</span>
                      <span className="text-[10px] text-slate-400">Post</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Share on X (Twitter) to reach founders & investors</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('linkedin')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-blue-600/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <span className="text-blue-500 text-lg font-bold">in</span>
                      <span className="text-[10px] text-slate-400">Share</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Share on LinkedIn for professional reach</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('facebook')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-blue-500/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <span className="text-blue-400 text-lg font-bold">f</span>
                      <span className="text-[10px] text-slate-400">Post</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Share on Facebook with your network</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('whatsapp')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-green-500/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <MessageCircle className="h-5 w-5 text-green-400" />
                      <span className="text-[10px] text-slate-400">Send</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Send via WhatsApp to friends directly</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('telegram')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-sky-500/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <Send className="h-5 w-5 text-sky-400" />
                      <span className="text-[10px] text-slate-400">Send</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Share via Telegram to startup communities</p></TooltipContent>
              </Tooltip>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('threads')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-slate-600/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <span className="text-lg font-bold">@</span>
                      <span className="text-[10px] text-slate-400">Post</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Share on Threads for social engagement</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('reddit')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-orange-500/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <Globe className="h-5 w-5 text-orange-500" />
                      <span className="text-[10px] text-slate-400">Reddit</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Share on Reddit startup communities</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => shareOnPlatform('email')} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <Mail className="h-5 w-5 text-amber-400" />
                      <span className="text-[10px] text-slate-400">Email</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Email to colleagues and mentors</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={copyLinkOnly} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 w-full"
                      variant="ghost"
                    >
                      <Globe className="h-5 w-5 text-cyan-400" />
                      <span className="text-[10px] text-slate-400">Link</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Copy just the referral link</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={copyToClipboard} 
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/50 w-full"
                      variant="ghost"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <Copy className="h-5 w-5 text-violet-400" />
                      )}
                      <span className="text-[10px] text-slate-400">{copied ? "Done!" : "Copy All"}</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent><p>Copy full message with referral link</p></TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
        
        <motion.div 
          className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="h-3 w-3 text-amber-400" />
          Share to 8 platforms! Earn Gleams when friends join via your link
          <Sparkles className="h-3 w-3 text-amber-400" />
        </motion.div>
      </ResizableDialogContent>
    </Dialog>
  );
}
