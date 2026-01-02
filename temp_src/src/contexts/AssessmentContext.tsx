import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface AssessmentContextType {
  totalGleams: number;
  setTotalGleams: (gleams: number) => void;
  currentLevel: string;
  setCurrentLevel: (level: string) => void;
  assessmentProgress: number;
  setAssessmentProgress: (progress: number) => void;
  hasCompletedAssessment: boolean;
  setHasCompletedAssessment: (completed: boolean) => void;
  hasNewResults: boolean;
  setHasNewResults: (hasNew: boolean) => void;
  leaderboardPosition: number | null;
  setLeaderboardPosition: (position: number | null) => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  showResultsPopup: boolean;
  setShowResultsPopup: (show: boolean) => void;
  triggerStartAssessment: boolean;
  setTriggerStartAssessment: (trigger: boolean) => void;
  isInAssessment: boolean;
  setIsInAssessment: (inAssessment: boolean) => void;
  triggerHome: boolean;
  setTriggerHome: (trigger: boolean) => void;
  triggerBack: boolean;
  setTriggerBack: (trigger: boolean) => void;
  showPauseModal: boolean;
  setShowPauseModal: (show: boolean) => void;
  showExitModal: boolean;
  setShowExitModal: (show: boolean) => void;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [totalGleams, setTotalGleams] = useState(0);
  const [currentLevel, setCurrentLevel] = useState("L0");
  const [assessmentProgress, setAssessmentProgress] = useState(0);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [hasNewResults, setHasNewResults] = useState(false);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  const [triggerStartAssessment, setTriggerStartAssessment] = useState(false);
  const [isInAssessment, setIsInAssessment] = useState(false);
  const [triggerHome, setTriggerHome] = useState(false);
  const [triggerBack, setTriggerBack] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  return (
    <AssessmentContext.Provider value={{
      totalGleams,
      setTotalGleams,
      currentLevel,
      setCurrentLevel,
      assessmentProgress,
      setAssessmentProgress,
      hasCompletedAssessment,
      setHasCompletedAssessment,
      hasNewResults,
      setHasNewResults,
      leaderboardPosition,
      setLeaderboardPosition,
      showLeaderboard,
      setShowLeaderboard,
      showResultsPopup,
      setShowResultsPopup,
      triggerStartAssessment,
      setTriggerStartAssessment,
      isInAssessment,
      setIsInAssessment,
      triggerHome,
      setTriggerHome,
      triggerBack,
      setTriggerBack,
      showPauseModal,
      setShowPauseModal,
      showExitModal,
      setShowExitModal
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessmentContext() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessmentContext must be used within an AssessmentProvider");
  }
  return context;
}

export function useAssessmentContextSafe() {
  return useContext(AssessmentContext);
}
