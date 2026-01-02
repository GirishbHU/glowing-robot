import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, Pause, Play, CheckCircle, Trophy, Sparkles, 
  MapPin, Calendar, Timer, AlertCircle, Volume2, VolumeX,
  RefreshCw, History, ChevronDown, ChevronUp, Bell
} from "lucide-react";
import { LEVELS, getLevelDisplayName } from "@/lib/valueJourneyTypes";
import type { PauseState } from "@shared/schema";

interface LevelCompletion {
  id: number;
  level: string;
  assessmentType: string;
  score: number;
  gleamsEarned: number;
  alicornsEarned: string;
  completedAt: string;
  ipAddress: string;
}

interface UserProgress {
  id: number;
  stakeholder: string;
  totalGleams: number;
  totalAlicorns: string;
  currentPauseState: PauseState | null;
  createdAt: string;
}

interface UserProgressPanelProps {
  userId: string;
  onResumeAssessment?: (pauseState: PauseState) => void;
  onStartNewLevel?: (level: string) => void;
  compact?: boolean;
}

const GLEAM_SYMBOL = "Ğ";
const ALICORN_SYMBOL = "🦄";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const maskIP = (ip: string) => {
  if (!ip || ip === 'unknown') return 'Unknown';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip.substring(0, 8) + '...';
};

export function UserProgressPanel({ 
  userId, 
  onResumeAssessment,
  onStartNewLevel,
  compact = false 
}: UserProgressPanelProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [completions, setCompletions] = useState<LevelCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/value-journey/progress/${userId}`);
      const data = await response.json();
      if (data.success) {
        setProgress(data.progress);
        setCompletions(data.completions || []);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  const completedLevels = Array.from(new Set(completions.map(c => c.level)));
  const latestCompletion = completions[0];
  const pauseState = progress.currentPauseState;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-xl p-4 border border-violet-500/30 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Welcome back!</div>
              <div className="font-semibold text-white">
                {GLEAM_SYMBOL} {progress.totalGleams.toLocaleString()} Gleams | {ALICORN_SYMBOL} {parseFloat(progress.totalAlicorns).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Alicorns
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pauseState?.isPaused && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500"
                onClick={() => onResumeAssessment?.(pauseState)}
                data-testid="button-resume-paused"
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHistory(!showHistory)}
              data-testid="button-toggle-history"
            >
              <History className="h-4 w-4 mr-1" />
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-violet-500/20"
            >
              <div className="text-sm text-slate-400 mb-2">Completed Assessments</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {completions.map((completion) => (
                  <div 
                    key={completion.id}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="font-medium">{getLevelDisplayName(completion.level)}</span>
                      <Badge variant="outline" className="text-xs">
                        {completion.assessmentType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="text-yellow-400">{GLEAM_SYMBOL} {completion.gleamsEarned}</span>
                      <span>{formatDate(completion.completedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-violet-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-400">
          <Trophy className="h-5 w-5" />
          Your Journey Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {GLEAM_SYMBOL} {progress.totalGleams.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Gleams</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-violet-400">
              {ALICORN_SYMBOL} {parseFloat(progress.totalAlicorns).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-slate-400">Alicorns Earned</div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Stakeholder</span>
            <Badge className="bg-violet-500/20 text-violet-300">{progress.stakeholder}</Badge>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Levels Completed</span>
            <span className="font-semibold text-white">{completedLevels.length} / {LEVELS.length}</span>
          </div>
          <Progress value={(completedLevels.length / LEVELS.length) * 100} className="h-2" />
        </div>

        {pauseState?.isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4 border border-amber-500/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <Pause className="h-5 w-5 text-amber-400" />
              <span className="font-semibold text-amber-400">Assessment Paused</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              You paused at {getLevelDisplayName(pauseState.level)}, Question {pauseState.questionIndex + 1}
            </p>
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
              onClick={() => onResumeAssessment?.(pauseState)}
              data-testid="button-resume-assessment"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Assessment
            </Button>
          </motion.div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-300">Completion History</div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {completions.map((completion) => (
              <motion.div
                key={completion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="font-medium">{getLevelDisplayName(completion.level)}</span>
                    <Badge 
                      variant="outline" 
                      className={completion.assessmentType === 'aspirational' ? 'border-purple-500 text-purple-400' : 'border-cyan-500 text-cyan-400'}
                    >
                      {completion.assessmentType}
                    </Badge>
                  </div>
                  <span className="text-yellow-400 font-semibold">
                    {GLEAM_SYMBOL} {completion.gleamsEarned}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(completion.completedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {maskIP(completion.ipAddress)}
                  </div>
                </div>
              </motion.div>
            ))}
            {completions.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                No assessments completed yet. Start your journey!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PauseBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPause: (durationMinutes: number) => void;
  currentLevel: string;
  currentQuestionIndex: number;
}

const BREAK_DURATIONS = [
  { label: "2 min", value: 2, description: "Quick stretch" },
  { label: "5 min", value: 5, description: "Coffee break" },
  { label: "15 min", value: 15, description: "Short rest" },
  { label: "30 min", value: 30, description: "Power nap" },
  { label: "1 hour", value: 60, description: "Meal break" },
  { label: "2 hours", value: 120, description: "Extended break" },
  { label: "6 hours", value: 360, description: "Long break" },
  { label: "12 hours", value: 720, description: "Come back tomorrow" },
];

export function PauseBreakModal({ 
  isOpen, 
  onClose, 
  onPause,
  currentLevel,
  currentQuestionIndex 
}: PauseBreakModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [customDuration, setCustomDuration] = useState(5);
  const [useCustom, setUseCustom] = useState(false);

  const handlePause = () => {
    const duration = useCustom ? customDuration : selectedDuration;
    onPause(duration);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-violet-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-400">
            <Pause className="h-5 w-5" />
            Take a Break
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Your progress will be saved. We'll remind you when it's time to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Progress saved at: <span className="font-semibold text-white">{getLevelDisplayName(currentLevel)}</span>
            </div>
            <div className="text-slate-500 mt-1">
              Question {currentQuestionIndex + 1}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">Select break duration</div>
            <div className="grid grid-cols-4 gap-2">
              {BREAK_DURATIONS.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value && !useCustom ? "default" : "outline"}
                  size="sm"
                  className={`flex-col h-auto py-2 ${
                    selectedDuration === duration.value && !useCustom
                      ? "bg-violet-600 border-violet-500"
                      : "border-slate-600 hover:border-violet-500"
                  }`}
                  onClick={() => {
                    setSelectedDuration(duration.value);
                    setUseCustom(false);
                  }}
                  data-testid={`button-break-${duration.value}`}
                >
                  <span className="font-semibold">{duration.label}</span>
                  <span className="text-[10px] text-slate-400">{duration.description}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Or set custom duration</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseCustom(!useCustom)}
                className={useCustom ? "text-violet-400" : "text-slate-500"}
              >
                {useCustom ? "Using custom" : "Use custom"}
              </Button>
            </div>
            {useCustom && (
              <div className="space-y-2">
                <Slider
                  value={[customDuration]}
                  onValueChange={(value) => setCustomDuration(value[0])}
                  min={1}
                  max={720}
                  step={1}
                  className="py-2"
                />
                <div className="text-center text-sm">
                  <span className="font-semibold text-violet-400">
                    {customDuration >= 60 
                      ? `${Math.floor(customDuration / 60)} hour${Math.floor(customDuration / 60) > 1 ? 's' : ''} ${customDuration % 60 > 0 ? `${customDuration % 60} min` : ''}`
                      : `${customDuration} minutes`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
            <Bell className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              We'll play an alarm sound when your break ends. Make sure your device volume is on!
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} data-testid="button-cancel-pause">
            Cancel
          </Button>
          <Button 
            onClick={handlePause}
            className="bg-gradient-to-r from-violet-600 to-purple-600"
            data-testid="button-confirm-pause"
          >
            <Pause className="h-4 w-4 mr-2" />
            Start Break
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BreakCountdownProps {
  pauseState: PauseState;
  onResume: () => void;
  onExtend: () => void;
}

export function BreakCountdown({ pauseState, onResume, onExtend }: BreakCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!pauseState.alarmTime) return;

    const updateTimer = () => {
      const remaining = pauseState.alarmTime! - Date.now();
      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= 0 && !isAlarmPlaying) {
        setIsAlarmPlaying(true);
        if (!isMuted) {
          playAlarm();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pauseState.alarmTime, isAlarmPlaying, isMuted]);

  const playAlarm = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 3000);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = pauseState.breakDuration > 0 
    ? ((pauseState.breakDuration - timeRemaining) / pauseState.breakDuration) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md"
    >
      <div className="text-center space-y-8 max-w-md mx-auto p-8">
        <motion.div
          animate={{ 
            scale: isAlarmPlaying ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: isAlarmPlaying ? Infinity : 0 }}
        >
          <Timer className={`h-24 w-24 mx-auto ${isAlarmPlaying ? 'text-amber-400' : 'text-violet-400'}`} />
        </motion.div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isAlarmPlaying ? "Break's Over!" : "Taking a Break"}
          </h2>
          <p className="text-slate-400">
            {isAlarmPlaying 
              ? "Time to continue your assessment journey!" 
              : `Resting at ${getLevelDisplayName(pauseState.level)}, Question ${pauseState.questionIndex + 1}`
            }
          </p>
        </div>

        {!isAlarmPlaying && (
          <>
            <div className="text-6xl font-mono font-bold text-violet-400">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="h-2 max-w-xs mx-auto" />
          </>
        )}

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white"
            data-testid="button-toggle-mute"
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-purple-600 px-8"
            onClick={onResume}
            data-testid="button-resume-now"
          >
            <Play className="h-5 w-5 mr-2" />
            {isAlarmPlaying ? "Continue Now" : "Resume Early"}
          </Button>

          {!isAlarmPlaying && (
            <Button
              variant="outline"
              onClick={onExtend}
              className="border-slate-600"
              data-testid="button-extend-break"
            >
              +5 min
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
