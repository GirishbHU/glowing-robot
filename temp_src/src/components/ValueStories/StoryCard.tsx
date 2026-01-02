import { ValueStory } from "@/lib/mockData";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StoryCardProps {
  story: ValueStory;
  featured?: boolean;
}

export default function StoryCard({ story, featured = false }: StoryCardProps) {
  return (
    <Card className={`group overflow-hidden border transition-all duration-300 hover:shadow-xl hover:border-primary/20 ${featured ? 'col-span-2 row-span-2 bg-gradient-to-br from-card to-muted/50' : 'bg-card'}`}>
      <CardHeader className="p-6 pb-2 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-heading">
              {story.unicorn.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{story.unicorn.name}</p>
              <p className="text-xs text-muted-foreground">{story.phaseName}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-background text-xs font-normal border-primary/20 text-primary">
            {story.stakeholderType}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Link href={`/value-stories/story/${story.id}`}>
            <h3 className={`font-heading font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer ${featured ? 'text-3xl' : 'text-xl'}`}>
              {story.title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {story.headline}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-2">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp size={14} />
              <span className="text-xs font-semibold uppercase">Impact</span>
            </div>
            <p className="font-mono text-sm font-bold">
              {story.metrics.revenueImpact 
                ? `$${(story.metrics.revenueImpact / 1000000).toFixed(1)}M` 
                : `${story.metrics.userAdoptionImpact}%`}
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Clock size={14} />
              <span className="text-xs font-semibold uppercase">Time</span>
            </div>
            <p className="font-mono text-sm font-bold">{story.metrics.timeToAchieveMonths} Months</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="text-xs text-muted-foreground font-medium">
          {story.parameterName}
        </div>
        <Link href={`/value-stories/story/${story.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
            Read Story <ArrowRight size={14} />
        </Link>
      </CardFooter>
    </Card>
  );
}
