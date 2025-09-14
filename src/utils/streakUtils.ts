import { format, subDays, isSameDay, parseISO } from "date-fns";
import { Habit, Completion } from "./dateUtils";

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

  if (habitCompletions.length === 0) return 0;

  let streak = 0;
  let checkDate = parseISO(currentDate);

  // Check if today is completed
  const todayCompleted = habitCompletions.some(
    (completion) => completion.date === currentDate
  );

  // If today is not completed, start checking from yesterday
  if (!todayCompleted) {
    checkDate = subDays(checkDate, 1);
  }

  // Count consecutive days
  for (let i = 0; i < 365; i++) {
    // Max 365 days to prevent infinite loops
    const dateString = format(checkDate, "yyyy-MM-dd");
    const dayCompleted = habitCompletions.some(
      (completion) => completion.date === dateString
    );

    if (dayCompleted) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  return streak;
};

export const isHabitCompletedToday = (
  habitId: string,
  completions: Completion[],
  currentDate: string = format(new Date(), "yyyy-MM-dd")
): boolean => {
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
