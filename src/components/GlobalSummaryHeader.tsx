import React from "react";
import { useHabitStore } from "../stores/habitStore";
import GlobalSummaryCard from "./GlobalSummaryCard";
import { getToday } from "../utils/dateUtils";

const GlobalSummaryHeader: React.FC = () => {
  const {
    getActiveHabitsCount,
    getCompletedTodayCount,
    getCompletionRate,
    getPerfectDaysCount,
  } = useHabitStore();

  const today = getToday();
  const activeHabits = getActiveHabitsCount(today);
  const completedToday = getCompletedTodayCount(today);
  const completionRate = getCompletionRate(today);
  const perfectDays = getPerfectDaysCount();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <GlobalSummaryCard
        label="Active Habits Today"
        value={activeHabits}
        type="activeHabits"
      />
      <GlobalSummaryCard
        label="Completed Today"
        value={`${completedToday} / ${activeHabits}`}
        type="completedToday"
      />
      <GlobalSummaryCard
        label="Completion Rate"
        value={`${completionRate}%`}
        type="completionRate"
      />
      <GlobalSummaryCard
        label="Perfect Days"
        value={perfectDays}
        type="perfectDays"
      />
    </div>
  );
};

export default GlobalSummaryHeader;
