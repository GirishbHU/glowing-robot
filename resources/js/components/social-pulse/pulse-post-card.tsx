import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Rocket, Lightbulb, Diamond } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface PulsePostCardProps {
    post: any;
    onReact: (postId: number, type: string) => void;
}

export function PulsePostCard({ post, onReact }: PulsePostCardProps) {
    const [liked, setLiked] = useState(false); // Optimistic UI state could be enhanced

    const contextColor = (type: string) => {
        switch (type) {
            case 'milestone': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
            case 'insight': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
            default: return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl transition-all hover:border-white/20"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/20">
                        <AvatarImage src={post.user?.avatar} />
                        <AvatarFallback>{post.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white tracking-wide">{post.user?.name}</h3>
                            <span className="text-xs text-white/40">• {new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-cyan-400 font-medium">L{post.user?.merit_level?.replace('L', '') || '0'} Builder</div>
                    </div>
                </div>
                {post.context_type && (
                    <Badge variant="outline" className={`capitalize ${contextColor(post.type)}`}>
                        {post.type === 'post' ? post.context_value : post.type}
                    </Badge>
                )}
            </div>

            {/* Content */}
            <div className="mb-6">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                {/* Media rendering would go here */}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white/60 hover:text-pink-400 hover:bg-pink-500/10"
                    onClick={() => onReact(post.id, 'heart')}
                >
                    <Heart className="w-4 h-4" />
                    <span>{post.reactions?.filter((r: any) => r.type === 'heart').length || 0}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white/60 hover:text-yellow-400 hover:bg-yellow-500/10"
                    onClick={() => onReact(post.id, 'rocket')}
                >
                    <Rocket className="w-4 h-4" />
                    <span>{post.reactions?.filter((r: any) => r.type === 'rocket').length || 0}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white/60 hover:text-cyan-400 hover:bg-cyan-500/10"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments?.length || 0}</span>
                </Button>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}
