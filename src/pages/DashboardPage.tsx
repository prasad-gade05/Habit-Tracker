import React, { useEffect } from "react";
import { useHabitStore } from "../stores/habitStore";
import GlobalSummaryHeader from "../components/GlobalSummaryHeader";
import QuickActionsModule from "../components/QuickActionsModule";
import ContributionChart from "../components/ContributionChart";
import NavigationModule from "../components/NavigationModule";
// ConsistencyCard removed as requested
import MyHabitsModule from "../components/MyHabitsModule";
import WeeklyOverviewChart from "../components/WeeklyOverviewChart";

const DashboardPage: React.FC = () => {
  const { fetchAllData, loading } = useHabitStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your habits...</div>
      </div>
    );
  }

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

      <GlobalSummaryHeader />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {/* Left column (sidebar) */}
        <div className="md:col-span-1 space-y-5">
          <QuickActionsModule />
          {/* ConsistencyCard removed as requested */}
          <WeeklyOverviewChart />
        </div>

        {/* Right column (main content) */}
        <div className="md:col-span-2 space-y-5">
          <MyHabitsModule />
          <ContributionChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;