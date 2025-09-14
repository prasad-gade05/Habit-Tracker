import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Completion, isHabitActiveOnDate } from "../utils/dateUtils";
import { parseISO, isBefore, isAfter, addDays, subDays } from "date-fns";
import { Flame, Trophy } from "lucide-react";

const StreakAnalytics: React.FC = () => {
  const { habits, completions } = useHabitStore();

  // Calculate streaks for each habit
  const habitStreaks = useMemo(() => {
    return habits.map((habit) => {
      // Get all completions for this habit, sorted by date
      const habitCompletions = completions
        .filter((c) => c.habitId === habit.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (habitCompletions.length === 0) {
        return {
          ...habit,
          currentStreak: 0,
          longestStreak: 0,
        };
      }

      // For day-specific habits, we need to consider only the days when the habit is active
      // Convert completion dates to actual Date objects
      const completionDates = habitCompletions.map((c) => parseISO(c.date));

      // Calculate current streak (consecutive active days ending with today or last completion)
      let currentStreak = 0;
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Find the most recent completion date
      const lastCompletion = habitCompletions[habitCompletions.length - 1];
      const lastCompletionDate = parseISO(lastCompletion.date);

      // Check if the habit is active today or was completed today/yesterday
      if (
        isHabitActiveOnDate(habit, today) ||
        isHabitActiveOnDate(habit, lastCompletionDate) ||
        isHabitActiveOnDate(habit, subDays(today, 1))
      ) {
        // Start from today and work backwards, counting only active days
        let currentDate = today;
        let streakDays = 0;

        // Continue counting while we find completed active days
        while (true) {
          // Check if habit is active on this date
          if (isHabitActiveOnDate(habit, currentDate)) {
            // Check if there's a completion for this date
            const dateStr = currentDate.toISOString().split("T")[0];
            const hasCompletion = habitCompletions.some(
              (c) => c.date === dateStr
            );

            if (hasCompletion) {
              streakDays++;
            } else {
              // If habit is active but not completed, break the streak
              // unless we're at the start (today) and haven't completed yet
              const isToday =
                currentDate.toDateString() === today.toDateString();
              if (!isToday) {
                break;
              }
            }
          }

          // Move to the previous day
          currentDate = subDays(currentDate, 1);

          // Safety check to prevent infinite loop
          if (streakDays > 365) break;
        }

        currentStreak = streakDays;
      }

      // Calculate longest streak by examining all completion sequences
      let longestStreak = 0;

      // Group completions by consecutive active days
      if (habitCompletions.length > 0) {
        let maxStreak = 0;
        let currentStreak = 0;
        let previousDate = parseISO(habitCompletions[0].date);

        // Start with the first completion
        if (isHabitActiveOnDate(habit, previousDate)) {
          currentStreak = 1;
        }

        // Check each subsequent completion
        for (let i = 1; i < habitCompletions.length; i++) {
          const currentDate = parseISO(habitCompletions[i].date);

          // Check if the habit was active on both dates
          if (
            isHabitActiveOnDate(habit, previousDate) &&
            isHabitActiveOnDate(habit, currentDate)
          ) {
            // Calculate the difference in days
            const timeDiff = currentDate.getTime() - previousDate.getTime();
            const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

            // If it's the next day, continue the streak
            if (dayDiff === 1) {
              currentStreak++;
            }
            // If it's the same day (shouldn't happen but just in case), don't increment
            else if (dayDiff === 0) {
              // Do nothing
            }
            // If there's a gap, end the current streak and start a new one
            else {
              maxStreak = Math.max(maxStreak, currentStreak);
              currentStreak = 1;
            }
          } else {
            // If habit wasn't active on one of the dates, end the streak
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = isHabitActiveOnDate(habit, currentDate) ? 1 : 0;
          }

          previousDate = currentDate;
        }

        // Don't forget the final streak
        maxStreak = Math.max(maxStreak, currentStreak);
        longestStreak = maxStreak;
      }

      return {
        ...habit,
        currentStreak,
        longestStreak,
      };
    });
  }, [habits, completions]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Streak Analytics
      </h2>

      <div className="space-y-4">
        {habitStreaks.length > 0 ? (
          habitStreaks.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">{habit.name}</div>
                {habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Active:{" "}
                    {habit.daysOfWeek
                      .map(
                        (day) =>
                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]
                      )
                      .join(", ")}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Flame className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-foreground font-medium">
                    {habit.currentStreak}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    current
                  </span>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-foreground font-medium">
                    {habit.longestStreak}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    longest
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No habits to analyze yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakAnalytics;
