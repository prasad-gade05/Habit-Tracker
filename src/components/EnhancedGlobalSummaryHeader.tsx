import React, { useEffect, useRef } from "react";
import { useHabitStore } from "../stores/habitStore";
import EnhancedGlobalSummaryCard from "./EnhancedGlobalSummaryCard";

const EnhancedGlobalSummaryHeader: React.FC = () => {
  const {
    getActiveHabitsCount,
    getCompletedTodayCount,
    getCompletionRate,
    getPerfectDaysCount,
  } = useHabitStore();

  const activeHabits = getActiveHabitsCount();
  const completedToday = getCompletedTodayCount();
  const completionRate = getCompletionRate();
  const perfectDays = getPerfectDaysCount();

  // Store previous values for celebration animations
  const prevValuesRef = useRef({
    activeHabits: activeHabits,
    completedToday: completedToday,
    completionRate: completionRate,
    perfectDays: perfectDays,
  });

  // Update previous values after current values change
  useEffect(() => {
    const timer = setTimeout(() => {
      prevValuesRef.current = {
        activeHabits,
        completedToday,
        completionRate,
        perfectDays,
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [activeHabits, completedToday, completionRate, perfectDays]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <EnhancedGlobalSummaryCard
        label="Active Habits"
        value={activeHabits}
        type="activeHabits"
        previousValue={prevValuesRef.current.activeHabits}
      />
      <EnhancedGlobalSummaryCard
        label="Completed Today"
        value={`${completedToday} / ${activeHabits}`}
        type="completedToday"
        previousValue={`${prevValuesRef.current.completedToday} / ${prevValuesRef.current.activeHabits}`}
      />
      <EnhancedGlobalSummaryCard
        label="Completion Rate"
        value={`${completionRate}%`}
        type="completionRate"
        previousValue={`${prevValuesRef.current.completionRate}%`}
      />
      <EnhancedGlobalSummaryCard
        label="Perfect Days"
        value={perfectDays}
        type="perfectDays"
        previousValue={prevValuesRef.current.perfectDays}
      />
    </div>
  );
};

export default EnhancedGlobalSummaryHeader;
