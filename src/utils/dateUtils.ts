import {
  format,
  subDays,
  isSameDay,
  parseISO,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isBefore,
  isAfter,
} from "date-fns";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string; // ISO string
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday. If undefined, habit is active on all days
}

export interface Completion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
}

export const getToday = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

export const getLast365Days = (): string[] => {
  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    days.push(format(subDays(today, i), "yyyy-MM-dd"));
  }
  return days;
};

export const getCompletionsForDate = (
  completions: Completion[],
  date: string
): Completion[] => {
  return completions.filter((completion) => completion.date === date);
};

export const isHabitCompletedOnDate = (
  habitId: string,
  completions: Completion[],
  date: string
): boolean => {
  // Find the habit
  // Note: This function should be called in a context where habits are available
  // For now, we'll just check if there's a completion
  return completions.some(
    (completion) => completion.habitId === habitId && completion.date === date
  );
};

export const isHabitActiveOnDate = (habit: Habit, date: Date): boolean => {
  // If no days are specified, the habit is active on all days
  if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) {
    return true;
  }

  // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = date.getDay();

  // Check if the habit is scheduled for this day
  return habit.daysOfWeek.includes(dayOfWeek);
};

export const getCompletionPercentageForDate = (
  habits: Habit[],
  completions: Completion[],
  date: string
): number => {
  // Filter habits that are active on the given date
  const activeHabits = habits.filter((habit) =>
    isHabitActiveOnDate(habit, parseISO(date))
  );

  if (activeHabits.length === 0) return 0;

  const completionsForDate = getCompletionsForDate(completions, date);
  // Count only completions for active habits
  const completedHabits = activeHabits.filter((habit) =>
    isHabitCompletedOnDate(habit.id, completions, date)
  ).length;

  const totalHabits = activeHabits.length;

  return Math.round((completedHabits / totalHabits) * 100);
};

export const getWeekDays = (startDate: Date): Date[] => {
  const start = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday as start
  const end = endOfWeek(startDate, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, "EEEE, MMMM d, yyyy");
};

export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return !isBefore(date, startDate) && !isAfter(date, endDate);
};
