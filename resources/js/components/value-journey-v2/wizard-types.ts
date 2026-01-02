import { StakeholderType } from "@/lib/value-journey-types";
import { PauseState, UserIdea, IdeaRole } from "@/types/schema";

export type WizardStep =
    | "welcome"
    | "stakeholder"
    | "stakeholder_confirm"
    | "current_level"
    | "aspirational_level"
    | "assessment"
    | "results";

export interface AssessmentState {
    stakeholder: StakeholderType | null;
    currentLevel: string;
    aspirationalLevel: string;
    isAspirational: boolean;
    assessingEarlierLevel: string | null;
    answers: Record<string, Record<string, number>>;
    currentQuestionIndex: number;
    streak: number;
    lastAnswerTime: number | null;
    currentCompleted: boolean;
    aspirationalCompleted: boolean;
    startTime: number | null;
}

export interface MilestoneBadge {
    id: string;
    name: string;
    icon: string;
    description: string;
    gradient: string;
    shareMessage: string;
    requirement: string;
}

export const MILESTONE_BADGES: MilestoneBadge[] = [
    {
        id: "first_spark",
        name: "First Spark",
        icon: "✨",
        description: "Completed your first L0 assessment",
        gradient: "from-yellow-500 to-amber-500",
        shareMessage: "I just earned my First Spark badge on Value Journey Quest! 🔥 Starting my journey to unicorn status!",
        requirement: "Complete L0 current assessment"
    },
    {
        id: "dual_vision",
        name: "Dual Vision",
        icon: "👁️",
        description: "Completed both current and aspirational assessments",
        gradient: "from-violet-500 to-purple-500",
        shareMessage: "I've unlocked Dual Vision! 👁️ Assessed where I am AND where I want to be on Value Journey Quest!",
        requirement: "Complete both current & aspirational"
    },
    {
        id: "level_up",
        name: "Level Up Hero",
        icon: "🚀",
        description: "Progressed beyond Spark to higher levels",
        gradient: "from-cyan-500 to-blue-500",
        shareMessage: "I'm a Level Up Hero! 🚀 Moving beyond L0 Spark on Value Journey Quest!",
        requirement: "Progress to L1 or higher"
    },
    {
        id: "gleam_hunter",
        name: "Gleam Hunter",
        icon: "💎",
        description: "Earned 500+ Gleams in total",
        gradient: "from-emerald-500 to-teal-500",
        shareMessage: "I'm a Gleam Hunter! 💎 Earned 500+ Gleams on Value Journey Quest! Can you beat me?",
        requirement: "Earn 500+ total Gleams"
    },
    {
        id: "alicorn_rider",
        name: "Alicorn Rider",
        icon: "🦄",
        description: "Earned 10+ Alicorns in total",
        gradient: "from-pink-500 to-rose-500",
        shareMessage: "I'm an Alicorn Rider! 🦄 Earned 10+ Alicorns on Value Journey Quest! Join the herd!",
        requirement: "Earn 10+ total Alicorns"
    }
];
