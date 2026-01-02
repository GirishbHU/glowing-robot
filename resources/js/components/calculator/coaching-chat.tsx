import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface AssessmentContext {
  phase: number;
  phaseName: string;
  isAspirational: boolean;
  score: number;
  dimensionScore: number;
  thriveScore: number;
  badge: string;
  strengths?: string[];
  improvements?: string[];
}

interface CoachingChatProps {
  assessmentContext?: AssessmentContext;
}

const getStorageKey = (context?: AssessmentContext) => {
  if (!context) return "coaching_conversation_default";
  return `coaching_conversation_p${context.phase}_${context.isAspirational ? "asp" : "cur"}`;
};

export default function CoachingChat({ assessmentContext }: CoachingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showPulse, setShowPulse] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  const loadConversationHistory = useCallback(async (convId: number) => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/coaching/conversations/${convId}`);
      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      } else {
        localStorage.removeItem(getStorageKey(assessmentContext));
        setConversationId(null);
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
      localStorage.removeItem(getStorageKey(assessmentContext));
      setConversationId(null);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [assessmentContext]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const storedConvId = localStorage.getItem(getStorageKey(assessmentContext));
    if (storedConvId) {
      const convId = parseInt(storedConvId);
      if (!isNaN(convId)) {
        setConversationId(convId);
        loadConversationHistory(convId);
      }
    }
  }, [assessmentContext, loadConversationHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const createConversation = async (): Promise<number | null> => {
    try {
      const response = await fetch("/api/coaching/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Coaching Session - ${new Date().toLocaleDateString()}`,
          assessmentContext: assessmentContext || null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const convId = data.conversation.id;
        localStorage.setItem(getStorageKey(assessmentContext), convId.toString());
        return convId;
      }
      return null;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    let convId = conversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) {
        setIsLoading(false);
        return;
      }
      setConversationId(convId);
    }

    const newUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(`/api/coaching/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
            : msg
        )
      );
    }

    setIsLoading(false);
  };

  const clearChat = async () => {
    if (conversationId) {
      try {
        await fetch(`/api/coaching/conversations/${conversationId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
    localStorage.removeItem(getStorageKey(assessmentContext));
    setMessages([]);
    setConversationId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What should I focus on first?",
    "How can I improve my score?",
    "What's my biggest gap?",
    "Tips for my current phase?",
  ];

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-coaching-chat"
      >
        <Sparkles className="w-6 h-6" />
        {showPulse && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-violet-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] font-bold">
          AI
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
            data-testid="coaching-chat-panel"
          >
            <Card className="overflow-hidden border-2 border-violet-500/30 shadow-2xl">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">AI Coach</h3>
                    <p className="text-xs text-white/70">Personalized startup guidance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearChat}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20"
                      data-testid="button-clear-chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20"
                    data-testid="button-close-chat"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div ref={scrollRef} className="h-80 overflow-y-auto p-4 bg-background/95">
                {isLoadingHistory ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Loading conversation...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4"
                    >
                      <Sparkles className="w-8 h-8 text-violet-500" />
                    </motion.div>
                    <h4 className="font-semibold text-lg mb-2">Your Personal AI Coach</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get personalized advice based on your assessment results. Ask anything about
                      your startup journey!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestedQuestions.map((q, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => {
                            setInput(q);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-1.5 text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 rounded-full transition-colors"
                          data-testid={`button-suggested-question-${i}`}
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-violet-500" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            msg.role === "user"
                              ? "bg-violet-500 text-white rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.role === "assistant" && isLoading && idx === messages.length - 1 && !msg.content && (
                            <div className="flex items-center gap-1 py-1">
                              <motion.span
                                className="w-2 h-2 bg-violet-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              />
                              <motion.span
                                className="w-2 h-2 bg-violet-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              />
                              <motion.span
                                className="w-2 h-2 bg-violet-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              />
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your AI coach..."
                    disabled={isLoading}
                    className="flex-1 rounded-full"
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="rounded-full bg-violet-500 hover:bg-violet-600"
                    data-testid="button-send-message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
