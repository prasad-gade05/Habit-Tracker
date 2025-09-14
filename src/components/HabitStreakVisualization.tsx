import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit } from "../utils/dateUtils";
import {
  calculateHabitStreak,
  isHabitCompletedToday,
} from "../utils/streakUtils";
import { Flame, Calendar } from "lucide-react";
import { format } from "date-fns";

const HabitStreakVisualization: React.FC = () => {
  const { habits, completions } = useHabitStore();

  // Calculate streaks for each habit
  const habitsWithStreaks = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");

    return habits.map((habit) => {
      const currentStreak = calculateHabitStreak(habit, completions, today);
      const isCompletedToday = isHabitCompletedToday(
        habit.id,
        completions,
        today
      );

      return {
        ...habit,
        currentStreak,
        isCompletedToday,
      };
    });
  }, [habits, completions]);

  // Get habits with the longest streaks (top 5)
  const topStreakHabits = useMemo(() => {
    return [...habitsWithStreaks]
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5);
  }, [habitsWithStreaks]);

  // Get habits that are currently active (have streaks > 0)
  const activeHabits = useMemo(() => {
    return habitsWithStreaks.filter((habit) => habit.currentStreak > 0);
  }, [habitsWithStreaks]);

  // Calculate total active streaks
  const totalActiveStreaks = activeHabits.length;

  // Calculate average streak length
  const averageStreak =
    activeHabits.length > 0
      ? Math.round(
          activeHabits.reduce((sum, habit) => sum + habit.currentStreak, 0) /
            activeHabits.length
        )
      : 0;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Habit Streaks
      </h2>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Your current habit streaks and consistency
        </p>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
          <p>
            No habits to track yet. Add some habits to start building streaks!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-500/20 rounded-lg p-3">
              <div className="text-sm text-green-500">Active Streaks</div>
              <div className="text-2xl font-bold text-foreground">
                {totalActiveStreaks}
              </div>
            </div>
            <div className="bg-orange-500/20 rounded-lg p-3">
              <div className="text-sm text-orange-500">Avg. Streak</div>
              <div className="text-2xl font-bold text-foreground">
                {averageStreak} days
              </div>
            </div>
          </div>

          {topStreakHabits.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Top Streaks
              </h3>
              <div className="space-y-3">
                {topStreakHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    style={{
                      borderLeft: habit.color
                        ? `3px solid ${habit.color}`
                        : "3px solid #3B82F6",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-medium text-foreground truncate">
                          {habit.name}
                        </span>
                        {habit.isCompletedToday && (
                          <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <Flame className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm text-foreground">
                          {habit.currentStreak} day
                          {habit.currentStreak !== 1 ? "s" : ""} streak
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HabitStreakVisualization;
