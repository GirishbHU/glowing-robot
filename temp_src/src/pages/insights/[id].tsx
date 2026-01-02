import { blogPosts } from "@/lib/articles";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Calendar, Clock, Share2, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import NotFound from "@/pages/not-found";

import Footer from "@/components/layout/Footer";
import PageNav from "@/components/layout/PageNav";

export default function InsightDetail() {
  const [, params] = useRoute("/insights/:id");
  const postId = params?.id;
  const post = blogPosts.find(p => p.id === postId);

  if (!post) return <NotFound />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-4 left-4 z-50">
        <PageNav />
      </div>
      
      <main className="container mx-auto px-4 pt-10 max-w-4xl">

        <article>
          <header className="mb-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {post.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock size={14} /> {post.readTime}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  GH
                </div>
                {post.author}
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar size={14} /> {post.date}
              </div>
            </div>

            {post.sourceUrl && (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
                <span>Originally published on <strong>{post.attribution || post.source}</strong></span>
                <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Read Original <ExternalLink size={12} />
                </a>
              </div>
            )}
          </header>

          <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-sm">
             <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
               <div dangerouslySetInnerHTML={{ __html: post.content }} />
               
               <p className="text-muted-foreground italic mt-8 border-t pt-8">
                 This is an excerpt/preview. For the full in-depth analysis, please refer to the <a href={post.sourceUrl} className="text-primary hover:underline">original source</a>.
               </p>
               
               <h3>Key Takeaways</h3>
               <ul>
                 <li>Understanding the core principles is essential for long-term success.</li>
                 <li>Innovation often comes from questioning established norms.</li>
                 <li>Technology is a tool, but human insight drives its application.</li>
               </ul>
               
               <blockquote>
                 "The future belongs to those who prepare for it today."
               </blockquote>
             </div>
          </div>

          <div className="mt-10 flex justify-between items-center">
             <div className="text-sm text-muted-foreground">
               Share this article:
             </div>
             <div className="flex gap-2">
               <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                 <Linkedin size={16} />
               </Button>
               <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                 <Twitter size={16} />
               </Button>
               <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                 <Share2 size={16} />
               </Button>
             </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
