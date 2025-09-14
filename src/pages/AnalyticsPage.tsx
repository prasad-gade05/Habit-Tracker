import React, { useEffect } from "react";
import { useHabitStore } from "../stores/habitStore";
import PerformanceBreakdown from "../components/PerformanceBreakdown";
import StreakAnalytics from "../components/StreakAnalytics";
import PatternRecognition from "../components/PatternRecognition";
import HabitManager from "../components/HabitManager";

const AnalyticsPage: React.FC = () => {
  const { fetchAllData } = useHabitStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Analytics & Insights
        </h1>
        <p className="text-muted-foreground">Deep dive into your habit data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PerformanceBreakdown />
        <StreakAnalytics />
      </div>

      <div className="mt-8">
        <PatternRecognition />
      </div>

      <div className="mt-8">
        <HabitManager />
      </div>
    </div>
  );
};

export default AnalyticsPage;
