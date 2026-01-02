import { ValueStory } from "@/lib/mock-data";
import { Link } from "wouter";
import { ArrowLeft, Quote, TrendingUp, DollarSign, Target, Clock, Zap } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import Footer from "@/components/layout/footer";

interface StoryDetailProps {
  story: ValueStory;
}

export default function StoryDetail({ story }: StoryDetailProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 pt-10">
        <Link href="/value-stories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Stories
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20">{story.phaseName}</Badge>
                <Badge variant="outline">{story.parameterName}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight">
                {story.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {story.headline}
              </p>
            </div>

            <div className="bg-card border rounded-xl p-8 shadow-sm space-y-8">
              <section>
                <h3 className="text-lg font-bold font-heading mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">01</span>
                  The Challenge
                </h3>
                <p className="text-muted-foreground leading-7">{story.challengeBefore}</p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-bold font-heading mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">02</span>
                  The Solution
                </h3>
                <p className="text-muted-foreground leading-7">{story.solutionApplied}</p>
                <div className="mt-4 p-6 bg-muted/30 rounded-lg border-l-4 border-primary">
                  <p className="italic font-medium text-foreground">"{story.keyInsight}"</p>
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-bold font-heading mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">03</span>
                  The Result
                </h3>
                <p className="text-muted-foreground leading-7">{story.resultAfter}</p>
                <div dangerouslySetInnerHTML={{ __html: story.body }} className="prose prose-slate max-w-none mt-4 text-muted-foreground" />
              </section>
            </div>

            {/* AI Value Prop Section */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/10 border border-primary/20 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">How i2u.ai Accelerates This</h3>
                </div>

                <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                  {story.aiValueProposition}
                </p>

                <div className="flex items-center justify-between bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-primary/10">
                  <span className="text-sm font-medium text-muted-foreground">Estimated Value Delivery</span>
                  <span className="text-2xl font-bold text-primary font-mono">
                    ${story.estimatedValueDelivery.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Metrics Card */}
            <Card className="bg-card shadow-lg border-border/50 sticky top-24">
              <CardHeader>
                <h3 className="font-heading font-bold text-lg">Impact Metrics</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Clock size={14} /> Time to Achieve</span>
                  </div>
                  <p className="text-2xl font-bold font-mono">{story.metrics.timeToAchieveMonths} Months</p>
                </div>

                {story.metrics.revenueImpact && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-2"><DollarSign size={14} /> Revenue Impact</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-green-600">
                      +${(story.metrics.revenueImpact / 1000000).toFixed(1)}M
                    </p>
                  </div>
                )}

                {story.metrics.valuationImpact && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-2"><TrendingUp size={14} /> Valuation Impact</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-primary">
                      +${(story.metrics.valuationImpact / 1000000).toFixed(1)}M
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-bold text-sm mb-2">Unicorn Profile</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {story.unicorn.name.charAt(0)}
                      </div>
                      <span className="font-bold">{story.unicorn.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{story.unicorn.description}</p>
                    <div className="text-xs font-mono">
                      Valuation: ${(story.unicorn.currentValuation / 1000000000).toFixed(1)}B
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotes */}
            {story.quotes.map((quote, idx) => (
              <div key={idx} className="bg-primary/5 border border-primary/10 p-6 rounded-xl relative">
                <Quote className="absolute top-4 left-4 text-primary/20 w-8 h-8" />
                <blockquote className="relative z-10 pt-4">
                  <p className="text-lg font-serif italic text-foreground mb-4">
                    "{quote.text}"
                  </p>
                  <footer className="text-sm font-medium text-primary">
                    — {quote.author}, <span className="text-muted-foreground">{quote.role}</span>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
