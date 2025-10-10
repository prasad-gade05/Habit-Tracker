import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Settings,
} from "lucide-react";

const NavigationCard: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/calendar", label: "Calendar", icon: CalendarDays },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-card rounded-lg p-2 shadow-sm border border-border">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`w-full justify-start h-8 ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              asChild
            >
              <Link to={item.path}>
                <Icon className="h-4 w-4 mr-2" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationCard;
