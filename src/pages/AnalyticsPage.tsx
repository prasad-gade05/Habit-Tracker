import React, { useEffect } from "react";
import { useHabitStore } from "../stores/habitStore";
import PerformanceBreakdown from "../components/PerformanceBreakdown";
import StreakAnalytics from "../components/StreakAnalytics";
import PatternRecognition from "../components/PatternRecognition";
import GlobalSummaryHeader from "../components/GlobalSummaryHeader";
import NavigationModule from "../components/NavigationModule";
import QuickActionsModule from "../components/QuickActionsModule";
import MyHabitsModule from "../components/MyHabitsModule";
import CompletionRatesVisual from "../components/CompletionRatesVisual";
import HabitCorrelations from "../components/HabitCorrelations";

const AnalyticsPage: React.FC = () => {
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
        <h1 className="text-xl font-bold text-foreground">
          Analytics & Insights
        </h1>
        <p className="text-muted-foreground text-sm">
          Deep dive into your habit data
        </p>
      </div>

      <GlobalSummaryHeader />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {/* Left column (sidebar) */}
        <div className="md:col-span-1 space-y-5">
          <QuickActionsModule />
          <CompletionRatesVisual />
          <HabitCorrelations />
        </div>

        {/* Right column (main content) */}
        <div className="md:col-span-2 space-y-5">
          <MyHabitsModule />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PerformanceBreakdown />
            <StreakAnalytics />
          </div>
          <PatternRecognition />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
