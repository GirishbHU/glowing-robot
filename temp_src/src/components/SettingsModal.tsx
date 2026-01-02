import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResizableModal } from "@/components/ui/resizable-modal";
import { 
  Settings, User, Trophy, Share2, Sparkles, 
  RefreshCw, Check, Wand2
} from "lucide-react";
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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
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
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen]);

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
        onClose();
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
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">{label}</h3>
          <p className="text-[10px] text-slate-400">{description}</p>
        </div>
      </div>
      
      <RadioGroup value={value} onValueChange={(v) => onChange(v as NameDisplayType)} className="space-y-1">
        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
          <RadioGroupItem value="real" id={`${label}-real`} className="h-3 w-3" />
          <Label htmlFor={`${label}-real`} className="flex-1 cursor-pointer text-xs">
            <span className="text-slate-200">Real</span>
            <span className="ml-1 text-slate-500">({realName})</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
          <RadioGroupItem value="fancy" id={`${label}-fancy`} className="h-3 w-3" />
          <Label htmlFor={`${label}-fancy`} className="flex-1 cursor-pointer text-xs">
            <span className="text-slate-200">Display</span>
            <span className="ml-1 text-amber-400">({preferences.fancyName || "Not set"})</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer">
          <RadioGroupItem value="anonymous" id={`${label}-anon`} className="h-3 w-3" />
          <Label htmlFor={`${label}-anon`} className="flex-1 cursor-pointer text-xs">
            <span className="text-slate-200">Anonymous</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <ResizableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Display Settings"
      subtitle="Choose how your name appears"
      icon={<Settings className="h-5 w-5 text-white" />}
      defaultWidth={450}
      defaultHeight={600}
      minWidth={350}
      minHeight={400}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <RefreshCw className="h-6 w-6 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                <Wand2 className="h-4 w-4 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Your Display Name</h3>
                <p className="text-[10px] text-slate-400">A creative alias</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={preferences.fancyName}
                onChange={(e) => setPreferences(prev => ({ ...prev, fancyName: e.target.value }))}
                placeholder="Enter display name..."
                className="flex-1 bg-slate-900 border-slate-700 focus:border-amber-500 text-sm h-9"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={generateRandomFancyName}
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 h-9"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>
            
            <button
              onClick={() => setShowFancyNameSuggestions(!showFancyNameSuggestions)}
              className="mt-2 text-xs text-violet-400 hover:text-violet-300"
            >
              {showFancyNameSuggestions ? "Hide" : "Show"} suggestions
            </button>
            
            <AnimatePresence>
              {showFancyNameSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex flex-wrap gap-1"
                >
                  {FANCY_NAME_SUGGESTIONS.slice(0, 8).map((name) => (
                    <button
                      key={name}
                      onClick={() => setPreferences(prev => ({ ...prev, fancyName: name }))}
                      className={`px-2 py-1 rounded-full text-xs transition-all ${
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
            description="How others see you"
          />

          <NameTypeSelector
            label="Sharing"
            icon={Share2}
            value={preferences.shareNameType}
            onChange={(v) => setPreferences(prev => ({ ...prev, shareNameType: v }))}
            description="When sharing achievements"
          />

          <NameTypeSelector
            label="Profile"
            icon={User}
            value={preferences.profileNameType}
            onChange={(v) => setPreferences(prev => ({ ...prev, profileNameType: v }))}
            description="Your profile display"
          />

          <Button
            onClick={savePreferences}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Preferences
          </Button>
        </div>
      )}
    </ResizableModal>
  );
}
