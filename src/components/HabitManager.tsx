import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit } from "../utils/dateUtils";
import HabitModal from "./HabitModal";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RotateCcw, Pause, Play } from "lucide-react";
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
import { format, parseISO, isBefore, isToday } from "date-fns";

const HabitManager: React.FC = () => {
  const { habits, updateHabit, deleteHabit, restoreHabit, pauseHabit, unpauseHabit } = useHabitStore();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    }
  };

  const handleSoftDeleteHabit = (id: string) => {
    deleteHabit(id);
  };

  const handleRestoreHabit = (id: string) => {
    restoreHabit(id);
  };

  const handlePauseHabit = (id: string) => {
    const pauseEndDate = new Date();
    pauseEndDate.setDate(pauseEndDate.getDate() + 7); // Pause for 7 days by default
    const pausedUntil = format(pauseEndDate, "yyyy-MM-dd");
    pauseHabit(id, pausedUntil);
  };

  const handleUnpauseHabit = (id: string) => {
    unpauseHabit(id);
  };

  const startEditing = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditModalOpen(true);
  };

  // Filter out deleted habits for the main list
  const activeHabits = habits.filter(habit => !habit.isDeleted);

  // Check if a temporary habit has expired
  const isTemporaryHabitExpired = (habit: Habit): boolean => {
    if (!habit.isTemporary || !habit.endDate) return false;
    const endDate = parseISO(habit.endDate);
    const today = new Date();
    return isBefore(endDate, today);
  };

  // Check if a paused habit is still paused
  const isHabitPaused = (habit: Habit): boolean => {
    if (!habit.isPaused || !habit.pausedUntil) return false;
    const pauseEndDate = parseISO(habit.pausedUntil);
    const today = new Date();
    return isBefore(today, pauseEndDate) || isToday(pauseEndDate);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Manage Habits
      </h2>

      {activeHabits.length > 0 ? (
        <div className="space-y-4">
          {activeHabits.map((habit) => {
            const isExpired = isTemporaryHabitExpired(habit);
            const isPaused = isHabitPaused(habit);
            
            return (
              <div
                key={habit.id}
                className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors ${
                  isExpired ? "opacity-70 bg-muted" : ""
                } ${isPaused ? "opacity-70 bg-blue-50 dark:bg-blue-900/20" : ""}`}
                style={{
                  borderLeft: habit.color
                    ? `4px solid ${habit.color}`
                    : "4px solid #3B82F6",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 font-medium text-foreground flex-wrap gap-y-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color || "#3B82F6" }}
                    />
                    <span className="truncate">{habit.name}</span>
                    {habit.isTemporary && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex-shrink-0">
                        Temporary
                      </span>
                    )}
                    {isExpired && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex-shrink-0">
                        Expired
                      </span>
                    )}
                    {isPaused && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0">
                        Paused
                      </span>
                    )}
                  </div>
                  {habit.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {habit.description}
                    </div>
                  )}
                  {habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Active on:{" "}
                      {habit.daysOfWeek
                        .map(
                          (day) =>
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]
                        )
                        .join(", ")}
                    </div>
                  )}
                  {habit.isTemporary && habit.endDate && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Ends on: {format(parseISO(habit.endDate), "MMM d, yyyy")}
                    </div>
                  )}
                  {isPaused && habit.pausedUntil && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Paused until: {format(parseISO(habit.pausedUntil), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-end lg:justify-start lg:flex-nowrap lg:flex-shrink-0">
                  {isPaused ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnpauseHabit(habit.id)}
                      className="min-w-0 flex-shrink-0"
                    >
                      <Play className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Resume</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePauseHabit(habit.id)}
                      className="min-w-0 flex-shrink-0"
                    >
                      <Pause className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Pause</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(habit)}
                    className="min-w-0 flex-shrink-0"
                  >
                    <Edit className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="min-w-0 flex-shrink-0">
                        <Trash2 className="h-4 w-4 sm:mr-2 text-destructive" />
                        <span className="text-destructive hidden sm:inline">Delete</span>
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
                          onClick={() => handleSoftDeleteHabit(habit.id)}
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
          <p>No habits to manage yet.</p>
        </div>
      )}

      <HabitModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        habit={editingHabit}
        onConfirm={handleUpdateHabit}
      />
    </div>
  );
};

export default HabitManager;