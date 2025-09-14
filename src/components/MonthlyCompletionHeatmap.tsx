import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import {
  format,
  parseISO,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  getCompletionPercentageForDate,
  getLast365Days,
} from "../utils/dateUtils";

const MonthlyCompletionHeatmap: React.FC = () => {
  const { habits, completions } = useHabitStore();

  // Generate data for the heatmap
  const heatmapData = useMemo(() => {
    const today = new Date();
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    // Get all days in the last 365 days
    const last365Days = getLast365Days();

    return months.map((month) => {
      // Get all days in this month from the last 365 days
      const monthDays = last365Days.filter((day) => {
        const dayDate = parseISO(day);
        return (
          dayDate.getMonth() === month.getMonth() &&
          dayDate.getFullYear() === month.getFullYear()
        );
      });

      if (monthDays.length === 0) {
        return {
          month: format(month, "MMM"),
          year: format(month, "yyyy"),
          percentage: 0,
          count: 0,
          total: 0,
        };
      }

      // Calculate completion percentages for each day in the month
      const percentages = monthDays.map((day) =>
        getCompletionPercentageForDate(habits, completions, day)
      );

      // Calculate average percentage for the month
      const averagePercentage =
        percentages.length > 0
          ? Math.round(
              percentages.reduce((sum, p) => sum + p, 0) / percentages.length
            )
          : 0;

      return {
        month: format(month, "MMM"),
        year: format(month, "yyyy"),
        percentage: averagePercentage,
        count: percentages.filter((p) => p > 0).length,
        total: monthDays.length,
      };
    });
  }, [habits, completions]);

  // Get color class based on completion percentage
  const getColorClass = (percentage: number) => {
    if (percentage === 0) return "bg-secondary";
    if (percentage < 25) return "bg-green-500/20";
    if (percentage < 50) return "bg-green-500/40";
    if (percentage < 75) return "bg-green-500/70";
    return "bg-green-500";
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Monthly Completion Overview
      </h2>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Your habit completion rates by month
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {heatmapData.map((monthData, index) => (
          <div key={index} className="text-center">
            <div
              className={`w-full h-12 rounded-md flex items-center justify-center ${getColorClass(
                monthData.percentage
              )}`}
              title={`${monthData.month} ${monthData.year}: ${monthData.percentage}% completion`}
            >
              <span className="text-xs font-medium text-foreground">
                {monthData.percentage}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {monthData.month}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Less</div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-secondary rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500/20 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500/40 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500/70 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          </div>
          <div className="text-muted-foreground">More</div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCompletionHeatmap;
