import React, { useState, useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit, Completion, isHabitActiveOnDate } from "../utils/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO, isBefore, isToday } from "date-fns";
import { getCompletionPercentageForDate } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Pause, Play } from "lucide-react";
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
import CustomCalendar from "./CustomCalendar";

interface CalendarViewProps {
  initialDate?: Date; // Added prop for initial date
}

const CalendarView: React.FC<CalendarViewProps> = ({ initialDate }) => {
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { habits, completions, toggleCompletion, updateHabit, deleteHabit, pauseHabit, unpauseHabit } =
    useHabitStore();

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

  // Get completions for the selected date
  const completionsForSelectedDate = selectedDate
    ? completions.filter((c) => c.date === selectedDate)
    : [];

  // Calculate completion percentage for the selected date
  const completionPercentage = selectedDate
    ? getCompletionPercentageForDate(habits, completions, selectedDate)
    : 0;

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setDate(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    setSelectedDate(formattedDate);
    setIsDialogOpen(true);
  };

  // Handle habit completion toggle
  const handleToggleCompletion = (habitId: string) => {
    if (selectedDate) {
      toggleCompletion(habitId, selectedDate);
    }
  };

  // Check if a habit is completed on the selected date
  const isHabitCompleted = (habitId: string) => {
    return completionsForSelectedDate.some((c) => c.habitId === habitId);
  };

  // Handle habit update
  const handleUpdateHabit = (
    name: string,
    description?: string,
    color?: string,
    days?: number[],
    isTemporary?: boolean,
    durationDays?: number,
    endDate?: string,
    isPaused?: boolean,
    pausedUntil?: string
  ) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, name, description, color, days, isTemporary, durationDays, endDate, isPaused, pausedUntil);
      setIsEditModalOpen(false);
      setEditingHabit(null);
    }
  };

  // Handle habit deletion
  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
  };

  // Handle habit pause
  const handlePauseHabit = (id: string) => {
    const pauseEndDate = new Date();
    pauseEndDate.setDate(pauseEndDate.getDate() + 7); // Pause for 7 days by default
    const pausedUntil = format(pauseEndDate, "yyyy-MM-dd");
    pauseHabit(id, pausedUntil);
  };

  // Handle habit unpause
  const handleUnpauseHabit = (id: string) => {
    unpauseHabit(id);
  };

  // Start editing a habit
  const startEditing = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Habit Calendar
        </h2>
        <p className="text-muted-foreground text-xs">
          Click on any date to view and edit your habits for that day
        </p>
      </div>

      <CustomCalendar onDateSelect={handleDateSelect} selectedDate={date} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            {selectedDate && (
              <div className="text-xs text-muted-foreground">
                {completionPercentage}% completion (
                {completionsForSelectedDate.length} of {habits.length} habits)
              </div>
            )}
          </DialogHeader>

          <div className="space-y-3 mt-3 max-h-96 overflow-y-auto">
            {habits.length > 0 ? (
              habits.map((habit) => {
                // Check if habit is active on the selected date
                const isHabitActiveOnSelectedDate = selectedDate
                  ? isHabitActiveOnDate(habit, parseISO(selectedDate))
                  : false;
                const habitCompleted = isHabitCompleted(habit.id);
                const isPaused = isHabitPaused(habit);
                const isExpired = isHabitExpired(habit);
                
                // Check if habit is deleted
                const isHabitDeleted = habit.isDeleted;
                
                // Determine if habit should be disabled
                const isHabitDisabled = !isHabitActiveOnSelectedDate || !selectedDate || isHabitDeleted || isPaused || isExpired;

                return (
                  <div
                    key={habit.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors ${
                      isHabitDeleted ? "opacity-60 bg-muted" : ""
                    } ${isPaused ? "opacity-70 bg-blue-50 dark:bg-blue-900/20" : ""} ${
                      isExpired ? "opacity-70 bg-red-50 dark:bg-red-900/20" : ""
                    }`}
                    style={{
                      borderLeft: habit.color
                        ? `3px solid ${habit.color}`
                        : "3px solid #3B82F6",
                    }}
                  >
                    <Checkbox
                      id={habit.id}
                      checked={habitCompleted}
                      onCheckedChange={() => {
                        // Only allow toggling for active habits that are not disabled
                        if (!isHabitDisabled) {
                          handleToggleCompletion(habit.id);
                        }
                      }}
                      disabled={isHabitDisabled}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={habit.id}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          isHabitDisabled
                            ? "text-gray-500 dark:text-gray-400"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: habit.color || "#3B82F6",
                            }}
                          />
                          <span>{habit.name}</span>
                          {isHabitDeleted && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Deleted
                            </span>
                          )}
                          {isPaused && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Paused
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Expired
                            </span>
                          )}
                          {habit.isTemporary && !isExpired && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Temporary
                            </span>
                          )}
                        </div>
                        {habit.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {habit.description}
                          </div>
                        )}
                        {!isHabitActiveOnSelectedDate && selectedDate && !isHabitDeleted && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Not scheduled for this date
                          </div>
                        )}
                        {isPaused && habit.pausedUntil && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Paused until: {format(parseISO(habit.pausedUntil), "MMM d, yyyy")}
                          </div>
                        )}
                        {isExpired && habit.endDate && (
                          <div className="text-xs text-red-600 mt-1">
                            Expired on: {format(parseISO(habit.endDate), "MMM d, yyyy")}
                          </div>
                        )}
                        {habit.isTemporary && habit.endDate && !isExpired && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Expires on: {format(parseISO(habit.endDate), "MMM d, yyyy")}
                          </div>
                        )}
                        {isHabitDeleted && (
                          <div className="text-xs text-muted-foreground mt-1">
                            This habit has been deleted and cannot be edited
                          </div>
                        )}
                      </label>
                    </div>
                    {!isHabitDeleted && (
                      <div className="flex space-x-1">
                        {isPaused ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleUnpauseHabit(habit.id)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handlePauseHabit(habit.id)}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => startEditing(habit)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
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
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">
                No habits to display. Add some habits to get started!
              </p>
            )}
          </div>

          <div className="mt-3 text-xs text-muted-foreground text-center">
            Toggle habits to mark them as completed or not completed on this
            date. Deleted habits cannot be edited.
          </div>
        </DialogContent>
      </Dialog>

      <HabitModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        habit={editingHabit}
        onConfirm={handleUpdateHabit}
      />
    </div>
  );
};

export default CalendarView;