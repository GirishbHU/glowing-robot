import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  X,
  MessageCircle,
  Loader2,
  Shield // Added import
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  assessmentContext: any;
  createdAt: string;
}

interface CoachingChatProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentContext?: {
    stakeholder: string;
    currentLevel: string;
    currentLevelName: string;
    aspirationalLevel: string;
    aspirationalLevelName: string;
    currentScore: number;
    aspirationalScore: number;
    gapScore: number;
    gleamsEarned: number;
    alicornsEarned: number;
    isTrial?: boolean;
  };
}

export default function CoachingChat({ isOpen, onClose, assessmentContext }: CoachingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");

  // Initialize from localStorage or default to neutral
  const [personaGender, setPersonaGenderState] = useState<"neutral" | "male" | "female">(() => {
    const saved = localStorage.getItem("concierge_gender");
    return (saved as "neutral" | "male" | "female") || "neutral";
  });

  const setPersonaGender = (gender: "neutral" | "male" | "female") => {
    setPersonaGenderState(gender);
    localStorage.setItem("concierge_gender", gender);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (isOpen && !conversation) {
      createConversation();
    }
  }, [isOpen]);

  const createConversation = async () => {
    try {
      const response = await fetch("/api/coaching/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assessmentContext
            ? `${assessmentContext.stakeholder} - ${assessmentContext.currentLevel} to ${assessmentContext.aspirationalLevel}`
            : "Coaching Session",
          assessmentContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setConversation(data.conversation);
        setMessages([{
          id: 0,
          role: "assistant",
          content: getWelcomeMessage(),
          createdAt: new Date().toISOString(),
        }]);
      } else {
        setMessages([{
          id: 0,
          role: "assistant",
          content: "I'm having trouble connecting right now. Please close and reopen the chat to try again.",
          createdAt: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setMessages([{
        id: 0,
        role: "assistant",
        content: "Unable to start coaching session. Please check your connection and try again.",
        createdAt: new Date().toISOString(),
      }]);
    }
  };

  const getWelcomeMessage = () => {
    if (!assessmentContext) {
      return "Welcome to your Value Journey coaching session! I'm here to help you navigate your startup journey. What would you like to explore today?";
    }

    const gap = assessmentContext.gapScore;
    const stakeholder = assessmentContext.stakeholder;

    return `Welcome, ${stakeholder}! 🦄

I can see you've completed your Value Journey assessment:
• **Current Level:** ${assessmentContext.currentLevel} (${assessmentContext.currentLevelName}) - Score: ${assessmentContext.currentScore}%
• **Aspirational Level:** ${assessmentContext.aspirationalLevel} (${assessmentContext.aspirationalLevelName}) - Score: ${assessmentContext.aspirationalScore}%
• **Gap to Close:** ${gap > 0 ? gap : "You're ahead!"} points

You've earned **${assessmentContext.gleamsEarned.toLocaleString()} Gleams** and **${(assessmentContext.gleamsEarned / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Alicorns** so far!

How can I help you today? I can:
1. Explain what it takes to move from ${assessmentContext.currentLevel} to ${assessmentContext.aspirationalLevel}
2. Suggest specific actions to close your gap
3. Share unicorn success stories relevant to your journey
4. Help you understand your assessment results better

What's on your mind?`;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !conversation || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setStreamingMessage("");

    const newUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch(`/api/coaching/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userMessage,
          settings: { gender: personaGender }
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullMessage += data.content;
                  setStreamingMessage(fullMessage);
                }
                if (data.done) {
                  setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: "assistant",
                    content: fullMessage,
                    createdAt: new Date().toISOString(),
                  }]);
                  setStreamingMessage("");
                }
              } catch (e) {
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "I apologize, but I encountered an issue. Please try again.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl h-[80vh] flex flex-col"
        >
          <Card className="flex-1 flex flex-col border-violet-500/30 bg-slate-900/95 overflow-hidden">
            <CardHeader className="border-b border-slate-700 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      Secret Confidante
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Private AI
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ml-2">
                        <Shield className="h-3 w-3 mr-1" />
                        Safe Space
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setPersonaGender("male")}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${personaGender === 'male' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}
                      >
                        Uncle
                      </button>
                      <button
                        onClick={() => setPersonaGender("female")}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${personaGender === 'female' ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}
                      >
                        Aunt
                      </button>
                      <button
                        onClick={() => setPersonaGender("neutral")}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${personaGender === 'neutral' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}
                      >
                        Agent
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                  data-testid="button-close-chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-100"
                        }`}
                    >
                      <div className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                        {message.content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={i}>{part.slice(2, -2)}</strong>;
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {streamingMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-slate-800 text-slate-100">
                      <div className="text-sm whitespace-pre-wrap">
                        {streamingMessage}
                        <span className="inline-block w-2 h-4 bg-violet-400 ml-1 animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {isLoading && !streamingMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-slate-800">
                      <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your coach anything..."
                  className="min-h-[44px] max-h-32 resize-none bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  rows={1}
                  disabled={isLoading}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-violet-600 hover:bg-violet-700 shrink-0"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ChatLauncher({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30 flex items-center justify-center text-white z-40"
      data-testid="button-open-chat"
    >
      <MessageCircle className="h-6 w-6" />
    </motion.button>
  );
}
