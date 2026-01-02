import { useState, useEffect } from "react";
import AssessmentWizard from "@/components/Calculator/AssessmentWizard";
import { safeGetItem, safeSetItem } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Target, ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight, Rocket, Share2, Plus, TrendingUp, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

import Footer from "@/components/layout/Footer";
import PageNav from "@/components/layout/PageNav";

const PHASES = [
  { id: "1", short: "Idea", full: "Idea Validation", color: "amber" },
  { id: "2", short: "Product", full: "Product Dev", color: "orange" },
  { id: "3", short: "Market", full: "Market Entry", color: "green" },
  { id: "4", short: "Growth", full: "Growth & Scale", color: "blue" },
  { id: "5", short: "Mature", full: "Maturity", color: "indigo" },
  { id: "6", short: "Lead", full: "Leadership", color: "purple" },
  { id: "7", short: "Unicorn", full: "Unicorn+", color: "pink" },
];

const PHASE_COLORS: Record<string, string> = {
  "1": "bg-amber-500",
  "2": "bg-orange-500",
  "3": "bg-green-500",
  "4": "bg-blue-500",
  "5": "bg-indigo-500",
  "6": "bg-purple-500",
  "7": "bg-yellow-500",
};

export default function CalculatorLanding() {
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState("founder");
  
  const stakeholderTypes = [
    { id: "founder", label: "Fellow Founders", icon: <Rocket className="h-4 w-4" /> },
    { id: "investor", label: "Investors", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "mentor", label: "Mentors & Advisors", icon: <Lightbulb className="h-4 w-4" /> },
  ];
  
  const getShareMessage = () => {
    const messages: Record<string, string> = {
      founder: "Fellow founders, take the Unicorn Potential assessment and compare scores with me!",
      investor: "Investors, check out this startup readiness assessment tool!",
      mentor: "Mentors, help your startups assess their unicorn potential!",
    };
    return `${messages[selectedStakeholder]} Take the assessment: https://i2u.ai/value-stories/calculator`;
  };
  
  const handleShare = (platform: string) => {
    const message = encodeURIComponent(getShareMessage());
    const url = encodeURIComponent("https://i2u.ai/value-stories/calculator");
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${message}`,
      copy: ""
    };
    
    if (platform === "copy") {
      navigator.clipboard.writeText(getShareMessage());
      toast({ title: "Copied!", description: "Share message copied to clipboard" });
    } else {
      window.open(shareUrls[platform], "_blank");
    }
    setShowShareModal(false);
  };

  const [selectedPhase, setSelectedPhase] = useState<string>(() => {
    const saved = safeGetItem('lastSelectedPhase');
    if (saved && parseInt(saved) >= 1 && parseInt(saved) <= 7) {
      return saved;
    }
    return "2";
  });
  
  // Calculate visible window (show 3 phases centered on selection)
  const getVisibleRange = (phase: string) => {
    const idx = parseInt(phase) - 1;
    let start = Math.max(0, idx - 1);
    let end = start + 3;
    if (end > 7) {
      end = 7;
      start = 4;
    }
    return { start, end };
  };
  
  const { start: visibleStart, end: visibleEnd } = getVisibleRange(selectedPhase);
  const visiblePhases = PHASES.slice(visibleStart, visibleEnd);
  
  const canScrollLeft = visibleStart > 0;
  const canScrollRight = visibleEnd < 7;
  
  const scrollLeft = () => {
    const current = parseInt(selectedPhase);
    if (current > 1) {
      setSelectedPhase(String(current - 1));
    }
  };
  
  const scrollRight = () => {
    const current = parseInt(selectedPhase);
    if (current < 7) {
      setSelectedPhase(String(current + 1));
    }
  };

  useEffect(() => {
    safeSetItem('lastSelectedPhase', selectedPhase);
  }, [selectedPhase]);

  return (
    <div className="min-h-screen bg-background pb-0">
      <div className="fixed top-4 left-4 z-50">
        <PageNav />
      </div>
      {/* CTA Cards - Fixed on sides like ears (visible on all pages) */}
      <div className="hidden lg:block fixed left-4 top-1/4 z-40 w-48">
        <Card className="border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-purple-500/10 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 rounded-full bg-violet-500/20">
                <Share2 className="h-5 w-5 text-violet-500" />
              </div>
              <h4 className="font-bold text-sm">Share, Invite, Challenge...</h4>
              <p className="text-xs text-muted-foreground">Challenge your tribe!</p>
              <Button 
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                onClick={() => setShowShareModal(true)}
                data-testid="button-ear-share"
              >
                Share
              </Button>
              <div className="flex flex-col gap-1 w-full mt-1">
                {stakeholderTypes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedStakeholder(s.id);
                      setShowShareModal(true);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                      selectedStakeholder === s.id 
                        ? "bg-violet-500 text-white" 
                        : "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20"
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:block fixed right-4 top-1/4 z-40 w-48">
        <Card className="border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-blue-500/10 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 rounded-full bg-cyan-500/20">
                <Plus className="h-5 w-5 text-cyan-500" />
              </div>
              <h4 className="font-bold text-sm">Assess Phase</h4>
              <p className="text-xs text-muted-foreground">Reality vs Aspiration</p>
              <Button 
                size="sm"
                variant="outline"
                className="border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10 w-full"
                onClick={() => setStarted(true)}
                data-testid="button-ear-add-phase"
              >
                <Plus className="h-4 w-4 mr-1" /> Start
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Share Modal (available on all pages) */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <Card className="max-w-md w-full text-left" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-5 w-5 text-violet-500" />
                <h3 className="font-bold text-lg">Share & Challenge Your Tribe</h3>
              </div>
              <p className="text-sm text-muted-foreground">Make a bold statement and invite others to take the assessment!</p>
              
              {/* Stakeholder Selection */}
              <div className="grid grid-cols-3 gap-2">
                {stakeholderTypes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStakeholder(s.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-all ${
                      selectedStakeholder === s.id 
                        ? "bg-violet-500 text-white" 
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              
              {/* Preview Message */}
              <div className="p-3 bg-muted rounded-lg text-sm">
                {getShareMessage()}
              </div>
              
              {/* Share Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleShare("twitter")} className="flex-col h-auto py-3">
                  <span className="text-lg">𝕏</span>
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")} className="flex-col h-auto py-3">
                  <span className="text-lg">in</span>
                  <span className="text-xs">LinkedIn</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")} className="flex-col h-auto py-3">
                  <span className="text-lg">📱</span>
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("copy")} className="flex-col h-auto py-3">
                  <span className="text-lg">📋</span>
                  <span className="text-xs">Copy</span>
                </Button>
              </div>
              
              {/* Register for Referral Link */}
              <Button 
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                onClick={() => window.open('https://i2u.ai/register', '_blank')}
              >
                Get Personal Referral Link & Earn Rewards
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!started ? (
        <div className="container mx-auto px-4 pt-8 max-w-5xl text-center pb-20">
          {/* Mobile CTA - Compact header for smaller screens */}
          <div className="lg:hidden flex gap-2 mb-6 justify-center">
            <Button 
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="h-4 w-4 mr-1" /> Share & Invite
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="border-cyan-500/50 text-cyan-600"
              onClick={() => setStarted(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Assess Phase
            </Button>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 block mx-auto w-fit">
            <Sparkles size={14} /> AI-Powered Value Assessment
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground mb-8 leading-tight animate-in fade-in slide-in-from-bottom-5 delay-100">
            Measure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">Unicorn Potential</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-6 delay-200">
            Identify your valuation gaps, friction points (EiR), and growth dimensions compared to real unicorns like Airbnb, Stripe, and Tesla.
          </p>
          
          {/* Phase Selection Toggle - Scrollable showing 3 at a time */}
          <div className="max-w-lg mx-auto mb-8 p-4 bg-card/50 backdrop-blur border rounded-2xl animate-in fade-in slide-in-from-bottom-7 delay-300">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="font-medium">Select Your Growth Phase</span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full transition-all ${
                  canScrollLeft 
                    ? "bg-muted hover:bg-muted/80 text-foreground" 
                    : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                }`}
                data-testid="button-scroll-left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex gap-2">
                {visiblePhases.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPhase(p.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-w-[100px] ${
                      selectedPhase === p.id 
                        ? `${PHASE_COLORS[p.id]} text-white shadow-lg scale-105` 
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`button-phase-${p.id}`}
                  >
                    <div className="text-xs opacity-70">Phase {p.id}</div>
                    <div>{p.short}</div>
                  </button>
                ))}
              </div>
              
              {selectedPhase === "7" ? (
                <span className="p-2 text-xs text-muted-foreground italic whitespace-nowrap">Coming Soon</span>
              ) : (
                <button
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className={`p-2 rounded-full transition-all ${
                    canScrollRight 
                      ? "bg-muted hover:bg-muted/80 text-foreground" 
                      : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                  }`}
                  data-testid="button-scroll-right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Selected: <span className={`font-medium ${(PHASE_COLORS[selectedPhase] || 'bg-primary').replace('bg-', 'text-')}`}>
                Phase {selectedPhase}: {PHASES[parseInt(selectedPhase) - 1]?.full || 'Unknown'}
              </span>
            </p>
          </div>

          {/* Dimension & EiR Cards */}
          <div className="flex flex-col md:flex-row gap-8 justify-center mb-12 animate-in fade-in slide-in-from-bottom-8 delay-400">
            <div className="bg-card/50 backdrop-blur border p-6 rounded-2xl max-w-sm text-left hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-4">
                <Target size={24} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">Dimension Scoring</h3>
              <p className="text-sm text-muted-foreground">Evaluate your startup's core growth drivers against industry benchmarks.</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur border p-6 rounded-2xl max-w-sm text-left hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">Friction Analysis (EiR)</h3>
              <p className="text-sm text-muted-foreground">Pinpoint the "Elephants in the Room" risks that typically kill startups at your stage.</p>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={() => setStarted(true)}
            className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 animate-in zoom-in duration-500 delay-500"
          >
            Start Assessment <ArrowRight className="ml-2" />
          </Button>
          
          {/* Secondary link to Insights */}
          <div className="mt-8 animate-in fade-in delay-700">
            <Link href="/value-stories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
              Explore Unicorn Insights <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 pt-10 max-w-4xl pb-20">
           <AssessmentWizard />
        </div>
      )}
      
      <Footer />
    </div>
  );
}
