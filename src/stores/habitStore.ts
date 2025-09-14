import { create } from "zustand";
import { db } from "../lib/db";
import { Habit, Completion, isHabitActiveOnDate } from "../utils/dateUtils";
import { getToday } from "../utils/dateUtils";

interface HabitStore {
  habits: Habit[];
  completions: Completion[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchAllData: () => Promise<void>;
  addHabit: (
    name: string,
    description?: string,
    color?: string,
    daysOfWeek?: number[]
  ) => Promise<void>;
  updateHabit: (
    id: string,
    name: string,
    description?: string,
    color?: string,
    daysOfWeek?: number[]
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date?: string) => Promise<void>;
  getCompletionsForDate: (date: string) => Completion[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
  getActiveHabitsCount: (date?: string) => number;
  getCompletedTodayCount: (date?: string) => number;
  getCompletionRate: (date?: string) => number;
  getPerfectDaysCount: () => number;
  getHabitsForDay: (dayOfWeek: number) => Habit[];
  getTotalHabitsCount: () => number;
  getInactiveHabitsCount: (date?: string) => number;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  completions: [],
  loading: false,
  error: null,

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [habits, completions] = await Promise.all([
        db.getAllHabits(),
        db.getAllCompletions(),
      ]);
      set({ habits, completions, loading: false });
    } catch (error) {
      console.error("Error fetching data:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  addHabit: async (name, description, color, daysOfWeek) => {
    try {
      const id = await db.addHabit(name, description, color, daysOfWeek);
      const newHabit = {
        id,
        name,
        description,
        color,
        daysOfWeek,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ habits: [...state.habits, newHabit], error: null }));
    } catch (error) {
      console.error("Error adding habit:", error);
      set({ error: (error as Error).message });
      // Try to reinitialize the database if there's a version error
      if ((error as Error).message.includes("UpgradeError")) {
        try {
          // Force a reinitialization by clearing the store and refetching
          set({ habits: [], completions: [] });
          await get().fetchAllData();
        } catch (retryError) {
          console.error("Error reinitializing database:", retryError);
        }
      }
    }
  },

  updateHabit: async (id, name, description, color, daysOfWeek) => {
    try {
      await db.updateHabit(id, name, description, color, daysOfWeek);
      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id
            ? { ...habit, name, description, color, daysOfWeek }
            : habit
        ),
        error: null,
      }));
    } catch (error) {
      console.error("Error updating habit:", error);
      set({ error: (error as Error).message });
    }
  },

  deleteHabit: async (id) => {
    try {
      await db.deleteHabit(id);
      set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== id),
        completions: state.completions.filter(
          (completion) => completion.habitId !== id
        ),
        error: null,
      }));
    } catch (error) {
      console.error("Error deleting habit:", error);
      set({ error: (error as Error).message });
    }
  },

  toggleCompletion: async (habitId, date = getToday()) => {
    try {
      const { completions, habits } = get();
      const isCompleted = get().isHabitCompletedOnDate(habitId, date);

      if (isCompleted) {
        // Remove completion
        await db.deleteCompletion(habitId, date);
        set({
          completions: completions.filter(
            (completion) =>
              !(completion.habitId === habitId && completion.date === date)
          ),
          error: null,
        });
      } else {
        // Add completion
        const id = await db.addCompletion(habitId, date);
        const newCompletion = {
          id,
          habitId,
          date,
        };
        set({ completions: [...completions, newCompletion], error: null });
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      set({ error: (error as Error).message });
    }
  },

  getCompletionsForDate: (date) => {
    const { completions } = get();
    return completions.filter((completion) => completion.date === date);
  },

  isHabitCompletedOnDate: (habitId, date) => {
    const { completions, habits } = get();
    // Find the habit
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      // If habit is not active on this date, it's not considered completed
      if (!isHabitActiveOnDate(habit, new Date(date))) {
        return false;
      }
    }
    // Otherwise, check if there's an actual completion
    return completions.some(
      (completion) => completion.habitId === habitId && completion.date === date
    );
  },

  getActiveHabitsCount: (date = getToday()) => {
    const { habits } = get();
    const currentDate = new Date(date);
    // Filter habits that are active on the given date
    const activeHabits = habits.filter((habit) =>
      isHabitActiveOnDate(habit, currentDate)
    );
    return activeHabits.length;
  },

  getInactiveHabitsCount: (date = getToday()) => {
    const { habits } = get();
    const currentDate = new Date(date);
    // Filter habits that are NOT active on the given date
    const inactiveHabits = habits.filter(
      (habit) => !isHabitActiveOnDate(habit, currentDate)
    );
    return inactiveHabits.length;
  },

  getTotalHabitsCount: () => {
    const { habits } = get();
    return habits.length;
  },

  getCompletedTodayCount: (date = getToday()) => {
    const { habits, completions } = get();
    // Count only actually completed habits (not inactive ones)
    return habits.filter((habit) => {
      // Only count if habit is active today
      if (isHabitActiveOnDate(habit, new Date(date))) {
        // And actually completed
        return completions.some(
          (completion) =>
            completion.habitId === habit.id && completion.date === date
        );
      }
      return false;
    }).length;
  },

  getCompletionRate: (date = getToday()) => {
    const { getActiveHabitsCount, getCompletedTodayCount } = get();
    const activeHabits = getActiveHabitsCount(date);
    if (activeHabits === 0) return 0;
    // For completion rate, we need to count only active habits that are completed
    const { habits, isHabitCompletedOnDate } = get();
    const completedActiveHabits = habits.filter((habit) => {
      // Only count active habits
      if (isHabitActiveOnDate(habit, new Date(date))) {
        // And only those that are actually completed (not just inactive)
        return (
          isHabitCompletedOnDate(habit.id, date) &&
          // But we need to check if they're actually completed, not just considered completed due to inactivity
          get().completions.some(
            (completion) =>
              completion.habitId === habit.id && completion.date === date
          )
        );
      }
      return false;
    }).length;
    return Math.round((completedActiveHabits / activeHabits) * 100);
  },

  getPerfectDaysCount: () => {
    const { habits, completions, isHabitCompletedOnDate } = get();
    if (habits.length === 0) return 0;

    // Get all unique dates from completions
    const dates = [...new Set(completions.map((c) => c.date))];

    // Also check today even if there are no completions for it
    const today = getToday();
    if (!dates.includes(today)) {
      dates.push(today);
    }

    let perfectDays = 0;

    // For each date, check if all active habits were completed
    dates.forEach((date) => {
      // Get active habits for this specific date
      const activeHabitsForDate = habits.filter((habit) =>
        isHabitActiveOnDate(habit, new Date(date))
      );

      // If there are no active habits for this date, it's not a perfect day
      if (activeHabitsForDate.length === 0) {
        return;
      }

      // Count how many active habits were actually completed on this date
      const completedActiveHabits = activeHabitsForDate.filter((habit) =>
        isHabitCompletedOnDate(habit.id, date)
      ).length;

      // Check if all active habits were completed on this date
      if (completedActiveHabits === activeHabitsForDate.length) {
        perfectDays++;
      }
    });

    return perfectDays;
  },

  getHabitsForDay: (dayOfWeek) => {
    const { habits } = get();
    return habits.filter(
      (habit) =>
        !habit.daysOfWeek || // If daysOfWeek is undefined, habit is active on all days
        habit.daysOfWeek.includes(dayOfWeek)
    );
  },
}));
