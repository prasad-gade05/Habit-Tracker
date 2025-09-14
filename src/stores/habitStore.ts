import { create } from "zustand";
import { db } from "../lib/db";
import { Habit, Completion } from "../utils/dateUtils";
import { getToday } from "../utils/dateUtils";

interface HabitStore {
  habits: Habit[];
  completions: Completion[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchAllData: () => Promise<void>;
  addHabit: (name: string, description?: string) => Promise<void>;
  updateHabit: (
    id: string,
    name: string,
    description?: string
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date?: string) => Promise<void>;
  getCompletionsForDate: (date: string) => Completion[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
  getActiveHabitsCount: () => number;
  getCompletedTodayCount: () => number;
  getCompletionRate: () => number;
  getPerfectDaysCount: () => number;
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

  addHabit: async (name, description) => {
    try {
      const id = await db.addHabit(name, description);
      const newHabit = {
        id,
        name,
        description,
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

  updateHabit: async (id, name, description) => {
    try {
      await db.updateHabit(id, name, description);
      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, name, description } : habit
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
    const { completions } = get();
    return completions.some(
      (completion) => completion.habitId === habitId && completion.date === date
    );
  },

  getActiveHabitsCount: () => {
    const { habits } = get();
    return habits.length;
  },

  getCompletedTodayCount: () => {
    const { getCompletionsForDate } = get();
    const today = getToday();
    return getCompletionsForDate(today).length;
  },

  getCompletionRate: () => {
    const { getActiveHabitsCount, getCompletedTodayCount } = get();
    const activeHabits = getActiveHabitsCount();
    if (activeHabits === 0) return 0;
    const completedToday = getCompletedTodayCount();
    return Math.round((completedToday / activeHabits) * 100);
  },

  getPerfectDaysCount: () => {
    const { habits, completions } = get();
    if (habits.length === 0) return 0;

    // Group completions by date
    const completionsByDate: Record<string, number> = {};
    completions.forEach((completion) => {
      completionsByDate[completion.date] =
        (completionsByDate[completion.date] || 0) + 1;
    });

    // Count days where all habits were completed
    let perfectDays = 0;
    Object.values(completionsByDate).forEach((count) => {
      if (count === habits.length) {
        perfectDays++;
      }
    });

    return perfectDays;
  },
}));
