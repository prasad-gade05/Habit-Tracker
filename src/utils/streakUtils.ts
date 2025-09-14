import { format, subDays, isSameDay, parseISO, addDays } from "date-fns";
import { Habit, Completion, isHabitActiveOnDate } from "./dateUtils";

export interface HabitWithStreak extends Habit {
  currentStreak: number;
  isCompletedToday: boolean;
}

export const calculateHabitStreak = (
  habit: Habit,
  completions: Completion[],
  currentDate: string = format(new Date(), "yyyy-MM-dd")
): number => {
  const habitCompletions = completions
    .filter((completion) => completion.habitId === habit.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  let checkDate = parseISO(currentDate);

  // Check if habit is active today
  const isHabitActiveToday = isHabitActiveOnDate(habit, checkDate);
  
  // If habit is not active today, we don't count it in the streak calculation
  if (!isHabitActiveToday) {
    return 0;
  }

  // Check if today is completed
  const todayCompleted = habitCompletions.some(
    (completion) => completion.date === currentDate
  );

  // If today is not completed but habit is active today, start checking from yesterday
  if (!todayCompleted) {
    checkDate = subDays(checkDate, 1);
  }

  // Count consecutive days with completions or inactive days
  let daysChecked = 0;
  while (daysChecked < 365) { // Max 365 days to prevent infinite loops
    // Check if habit is active on this day
    const isActiveOnDate = isHabitActiveOnDate(habit, checkDate);
    
    if (isActiveOnDate) {
      const dateString = format(checkDate, "yyyy-MM-dd");
      const dayCompleted = habitCompletions.some(
        (completion) => completion.date === dateString
      );

      if (dayCompleted) {
        streak++;
      } else {
        // If habit is active but not completed, break the streak
        // unless we're at the start and haven't completed yet
        if (todayCompleted || dateString !== currentDate) {
          break;
        }
      }
    } else {
      // For inactive days, we don't count them in the streak
      // This maintains the current behavior where inactive days don't affect streaks
    }
    
    // Move to the previous day
    checkDate = subDays(checkDate, 1);
    daysChecked++;
  }

  return streak;
};

export const isHabitCompletedToday = (
  habitId: string,
  completions: Completion[],
  currentDate: string = format(new Date(), "yyyy-MM-dd")
): boolean => {
  // This function should be called in a context where habits are available
  // For now, we'll assume the habit is active and just check if there's a completion
  // The proper implementation should be in the habit store
  return completions.some(
    (completion) =>
      completion.habitId === habitId && completion.date === currentDate
  );
};

export const getStreakBadgeColor = (streak: number): string => {
  if (streak === 0) return "bg-gray-100 text-gray-600 border-gray-200";
  if (streak <= 5) return "bg-orange-100 text-orange-700 border-orange-200";
  if (streak <= 20) return "bg-orange-200 text-orange-800 border-orange-300";
  return "bg-red-200 text-red-800 border-red-300";
};

export const getStreakEmoji = (streak: number): string => {
  if (streak === 0) return "💤";
  if (streak <= 3) return "🔥";
  if (streak <= 7) return "🔥🔥";
  if (streak <= 14) return "🔥🔥🔥";
  if (streak <= 30) return "🔥🔥🔥🔥";
  return "🔥🔥🔥🔥🔥";
};