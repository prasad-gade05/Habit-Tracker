import React, { useState, useMemo, useCallback } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit, isHabitActiveOnDate } from "../utils/dateUtils";
import {
  calculateHabitStreak,
  getStreakBadgeColor,
  getStreakEmoji,
} from "../utils/streakUtils";
import { getToday } from "../utils/dateUtils";
import { parseISO, format, isBefore, isToday } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Pause, Play, Plus } from "lucide-react";
import HabitModal from "./HabitModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TodaysHabits: React.FC = () => {
  const {
    habits,
    completions,
    toggleCompletion,
    updateHabit,
    deleteHabit,
    addHabit,
    isHabitCompletedOnDate,
    pauseHabit,
    unpauseHabit,
  } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = getToday();

  // Check if a paused habit is still paused
  const isHabitPaused = (habit: Habit): boolean => {
    if (!habit.isPaused || !habit.pausedUntil) return false;
    const pauseEndDate = parseISO(habit.pausedUntil);
    const todayDate = new Date();
    return isBefore(todayDate, pauseEndDate) || isToday(pauseEndDate);
  };

  const handleAddHabit = useCallback(
    (
      name: string,
      description?: string,
      color?: string,
      daysOfWeek?: number[],
      isTemporary?: boolean,
      durationDays?: number,
      endDate?: string,
      isPaused?: boolean,
      pausedUntil?: string
    ) => {
      addHabit(name, description, color, daysOfWeek, isTemporary, durationDays, endDate, isPaused, pausedUntil);
    },
    [addHabit]
  );

  const handleUpdateHabit = useCallback(
    (
      name: string,
      description?: string,
      color?: string,
      daysOfWeek?: number[],
      isTemporary?: boolean,
      durationDays?: number,
      endDate?: string,
      isPaused?: boolean,
      pausedUntil?: string
    ) => {
      if (editingHabit) {
        updateHabit(editingHabit.id, name, description, color, daysOfWeek, isTemporary, durationDays, endDate, isPaused, pausedUntil);
        setEditingHabit(null);
      }
    },
    [editingHabit, updateHabit]
  );

  const handleToggleCompletion = useCallback(
    (habitId: string) => {
      toggleCompletion(habitId, today);
    },
    [toggleCompletion, today]
  );

  const handleEditHabit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  }, []);

  const handleDeleteHabit = useCallback(
    (habitId: string) => {
      deleteHabit(habitId);
    },
    [deleteHabit]
  );

  const handlePauseHabit = useCallback(
    (habitId: string) => {
      const pauseEndDate = new Date();
      pauseEndDate.setDate(pauseEndDate.getDate() + 7); // Pause for 7 days by default
      const pausedUntil = format(pauseEndDate, "yyyy-MM-dd");
      pauseHabit(habitId, pausedUntil);
    },
    [pauseHabit]
  );

  const handleUnpauseHabit = useCallback(
    (habitId: string) => {
      unpauseHabit(habitId);
    },
    [unpauseHabit]
  );

  const habitsWithStreaks = useMemo(
    () =>
      habits.map((habit) => {
        const isHabitActiveToday = isHabitActiveOnDate(habit, parseISO(today));
        let isCompletedTodayValue = false;
        let currentStreakValue = 0;

        if (isHabitActiveToday) {
          currentStreakValue = calculateHabitStreak(habit, completions, today);
          isCompletedTodayValue = isHabitCompletedOnDate(habit.id, today);
        } else {
          // For inactive habits, they are not considered completed
          isCompletedTodayValue = false;
        }

        return {
          ...habit,
          currentStreak: currentStreakValue,
          isCompletedToday: isCompletedTodayValue,
          isHabitActiveToday,
        };
      }),
    [habits, completions, today, isHabitCompletedOnDate]
  );

  // Filter out deleted habits for display
  const activeHabitsWithStreaks = habitsWithStreaks.filter(habit => !habit.isDeleted);

  return (
    <>
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Today's Habits
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-accent-foreground h-8 px-3 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Habit
          </Button>
        </div>

        {activeHabitsWithStreaks.length > 0 ? (
          <div className="space-y-3">
            {activeHabitsWithStreaks.map((habit) => {
              const isPaused = isHabitPaused(habit);
              return (
                <div
                  key={habit.id}
                  className={`flex items-center p-4 rounded-lg transition-all duration-200 hover:bg-secondary/30 border ${
                    habit.isCompletedToday && habit.isHabitActiveToday
                      ? "opacity-70 border-green-500/30"
                      : "border-border"
                  } ${
                    !habit.isHabitActiveToday || isPaused
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-background"
                  }`}
                  style={{
                    borderLeft: `4px solid ${habit.color || '#3B82F6'}`
                  }}
                >
                  {/* Large Checkbox */}
                  <div className="mr-4">
                    <Checkbox
                      checked={habit.isCompletedToday}
                      onCheckedChange={() => {
                        // Only allow toggling for active habits
                        if (habit.isHabitActiveToday && !isPaused) {
                          handleToggleCompletion(habit.id);
                        }
                      }}
                      className="w-6 h-6"
                      aria-label={`Mark ${habit.name} as ${
                        habit.isCompletedToday ? "incomplete" : "complete"
                      }`}
                      disabled={!habit.isHabitActiveToday || isPaused}
                    />
                  </div>

                  {/* Habit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium text-foreground ${
                            habit.isCompletedToday && habit.isHabitActiveToday
                              ? "line-through"
                              : ""
                          } ${
                            !habit.isHabitActiveToday || isPaused
                              ? "text-gray-500 dark:text-gray-400"
                              : ""
                          }`}
                        >
                          {/* Habit color indicator */}
                          <span 
                            className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                            style={{ backgroundColor: habit.color || '#3B82F6' }}
                          ></span>
                          {habit.name}
                          {habit.isTemporary && (
                            <span className="ml-2 text-xs bg-muted text-foreground px-2 py-1 rounded-full">
                              Temporary
                            </span>
                          )}
                          {isPaused && (
                            <span className="ml-2 text-xs bg-muted text-foreground px-2 py-1 rounded-full">
                              Paused
                            </span>
                          )}
                        </div>
                        {habit.description && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {habit.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Active:{" "}
                          {habit.daysOfWeek
                            .map(
                              (day) =>
                                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                                  day
                                ]
                            )
                            .join(", ")}
                        </div>
                      )}
                      {!habit.isHabitActiveToday && (
                        <div className="text-xs text-muted-foreground">
                          Not scheduled for today
                        </div>
                      )}
                      {isPaused && habit.pausedUntil && (
                        <div className="text-xs text-muted-foreground">
                          Paused until: {format(parseISO(habit.pausedUntil), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-1 ml-2">
                    {isPaused ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-500/10"
                        onClick={() => handleUnpauseHabit(habit.id)}
                        aria-label={`Resume ${habit.name}`}
                      >
                        <Play className="h-4 w-4 text-foreground" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-500/10"
                        onClick={() => handlePauseHabit(habit.id)}
                        aria-label={`Pause ${habit.name}`}
                      >
                        <Pause className="h-4 w-4 text-foreground" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-yellow-500/10"
                      onClick={() => handleEditHabit(habit)}
                      aria-label={`Edit ${habit.name}`}
                    >
                      <Edit className="h-4 w-4 text-foreground" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-500/10"
                          aria-label={`Delete ${habit.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-foreground" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark "{habit.name}" as deleted. You can restore it later from the Analytics page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Confirm Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              No habits yet. Add your first habit to get started!
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-accent text-accent-foreground h-8 px-3 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Your First Habit
            </Button>
          </div>
        )}
      </div>

      <HabitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        habit={editingHabit}
        onConfirm={editingHabit ? handleUpdateHabit : handleAddHabit}
      />
    </>
  );
};

export default TodaysHabits;