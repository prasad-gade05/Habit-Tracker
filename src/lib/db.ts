import Dexie, { type EntityTable } from "dexie";
import { Habit, Completion } from "../utils/dateUtils";

interface HabitRecord extends Habit {
  id: string;
  description?: string;
}

interface CompletionRecord extends Completion {
  id: string;
}

class HabitTrackerDB extends Dexie {
  habits: EntityTable<HabitRecord, "id">;
  completions: EntityTable<CompletionRecord, "id">;

  constructor() {
    super("HabitTrackerDB");

    // Handle potential version conflicts by deleting the database and recreating it
    this.on("versionchange", (event) => {
      console.log("Database version change detected", event);
    });

    this.version(1).stores({
      habits: "id, name, description, createdAt",
      completions: "id, habitId, date, [habitId+date]", // Composite index for faster queries
    });

    this.habits = this.table("habits") as EntityTable<HabitRecord, "id">;
    this.completions = this.table("completions") as EntityTable<
      CompletionRecord,
      "id"
    >;
  }

  // Habit methods
  async addHabit(name: string, description?: string): Promise<string> {
    try {
      const id = await this.habits.add({
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: new Date().toISOString(),
      });
      return id as string;
    } catch (error) {
      console.error("Error adding habit:", error);
      throw error;
    }
  }

  async getAllHabits(): Promise<HabitRecord[]> {
    return await this.habits.toArray();
  }

  async updateHabit(
    id: string,
    name: string,
    description?: string
  ): Promise<void> {
    await this.habits.update(id, { name, description });
  }

  async deleteHabit(id: string): Promise<void> {
    // Delete the habit and all its completions
    await this.transaction("rw", this.habits, this.completions, async () => {
      await this.habits.delete(id);
      await this.completions.where("habitId").equals(id).delete();
    });
  }

  // Completion methods
  async addCompletion(habitId: string, date: string): Promise<string> {
    // Check if completion already exists
    const existing = await this.completions.where({ habitId, date }).first();
    if (existing) {
      return existing.id;
    }

    const id = await this.completions.add({
      id: crypto.randomUUID(),
      habitId,
      date,
    });
    return id as string;
  }

  async getAllCompletions(): Promise<Completion[]> {
    return await this.completions.toArray();
  }

  async getCompletionsForDate(date: string): Promise<Completion[]> {
    return await this.completions.where("date").equals(date).toArray();
  }

  async getCompletionsForHabit(habitId: string): Promise<Completion[]> {
    return await this.completions.where("habitId").equals(habitId).toArray();
  }

  async deleteCompletion(habitId: string, date: string): Promise<void> {
    await this.completions.where({ habitId, date }).delete();
  }

  async deleteAllData(): Promise<void> {
    await this.transaction("rw", this.habits, this.completions, async () => {
      await this.habits.clear();
      await this.completions.clear();
    });
  }

  async exportData(): Promise<{
    habits: HabitRecord[];
    completions: Completion[];
  }> {
    const habits = await this.getAllHabits();
    const completions = await this.getAllCompletions();
    return { habits, completions };
  }

  async importData(data: {
    habits: HabitRecord[];
    completions: Completion[];
  }): Promise<void> {
    await this.transaction("rw", this.habits, this.completions, async () => {
      await this.habits.clear();
      await this.completions.clear();

      if (data.habits?.length) {
        await this.habits.bulkAdd(
          data.habits.map((habit) => ({
            ...habit,
            id: habit.id || crypto.randomUUID(),
          }))
        );
      }

      if (data.completions?.length) {
        await this.completions.bulkAdd(
          data.completions.map((completion) => ({
            ...completion,
            id: completion.id || crypto.randomUUID(),
          }))
        );
      }
    });
  }

  // Utility method to reset the database
  async resetDatabase(): Promise<void> {
    try {
      await this.delete();
      // Recreate the database instance
      const newDb = new HabitTrackerDB();
      this.habits = newDb.habits;
      this.completions = newDb.completions;
    } catch (error) {
      console.error("Error resetting database:", error);
      throw error;
    }
  }
}

// Create a function to safely initialize the database
const initializeDB = async (): Promise<HabitTrackerDB> => {
  try {
    const db = new HabitTrackerDB();
    // Test the connection
    await db.habits.count();
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    // If there's a version conflict, delete and recreate the database
    try {
      await Dexie.delete("HabitTrackerDB");
      const db = new HabitTrackerDB();
      return db;
    } catch (retryError) {
      console.error("Error reinitializing database:", retryError);
      throw retryError;
    }
  }
};

// Export the database instance
export const db = new HabitTrackerDB();

// Export the reset function for testing
export const resetDatabase = async (): Promise<void> => {
  await db.resetDatabase();
};
