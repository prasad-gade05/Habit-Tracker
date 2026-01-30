import { describe, it, expect } from 'vitest';
import {
  getToday,
  getLast365Days,
  getCompletionsForDate,
  isHabitCompletedOnDate,
  isHabitActiveOnDate,
  getCompletionPercentageForDate,
  formatDateForDisplay,
  isDateInRange,
  getWeekDays,
  Habit,
  Completion,
} from '../utils/dateUtils';
import { parseISO } from 'date-fns';

describe('dateUtils - getToday', () => {
  it('should return today date in YYYY-MM-DD format', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return current date', () => {
    const today = getToday();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    expect(today).toBe(`${year}-${month}-${day}`);
  });
});

describe('dateUtils - getLast365Days', () => {
  it('should return exactly 365 days', () => {
    const days = getLast365Days();
    expect(days).toHaveLength(365);
  });

  it('should return dates in ascending order', () => {
    const days = getLast365Days();
    for (let i = 1; i < days.length; i++) {
      expect(days[i] > days[i - 1]).toBe(true);
    }
  });

  it('should include today as the last day', () => {
    const days = getLast365Days();
    const today = getToday();
    expect(days[days.length - 1]).toBe(today);
  });

  it('should return dates in YYYY-MM-DD format', () => {
    const days = getLast365Days();
    days.forEach((day) => {
      expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe('dateUtils - getCompletionsForDate', () => {
  const mockCompletions: Completion[] = [
    { id: '1', habitId: 'h1', date: '2025-01-01' },
    { id: '2', habitId: 'h2', date: '2025-01-01' },
    { id: '3', habitId: 'h1', date: '2025-01-02' },
    { id: '4', habitId: 'h3', date: '2025-01-03' },
  ];

  it('should return completions for a specific date', () => {
    const result = getCompletionsForDate(mockCompletions, '2025-01-01');
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2025-01-01');
    expect(result[1].date).toBe('2025-01-01');
  });

  it('should return empty array for date with no completions', () => {
    const result = getCompletionsForDate(mockCompletions, '2025-12-31');
    expect(result).toHaveLength(0);
  });

  it('should handle empty completions array', () => {
    const result = getCompletionsForDate([], '2025-01-01');
    expect(result).toHaveLength(0);
  });
});

describe('dateUtils - isHabitCompletedOnDate', () => {
  const mockCompletions: Completion[] = [
    { id: '1', habitId: 'h1', date: '2025-01-01' },
    { id: '2', habitId: 'h2', date: '2025-01-01' },
    { id: '3', habitId: 'h1', date: '2025-01-02' },
  ];

  it('should return true if habit is completed on date', () => {
    const result = isHabitCompletedOnDate('h1', mockCompletions, '2025-01-01');
    expect(result).toBe(true);
  });

  it('should return false if habit is not completed on date', () => {
    const result = isHabitCompletedOnDate('h3', mockCompletions, '2025-01-01');
    expect(result).toBe(false);
  });

  it('should return false for empty completions', () => {
    const result = isHabitCompletedOnDate('h1', [], '2025-01-01');
    expect(result).toBe(false);
  });

  it('should distinguish between different dates', () => {
    const result1 = isHabitCompletedOnDate('h1', mockCompletions, '2025-01-01');
    const result2 = isHabitCompletedOnDate('h1', mockCompletions, '2025-01-03');
    expect(result1).toBe(true);
    expect(result2).toBe(false);
  });
});

describe('dateUtils - isHabitActiveOnDate', () => {
  it('should return true for habit active on all days', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
    };
    const result = isHabitActiveOnDate(habit, new Date('2025-01-15'));
    expect(result).toBe(true);
  });

  it('should return false for deleted habit', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      isDeleted: true,
    };
    const result = isHabitActiveOnDate(habit, new Date('2025-01-15'));
    expect(result).toBe(false);
  });

  it('should return false for paused habit within pause period', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      isPaused: true,
      pausedUntil: '2025-01-20',
    };
    const result = isHabitActiveOnDate(habit, new Date('2025-01-15'));
    expect(result).toBe(false);
  });

  it('should return true for paused habit after pause period', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      isPaused: true,
      pausedUntil: '2025-01-10',
    };
    const result = isHabitActiveOnDate(habit, new Date('2025-01-15'));
    expect(result).toBe(true);
  });

  it('should return false for temporary habit after end date', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      isTemporary: true,
      endDate: '2025-01-10',
    };
    const result = isHabitActiveOnDate(habit, new Date('2025-01-15'));
    expect(result).toBe(false);
  });

  it('should return true for temporary habit before end date', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      isTemporary: true,
      endDate: '2025-01-20',
    };
    const result = isHabitActiveOnDate(habit, new Date('2025-01-15'));
    expect(result).toBe(true);
  });

  it('should return true for habit scheduled on specific day', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    };
    // 2025-01-13 is a Monday
    const result = isHabitActiveOnDate(habit, new Date('2025-01-13'));
    expect(result).toBe(true);
  });

  it('should return false for habit not scheduled on specific day', () => {
    const habit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    };
    // 2025-01-14 is a Tuesday
    const result = isHabitActiveOnDate(habit, new Date('2025-01-14'));
    expect(result).toBe(false);
  });
});

describe('dateUtils - getCompletionPercentageForDate', () => {
  const habits: Habit[] = [
    { id: 'h1', name: 'Habit 1', createdAt: '2025-01-01' },
    { id: 'h2', name: 'Habit 2', createdAt: '2025-01-01' },
    { id: 'h3', name: 'Habit 3', createdAt: '2025-01-01' },
  ];

  const completions: Completion[] = [
    { id: '1', habitId: 'h1', date: '2025-01-15' },
    { id: '2', habitId: 'h2', date: '2025-01-15' },
  ];

  it('should return 0 when no habits exist', () => {
    const result = getCompletionPercentageForDate([], completions, '2025-01-15');
    expect(result).toBe(0);
  });

  it('should calculate correct percentage for partial completion', () => {
    const result = getCompletionPercentageForDate(habits, completions, '2025-01-15');
    expect(result).toBe(67); // 2 out of 3 = 66.67%, rounded to 67
  });

  it('should return 100 when all habits completed', () => {
    const allCompletions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-15' },
      { id: '2', habitId: 'h2', date: '2025-01-15' },
      { id: '3', habitId: 'h3', date: '2025-01-15' },
    ];
    const result = getCompletionPercentageForDate(habits, allCompletions, '2025-01-15');
    expect(result).toBe(100);
  });

  it('should return 0 when no habits completed', () => {
    const result = getCompletionPercentageForDate(habits, [], '2025-01-15');
    expect(result).toBe(0);
  });

  it('should only count active habits', () => {
    const habitsWithInactive: Habit[] = [
      { id: 'h1', name: 'Habit 1', createdAt: '2025-01-01' },
      { id: 'h2', name: 'Habit 2', createdAt: '2025-01-01', isDeleted: true },
      { id: 'h3', name: 'Habit 3', createdAt: '2025-01-01' },
    ];
    const result = getCompletionPercentageForDate(habitsWithInactive, completions, '2025-01-15');
    expect(result).toBe(50); // 1 out of 2 active habits
  });
});

describe('dateUtils - formatDateForDisplay', () => {
  it('should format date correctly', () => {
    const result = formatDateForDisplay('2025-01-15');
    expect(result).toMatch(/^[A-Za-z]+, [A-Za-z]+ \d{1,2}, \d{4}$/);
  });

  it('should handle different dates', () => {
    const result1 = formatDateForDisplay('2025-12-31');
    const result2 = formatDateForDisplay('2025-01-01');
    expect(result1).not.toBe(result2);
  });
});

describe('dateUtils - isDateInRange', () => {
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');

  it('should return true for date within range', () => {
    const result = isDateInRange(new Date('2025-01-15'), startDate, endDate);
    expect(result).toBe(true);
  });

  it('should return true for date at start of range', () => {
    const result = isDateInRange(new Date('2025-01-01'), startDate, endDate);
    expect(result).toBe(true);
  });

  it('should return true for date at end of range', () => {
    const result = isDateInRange(new Date('2025-01-31'), startDate, endDate);
    expect(result).toBe(true);
  });

  it('should return false for date before range', () => {
    const result = isDateInRange(new Date('2024-12-31'), startDate, endDate);
    expect(result).toBe(false);
  });

  it('should return false for date after range', () => {
    const result = isDateInRange(new Date('2025-02-01'), startDate, endDate);
    expect(result).toBe(false);
  });
});

describe('dateUtils - getWeekDays', () => {
  it('should return 7 days in a week', () => {
    const result = getWeekDays(new Date('2025-01-15'));
    expect(result).toHaveLength(7);
  });

  it('should start from Sunday', () => {
    const result = getWeekDays(new Date('2025-01-15'));
    expect(result[0].getDay()).toBe(0); // Sunday
  });

  it('should end on Saturday', () => {
    const result = getWeekDays(new Date('2025-01-15'));
    expect(result[6].getDay()).toBe(6); // Saturday
  });

  it('should return consecutive days', () => {
    const result = getWeekDays(new Date('2025-01-15'));
    for (let i = 1; i < result.length; i++) {
      const diff = result[i].getTime() - result[i - 1].getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000); // One day in milliseconds
    }
  });
});
