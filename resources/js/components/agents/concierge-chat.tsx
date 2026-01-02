import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Sparkles, Send, BrainCircuit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
    id: number;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
}

export function ConciergeChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: 'agent',
            content: "Greetings! I am your Ecosystem Concierge. I can help you structure your Pitch Deck or navigate the Unicorn Protocol. Remember, keep your NDA secrets safe in your Vault—just tell me about your value proposition!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [activeAgent, setActiveAgent] = useState<'concierge' | 'advisor'>('concierge');

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Mock Response
        setTimeout(() => {
            const agentMsg: Message = {
                id: Date.now() + 1,
                role: 'agent',
                content: activeAgent === 'concierge'
                    ? "That's a strong starting point. Based on the 'Adventures in BM Terrain' framework, have you considered how your revenue streams align with your customer segments?"
                    : "Interesting metrics. Comparing your validated traffic against the i2u.ai growth benchmarks, you are tracking in the top 15% for your sector.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMsg]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[600px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${activeAgent === 'concierge' ? 'bg-violet-500/20 border-violet-500/50' : 'bg-emerald-500/20 border-emerald-500/50'}`}>
                        {activeAgent === 'concierge' ? <Bot className="w-6 h-6 text-violet-400" /> : <BrainCircuit className="w-6 h-6 text-emerald-400" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-100">
                            {activeAgent === 'concierge' ? 'The Concierge' : 'The Wise Advisor'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Online • Powered by i2u.ai</span>
                        </div>
                    </div>
                </div>

                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button
                        onClick={() => setActiveAgent('concierge')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeAgent === 'concierge' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Concierge
                    </button>
                    <button
                        onClick={() => setActiveAgent('advisor')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeAgent === 'advisor' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Advisor
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 space-y-4">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <Avatar className="w-8 h-8 border border-white/10">
                            <AvatarFallback className={msg.role === 'agent' ? 'bg-slate-800 text-cyan-400' : 'bg-slate-700 text-white'}>
                                {msg.role === 'agent' ? 'AI' : 'ME'}
                            </AvatarFallback>
                            {msg.role === 'agent' && <AvatarImage src="/images/agent-avatar.png" />}
                        </Avatar>

                        <div className={`rounded-2xl p-4 max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-sm'
                            }`}>
                            {msg.content}
                            {msg.role === 'agent' && (
                                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    <span>Validated against Knowledge Core</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                <div className="relative flex gap-2">
                    <Input
                        placeholder={activeAgent === 'concierge' ? "Ask about your Pitch Deck..." : "Request a valuation estimate..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="bg-slate-950 border-slate-800 focus:border-violet-500 pr-12 text-slate-200"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        className={`absolute right-1 top-1 h-8 w-8 ${activeAgent === 'concierge' ? 'bg-violet-600 hover:bg-violet-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                        <Send className="w-4 h-4 text-white" />
                    </Button>
                </div>
                <div className="mt-2 text-[10px] text-center text-slate-600">
                    <span className="font-bold text-amber-500/80">Reminder:</span> Do not output IP or passwords. The agent is trained to guide, not store.
                </div>
            </div>
        </div>
    );
}
