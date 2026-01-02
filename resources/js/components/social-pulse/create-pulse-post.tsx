import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, HelpCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

interface CreatePulsePostProps {
    onPostCreated: () => void;
    contextType?: string;
    contextValue?: string;
}

export function CreatePulsePost({ onPostCreated, contextType, contextValue }: CreatePulsePostProps) {
    const [content, setContent] = useState('');
    const [type, setType] = useState('post');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await axios.post('/api/pulse', {
                content,
                type,
                context_type: contextType,
                context_value: contextValue
            });
            setContent('');
            setType('post');
            onPostCreated();
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl mb-8"
        >
            <div className="flex gap-2 mb-4">
                <Button
                    variant={type === 'post' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setType('post')}
                    className="rounded-full"
                >
                    <Zap className="w-4 h-4 mr-2" /> Thought
                </Button>
                <Button
                    variant={type === 'insight' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setType('insight')}
                    className="rounded-full"
                >
                    <LightbulbIcon className="w-4 h-4 mr-2" /> Insight
                </Button>
                <Button
                    variant={type === 'milestone' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setType('milestone')}
                    className="rounded-full"
                >
                    <Trophy className="w-4 h-4 mr-2" /> Milestone
                </Button>
            </div>

            <Textarea
                placeholder="What's pulsating in your ecosystem?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-cyan-500 min-h-[100px] mb-4 text-white placeholder:text-white/30"
            />

            <div className="flex justify-between items-center">
                <div className="text-xs text-white/40">
                    Share with {contextValue ? `#${contextValue}` : 'everyone'}
                </div>
                <Button
                    disabled={!content.trim() || loading}
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Posting...' : 'Pulse It'}
                </Button>
            </div>
        </motion.div>
    );
}

function LightbulbIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.5 1.5-3.5a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 1 .5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
        </svg>
    )
}
