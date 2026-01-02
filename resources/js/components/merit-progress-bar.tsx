
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeritStatusResponse {
    merit_level: string;
    execution_score: number;
    total_gleams: number;
    total_alicorns: number;
    next_level_threshold: number | null;
    progress_percentage: number;
}

interface MeritProgressBarProps {
    guestUuid?: string;
    className?: string;
}

export function MeritProgressBar({ guestUuid, className }: MeritProgressBarProps) {
    const { data: meritStatus } = useQuery<MeritStatusResponse>({
        queryKey: ['merit-status', guestUuid],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (guestUuid) {
                params.append('guestUuid', guestUuid);
            }

            const response = await fetch(`/api/merit-status?${params}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch merit status');
            return response.json();
        },
        refetchInterval: 5000, // Refresh every 5 seconds for live updates
        staleTime: 3000,
    });

    if (!meritStatus) {
        return (
            <div className={cn("p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20", className)}>
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Merit Progress</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full animate-pulse" />
            </div>
        );
    }

    const isMaxLevel = meritStatus.merit_level === 'L8';
    const nextThreshold = meritStatus.next_level_threshold;

    return (
        <div className={cn("p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Merit Progress</span>
                </div>
                <div className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-300 font-bold">
                    {meritStatus.merit_level}
                </div>
            </div>

            {/* Progress Bar */}
            {!isMaxLevel && nextThreshold ? (
                <>
                    <Progress
                        value={meritStatus.progress_percentage}
                        className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>{meritStatus.execution_score.toLocaleString()} pts</span>
                        <span className="text-purple-400">{meritStatus.progress_percentage.toFixed(0)}%</span>
                        <span>{nextThreshold?.toLocaleString()} pts</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                        {nextThreshold - meritStatus.execution_score} points to {getNextLevel(meritStatus.merit_level)}
                    </p>
                </>
            ) : (
                <div className="text-center py-2">
                    <span className="text-xs text-yellow-400 font-bold">🏆 MAX LEVEL ACHIEVED 🏆</span>
                </div>
            )}

            {/* Gleam Balance */}
            <div className="mt-3 pt-3 border-t border-purple-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-300">Gleams</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-400">
                        {meritStatus.total_gleams.toLocaleString()}
                    </span>
                </div>

                {meritStatus.total_alicorns > 0 && (
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs font-medium text-gray-300">Alicorns</span>
                        </div>
                        <span className="text-sm font-bold text-purple-400">
                            {meritStatus.total_alicorns.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function getNextLevel(currentLevel: string): string {
    const levels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[currentIndex + 1] || 'MAX';
}
