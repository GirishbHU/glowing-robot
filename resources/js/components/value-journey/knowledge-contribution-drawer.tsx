import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Send, Sparkles, MessageSquare, Tag, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeContributionDrawerProps {
    questionCode: string;
    questionText?: string;
    dimensionName?: string;
    stakeholderRole: string;
    guestUuid?: string;
    onContributionSuccess: (gleams: number) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KnowledgeContributionDrawer({
    questionCode,
    questionText,
    dimensionName,
    stakeholderRole,
    guestUuid,
    onContributionSuccess,
    isOpen,
    onOpenChange
}: KnowledgeContributionDrawerProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("answer_insight");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-detect timezone
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleSubmit = async () => {
        if (content.length < 10) {
            toast({
                title: "Too short",
                description: "Please share a bit more detail (at least 10 characters) to earn your Gleams.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                question_code: questionCode,
                stakeholder_role: stakeholderRole,
                contribution_type: activeTab,
                content: content,
                guest_uuid: guestUuid,
                client_timezone: clientTimezone,
                local_time: new Date().toISOString()
            };

            const response = await fetch('/api/knowledge/contribute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Auth header if token exists in localStorage, handled globally usually
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setContent("");
                onOpenChange(false);
                onContributionSuccess(data.bonus_gleams || 50);

                toast({
                    title: "Contribution Recorded! 🦄",
                    description: `You earned ${data.bonus_gleams || 50} Bonus Gleams for helping build the Protocol.`,
                    variant: "default",
                });
            } else {
                throw new Error(data.message || "Failed to submit");
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Submission Error",
                description: "Could not save your contribution. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'answer_insight': return "Refine Answer";
            case 'critique_q': return "Critique Question";
            case 'taxonomy_idea': return "Rename Dimension";
            default: return "Contribute";
        }
    };

    const getPlaceholder = () => {
        switch (activeTab) {
            case 'answer_insight': return "How would you answer this better? Share your unique insight...";
            case 'critique_q': return `Why is this question irrelevant for a ${stakeholderRole}? How should we ask it?`;
            case 'taxonomy_idea': return `Is '${dimensionName}' the wrong term? What would you call this business aspect?`;
            default: return "Share your thoughts...";
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:w-[500px] bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-violet-400">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        Unicorn Protocol: Contribute
                    </SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Help us build the foundational model for startups. Your insights shape the protocol for everyone.
                        <br />
                        <span className="text-amber-300 font-bold mt-1 inline-block">+50 Bonus Gleams per contribution</span>
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="answer_insight" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 mb-4">
                        <TabsTrigger value="answer_insight" className="data-[state=active]:bg-violet-600">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Insight
                        </TabsTrigger>
                        <TabsTrigger value="critique_q" className="data-[state=active]:bg-rose-600">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Critique
                        </TabsTrigger>
                        <TabsTrigger value="taxonomy_idea" className="data-[state=active]:bg-cyan-600">
                            <Tag className="w-4 h-4 mr-2" />
                            Rename
                        </TabsTrigger>
                    </TabsList>

                    <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 mb-4">
                        <p className="text-xs text-slate-500 font-mono mb-1 uppercase">Context</p>
                        <p className="text-sm text-slate-300 line-clamp-2 italic">"{questionText}"</p>
                    </div>

                    <TabsContent value="answer_insight" className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-violet-300">Suggest a Better Answer</h3>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={getPlaceholder()}
                                className="h-40 bg-slate-800 border-slate-700 focus:border-violet-500 text-slate-200"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="critique_q" className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-rose-300">Critique the Question</h3>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={getPlaceholder()}
                                className="h-40 bg-slate-800 border-slate-700 focus:border-rose-500 text-slate-200"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="taxonomy_idea" className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-cyan-300">Rename the Dimension</h3>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={getPlaceholder()}
                                className="h-40 bg-slate-800 border-slate-700 focus:border-cyan-500 text-slate-200"
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end gap-3">
                    <SheetClose asChild>
                        <Button variant="ghost" className="text-slate-400">Cancel</Button>
                    </SheetClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || content.length < 10}
                        className={`w-full sm:w-auto ${activeTab === 'answer_insight' ? 'bg-violet-600 hover:bg-violet-700' :
                                activeTab === 'critique_q' ? 'bg-rose-600 hover:bg-rose-700' :
                                    'bg-cyan-600 hover:bg-cyan-700'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">Uploading...</span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Submit Contribution
                            </span>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
