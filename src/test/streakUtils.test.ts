import { describe, it, expect } from 'vitest';
import {
  calculateHabitStreak,
  isHabitCompletedToday,
  getStreakBadgeColor,
  getStreakEmoji,
} from '../utils/streakUtils';
import { Habit, Completion } from '../utils/dateUtils';

describe('streakUtils - calculateHabitStreak', () => {
  const habit: Habit = {
    id: 'h1',
    name: 'Test Habit',
    createdAt: '2025-01-01',
  };

  it('should return 0 for habit with no completions', () => {
    const result = calculateHabitStreak(habit, [], '2025-01-15');
    expect(result).toBe(0);
  });

  it('should calculate streak correctly for consecutive completions', () => {
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-15' },
      { id: '2', habitId: 'h1', date: '2025-01-14' },
      { id: '3', habitId: 'h1', date: '2025-01-13' },
    ];
    const result = calculateHabitStreak(habit, completions, '2025-01-15');
    expect(result).toBe(3);
  });

  it('should stop counting when streak is broken', () => {
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-15' },
      { id: '2', habitId: 'h1', date: '2025-01-14' },
      // Missing 2025-01-13
      { id: '3', habitId: 'h1', date: '2025-01-12' },
      { id: '4', habitId: 'h1', date: '2025-01-11' },
    ];
    const result = calculateHabitStreak(habit, completions, '2025-01-15');
    expect(result).toBe(2);
  });

  it('should return 0 if today is not completed', () => {
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-14' },
      { id: '2', habitId: 'h1', date: '2025-01-13' },
    ];
    const result = calculateHabitStreak(habit, completions, '2025-01-15');
    // The streak continues from yesterday if today is not completed
    expect(result).toBe(2);
  });

  it('should handle single day streak', () => {
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-15' },
    ];
    const result = calculateHabitStreak(habit, completions, '2025-01-15');
    expect(result).toBe(1);
  });

  it('should only count completions for the specific habit', () => {
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-15' },
      { id: '2', habitId: 'h2', date: '2025-01-14' }, // Different habit
      { id: '3', habitId: 'h1', date: '2025-01-13' },
    ];
    const result = calculateHabitStreak(habit, completions, '2025-01-15');
    expect(result).toBe(1);
  });

  it('should handle habits with specific days of week', () => {
    const habitWithDays: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    };
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-17' }, // Friday
      { id: '2', habitId: 'h1', date: '2025-01-15' }, // Wednesday
      { id: '3', habitId: 'h1', date: '2025-01-13' }, // Monday
    ];
    const result = calculateHabitStreak(habitWithDays, completions, '2025-01-17');
    expect(result).toBe(3);
  });

  it('should return 0 for deleted habit', () => {
    const deletedHabit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      isDeleted: true,
    };
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-15' },
    ];
    const result = calculateHabitStreak(deletedHabit, completions, '2025-01-15');
    expect(result).toBe(0);
  });

  it('should return 0 for paused habit', () => {
    const pausedHabit: Habit = {
      id: 'h1',
      name: 'Test Habit',
      createdAt: '2025-01-01',
      isPaused: true,
      pausedUntil: '2025-01-20',
    };
    const completions: Completion[] = [
      { id: '1', habitId: 'h1', date: '2025-01-15' },
    ];
    const result = calculateHabitStreak(pausedHabit, completions, '2025-01-15');
    expect(result).toBe(0);
  });

  it('should calculate long streaks correctly', () => {
    const completions: Completion[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date('2025-01-15');
      date.setDate(date.getDate() - i);
      completions.push({
        id: String(i),
        habitId: 'h1',
        date: date.toISOString().split('T')[0],
      });
    }
    const result = calculateHabitStreak(habit, completions, '2025-01-15');
    expect(result).toBe(30);
  });
});

describe('streakUtils - isHabitCompletedToday', () => {
  const completions: Completion[] = [
    { id: '1', habitId: 'h1', date: '2025-01-15' },
    { id: '2', habitId: 'h2', date: '2025-01-15' },
    { id: '3', habitId: 'h1', date: '2025-01-14' },
  ];

  it('should return true if habit is completed today', () => {
    const result = isHabitCompletedToday('h1', completions, '2025-01-15');
    expect(result).toBe(true);
  });

  it('should return false if habit is not completed today', () => {
    const result = isHabitCompletedToday('h3', completions, '2025-01-15');
    expect(result).toBe(false);
  });

  it('should return false for empty completions', () => {
    const result = isHabitCompletedToday('h1', [], '2025-01-15');
    expect(result).toBe(false);
  });

  it('should distinguish between different dates', () => {
    const result1 = isHabitCompletedToday('h1', completions, '2025-01-15');
    const result2 = isHabitCompletedToday('h1', completions, '2025-01-16');
    expect(result1).toBe(true);
    expect(result2).toBe(false);
  });

  it('should handle multiple habits on same date', () => {
    const result1 = isHabitCompletedToday('h1', completions, '2025-01-15');
    const result2 = isHabitCompletedToday('h2', completions, '2025-01-15');
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});

describe('streakUtils - getStreakBadgeColor', () => {
  it('should return gray for 0 streak', () => {
    const result = getStreakBadgeColor(0);
    expect(result).toBe('bg-gray-100 text-gray-600 border-gray-200');
  });

  it('should return light orange for streak 1-5', () => {
    expect(getStreakBadgeColor(1)).toBe('bg-orange-100 text-orange-700 border-orange-200');
    expect(getStreakBadgeColor(3)).toBe('bg-orange-100 text-orange-700 border-orange-200');
    expect(getStreakBadgeColor(5)).toBe('bg-orange-100 text-orange-700 border-orange-200');
  });

  it('should return medium orange for streak 6-20', () => {
    expect(getStreakBadgeColor(6)).toBe('bg-orange-200 text-orange-800 border-orange-300');
    expect(getStreakBadgeColor(10)).toBe('bg-orange-200 text-orange-800 border-orange-300');
    expect(getStreakBadgeColor(20)).toBe('bg-orange-200 text-orange-800 border-orange-300');
  });

  it('should return red for streak above 20', () => {
    expect(getStreakBadgeColor(21)).toBe('bg-red-200 text-red-800 border-red-300');
    expect(getStreakBadgeColor(50)).toBe('bg-red-200 text-red-800 border-red-300');
    expect(getStreakBadgeColor(100)).toBe('bg-red-200 text-red-800 border-red-300');
  });

  it('should handle boundary values correctly', () => {
    expect(getStreakBadgeColor(5)).toBe('bg-orange-100 text-orange-700 border-orange-200');
    expect(getStreakBadgeColor(6)).toBe('bg-orange-200 text-orange-800 border-orange-300');
    expect(getStreakBadgeColor(20)).toBe('bg-orange-200 text-orange-800 border-orange-300');
    expect(getStreakBadgeColor(21)).toBe('bg-red-200 text-red-800 border-red-300');
  });
});

describe('streakUtils - getStreakEmoji', () => {
  it('should return sleep emoji for 0 streak', () => {
    const result = getStreakEmoji(0);
    expect(result).toBe('💤');
  });

  it('should return 1 fire for streak 1-3', () => {
    expect(getStreakEmoji(1)).toBe('🔥');
    expect(getStreakEmoji(2)).toBe('🔥');
    expect(getStreakEmoji(3)).toBe('🔥');
  });

  it('should return 2 fires for streak 4-7', () => {
    expect(getStreakEmoji(4)).toBe('🔥🔥');
    expect(getStreakEmoji(5)).toBe('🔥🔥');
    expect(getStreakEmoji(7)).toBe('🔥🔥');
  });

  it('should return 3 fires for streak 8-14', () => {
    expect(getStreakEmoji(8)).toBe('🔥🔥🔥');
    expect(getStreakEmoji(10)).toBe('🔥🔥🔥');
    expect(getStreakEmoji(14)).toBe('🔥🔥🔥');
  });

  it('should return 4 fires for streak 15-30', () => {
    expect(getStreakEmoji(15)).toBe('🔥🔥🔥🔥');
    expect(getStreakEmoji(20)).toBe('🔥🔥🔥🔥');
    expect(getStreakEmoji(30)).toBe('🔥🔥🔥🔥');
  });

  it('should return 5 fires for streak above 30', () => {
    expect(getStreakEmoji(31)).toBe('🔥🔥🔥🔥🔥');
    expect(getStreakEmoji(50)).toBe('🔥🔥🔥🔥🔥');
    expect(getStreakEmoji(100)).toBe('🔥🔥🔥🔥🔥');
  });

  it('should handle boundary values correctly', () => {
    expect(getStreakEmoji(3)).toBe('🔥');
    expect(getStreakEmoji(4)).toBe('🔥🔥');
    expect(getStreakEmoji(7)).toBe('🔥🔥');
    expect(getStreakEmoji(8)).toBe('🔥🔥🔥');
    expect(getStreakEmoji(14)).toBe('🔥🔥🔥');
    expect(getStreakEmoji(15)).toBe('🔥🔥🔥🔥');
    expect(getStreakEmoji(30)).toBe('🔥🔥🔥🔥');
    expect(getStreakEmoji(31)).toBe('🔥🔥🔥🔥🔥');
  });
});
