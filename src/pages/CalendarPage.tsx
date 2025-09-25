import React, { useEffect } from "react";
import { useHabitStore } from "../stores/habitStore";
import { useSearchParams } from "react-router-dom";
import CalendarView from "../components/CalendarView";
import SevenDayTrend from "../components/SevenDayTrend";
import WeeklyPatterns from "../components/WeeklyPatterns";
import NavigationModule from "../components/NavigationModule";
import MinimalTodaysProgress from "../components/MinimalTodaysProgress";
import MonthlyCompletionHeatmap from "../components/MonthlyCompletionHeatmap";
import HabitStreakVisualization from "../components/HabitStreakVisualization";
import { parseISO } from "date-fns";

const CalendarPage: React.FC = () => {
  const { fetchAllData } = useHabitStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Get the date parameter from URL and parse it
  const dateParam = searchParams.get("date");
  const initialDate = dateParam ? parseISO(dateParam) : new Date();

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

      {/* Minimal Today's Progress Module */}
      <div className="mb-5">
        <MinimalTodaysProgress />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Larger) */}
        <div className="lg:col-span-2">
          {/* Pass the initialDate to CalendarView */}
          <CalendarView initialDate={initialDate} />
          {/* New visualizations placed below the calendar and side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <MonthlyCompletionHeatmap />
            <WeeklyPatterns />
          </div>
        </div>

        {/* Right Column (Smaller) */}
        <div className="lg:col-span-1 space-y-5">
          <SevenDayTrend />
          <HabitStreakVisualization />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;