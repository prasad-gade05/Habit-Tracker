import React, { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useHabitStore } from "../stores/habitStore";
import { Habit, Completion } from "../utils/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { getCompletionPercentageForDate } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { habits, completions, toggleCompletion, updateHabit, deleteHabit } =
    useHabitStore();

  // Get completions for the selected date
  const completionsForSelectedDate = selectedDate
    ? completions.filter((c) => c.date === selectedDate)
    : [];

  // Calculate completion percentage for the selected date
  const completionPercentage = selectedDate
    ? getCompletionPercentageForDate(habits, completions, selectedDate)
    : 0;

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      setSelectedDate(formattedDate);
      setIsDialogOpen(true);
    }
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
  const handleUpdateHabit = (name: string, description?: string) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, name, description);
      setIsEditModalOpen(false);
      setEditingHabit(null);
    }
  };

  // Handle habit deletion
  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
  };

  // Start editing a habit
  const startEditing = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditModalOpen(true);
  };

  // Modified Calendar component with custom styling
  const StyledCalendar = useMemo(() => {
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        className="rounded-md border"
        modifiers={{
          completed: (date) => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const percentage = getCompletionPercentageForDate(
              habits,
              completions,
              formattedDate
            );
            return percentage > 0;
          },
          perfect: (date) => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const percentage = getCompletionPercentageForDate(
              habits,
              completions,
              formattedDate
            );
            return percentage === 100;
          },
        }}
        modifiersClassNames={{
          completed: "bg-green-500/20 hover:bg-green-500/30",
          perfect: "bg-green-500 hover:bg-green-600",
        }}
      />
    );
  }, [date, habits, completions]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Habit Calendar
        </h2>
        <p className="text-muted-foreground text-sm">
          Click on any date to view and edit your habits for that day
        </p>
      </div>

      {StyledCalendar}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            {selectedDate && (
              <div className="text-sm text-muted-foreground">
                {completionPercentage}% completion (
                {completionsForSelectedDate.length} of {habits.length} habits)
              </div>
            )}
          </DialogHeader>

          <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
            {habits.length > 0 ? (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <Checkbox
                    id={habit.id}
                    checked={isHabitCompleted(habit.id)}
                    onCheckedChange={() => handleToggleCompletion(habit.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={habit.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div>{habit.name}</div>
                      {habit.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {habit.description}
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => startEditing(habit)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{habit.name}" and all
                            of its tracked history. This action cannot be
                            undone.
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
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No habits to display. Add some habits to get started!
              </p>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            Toggle habits to mark them as completed or not completed on this
            date
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
