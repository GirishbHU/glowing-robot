import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Lightbulb, Users, ChevronRight, Edit2, Check, Sparkles, Shield, AlertTriangle, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { UserIdea, IdeaRole } from "@/types/schema";
import { generateFunIdeaCode, PRIVACY_MESSAGES } from '@/lib/idea-codes';

const PSEUDONYM_SUGGESTIONS = [
  { label: "Project X", icon: "🔒" },
  { label: "Idea #001", icon: "🔢" },
  { label: "🚀 Stealth", icon: "" },
  { label: "Alpha", icon: "🅰️" },
  { label: "Phoenix", icon: "🔥" },
  { label: "Nebula", icon: "🌌" },
  { label: "Quantum", icon: "⚛️" },
  { label: "Odyssey", icon: "🌊" },
];

interface ContextSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: UserIdea[];
  roles: IdeaRole[];
  currentIdeaId: number | null;
  currentRoleId: number | null;
  onSelectContext: (ideaId: number | null, roleId: number | null, stakeholder: string) => void;
  onCreateIdea: (name: string, description?: string) => Promise<UserIdea>;
  onAddRole: (ideaId: number, stakeholder: string) => Promise<IdeaRole>;
  sessionId: string;
}

const STAKEHOLDER_OPTIONS = [
  { id: "founder", label: "Founder", emoji: "🚀", description: "Building my own venture" },
  { id: "mentor", label: "Mentor", emoji: "🎓", description: "Guiding other founders" },
  { id: "investor", label: "Investor", emoji: "💰", description: "Evaluating investments" },
  { id: "talent", label: "Talent", emoji: "⭐", description: "Joining a startup" },
  { id: "enabler", label: "Enabler", emoji: "🔧", description: "Supporting the ecosystem" },
  { id: "corporate", label: "Corporate", emoji: "🏢", description: "Corporate innovation" },
  { id: "academic", label: "Academic", emoji: "📚", description: "Research & education" },
  { id: "government", label: "Government", emoji: "🏛️", description: "Policy & support" },
  { id: "media", label: "Media", emoji: "📰", description: "Covering the ecosystem" },
];

export function ContextSwitcher({
  isOpen,
  onClose,
  ideas,
  roles,
  currentIdeaId,
  currentRoleId,
  onSelectContext,
  onCreateIdea,
  onAddRole,
  sessionId,
}: ContextSwitcherProps) {
  const [step, setStep] = useState<"ideas" | "new_idea" | "roles" | "new_role">("ideas");
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(currentIdeaId);
  const [newIdeaName, setNewIdeaName] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("ideas");
      setSelectedIdeaId(currentIdeaId);
    }
  }, [isOpen, currentIdeaId]);

  const selectedIdea = ideas.find(i => i.id === selectedIdeaId);
  const ideaRoles = roles.filter(r => r.ideaId === selectedIdeaId);

  const handleSelectIdea = (ideaId: number) => {
    setSelectedIdeaId(ideaId);
    setStep("roles");
  };

  const handleCreateIdea = async () => {
    if (!newIdeaName.trim()) return;
    setIsCreating(true);
    try {
      const newIdea = await onCreateIdea(newIdeaName.trim(), newIdeaDescription.trim() || undefined);
      setSelectedIdeaId(newIdea.id);
      setNewIdeaName("");
      setNewIdeaDescription("");
      setStep("roles");
    } catch (error) {
      console.error("Failed to create idea:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectRole = (role: IdeaRole) => {
    onSelectContext(role.ideaId, role.id, role.stakeholder);
    onClose();
  };

  const handleAddRole = async (stakeholder: string) => {
    if (!selectedIdeaId) return;
    setIsCreating(true);
    try {
      const newRole = await onAddRole(selectedIdeaId, stakeholder);
      onSelectContext(selectedIdeaId, newRole.id, stakeholder);
      onClose();
    } catch (error) {
      console.error("Failed to add role:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleContinueWithoutIdea = (stakeholder: string) => {
    onSelectContext(null, null, stakeholder);
    onClose();
  };

  const handleInstantStart = async (stakeholder: string) => {
    setIsCreating(true);
    try {
      const autoCode = generateFunIdeaCode(ideas.length);
      const newIdea = await onCreateIdea(autoCode, "Created automatically - rename anytime!");
      const newRole = await onAddRole(newIdea.id, stakeholder);
      onSelectContext(newIdea.id, newRole.id, stakeholder);
      onClose();
    } catch (error) {
      console.error("Failed to create instant idea:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-gradient-to-br from-slate-900 via-violet-950/50 to-slate-900 rounded-2xl p-6 border border-violet-500/30 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
              data-testid="button-close-context-switcher"
            >
              <X className="h-5 w-5" />
            </button>

            {step === "ideas" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <motion.div
                    className="text-4xl mb-2"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🦄
                  </motion.div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent">
                    {PRIVACY_MESSAGES.hero}
                  </h2>
                  <p className="text-slate-400 mt-1 text-sm">{PRIVACY_MESSAGES.tagline}</p>
                </div>

                {ideas.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-amber-500/20 border border-violet-500/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="h-5 w-5 text-amber-400" />
                      </motion.div>
                      <span className="font-bold text-white">Start Now - No Name Required!</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">
                      🎯 We'll auto-assign a secret codename. Rename it later (or never). Your call!
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "founder", label: "Founder", emoji: "🚀" },
                        { id: "investor", label: "Investor", emoji: "💰" },
                        { id: "mentor", label: "Mentor", emoji: "🎓" },
                      ].map((role) => (
                        <Button
                          key={role.id}
                          onClick={() => handleInstantStart(role.id)}
                          disabled={isCreating}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-sm"
                          data-testid={`button-instant-start-${role.id}`}
                        >
                          {role.emoji} {role.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-2">
                      More roles available after you pick one above 👆
                    </p>
                  </motion.div>
                )}

                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                  {ideas.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      <p>Or create a named idea below...</p>
                    </div>
                  ) : (
                    ideas.map((idea) => {
                      const hasRoles = roles.some(r => r.ideaId === idea.id);
                      return (
                        <motion.button
                          key={idea.id}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectIdea(idea.id)}
                          className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${currentIdeaId === idea.id
                            ? "bg-violet-600/30 border-violet-500"
                            : "bg-slate-800/50 border-slate-600/50 hover:border-violet-500/50"
                            }`}
                          data-testid={`button-select-idea-${idea.id}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Lightbulb className="h-5 w-5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">{idea.name}</div>
                            {idea.description && (
                              <p className="text-sm text-slate-400 truncate">{idea.description}</p>
                            )}
                            {hasRoles && (
                              <div className="flex gap-1 mt-1">
                                {roles.filter(r => r.ideaId === idea.id).map(r => (
                                  <span
                                    key={r.id}
                                    className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full text-slate-300"
                                  >
                                    {r.stakeholder}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </motion.button>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep("new_idea")}
                    variant="outline"
                    className="flex-1 border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                    data-testid="button-create-new-idea"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Name My Idea
                  </Button>
                  {ideas.length > 0 && (
                    <Button
                      onClick={() => handleInstantStart("founder")}
                      disabled={isCreating}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                      data-testid="button-quick-start"
                    >
                      <Rocket className="mr-2 h-4 w-4" />
                      {isCreating ? "Creating..." : "Quick Start New"}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {step === "new_idea" && (
              <TooltipProvider>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep("ideas")}
                      className="text-slate-400 hover:text-white"
                    >
                      ← Back
                    </button>
                    <h2 className="text-xl font-bold text-white">Name Your Idea (Optional!)</h2>
                  </div>

                  {/* Privacy Warning Banner - Humorous */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-2xl">🙈</span>
                    </motion.div>
                    <div className="text-sm">
                      <p className="text-emerald-300 font-medium">We Don't Want Your Secrets!</p>
                      <p className="text-emerald-200/70 text-xs mt-1">
                        Seriously! Use codenames, emojis, whatever. We're here for insights, not your pitch deck!
                        <span className="text-emerald-300"> Your NDA stays YOUR NDA.</span> 🔐
                      </p>
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Idea Name *</label>
                      <Input
                        value={newIdeaName}
                        onChange={(e) => setNewIdeaName(e.target.value)}
                        placeholder="e.g., Project Alpha, Idea #42, 🚀 Stealth..."
                        className="bg-slate-800 border-slate-600 text-white"
                        data-testid="input-new-idea-name"
                      />
                      {/* Pseudonym Quick-Pick Suggestions */}
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1.5">Quick pseudonyms:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PSEUDONYM_SUGGESTIONS.map((p) => (
                            <Tooltip key={p.label}>
                              <TooltipTrigger asChild>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setNewIdeaName(p.label)}
                                  className="px-2 py-1 text-xs rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all"
                                >
                                  {p.icon} {p.label}
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>Use "{p.label}" as a codename</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Brief Description (optional)</label>
                      <Input
                        value={newIdeaDescription}
                        onChange={(e) => setNewIdeaDescription(e.target.value)}
                        placeholder="Keep it vague if confidential"
                        className="bg-slate-800 border-slate-600 text-white"
                        data-testid="input-new-idea-description"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep("ideas")}
                      className="flex-1 border-slate-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateIdea}
                      disabled={!newIdeaName.trim() || isCreating}
                      className="flex-1 bg-violet-600 hover:bg-violet-500"
                      data-testid="button-save-new-idea"
                    >
                      {isCreating ? "Creating..." : "Create & Continue"}
                    </Button>
                  </div>
                </motion.div>
              </TooltipProvider>
            )}

            {step === "roles" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep("ideas")}
                    className="text-slate-400 hover:text-white"
                  >
                    ← Back
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white">Select Your Role</h2>
                    {selectedIdea && (
                      <p className="text-sm text-violet-400">For: {selectedIdea.name}</p>
                    )}
                  </div>
                </div>

                {ideaRoles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Your existing roles for this idea:</p>
                    {ideaRoles.map((role) => (
                      <motion.button
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectRole(role)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${currentRoleId === role.id
                          ? "bg-emerald-600/30 border-emerald-500"
                          : "bg-slate-800/50 border-slate-600/50 hover:border-emerald-500/50"
                          }`}
                        data-testid={`button-select-role-${role.id}`}
                      >
                        <span className="text-xl">
                          {STAKEHOLDER_OPTIONS.find(s => s.id === role.stakeholder)?.emoji || "👤"}
                        </span>
                        <span className="font-medium text-white capitalize">{role.stakeholder}</span>
                        {role.isPrimary && (
                          <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                        <Check className="h-4 w-4 text-emerald-400 ml-auto" />
                      </motion.button>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    {ideaRoles.length > 0 ? "Or add a new role:" : "Select a stakeholder role:"}
                  </p>
                  <div className="grid grid-cols-3 gap-2 max-h-[35vh] overflow-y-auto pr-2">
                    {STAKEHOLDER_OPTIONS.filter(
                      s => !ideaRoles.some(r => r.stakeholder === s.id)
                    ).map((stakeholder) => (
                      <motion.button
                        key={stakeholder.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => selectedIdeaId
                          ? handleAddRole(stakeholder.id)
                          : handleContinueWithoutIdea(stakeholder.id)
                        }
                        disabled={isCreating}
                        className="p-3 rounded-xl bg-slate-800/50 border border-slate-600/50 hover:border-violet-500 text-center transition-all"
                        data-testid={`button-add-role-${stakeholder.id}`}
                      >
                        <div className="text-2xl mb-1">{stakeholder.emoji}</div>
                        <div className="text-sm font-medium text-white">{stakeholder.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{stakeholder.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="absolute -bottom-2 left-8 text-2xl"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🦄
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
