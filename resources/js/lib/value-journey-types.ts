import valueJourneyMatrix from './value-journey-matrix.json';

export type StakeholderType =
  | "Startup (Founder)"
  | "Investor"
  | "Corporate Partner"
  | "Enabler (Accelerator)"
  | "Facilitator (Services)"
  | "Government/Policy"
  | "Influencer/Media"
  | "Mentor"
  | "Professional (Talent)";

export const STAKEHOLDERS: { id: StakeholderType; name: string; emoji: string; description: string }[] = [
  { id: "Startup (Founder)", name: "Founder", emoji: "🚀", description: "Building the next big thing" },
  { id: "Investor", name: "Investor", emoji: "💰", description: "Backing visionary founders" },
  { id: "Corporate Partner", name: "Corporate", emoji: "🏢", description: "Strategic partnerships" },
  { id: "Enabler (Accelerator)", name: "Accelerator", emoji: "⚡", description: "Enabling startup growth" },
  { id: "Facilitator (Services)", name: "Facilitator", emoji: "🛠️", description: "Professional services" },
  { id: "Government/Policy", name: "Government", emoji: "🏛️", description: "Policy & ecosystem" },
  { id: "Influencer/Media", name: "Influencer", emoji: "📣", description: "Amplifying stories" },
  { id: "Mentor", name: "Mentor", emoji: "🧭", description: "Guiding the journey" },
  { id: "Professional (Talent)", name: "Talent", emoji: "👤", description: "Joining the mission" },
];

export interface Level {
  level: string;
  levelName: string;
  levelFocus: string;
}

export const LEVELS: Level[] = valueJourneyMatrix.levels;

export const LEVEL_THEMES: Record<string, { color: string; gradient: string; emoji: string }> = {
  "L1": { color: "text-red-500", gradient: "from-red-500 to-red-600", emoji: "🔥" },
  "L2": { color: "text-orange-500", gradient: "from-orange-500 to-orange-600", emoji: "🎯" },
  "L3": { color: "text-yellow-500", gradient: "from-yellow-500 to-yellow-600", emoji: "🔨" },
  "L4": { color: "text-green-500", gradient: "from-green-500 to-green-600", emoji: "🚀" },
  "L5": { color: "text-teal-500", gradient: "from-teal-500 to-teal-600", emoji: "📈" },
  "L6": { color: "text-blue-500", gradient: "from-blue-500 to-blue-600", emoji: "💎" },
  "L7": { color: "text-indigo-500", gradient: "from-indigo-500 to-indigo-600", emoji: "👑" },
  "L8": { color: "text-violet-500", gradient: "from-violet-500 to-violet-600", emoji: "🦄" },
  "L9": { color: "text-purple-500", gradient: "from-purple-500 to-purple-600", emoji: "⭐" },
};

export const LEVEL_NAMES: Record<string, string> = {
  "L1": "Spark",
  "L2": "Hunt",
  "L3": "Build",
  "L4": "Launch",
  "L5": "Rocket",
  "L6": "Optimize",
  "L7": "Lead",
  "L8": "Unicorn",
  "L9": "Jedi",
};

export const getLevelDisplayName = (level: string): string => {
  const name = LEVEL_NAMES[level];
  return name ? `${name} Level` : level;
};

export type ConfidenceGuidance = {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
};

export interface Question {
  category: "Dimension" | "EiR (Elephants in the Room)";
  dimension?: string;
  code: string;
  gleams: number;
  alicorns: number;
  stakeholderQuestions: Record<StakeholderType, string>;
  confidenceGuidance?: Partial<Record<StakeholderType, ConfidenceGuidance>>;
}

export const getConfidenceGuidanceForQuestion = (
  question: Question,
  stakeholder: StakeholderType,
  confidenceLevel: 1 | 2 | 3 | 4 | 5
): string | undefined => {
  return question.confidenceGuidance?.[stakeholder]?.[confidenceLevel];
};

export interface LevelQuestions {
  level: string;
  levelName: string;
  levelFocus: string;
  questions: Question[];
}

export const getQuestionsForLevel = (level: string): LevelQuestions | undefined => {
  return (valueJourneyMatrix.questionsByLevel as Record<string, LevelQuestions>)[level];
};

export const getQuestionForStakeholder = (
  level: string,
  questionIndex: number,
  stakeholder: StakeholderType
): string | undefined => {
  const levelData = getQuestionsForLevel(level);
  if (!levelData || !levelData.questions[questionIndex]) return undefined;
  return levelData.questions[questionIndex].stakeholderQuestions[stakeholder];
};

export interface AssessmentResult {
  stakeholder: StakeholderType;
  currentLevel: string;
  aspirationalLevel: string;
  currentScore: number;
  aspirationalScore: number;
  gap: number;
  gleamsEarned: number;
  alicornsEarned: number;
  timestamp: string;
  answers: {
    level: string;
    isAspirational: boolean;
    responses: Record<string, number>;
  }[];
}

export const ANSWER_OPTIONS = [
  { value: 1, label: "Not at all", emoji: "😔", color: "bg-red-500" },
  { value: 2, label: "Slightly", emoji: "😕", color: "bg-orange-500" },
  { value: 3, label: "Moderately", emoji: "😐", color: "bg-yellow-500" },
  { value: 4, label: "Mostly", emoji: "🙂", color: "bg-green-500" },
  { value: 5, label: "Absolutely", emoji: "😄", color: "bg-emerald-500" },
];

export const calculateLevelScore = (answers: Record<string, number>): number => {
  const values = Object.values(answers);
  if (values.length === 0) return 0;
  const total = values.reduce((sum, v) => sum + v, 0);
  return Math.round((total / (values.length * 5)) * 100);
};

export const calculateGleams = (answers: Record<string, number>, level: string): number => {
  const levelData = getQuestionsForLevel(level);
  if (!levelData) return 0;
  let gleams = 0;
  levelData.questions.forEach((q, i) => {
    const answer = answers[q.code] || 0;
    gleams += (answer / 5) * q.gleams;
  });
  return Math.round(gleams);
};

export const calculateAlicorns = (answers: Record<string, number>, level: string): number => {
  return Math.round(calculateGleams(answers, level) / 100 * 100) / 100;
};
