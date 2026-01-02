import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, X, Send, Loader2, Sparkles, 
  Bot, User, Minimize2, Maximize2, Lightbulb, Gift, CheckCircle
} from "lucide-react";
import { useAssessmentContextSafe } from "@/contexts/AssessmentContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function CoachingChatbot() {
  const assessmentState = useAssessmentContextSafe();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIntroBubble, setShowIntroBubble] = useState(true);
  const [showSuggestionMode, setShowSuggestionMode] = useState(false);
  const [suggestionInput, setSuggestionInput] = useState("");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return localStorage.getItem('coach_intro_seen') === 'true';
  });
  
  const submitSuggestion = async () => {
    if (!suggestionInput.trim() || isSubmittingSuggestion) return;
    
    setIsSubmittingSuggestion(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion: suggestionInput.trim() })
      });
      
      if (res.ok) {
        toast({
          title: "Suggestion Received!",
          description: "Thank you! You earned +50 Gleams for your feedback!",
        });
        setSuggestionInput("");
        setShowSuggestionMode(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: "Thank you for your suggestion! 🎉 You have earned +50 Gleams as a reward. Your feedback helps us improve the Value Journey Quest for everyone!"
        }]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not submit suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  useEffect(() => {
    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        localStorage.setItem('coach_intro_seen', 'true');
        setShowIntroBubble(false);
        setHasSeenIntro(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenIntro]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/coaching/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            currentLevel: assessmentState?.currentLevel || "L0",
            totalGleams: assessmentState?.totalGleams || 0,
          },
          history: messages.slice(-10)
        })
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: ""
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg.role === "assistant") {
                      lastMsg.content += data.content;
                    }
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getWelcomeMessage = () => {
    if (assessmentState?.currentLevel && assessmentState.currentLevel !== "L0") {
      return `Hello! I am your AI Unicorn Coach. You are currently at ${assessmentState.currentLevel} with ${assessmentState.totalGleams} Gleams earned. What would you like to explore?`;
    }
    return "Hello! I am your AI Unicorn Coach. I can help you understand your assessment results, explore growth strategies, and guide you on your journey to unicorn status. How can I help you today?";
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
            <AnimatePresence>
              {showIntroBubble && !hasSeenIntro && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="bg-slate-800 border border-violet-500/40 rounded-xl p-3 shadow-lg shadow-violet-500/20 max-w-48"
                >
                  <div className="flex items-start gap-2">
                    <motion.span
                      animate={{ rotate: [0, 20, -20, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-xl"
                    >👋</motion.span>
                    <div>
                      <p className="text-xs text-slate-200 font-medium">Need help on your journey?</p>
                      <p className="text-xs text-slate-400 mt-0.5">I am your AI Unicorn Coach!</p>
                    </div>
                  </div>
                  <motion.div 
                    className="absolute -right-2 bottom-4 w-3 h-3 bg-slate-800 border-r border-b border-violet-500/40 rotate-[-45deg]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: !hasSeenIntro ? [0, -5, 0] : 0
              }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={!hasSeenIntro ? { 
                y: { duration: 1.5, repeat: Infinity }
              } : undefined}
              onClick={() => {
                setIsOpen(true);
                setShowIntroBubble(false);
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center"
              data-testid="button-open-coach"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
              <motion.span
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "500px"
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/20 overflow-hidden flex flex-col"
            data-testid="panel-coach"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Unicorn Coach</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/90">AI</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                  data-testid="button-minimize-coach"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                  data-testid="button-close-coach"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 bg-slate-800 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-200">
                          {getWelcomeMessage()}
                        </div>
                      </motion.div>
                    )}

                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500" 
                            : "bg-gradient-to-r from-violet-500 to-purple-500"
                        }`}>
                          {message.role === "user" ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`flex-1 rounded-2xl p-3 text-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm"
                            : "bg-slate-800 text-slate-200 rounded-tl-sm"
                        }`}>
                          {message.content || (
                            <span className="flex items-center gap-2 text-slate-400">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Thinking...
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-3">
                          <motion.div
                            className="flex gap-1"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <span className="w-2 h-2 bg-violet-400 rounded-full" />
                            <span className="w-2 h-2 bg-violet-400 rounded-full" />
                            <span className="w-2 h-2 bg-violet-400 rounded-full" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t border-slate-700/50 space-y-2">
                  <AnimatePresence>
                    {showSuggestionMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-400">
                            <Lightbulb className="h-4 w-4" />
                            <span className="text-sm font-semibold">Share Your Suggestion</span>
                          </div>
                          <button onClick={() => setShowSuggestionMode(false)} className="text-slate-400 hover:text-white">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea
                          value={suggestionInput}
                          onChange={(e) => setSuggestionInput(e.target.value)}
                          placeholder="What would make this better? Features, improvements, ideas..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 placeholder-slate-500 resize-none h-20 focus:border-amber-500 focus:outline-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-amber-400">
                            <Gift className="h-3 w-3" />
                            <span>Earn +50 Gleams!</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={submitSuggestion}
                            disabled={!suggestionInput.trim() || isSubmittingSuggestion}
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400"
                          >
                            {isSubmittingSuggestion ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Submit
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSuggestionMode(!showSuggestionMode)}
                      className={`px-2 ${showSuggestionMode ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-amber-400'}`}
                      title="Share a suggestion"
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask your coach..."
                      className="flex-1 bg-slate-800 border-slate-700 focus:border-violet-500"
                      disabled={isLoading}
                      data-testid="input-coach-message"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                      data-testid="button-send-coach"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-500">
                    <Sparkles className="h-3 w-3" />
                    <span>Powered by AI • Personalized coaching</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
