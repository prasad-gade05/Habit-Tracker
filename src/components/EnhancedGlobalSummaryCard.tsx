import React, { useEffect, useState } from "react";
import { Activity, CheckCircle2, TrendingUp, Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedGlobalSummaryCardProps {
  label: string;
  value: string | number;
  type?: "activeHabits" | "completedToday" | "completionRate" | "perfectDays";
  previousValue?: string | number;
}

const EnhancedGlobalSummaryCard: React.FC<EnhancedGlobalSummaryCardProps> = ({
  label,
  value,
  type,
  previousValue,
}) => {
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Trigger celebration animation when value changes
  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setIsCelebrating(true);
      const timer = setTimeout(() => setIsCelebrating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const getIconAndColor = () => {
    switch (type) {
      case "activeHabits":
        return {
          icon: Activity,
          color: "bg-secondary",
          iconColor: "text-foreground",
        };
      case "completedToday":
        return {
          icon: CheckCircle2,
          color: "bg-secondary",
          iconColor: "text-foreground",
        };
      case "completionRate":
        return {
          icon: TrendingUp,
          color: "bg-secondary",
          iconColor: "text-foreground",
        };
      case "perfectDays":
        return {
          icon: Award,
          color: "bg-secondary",
          iconColor: "text-foreground",
        };
      default:
        return {
          icon: Activity,
          color: "bg-secondary",
          iconColor: "text-foreground",
        };
    }
  };

  const getTooltipContent = () => {
    switch (type) {
      case "activeHabits":
        return "This is the total number of habits you are currently tracking.";
      case "completedToday":
        return "Shows how many habits you've completed today. Keep going!";
      case "completionRate":
        return "Your overall completion rate across all habits and all time.";
      case "perfectDays":
        return "A 'Perfect Day' is a day where you complete 100% of your habits. You have X perfect days so far.";
      default:
        return "";
    }
  };

  const { icon: Icon, color, iconColor } = getIconAndColor();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border card-hover fade-in relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div
                  className={`text-2xl font-bold text-foreground mb-1 transition-all duration-500 ${
                    isCelebrating ? "animate-pulse text-primary" : ""
                  }`}
                  style={{
                    textShadow: isCelebrating
                      ? "0 0 8px hsl(var(--primary))"
                      : "none",
                  }}
                >
                  {value}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {label}
                </div>
              </div>
              <div
                className={`w-12 h-12 ${color} rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCelebrating ? "scale-110" : ""
                }`}
              >
                <Icon className={`size-6 ${iconColor}`} />
              </div>
            </div>
            {/* Celebration overlay */}
            {isCelebrating && (
              <div className="absolute inset-0 bg-primary/10 rounded-xl animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EnhancedGlobalSummaryCard;
