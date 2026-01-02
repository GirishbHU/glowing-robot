import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Globe, Play, Users, Building2, GraduationCap, 
  Landmark, Newspaper, Briefcase, Lightbulb, TrendingUp, UserCheck
} from "lucide-react";
import { STAKEHOLDERS, LEVEL_THEMES } from "@/lib/valueJourneyTypes";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const STAKEHOLDER_ICONS: Record<string, React.ReactNode> = {
  founder: <Lightbulb className="h-5 w-5" />,
  mentor: <UserCheck className="h-5 w-5" />,
  investor: <TrendingUp className="h-5 w-5" />,
  talent: <Users className="h-5 w-5" />,
  enabler: <Briefcase className="h-5 w-5" />,
  corporate: <Building2 className="h-5 w-5" />,
  academic: <GraduationCap className="h-5 w-5" />,
  government: <Landmark className="h-5 w-5" />,
  media: <Newspaper className="h-5 w-5" />,
};

const STAKEHOLDER_COLORS: Record<string, string> = {
  founder: "from-amber-500 to-orange-500",
  mentor: "from-violet-500 to-purple-500",
  investor: "from-emerald-500 to-teal-500",
  talent: "from-blue-500 to-cyan-500",
  enabler: "from-pink-500 to-rose-500",
  corporate: "from-slate-500 to-gray-500",
  academic: "from-indigo-500 to-blue-500",
  government: "from-red-500 to-orange-500",
  media: "from-yellow-500 to-amber-500",
};

export default function StakeholdersPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const selectedStakeholder = searchParams.get("type") || null;
  
  const stakeholder = selectedStakeholder 
    ? STAKEHOLDERS.find(s => s.id === selectedStakeholder) 
    : null;

  if (stakeholder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="fixed top-4 right-4 z-50">
          <ThemeSwitcher />
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-4 text-slate-400 hover:text-white"
            onClick={() => setLocation("/stakeholders")}
            data-testid="button-back-stakeholders"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Stakeholders
          </Button>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            {/* Ecosystem Hero Section */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4"
              >
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                  <Globe className="h-6 w-6 text-violet-400" />
                  {stakeholder.name} Ecosystem
                  <span className={`text-lg px-3 py-1 rounded bg-gradient-to-r ${STAKEHOLDER_COLORS[stakeholder.id] || "from-violet-500 to-purple-500"} text-white flex items-center gap-2`}>
                    {STAKEHOLDER_ICONS[stakeholder.id]}
                    {stakeholder.name}
                  </span>
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Live activity, connections, and opportunities for {stakeholder.name}s
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl overflow-hidden border border-violet-500/30 shadow-xl shadow-violet-500/10"
              >
                <iframe
                  src={`/ecosystem?stakeholder=${stakeholder.id}`}
                  className="w-full h-[550px] bg-slate-950"
                  title={`${stakeholder.name} Ecosystem`}
                  data-testid={`ecosystem-iframe-hero-${stakeholder.id}`}
                />
              </motion.div>
            </div>
            
            {/* Stakeholder Details */}
            <motion.div 
              className={`h-3 rounded-t-xl bg-gradient-to-r ${STAKEHOLDER_COLORS[stakeholder.id] || "from-violet-500 to-purple-500"} mb-0`}
            />
            <div className="bg-slate-800/50 rounded-b-xl border border-t-0 border-slate-700/50 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${STAKEHOLDER_COLORS[stakeholder.id] || "from-violet-500 to-purple-500"} flex items-center justify-center text-white`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {STAKEHOLDER_ICONS[stakeholder.id]}
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{stakeholder.name}</h1>
                    <p className="text-slate-400">{stakeholder.description}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                    <h3 className="font-semibold text-white mb-2">Key Focus Areas</h3>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>Assessment dimensions tailored for {stakeholder.name}s</li>
                      <li>Connect with other ecosystem participants</li>
                      <li>Track your Gleams and Alicorns progress</li>
                    </ul>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                    <h3 className="font-semibold text-white mb-2">Opportunities</h3>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>Match with startups at various levels</li>
                      <li>Join the leaderboard competition</li>
                      <li>Share achievements and insights</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    className={`flex-1 bg-gradient-to-r ${STAKEHOLDER_COLORS[stakeholder.id] || "from-violet-500 to-purple-500"} text-white font-semibold`}
                    onClick={() => setLocation("/value-journey")}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Assessment as {stakeholder.name}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600"
                    onClick={() => setLocation("/stakeholders")}
                  >
                    View All Stakeholders
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="h-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 text-slate-400 hover:text-white"
          onClick={() => setLocation("/")}
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Home
        </Button>
        
        {/* Ecosystem Hero Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <Globe className="h-6 w-6 text-violet-400" />
              Stakeholder Ecosystem
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Connect with founders, investors, mentors, and more across the startup journey
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl overflow-hidden border border-violet-500/30 shadow-xl shadow-violet-500/10"
          >
            <iframe
              src="/ecosystem"
              className="w-full h-[500px] bg-slate-950"
              title="Stakeholder Ecosystem"
              data-testid="ecosystem-iframe-stakeholders"
            />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Role</h1>
          <p className="text-slate-400">
            Select your stakeholder type to see tailored ecosystem activity
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {STAKEHOLDERS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-violet-500/50 p-5 cursor-pointer transition-all`}
              onClick={() => setLocation(`/stakeholders?type=${s.id}`)}
              data-testid={`stakeholder-card-${s.id}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${STAKEHOLDER_COLORS[s.id] || "from-violet-500 to-purple-500"} flex items-center justify-center text-white`}>
                  {STAKEHOLDER_ICONS[s.id]}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{s.name}</h3>
                  <p className="text-xs text-slate-400">{s.emoji}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
}
