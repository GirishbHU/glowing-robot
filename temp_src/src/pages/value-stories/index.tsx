import { useState } from "react";
import { blogPosts } from "@/lib/articles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, User, BookOpen, Linkedin, ExternalLink, Rss } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/layout/Footer";
import PageNav from "@/components/layout/PageNav";
import generatedImage from '@assets/generated_images/abstract_value_growth_visualization_with_golden_elements_on_deep_blue.png';

export default function ValueStoriesLanding() {
  const getSourceIcon = (source: string) => {
    switch(source) {
      case "LinkedIn": return <Linkedin size={12} />;
      case "RSS": return <Rss size={12} />;
      case "External": return <ExternalLink size={12} />;
      default: return <BookOpen size={12} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 left-4 z-50">
        <PageNav />
      </div>
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={generatedImage} 
            alt="Value Growth" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} /> Insights & Perspectives
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            Unicorn value delivery,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">democratized.</span>
          </h1>
          
          <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Deep dives into AI, entrepreneurship, and the future of technology. Explore our credibility engine and deep insights woven into every phase of growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-lg rounded-full" onClick={() => document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Insights
            </Button>
            <Link href="/value-stories/calculator">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-lg rounded-full backdrop-blur-sm">
                Unicorn Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div id="content-section" className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">
                Insights & Perspectives
              </h2>
              <p className="text-muted-foreground">
                Deep dives into AI, entrepreneurship, and the future of technology
              </p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group hover:border-primary/20 transition-colors flex flex-col overflow-hidden h-full">
              <div className="h-48 bg-muted/20 relative overflow-hidden">
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-card to-muted flex items-center justify-center">
                        <BookOpen className="text-muted-foreground/20 w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/80 backdrop-blur text-foreground hover:bg-background">{post.category}</Badge>
                  </div>
              </div>
              
              <CardHeader className="p-6 pb-3">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider font-semibold">
                      {getSourceIcon(post.source)} {post.source}
                  </span>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <Link href={`/insights/${post.id}`}>
                  <h3 className="text-xl font-heading font-bold leading-snug group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto flex justify-between items-center text-xs text-muted-foreground border-t border-border/40 pt-4">
                <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-slate-900 text-white py-24 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">Ready to create your own unicorn story?</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            i2u.ai's Agentic AI gives you the tenacity of a unicorn founder, automatically.
          </p>
          <Link href="/value-stories/calculator">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-10 rounded-full text-lg font-bold">
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
