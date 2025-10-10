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

  // Check if a temporary habit has expired
  const isHabitExpired = (habit: Habit): boolean => {
    if (!habit.isTemporary || !habit.endDate) return false;
    const endDate = parseISO(habit.endDate);
    const todayDate = new Date();
    return isBefore(endDate, todayDate);
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
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-foreground">My Habits</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-accent-foreground h-7 px-2 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {activeHabits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeHabits.map((habit: Habit) => {
            const isCompleted = isHabitCompletedOnDate(habit.id, today);
            const isHabitActiveToday = isHabitActiveOnDate(
              habit,
              parseISO(today)
            );
            const isPaused = isHabitPaused(habit);
            const isExpired = isHabitExpired(habit);
            const streak = calculateStreak(habit);
            const isDisabled = !isHabitActiveToday || isPaused || isExpired;

            return (
              <div
                key={habit.id}
                className={`relative rounded-lg p-4 group transition-all duration-200 hover:shadow-md ${
                  isPaused || isExpired 
                    ? "bg-gray-100 dark:bg-gray-800 opacity-70" 
                    : "bg-secondary/20 hover:bg-secondary/30"
                }`}
                style={{
                  border: `2px solid ${habit.color || "#3B82F6"}`,
                  backgroundColor: isCompleted 
                    ? `${habit.color || "#3B82F6"}15` 
                    : undefined,
                }}
              >
                {/* Status indicators */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {isPaused && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                      Paused
                    </span>
                  )}
                  {isExpired && (
                    <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                      Expired
                    </span>
                  )}
                  {habit.isTemporary && !isExpired && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                      Temp
                    </span>
                  )}
                </div>

                {/* Main content */}
                <div className="space-y-3 pr-8">
                  {/* Habit icon and name */}
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: habit.color || "#3B82F6",
                      }}
                    >
                      <div className="w-5 h-5 rounded bg-white opacity-90"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {habit.name}
                      </h3>
                      {habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {habit.daysOfWeek
                            .map((day) => ["S", "M", "T", "W", "T", "F", "S"][day])
                            .join(" ")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Streak and info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-accent/30 text-accent-foreground px-2 py-1 rounded-full">
                        {streak}d streak
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date info */}
                  {isPaused && habit.pausedUntil && (
                    <div className="text-xs text-muted-foreground">
                      Until {format(parseISO(habit.pausedUntil), "MMM d")}
                    </div>
                  )}
                  {isExpired && habit.endDate && (
                    <div className="text-xs text-red-600">
                      Expired {format(parseISO(habit.endDate), "MMM d")}
                    </div>
                  )}
                  {habit.isTemporary && habit.endDate && !isExpired && (
                    <div className="text-xs text-muted-foreground">
                      Ends {format(parseISO(habit.endDate), "MMM d")}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingHabit(habit);
                          setIsModalOpen(true);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          if (isPaused) {
                            unpauseHabit(habit.id);
                          } else {
                            const until = new Date();
                            until.setDate(until.getDate() + 7);
                            pauseHabit(habit.id, until.toISOString().split("T")[0]);
                          }
                        }}
                      >
                        {isPaused ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Pause className="w-3 h-3" />
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{habit.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteHabit(habit.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <Button
                      size="sm"
                      variant={isCompleted ? "default" : "outline"}
                      className={`h-8 px-3 text-xs font-medium ${
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
                        if (!isDisabled) {
                          handleToggleCompletion(habit.id);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Done
                        </>
                      ) : (
                        "Do It"
                      )}
                    </Button>
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