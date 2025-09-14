import React, { useEffect } from "react";
import { useHabitStore } from "../stores/habitStore";
import CalendarView from "../components/CalendarView";
import SevenDayTrend from "../components/SevenDayTrend";
import WeeklyPatterns from "../components/WeeklyPatterns";
import NavigationModule from "../components/NavigationModule";
import QuickActionsModule from "../components/QuickActionsModule";
import MonthlyCompletionHeatmap from "../components/MonthlyCompletionHeatmap";
import HabitStreakVisualization from "../components/HabitStreakVisualization";

const CalendarPage: React.FC = () => {
  const { fetchAllData } = useHabitStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Improved Application Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Habit Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build consistency, one day at a time
        </p>
      </div>

      {/* Minimal Navigation at the top */}
      <div className="mb-6">
        <NavigationModule />
      </div>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground text-sm">
          View and edit your habit history
        </p>
      </div>

      {/* Quick Actions Module */}
      <div className="mb-5">
        <QuickActionsModule />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Larger) */}
        <div className="lg:col-span-2">
          <CalendarView />
          {/* New visualizations placed below the calendar and side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <MonthlyCompletionHeatmap />
            <HabitStreakVisualization />
          </div>
        </div>

        {/* Right Column (Smaller) */}
        <div className="lg:col-span-1 space-y-5">
          <SevenDayTrend />
          <WeeklyPatterns />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
