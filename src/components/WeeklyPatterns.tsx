import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { format, subDays } from "date-fns";

const WeeklyPatterns: React.FC = () => {
  const { habits, completions, isHabitCompletedOnDate } = useHabitStore();

  // Calculate patterns based on historical data (last 30 days)
  const dayPatterns = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const patterns = dayNames.map((dayName, index) => {
      // Collect data for this day of the week over the last 30 days
      const percentages: number[] = [];
      const today = new Date();

      // Go back 30 days
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, i);
        // Check if this date matches the day of the week we're analyzing
        if (date.getDay() === index) {
          const dateString = format(date, "yyyy-MM-dd");

          // Get active habits for this specific date
          const activeHabits = habits.filter((habit) =>
            isHabitActiveOnDate(habit, date)
          );

          // If there are no active habits for this date, skip it
          if (activeHabits.length === 0) {
            continue;
          }

          // Count completed active habits for this date
          const completedHabits = activeHabits.filter((habit) =>
            isHabitCompletedOnDate(habit.id, dateString)
          ).length;

          // Calculate percentage for this date
          const percentage = Math.round(
            (completedHabits / activeHabits.length) * 100
          );
          percentages.push(percentage);
        }
      }

      // Calculate average percentage for this day
      const averagePercentage =
        percentages.length > 0
          ? Math.round(
              percentages.reduce((sum, p) => sum + p, 0) / percentages.length
            )
          : 0;

      return {
        dayName,
        percentage: averagePercentage,
      };
    });

    return patterns;
  }, [habits, completions, isHabitCompletedOnDate]);

  // Find the best day
  const bestDay = dayPatterns.reduce((best, current) =>
    current.percentage > best.percentage ? current : best
  );

  // Calculate weekend vs weekday average
  const weekendDays = dayPatterns.filter(
    (_, index) => index === 0 || index === 6
  );
  const weekdayDays = dayPatterns.filter((_, index) => index > 0 && index < 6);

  const weekendAverage =
    weekendDays.length > 0
      ? Math.round(
          weekendDays.reduce((sum, day) => sum + day.percentage, 0) /
            weekendDays.length
        )
      : 0;

  const weekdayAverage =
    weekdayDays.length > 0
      ? Math.round(
          weekdayDays.reduce((sum, day) => sum + day.percentage, 0) /
            weekdayDays.length
        )
      : 0;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Weekly Patterns
      </h2>

      <div className="space-y-3">
        {dayPatterns.map((day, index) => (
          <div key={index} className="flex items-center">
            <div className="w-10 text-sm text-muted-foreground">
              {day.dayName}
            </div>
            <div className="flex-1 ml-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    day.dayName === bestDay.dayName
                      ? "bg-accent"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${day.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="w-10 text-right text-sm text-foreground">
              {day.percentage}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/20 rounded-lg p-3">
            <div className="text-sm text-green-500">Weekends</div>
            <div className="text-lg font-semibold text-foreground">
              {weekendAverage}%
            </div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3">
            <div className="text-sm text-blue-500">Weekdays</div>
            <div className="text-lg font-semibold text-foreground">
              {weekdayAverage}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-accent/20 rounded-lg p-3">
            <div className="text-sm text-accent">Best Day</div>
            <div className="text-lg font-semibold text-foreground">
              {bestDay.dayName}
            </div>
          </div>
          <div className="bg-red-500/20 rounded-lg p-3">
            <div className="text-sm text-red-500">Needs Work</div>
            <div className="text-lg font-semibold text-foreground">
              {dayPatterns.find(
                (day) =>
                  day.percentage ===
                  Math.min(...dayPatterns.map((d) => d.percentage))
              )?.dayName || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPatterns;
