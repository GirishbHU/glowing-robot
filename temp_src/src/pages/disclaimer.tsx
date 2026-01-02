import Footer from "@/components/layout/Footer";
import PageNav from "@/components/layout/PageNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { ArrowLeft, ShieldAlert, BrainCircuit, Search, Database } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-4 left-4 z-50">
        <PageNav />
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Website Disclaimer</h1>
          <p className="text-xl text-muted-foreground">Content Attribution and Research Methodology</p>
        </div>

        <div className="space-y-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldAlert className="w-5 h-5 text-primary" />
                Service Relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Important Notice:</strong> None of the individuals, organizations, companies, or entities discussed or referenced in our content have received direct services from i2u.ai, nor are they partners or clients of our organization unless explicitly stated otherwise. Our analysis and commentary are independent assessments based on publicly available information and market research, not derived from proprietary service engagements or consultative relationships.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading">Content Development Framework</h2>
            <p className="text-muted-foreground leading-relaxed">
              The insights, analysis, articles, and strategic recommendations presented across our digital platforms—including our website at i2u.ai, our blog at i2u.ai/blog, and our extended content at Adventures in B/M Terrain—are developed through a comprehensive research and synthesis process that leverages:
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 mt-4">
              <li className="bg-card p-4 rounded-lg border flex flex-col gap-2">
                <span className="font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-accent" /> Global Knowledge Base</span>
                <span className="text-sm text-muted-foreground">A curated foundation of publicly available information, industry research, historical documentation, and collective wisdom from the global technology and startup ecosystems.</span>
              </li>
              <li className="bg-card p-4 rounded-lg border flex flex-col gap-2">
                <span className="font-semibold flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-secondary" /> Advanced AI Tools</span>
                <span className="text-sm text-muted-foreground">Sophisticated artificial intelligence platforms and research systems that enable deep analysis, pattern recognition, and synthesis of complex information.</span>
              </li>
            </ul>
            <div className="bg-muted/30 p-4 rounded-lg border mt-4">
              <h3 className="font-semibold mb-2">Primary Attribution</h3>
              <p className="text-sm text-muted-foreground">
                Special acknowledgment to <strong>Perplexity AI</strong>, an advanced AI-powered research and synthesis platform that has been instrumental in helping us gather, contextualize, and synthesize information across multiple domains.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading">Content Integrity Statement</h2>
            <p className="text-muted-foreground">
              Our content represents original synthesis and analysis performed by i2u.ai's team, informed by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary">
              <li>Publicly accessible research and data</li>
              <li>Published articles, reports, and industry analyses</li>
              <li>Historical records and public documentation</li>
              <li>Advanced AI-driven research methodologies</li>
            </ul>
            <p className="text-muted-foreground italic text-sm">
              We do not claim exclusive access to proprietary information regarding the individuals and organizations we analyze. Our perspectives are based on market observation, published sources, and advanced analytical tools.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Search className="w-6 h-6" /> Use of AI Technologies
            </h2>
            <p className="text-muted-foreground">
              i2u.ai leverages leading AI technologies and research platforms to enhance the quality, accuracy, and depth of our analysis. This includes but is not limited to:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Real-time information synthesis and web-based research",
                "Pattern recognition across large datasets",
                "Cross-domain knowledge synthesis",
                "Advanced reasoning and analytical frameworks"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card border rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-heading">Disclaimer on Accuracy and Completeness</h2>
            <p className="text-muted-foreground">
              While i2u.ai endeavors to maintain accuracy and provides well-researched content, we make no guarantees regarding:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-destructive/50">
              <li>The absolute completeness or exhaustiveness of our analysis</li>
              <li>The timeliness of information, particularly in rapidly evolving sectors</li>
              <li>The applicability of our insights to specific individual circumstances or use cases</li>
            </ul>
            <p className="text-sm text-muted-foreground font-medium bg-muted p-4 rounded border">
              Users of our content should conduct their own independent verification and consult with appropriate professionals before making business, investment, or strategic decisions based on our analysis.
            </p>
          </div>

          <div className="text-sm text-muted-foreground pt-8 border-t">
            <p className="font-semibold mb-2">Updates and Corrections</p>
            <p className="mb-4">
              i2u.ai reserves the right to update, modify, or correct any content on our platforms at any time. We welcome feedback, corrections, and suggestions from our audience to maintain the highest standards of quality and accuracy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 mt-6">
              <div>
                <span className="block font-semibold mb-1">Contact Information</span>
                <span className="block">For inquiries regarding content, methodology, or corrections:</span>
              </div>
              <div>
                <span className="block font-semibold mb-1">Company Details</span>
                <span className="block">i2u.ai Inc. ("Ideas to Unicorns through AI")</span>
                <span className="block">Delaware C Corporation (EIN: 36-5143244)</span>
              </div>
            </div>
            
            <p className="mt-8 text-xs opacity-70">Last Updated: December 19, 2025</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
