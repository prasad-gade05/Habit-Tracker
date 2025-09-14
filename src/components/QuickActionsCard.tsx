import React from "react";
import { useHabitStore } from "../stores/habitStore";
import { getToday } from "../utils/dateUtils";
import { Checkbox } from "@/components/ui/checkbox";

const QuickActionsCard: React.FC = () => {
  const { habits, getCompletionsForDate, toggleCompletion } = useHabitStore();
  const today = getToday();
  const todayCompletions = getCompletionsForDate(today);

  // Calculate completion percentage for today
  const completionPercentage =
    habits.length > 0
      ? Math.round((todayCompletions.length / habits.length) * 100)
      : 0;

  const handleToggle = (habitId: string) => {
    toggleCompletion(habitId, today);
  };

  const isHabitCompleted = (habitId: string) => {
    return todayCompletions.some(
      (completion) => completion.habitId === habitId
    );
  };

  return (
    <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Today's Progress
        </h2>
        <div className="text-right">
          <div className="text-xs text-foreground">
            {todayCompletions.length}/{habits.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-1.5 mb-3">
        <div
          className="bg-green-500 h-1.5 rounded-full progress-bar"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {/* Habits list - more compact */}
      <div className="space-y-2">
        {habits.length > 0 ? (
          habits.slice(0, 3).map(
            (
              habit // Show only first 3 habits to save space
            ) => (
              <div key={habit.id} className="flex items-center justify-between">
                <span className="text-xs text-foreground truncate mr-2">
                  {habit.name}
                </span>
                <Checkbox
                  checked={isHabitCompleted(habit.id)}
                  onCheckedChange={() => handleToggle(habit.id)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 h-4 w-4"
                />
              </div>
            )
          )
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            <p className="text-xs">No habits yet</p>
          </div>
        )}
        {habits.length > 3 && (
          <div className="text-xs text-muted-foreground text-center">
            +{habits.length - 3} more habits
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionsCard;
