import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { getCompletionPercentageForDate, getLast365Days } from "../utils/dateUtils";
import { format, parseISO } from "date-fns";

const CompletionRatesVisual: React.FC = () => {
  const { habits, completions } = useHabitStore();

  // Calculate completion rates for different time periods
  const completionRates = useMemo(() => {
    const today = new Date();
    const todayString = format(today, "yyyy-MM-dd");
    
    // Get last 365 days
    const last365Days = getLast365Days();
    
    // Today's completion rate
    const todayRate = getCompletionPercentageForDate(habits, completions, todayString);
    
    // This week's completion rate (last 7 days)
    const last7Days = last365Days.slice(-7);
    const weeklyRate = last7Days.length > 0 
      ? Math.round(
          last7Days.reduce((sum, date) => {
            return sum + getCompletionPercentageForDate(habits, completions, date);
          }, 0) / last7Days.length
        )
      : 0;
    
    // This month's completion rate (last 30 days)
    const last30Days = last365Days.slice(-30);
    const monthlyRate = last30Days.length > 0
      ? Math.round(
          last30Days.reduce((sum, date) => {
            return sum + getCompletionPercentageForDate(habits, completions, date);
          }, 0) / last30Days.length
        )
      : 0;
    
    // Overall completion rate (last 365 days)
    const overallRate = last365Days.length > 0
      ? Math.round(
          last365Days.reduce((sum, date) => {
            return sum + getCompletionPercentageForDate(habits, completions, date);
          }, 0) / last365Days.length
        )
      : 0;
    
    return {
      today: todayRate,
      weekly: weeklyRate,
      monthly: monthlyRate,
      overall: overallRate
    };
  }, [habits, completions]);

  // Get color class based on completion percentage
  const getColorClass = (percentage: number) => {
    if (percentage < 30) return "text-red-500";
    if (percentage < 60) return "text-amber-500";
    if (percentage < 80) return "text-blue-500";
    return "text-green-500";
  };

  // Get background color class for progress bars
  const getBgColorClass = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 60) return "bg-amber-500";
    if (percentage < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Completion Rates
      </h2>
      
      <div className="space-y-6">
        {/* Today's Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Today</span>
            <span className={`font-semibold ${getColorClass(completionRates.today)}`}>
              {completionRates.today}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getBgColorClass(completionRates.today)}`}
              style={{ width: `${completionRates.today}%` }}
            ></div>
          </div>
        </div>
        
        {/* Weekly Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">This Week</span>
            <span className={`font-semibold ${getColorClass(completionRates.weekly)}`}>
              {completionRates.weekly}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getBgColorClass(completionRates.weekly)}`}
              style={{ width: `${completionRates.weekly}%` }}
            ></div>
          </div>
        </div>
        
        {/* Monthly Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">This Month</span>
            <span className={`font-semibold ${getColorClass(completionRates.monthly)}`}>
              {completionRates.monthly}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getBgColorClass(completionRates.monthly)}`}
              style={{ width: `${completionRates.monthly}%` }}
            ></div>
          </div>
        </div>
        
        {/* Overall Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall</span>
            <span className={`font-semibold ${getColorClass(completionRates.overall)}`}>
              {completionRates.overall}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getBgColorClass(completionRates.overall)}`}
              style={{ width: `${completionRates.overall}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Based on {habits.length} active habits
        </div>
      </div>
    </div>
  );
};

export default CompletionRatesVisual;