import React from "react";
import { Link, useLocation } from "wouter";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Sparkles, Calculator, BookOpen, Target, TrendingUp } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [location] = useLocation();
  
  // Check if we are in embed mode
  const isEmbedded = typeof window !== 'undefined' && window.location.search.includes('embed=true');

  if (isEmbedded) return null;

  return (
    <nav className={`w-full z-50 transition-colors duration-300 border-b border-white/5 bg-background/80 backdrop-blur-md`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="https://i2u.ai/" className="group">
              <div className="relative overflow-hidden rounded-lg transition-transform group-hover:scale-105 duration-300">
                 <img src="/logo.png" alt="i2u.ai Logo" className="h-12 w-auto object-contain" />
              </div>
          </a>
          <Link href="/" className="hidden sm:flex flex-col group cursor-pointer">
            <span className="text-2xl font-bold font-heading tracking-tight text-white leading-none">
              i2u<span className="text-primary">.ai</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase mt-0.5 group-hover:text-primary transition-colors">
              Value Hub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              
              {/* Value Addition Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-primary hover:bg-white/5 data-[state=open]:bg-white/5">
                  Platform
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-card border border-white/10">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/5 p-6 no-underline outline-none focus:shadow-md"
                          href="/value-stories"
                        >
                          <BookOpen className="h-6 w-6 text-primary mb-2" />
                          <div className="mb-2 mt-4 text-lg font-medium text-white">
                            Insights Engine
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Deep analysis of unicorn growth strategies and future tech trends.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/value-stories" title="Latest Insights" icon={<TrendingUp className="w-4 h-4 text-accent" />}>
                      Read our latest analysis on AI and tech history.
                    </ListItem>
                    <ListItem href="/value-stories/calculator" title="Unicorn Assessment" icon={<Calculator className="w-4 h-4 text-secondary" />}>
                      Measure your valuation potential & risk.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* About Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a href="https://i2u.ai/about" className={cn(
                    navigationMenuTriggerStyle(), 
                    "bg-transparent text-muted-foreground hover:text-primary hover:bg-white/5 cursor-pointer"
                  )}>
                    About
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-4 py-2 rounded-full font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </button>
          <button className="relative overflow-hidden group bg-gradient-to-r from-accent via-primary to-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10 focus:text-accent-foreground group",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">
            {icon}
            {title}
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1.5">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
