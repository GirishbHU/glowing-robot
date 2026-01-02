import React, { useEffect, useState } from 'react';
import { CreatePulsePost } from './create-pulse-post';
import { PulsePostCard } from './pulse-post-card';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface SocialPulseProps {
    contextType?: string;
    contextValue?: string;
}

export default function SocialPulse({ contextType, contextValue }: SocialPulseProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const params: any = {};
            if (contextType) params.context_type = contextType;
            if (contextValue) params.context_value = contextValue;

            const response = await axios.get('/api/pulse', { params });
            setPosts(response.data.data);
        } catch (error) {
            console.error('Failed to fetch pulse:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReaction = async (postId: number, type: string) => {
        try {
            // Optimistic update
            const updatedPosts = posts.map(p => {
                if (p.id === postId) {
                    // Logic to toggle locally would go here for true optimistic UI
                    // For now, let's just refresh content or assume success 
                    // This is a simplified version
                    return p;
                }
                return p;
            });
            // setPosts(updatedPosts);

            await axios.post(`/api/pulse/${postId}/react`, { type });
            fetchPosts(); // Refetch to get consistent state
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [contextType, contextValue]);

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <CreatePulsePost
                onPostCreated={fetchPosts}
                contextType={contextType}
                contextValue={contextValue}
            />

            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-white/40 italic">
                        No pulses yet. Be the first transparency catalyst!
                    </div>
                ) : (
                    posts.map(post => (
                        <PulsePostCard
                            key={post.id}
                            post={post}
                            onReact={handleReaction}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
