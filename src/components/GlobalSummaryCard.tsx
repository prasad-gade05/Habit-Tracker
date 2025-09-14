import React from "react";
import { Activity, CheckCircle2, TrendingUp, Award } from "lucide-react";

interface GlobalSummaryCardProps {
  label: string;
  value: string | number;
  type?: "activeHabits" | "completedToday" | "completionRate" | "perfectDays";
}

const GlobalSummaryCard: React.FC<GlobalSummaryCardProps> = ({
  label,
  value,
  type,
}) => {
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

  const { icon: Icon, color, iconColor } = getIconAndColor();

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border card-hover fade-in relative overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
        </div>
        <div
          className={`w-12 h-12 ${color} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`size-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default GlobalSummaryCard;
