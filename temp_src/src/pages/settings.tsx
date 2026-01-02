import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Settings, User, Trophy, Share2, Sparkles, 
  RefreshCw, Check, ArrowLeft, Wand2
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

type NameDisplayType = "real" | "fancy" | "anonymous";

interface NamePreferences {
  fancyName: string;
  leaderboardNameType: NameDisplayType;
  shareNameType: NameDisplayType;
  profileNameType: NameDisplayType;
}

const FANCY_NAME_SUGGESTIONS = [
  "Cosmic Pioneer", "Stellar Voyager", "Quantum Dreamer", "Nova Architect",
  "Astral Founder", "Nebula Builder", "Eclipse Visionary", "Horizon Seeker",
  "Starlight Innovator", "Galactic Trailblazer", "Supernova Creator", "Orbit Maker",
  "Celestial Pathfinder", "Aurora Strategist", "Meteor Maverick", "Comet Chaser"
];

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFancyNameSuggestions, setShowFancyNameSuggestions] = useState(false);
  
  const [preferences, setPreferences] = useState<NamePreferences>({
    fancyName: "",
    leaderboardNameType: "real",
    shareNameType: "real",
    profileNameType: "real"
  });
  
  const [realName, setRealName] = useState("Unicorn Builder");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences({
          fancyName: data.fancyName || "",
          leaderboardNameType: data.leaderboardNameType || "real",
          shareNameType: data.shareNameType || "real",
          profileNameType: data.profileNameType || "real"
        });
        setRealName(data.realName || "Unicorn Builder");
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences)
      });
      
      if (res.ok) {
        toast({
          title: "Preferences Saved!",
          description: "Your display name settings have been updated."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateRandomFancyName = () => {
    const randomName = FANCY_NAME_SUGGESTIONS[Math.floor(Math.random() * FANCY_NAME_SUGGESTIONS.length)];
    setPreferences(prev => ({ ...prev, fancyName: randomName }));
  };

  const getDisplayPreview = (type: NameDisplayType) => {
    switch (type) {
      case "real": return realName;
      case "fancy": return preferences.fancyName || "Set a display name first";
      case "anonymous": return "Anonymous Unicorn";
    }
  };

  const NameTypeSelector = ({ 
    label, 
    icon: Icon, 
    value, 
    onChange,
    description 
  }: { 
    label: string; 
    icon: React.ElementType; 
    value: NameDisplayType; 
    onChange: (v: NameDisplayType) => void;
    description: string;
  }) => (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{label}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      
      <RadioGroup value={value} onValueChange={(v) => onChange(v as NameDisplayType)} className="space-y-2">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
          <RadioGroupItem value="real" id={`${label}-real`} />
          <Label htmlFor={`${label}-real`} className="flex-1 cursor-pointer">
            <span className="text-slate-200">Real Name</span>
            <span className="ml-2 text-sm text-slate-400">({realName})</span>
          </Label>
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
          <RadioGroupItem value="fancy" id={`${label}-fancy`} />
          <Label htmlFor={`${label}-fancy`} className="flex-1 cursor-pointer">
            <span className="text-slate-200">Display Name</span>
            <span className="ml-2 text-sm text-amber-400">
              ({preferences.fancyName || "Not set"})
            </span>
          </Label>
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
          <RadioGroupItem value="anonymous" id={`${label}-anon`} />
          <Label htmlFor={`${label}-anon`} className="flex-1 cursor-pointer">
            <span className="text-slate-200">Anonymous</span>
            <span className="ml-2 text-sm text-slate-400">(Anonymous Unicorn)</span>
          </Label>
        </div>
      </RadioGroup>
      
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-500">
          Preview: <span className="text-violet-400 font-medium">{getDisplayPreview(value)}</span>
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="h-8 w-8 text-violet-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/value-journey")}
            className="text-slate-400 hover:text-white"
            data-testid="button-back-settings"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Display Settings</h1>
              <p className="text-slate-400">Choose how your name appears across the platform</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 border border-amber-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Your Display Name</h3>
                <p className="text-xs text-slate-400">A creative alias for your unicorn journey</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={preferences.fancyName}
                onChange={(e) => setPreferences(prev => ({ ...prev, fancyName: e.target.value }))}
                placeholder="Enter your display name..."
                className="flex-1 bg-slate-900 border-slate-700 focus:border-amber-500"
                data-testid="input-fancy-name"
              />
              <Button
                variant="outline"
                onClick={generateRandomFancyName}
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                data-testid="button-generate-fancy"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Random
              </Button>
            </div>
            
            <button
              onClick={() => setShowFancyNameSuggestions(!showFancyNameSuggestions)}
              className="mt-3 text-sm text-violet-400 hover:text-violet-300"
            >
              {showFancyNameSuggestions ? "Hide suggestions" : "Show more suggestions"}
            </button>
            
            <AnimatePresence>
              {showFancyNameSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {FANCY_NAME_SUGGESTIONS.map((name) => (
                    <button
                      key={name}
                      onClick={() => setPreferences(prev => ({ ...prev, fancyName: name }))}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        preferences.fancyName === name
                          ? "bg-amber-500 text-black"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NameTypeSelector
            label="Leaderboard"
            icon={Trophy}
            value={preferences.leaderboardNameType}
            onChange={(v) => setPreferences(prev => ({ ...prev, leaderboardNameType: v }))}
            description="How others see you on the leaderboard"
          />

          <NameTypeSelector
            label="Sharing"
            icon={Share2}
            value={preferences.shareNameType}
            onChange={(v) => setPreferences(prev => ({ ...prev, shareNameType: v }))}
            description="Your name when sharing achievements"
          />

          <NameTypeSelector
            label="Profile"
            icon={User}
            value={preferences.profileNameType}
            onChange={(v) => setPreferences(prev => ({ ...prev, profileNameType: v }))}
            description="How your profile appears to others"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={savePreferences}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 py-6 text-lg"
              data-testid="button-save-preferences"
            >
              {isSaving ? (
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Check className="h-5 w-5 mr-2" />
              )}
              Save Preferences
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
