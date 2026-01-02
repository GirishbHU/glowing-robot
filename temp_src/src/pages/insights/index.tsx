import Footer from "@/components/layout/Footer";
import PageNav from "@/components/layout/PageNav";
import { blogPosts } from "@/lib/articles";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowRight, ExternalLink, Linkedin, Rss, BookOpen } from "lucide-react";

export default function InsightsPage() {
  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);

  const getSourceIcon = (source: string) => {
    switch(source) {
      case "LinkedIn": return <Linkedin size={12} />;
      case "RSS": return <Rss size={12} />;
      case "External": return <ExternalLink size={12} />;
      default: return <BookOpen size={12} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-4 left-4 z-50">
        <PageNav />
      </div>
      
      <main className="container mx-auto px-4 pt-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Insights & Perspectives</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Deep dives into AI, entrepreneurship, and the future of technology.
            <br/>
            <span className="text-sm font-medium text-primary mt-2 inline-block">
              Drafted and crafted by the i2u.ai team, published across LinkedIn and Adventures in BM Terrain.
            </span>
          </p>
        </div>

        {/* Featured Post */}
        <section className="mb-16">
          <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-accent rounded-full"/> Latest Article
          </h2>
          <div className="grid md:grid-cols-2 gap-8 bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-64 md:h-auto bg-muted/30 relative group">
              {featuredPost.imageUrl ? (
                <img 
                  src={featuredPost.imageUrl} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                   <div className="text-primary/20">
                     <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"/></svg>
                   </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {featuredPost.category}
                </Badge>
                <Badge variant="outline" className="text-xs font-normal bg-background flex items-center gap-1">
                   {getSourceIcon(featuredPost.source)} {featuredPost.attribution || featuredPost.source}
                </Badge>
              </div>
              
              <Link href={`/insights/${featuredPost.id}`}>
                <h3 className="text-3xl font-heading font-bold mb-4 hover:text-primary transition-colors cursor-pointer leading-tight">
                  {featuredPost.title}
                </h3>
              </Link>
              
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    GH
                  </div>
                  <div className="flex flex-col">
                    <span>{featuredPost.author}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {featuredPost.readTime}
                    </span>
                  </div>
                </div>
                <Link href={`/insights/${featuredPost.id}`}>
                   <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 hover:bg-transparent">
                     Read Article <ArrowRight size={16} className="ml-1" />
                   </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Posts Grid */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-6">Recent Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Card key={post.id} className="group hover:border-primary/20 transition-colors flex flex-col overflow-hidden">
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
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
