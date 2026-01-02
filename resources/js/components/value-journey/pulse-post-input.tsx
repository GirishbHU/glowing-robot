import { useState } from "react";
import { Send, Image, Video, Sparkles } from "lucide-react";

export default function PulsePostInput({ onPostSuccess }: { onPostSuccess?: () => void }) {
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsPosting(true);

        try {
            const res = await fetch('/api/social/pulse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content,
                    category: 'idea', // Default
                    author_name: null, // System handles guest ID
                    author_info: {
                        location: "Global",
                        tags: ["Guest"],
                        is_fancy: false
                    }
                })
            });

            if (res.ok) {
                setContent("");
                if (onPostSuccess) onPostSuccess();
            }
        } catch (err) {
            console.error("Failed to post", err);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto mb-8 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex-shrink-0 flex items-center justify-center font-bold text-white text-lg">
                    You
                </div>
                <div className="flex-1">
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your unicorn idea, ecosystem update, or daily win..."
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-950 transition-all resize-none h-24 text-sm"
                            maxLength={500}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors" title="Media (Demo)">
                                <Image className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-fuchsia-400 transition-colors" title="Video (Demo)">
                                <Video className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors" title="AI Assist">
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isPosting}
                            className="flex items-center gap-2 px-6 py-2 bg-white text-slate-950 font-bold rounded-full hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPosting ? 'Posting...' : 'Post Pulse'}
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
