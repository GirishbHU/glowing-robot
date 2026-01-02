import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Moon, Sun, Eye, Palette } from "lucide-react";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";

const themes: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: "dark", 
    label: "Dark Mode", 
    icon: <Moon className="h-4 w-4" />,
    description: "Default dark theme"
  },
  { 
    value: "light", 
    label: "Light Mode", 
    icon: <Sun className="h-4 w-4" />,
    description: "Bright and clean"
  },
  { 
    value: "high-contrast", 
    label: "High Contrast", 
    icon: <Eye className="h-4 w-4" />,
    description: "Enhanced visibility"
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  
  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-muted-foreground hover:text-foreground"
                data-testid="button-theme-switcher"
              >
                {currentTheme.icon}
                <span className="hidden sm:inline text-xs">{currentTheme.label}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Switch between dark, light, or high-contrast themes</TooltipContent>
        </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`flex items-center gap-3 cursor-pointer ${
              theme === t.value ? "bg-accent/20" : ""
            }`}
            data-testid={`menu-item-theme-${t.value}`}
          >
            <div className={theme === t.value ? "text-primary" : "text-muted-foreground"}>
              {t.icon}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${theme === t.value ? "text-primary" : ""}`}>
                {t.label}
              </div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
            </div>
            {theme === t.value && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    </TooltipProvider>
  );
}

export function ThemeSwitcherCompact() {
  const { theme, setTheme } = useTheme();
  
  const cycleTheme = () => {
    const themeOrder: ThemeMode[] = ["dark", "light", "high-contrast"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "high-contrast":
        return <Eye className="h-4 w-4" />;
      default:
        return <Moon className="h-4 w-4" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="text-muted-foreground hover:text-foreground"
      data-testid="button-theme-cycle"
      title={`Current: ${theme}. Click to change.`}
    >
      {getIcon()}
    </Button>
  );
}
