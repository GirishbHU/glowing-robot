import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getQuestionsForLevel, StakeholderType } from "@/lib/value-journey-types";
import { useAssessmentContext } from "@/contexts/assessment-context";
import { useToast } from "@/hooks/use-toast";
import QuestLayout from "./quest-layout";
import WelcomeStep from "./welcome-step";
import StakeholderStep from "./stakeholder-step";
import LevelSelectorStep from "./level-selector-step";
import QuestionStep from "./question-step";
import ResultsStep from "./results-step";
import { WizardStep, AssessmentState } from "./wizard-types";
import { calculateGleams } from "@/lib/value-journey-types";

export default function UnicornQuestWizard() {
    const [step, setStep] = useState<WizardStep>("welcome");
    const [state, setState] = useState<AssessmentState>({
        stakeholder: null,
        currentLevel: "L1",
        aspirationalLevel: "L2",
        isAspirational: false,
        assessingEarlierLevel: null,
        answers: {},
        currentQuestionIndex: 0,
        streak: 0,
        lastAnswerTime: null,
        currentCompleted: false,
        aspirationalCompleted: false,
        startTime: null,
    });

    const { toast } = useToast();
    const assessment = useAssessmentContext();

    // Memoized questions for current phase
    const currentQuestions = useMemo(() => {
        const level = state.isAspirational ? state.aspirationalLevel : state.currentLevel;
        const data = getQuestionsForLevel(level);
        return data?.questions || [];
    }, [state.isAspirational, state.currentLevel, state.aspirationalLevel]);

    const currentGleams = useMemo(() => {
        const level = state.isAspirational ? state.aspirationalLevel : state.currentLevel;
        const levelKey = state.isAspirational ? `${level}_asp` : `${level}_cur`;
        return calculateGleams(state.answers[levelKey] || {}, level);
    }, [state.answers, state.isAspirational, state.currentLevel, state.aspirationalLevel]);

    // Handle Transitions
    const nextStep = () => {
        if (step === "welcome") setStep("stakeholder");
        else if (step === "stakeholder") setStep("current_level");
        else if (step === "current_level") setStep("aspirational_level");
        else if (step === "aspirational_level") {
            setStep("assessment");
            setState(prev => ({ ...prev, startTime: Date.now() }));
        }
    };

    const prevStep = () => {
        if (step === "stakeholder") setStep("welcome");
        else if (step === "current_level") setStep("stakeholder");
        else if (step === "aspirational_level") setStep("current_level");
        else if (step === "assessment") setStep("aspirational_level");
    };

    // Handle Answer Logic
    const handleAnswer = (grade: number) => {
        const now = Date.now();
        const level = state.isAspirational ? state.aspirationalLevel : state.currentLevel;
        const levelKey = state.isAspirational ? `${level}_asp` : `${level}_cur`;
        const question = currentQuestions[state.currentQuestionIndex];

        // Update streak if answered within 10 seconds
        const isFast = state.lastAnswerTime ? (now - state.lastAnswerTime < 10000) : true;
        const newStreak = isFast ? state.streak + 1 : 0;

        // Update answers state
        const newAnswers = {
            ...state.answers,
            [levelKey]: {
                ...(state.answers[levelKey] || {}),
                [question.code]: grade
            }
        };

        if (state.currentQuestionIndex < currentQuestions.length - 1) {
            // Move to next question
            setState(prev => ({
                ...prev,
                answers: newAnswers,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
                streak: newStreak,
                lastAnswerTime: now
            }));
        } else {
            // Level Completed
            if (!state.isAspirational) {
                // Current level completed, move to aspirational if not already
                setState(prev => ({
                    ...prev,
                    answers: newAnswers,
                    currentCompleted: true,
                    isAspirational: true,
                    currentQuestionIndex: 0,
                    streak: newStreak + 2, // Bonus for finishing level
                    lastAnswerTime: now
                }));
            } else {
                // Aspirational completed, show results
                setState(prev => ({
                    ...prev,
                    answers: newAnswers,
                    aspirationalCompleted: true
                }));
                setStep("results");
                toast({
                    title: "Quest Accomplished!",
                    description: "You've successfully charted your Unicorn Journey.",
                });
            }
        }
    };

    return (
        <QuestLayout>
            <AnimatePresence mode="wait">
                {step === "welcome" && (
                    <motion.div key="welcome" exit={{ opacity: 0, y: -20 }}>
                        <WelcomeStep onStart={nextStep} />
                    </motion.div>
                )}

                {step === "stakeholder" && (
                    <motion.div key="stakeholder" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <StakeholderStep
                            selected={state.stakeholder}
                            onSelect={(s) => setState(prev => ({ ...prev, stakeholder: s }))}
                            onNext={nextStep}
                        />
                    </motion.div>
                )}

                {step === "current_level" && (
                    <motion.div key="current_level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <LevelSelectorStep
                            title="Where are you now?"
                            description="Select your current operational level in the startup ecosystem."
                            selected={state.currentLevel}
                            onSelect={(l) => setState(prev => ({ ...prev, currentLevel: l }))}
                            onNext={nextStep}
                        />
                    </motion.div>
                )}

                {step === "aspirational_level" && (
                    <motion.div key="aspirational_level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <LevelSelectorStep
                            title="Where are you headed?"
                            description="Select your target level for the next 12-18 months."
                            selected={state.aspirationalLevel}
                            onSelect={(l) => setState(prev => ({ ...prev, aspirationalLevel: l }))}
                            onNext={nextStep}
                            minLevel={state.currentLevel} // Pass current level constraint
                        />
                    </motion.div>
                )}

                {step === "assessment" && (
                    <motion.div key="assessment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <QuestionStep
                            level={state.isAspirational ? state.aspirationalLevel : state.currentLevel}
                            question={{
                                ...currentQuestions[state.currentQuestionIndex],
                                text: currentQuestions[state.currentQuestionIndex].stakeholderQuestions[state.stakeholder || "Startup (Founder)"],
                                grades: currentQuestions[state.currentQuestionIndex].confidenceGuidance?.[state.stakeholder || "Startup (Founder)"]
                            }}
                            index={state.currentQuestionIndex}
                            total={currentQuestions.length}
                            streak={state.streak}
                            currentGleams={currentGleams}
                            onAnswer={handleAnswer}
                            onBack={prevStep}
                        />
                    </motion.div>
                )}

                {step === "results" && (
                    <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }}>
                        <ResultsStep
                            gleams={currentGleams} // Total across all? For now current
                            level={state.currentLevel}
                            aspiration={state.aspirationalLevel}
                            stakeholder={state.stakeholder || "Founder"}
                            onReset={() => {
                                setStep("welcome");
                                setState(prev => ({ ...prev, currentQuestionIndex: 0, answers: {}, isAspirational: false }));
                            }}
                            onUpgrade={() => window.location.href = route('register')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </QuestLayout>
    );
}
