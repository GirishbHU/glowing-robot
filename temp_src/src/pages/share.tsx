import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Share2, ArrowRight, Copy, MessageCircle, Mail } from "lucide-react";
import { SimpleRadarChart } from "@/components/ui/simple-radar-chart";
import { useToast } from "@/hooks/use-toast";
import PageNav from "@/components/layout/PageNav";

// Scoring symbols
const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

// Convert Gleams to Alicorns - returns formatted string for display
const gleamsToAlicorns = (gleams: number): string => (gleams / 100).toFixed(2);

export default function SharePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [shareData, setShareData] = useState<any>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    const ref = params.get('ref');
    
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setShareData(decoded);
      } catch (e) {
        console.error('Failed to decode share data');
      }
    }
    
    if (ref) {
      localStorage.setItem('i2uReferrerCode', ref); // Store as referrer code, not user's own code
    }
  }, []);
  
  const getAssessmentUrl = () => {
    // For sharing: use referrer code (who invited current visitor) or user's own code if registered
    const referrerCode = localStorage.getItem('i2uReferrerCode');
    const ownCode = localStorage.getItem('i2uReferralCode');
    const ref = referrerCode || ownCode || '';
    return `${window.location.origin}/value-journey${ref ? `?ref=${ref}` : ''}`;
  };
  
  const getRegistrationUrl = () => {
    const referrerCode = localStorage.getItem('i2uReferrerCode');
    const ownCode = localStorage.getItem('i2uReferralCode');
    const ref = referrerCode || ownCode || '';
    if (ref) {
      return `https://global-leaderboard.i2u.ai/register?ref=${ref}`;
    }
    return "https://global-leaderboard.i2u.ai/register";
  };
  
  // Helper to format gleams - uses actual gleams value from shareData
  const displayGleams = () => ((shareData?.gleams || 0)).toLocaleString();
  
  // Check if level is beyond L0
  const isBeyondL0 = () => shareData?.level && shareData.level !== "L0";
  
  // Display value based on level
  const displayPrimaryScore = () => {
    if (isBeyondL0()) {
      return gleamsToAlicorns(shareData?.gleams || 0);
    }
    return displayGleams();
  };
  
  // Get level-appropriate score text for sharing
  const getShareScoreText = () => {
    if (!shareData) return '';
    if (isBeyondL0()) {
      return `${ALICORN_SYMBOL} I earned ${gleamsToAlicorns(shareData.gleams)} Alicorns`;
    }
    return `${GLEAM_SYMBOL} I earned ${displayGleams()} Gleams`;
  };
  
  const shareOnX = () => {
    const url = getAssessmentUrl();
    const text = shareData 
      ? `${getShareScoreText()} on the Value Journey Quest! Can you beat my score? Take the assessment:`
      : `${ALICORN_SYMBOL} Take the Value Journey Quest and discover your startup potential!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const shareOnLinkedIn = () => {
    const url = getAssessmentUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const shareOnWhatsApp = () => {
    const url = getAssessmentUrl();
    const text = shareData 
      ? `${getShareScoreText()} on the Value Journey Quest! Take the assessment: ${url}`
      : `${ALICORN_SYMBOL} Take the Value Journey Quest and discover your startup potential! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const shareViaEmail = () => {
    const url = getAssessmentUrl();
    const subject = "Take the Value Journey Quest!";
    const scoreText = shareData 
      ? (isBeyondL0() 
          ? `${gleamsToAlicorns(shareData.gleams)} Alicorns (${displayGleams()} ${GLEAM_SYMBOL} Gleams)`
          : `${displayGleams()} ${GLEAM_SYMBOL} Gleams`)
      : null;
    const body = shareData 
      ? `I earned ${scoreText} on the Value Journey Quest! Can you beat my score?\n\nTake the assessment: ${url}`
      : `Take the Value Journey Quest and discover your startup potential!\n\n${url}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(getAssessmentUrl());
    toast({ title: "Link copied!", description: "Share it with your network" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 py-20 px-4">
      <div className="fixed top-4 left-4 z-50">
        <PageNav />
      </div>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
            <CardHeader className="text-center relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-6xl mb-4"
              >
                🦄
              </motion.div>
              <CardTitle className="text-3xl font-heading bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Value Journey Quest
              </CardTitle>
              <p className="text-slate-400">Assessment Results</p>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              {shareData ? (
                <>
                  <div className="text-center">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`text-5xl font-bold bg-gradient-to-r ${isBeyondL0() ? 'from-violet-400 to-purple-400' : 'from-yellow-400 to-amber-400'} bg-clip-text text-transparent`}
                    >
                      {isBeyondL0() ? ALICORN_SYMBOL : GLEAM_SYMBOL} {displayPrimaryScore()}
                    </motion.div>
                    <p className={`${isBeyondL0() ? 'text-violet-400/70' : 'text-yellow-400/70'} mt-2 text-lg font-semibold`}>
                      {isBeyondL0() ? 'Alicorns Earned' : 'Gleams Earned'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                      <span className="text-3xl block mb-2 font-bold text-amber-400">{GLEAM_SYMBOL}</span>
                      <div className="text-2xl font-bold text-amber-400">{displayGleams()}</div>
                      <div className="text-xs text-slate-400">Total Gleams</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                      <Trophy className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-cyan-400">{shareData.level || 'L0'}</div>
                      <div className="text-xs text-slate-400">Level</div>
                    </div>
                  </div>
                  
                  {shareData.chartData && (
                    <div className="mt-6">
                      <SimpleRadarChart data={shareData.chartData} color="#22d3ee" />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl text-slate-300 mb-4">
                    Discover your startup's true potential!
                  </p>
                  <p className="text-slate-400">
                    Take the Value Journey Quest assessment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0)",
                "0 0 30px 10px rgba(139, 92, 246, 0.4)",
                "0 0 0 0 rgba(139, 92, 246, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block rounded-xl"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-xl px-10 py-6 rounded-xl"
              onClick={() => {
                const referrerCode = localStorage.getItem('i2uReferrerCode');
                const ownCode = localStorage.getItem('i2uReferralCode');
                const ref = referrerCode || ownCode;
                setLocation(`/value-journey${ref ? `?ref=${ref}` : ''}`);
              }}
            >
              Take the Assessment
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Share Options */}
        <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-pink-400">
              <Share2 className="h-5 w-5" />
              Share with Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-black hover:bg-gray-900 text-white h-12"
                onClick={shareOnX}
              >
                <span className="text-xl mr-2">𝕏</span>
                Share on X
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                onClick={shareOnLinkedIn}
              >
                <span className="font-bold mr-2">in</span>
                LinkedIn
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white h-12"
                onClick={shareOnWhatsApp}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white h-12"
                onClick={shareViaEmail}
              >
                <Mail className="mr-2 h-5 w-5" />
                Email
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={copyLink}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </CardContent>
        </Card>
        
        {/* Promo */}
        <div className="text-center text-sm text-slate-500">
          Powered by <span className="text-violet-400">i2u.ai</span> - Ideas to Unicorns
        </div>
      </div>
    </div>
  );
}
