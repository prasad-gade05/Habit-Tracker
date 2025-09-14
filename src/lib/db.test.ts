import { db } from "./db";

describe("Database tests", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.deleteAllData();
  });

  it("should add a habit successfully", async () => {
    const habitName = "Test Habit";
    const habitDescription = "This is a test habit";

    const id = await db.addHabit(habitName, habitDescription);

    expect(id).toBeDefined();
    expect(typeof id).toBe("string");

    const habits = await db.getAllHabits();
    expect(habits).toHaveLength(1);

    const habit = habits[0];
    expect(habit.name).toBe(habitName);
    expect(habit.description).toBe(habitDescription);
    expect(habit.id).toBe(id);
  });

  it("should handle habits without descriptions", async () => {
    const habitName = "Test Habit No Description";

    const id = await db.addHabit(habitName);

    expect(id).toBeDefined();

    const habits = await db.getAllHabits();
    expect(habits).toHaveLength(1);

    const habit = habits[0];
    expect(habit.name).toBe(habitName);
    expect(habit.description).toBeUndefined();
  });
});
