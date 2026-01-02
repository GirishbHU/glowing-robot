import { useLocation } from "wouter";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PageNavProps {
  showHome?: boolean;
  showBack?: boolean;
  className?: string;
}

export default function PageNav({ showHome = true, showBack = true, className = "" }: PageNavProps) {
  const [location, setLocation] = useLocation();
  
  const isEmbedded = typeof window !== 'undefined' && window.location.search.includes('embed=true');
  if (isEmbedded) return null;

  const isHomePage = location === "/" || location === "/value-journey";

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  const handleHome = () => {
    setLocation("/");
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBack && !isHomePage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBack}
              className="text-slate-400 hover:text-white hover:bg-white/10"
              data-testid="button-nav-back"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Go to previous page</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {showHome && !isHomePage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleHome}
              className="text-slate-400 hover:text-white hover:bg-white/10"
              data-testid="button-nav-home"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Go to home page</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
