import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit, isHabitActiveOnDate } from "../utils/dateUtils";
import HabitRowItem from "./HabitRowItem";
import HabitModal from "./HabitModal";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check, Pause, Play } from "lucide-react";
import { getToday } from "../utils/dateUtils";
import { parseISO, format, isBefore, isToday } from "date-fns";
import { calculateHabitStreak } from "../utils/streakUtils"; // Added import
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

const MyHabitsModule: React.FC = () => {
  const {
    habits,
    completions, // Added completions to the destructuring
    addHabit,
    isHabitCompletedOnDate,
    toggleCompletion,
    updateHabit,
    deleteHabit,
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

  const handleAddHabit = (
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
  };

  const handleUpdateHabit = (
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
  };

  const handleToggleCompletion = (habitId: string) => {
    toggleCompletion(habitId, today);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteHabit(habitId);
  };

  const handlePauseHabit = (habitId: string) => {
    const pauseEndDate = new Date();
    pauseEndDate.setDate(pauseEndDate.getDate() + 7); // Pause for 7 days by default
    const pausedUntil = format(pauseEndDate, "yyyy-MM-dd");
    pauseHabit(habitId, pausedUntil);
  };

  const handleUnpauseHabit = (habitId: string) => {
    unpauseHabit(habitId);
  };

  // Calculate streak for a habit using the proper streak calculation
  const calculateStreak = (habit: Habit) => {
    // Use the proper streak calculation function
    return calculateHabitStreak(habit, completions);
  };

  // Filter out deleted habits for display
  const activeHabits = habits.filter(habit => !habit.isDeleted);

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-foreground">My Habits</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-accent-foreground h-8 px-3 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Habit
        </Button>
      </div>

      {activeHabits.length > 0 ? (
        <div className="space-y-3">
          {activeHabits.map((habit: Habit) => {
            const isCompleted = isHabitCompletedOnDate(habit.id, today);
            // Check if habit is active today
            const isHabitActiveToday = isHabitActiveOnDate(
              habit,
              parseISO(today)
            );
            const isPaused = isHabitPaused(habit);
            const streak = calculateStreak(habit); // Updated to pass the habit object

            return (
              <div
                key={habit.id}
                className={`rounded-lg p-4 group transition-all duration-200 hover:bg-secondary/40 ${
                  isPaused ? "bg-gray-100 dark:bg-gray-800 opacity-80" : "bg-secondary/30"
                }`}
                style={{
                  borderLeft: habit.color
                    ? `4px solid ${habit.color}`
                    : "4px solid #3B82F6",
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    {/* Habit icon (using a placeholder) */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: habit.color
                          ? `${habit.color}20`
                          : "#3B82F620",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded"
                        style={{
                          backgroundColor: habit.color || "#3B82F6",
                        }}
                      ></div>
                    </div>

                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {habit.name}
                        {habit.isTemporary && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Temporary
                          </span>
                        )}
                        {isPaused && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Paused
                          </span>
                        )}
                      </div>
                      {habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Active:{" "}
                          {habit.daysOfWeek
                            .map(
                              (day) =>
                                [
                                  "Sun",
                                  "Mon",
                                  "Tue",
                                  "Wed",
                                  "Thu",
                                  "Fri",
                                  "Sat",
                                ][day]
                            )
                            .join(", ")}
                        </div>
                      )}
                      {isPaused && habit.pausedUntil && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Paused until: {format(parseISO(habit.pausedUntil), "MMM d, yyyy")}
                        </div>
                      )}
                      <div className="text-xs bg-accent/30 text-accent-foreground px-2 py-1 rounded mt-1 inline-block">
                        {streak} day{streak !== 1 ? "s" : ""} streak
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={isCompleted ? "default" : "outline"}
                      className={`h-7 px-2 text-xs ${
                        isCompleted
                          ? "text-white"
                          : "border-current hover:bg-current/10"
                      }`}
                      style={{
                        backgroundColor: isCompleted
                          ? habit.color || "#3B82F6"
                          : "transparent",
                        borderColor: habit.color || "#3B82F6",
                        color: isCompleted ? "white" : habit.color || "#3B82F6",
                      }}
                      onClick={() => {
                        // Only allow toggling for active habits
                        if (isHabitActiveToday && !isPaused) {
                          handleToggleCompletion(habit.id);
                        }
                      }}
                      disabled={!isHabitActiveToday || isPaused}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        "Complete"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-muted-foreground">
                    Today's Progress
                  </div>
                  <div className="flex space-x-1">
                    {isPaused ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
                        onClick={() => handleUnpauseHabit(habit.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
                        onClick={() => handlePauseHabit(habit.id)}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
                      onClick={() => handleEditHabit(habit)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">
            No habits yet. Add your first habit to get started!
          </p>
        </div>
      )}

      <HabitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        habit={editingHabit}
        onConfirm={editingHabit ? handleUpdateHabit : handleAddHabit}
      />
    </div>
  );
};

export default MyHabitsModule;