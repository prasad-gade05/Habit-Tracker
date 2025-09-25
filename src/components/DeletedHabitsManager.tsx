import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit } from "../utils/dateUtils";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
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
import { format, parseISO } from "date-fns";

const DeletedHabitsManager: React.FC = () => {
  const { habits, restoreHabit, deleteHabitPermanently } = useHabitStore();
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  // Filter to get only deleted habits
  const deletedHabits = habits.filter(habit => habit.isDeleted);

  const handleRestoreHabit = (id: string) => {
    restoreHabit(id);
  };

  const handlePermanentDelete = (id: string) => {
    deleteHabitPermanently(id);
  };

  const toggleExpand = (id: string) => {
    setExpandedHabitId(expandedHabitId === id ? null : id);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Deleted Habits Management
      </h2>

      {deletedHabits.length > 0 ? (
        <div className="space-y-4">
          {deletedHabits.map((habit) => (
            <div
              key={habit.id}
              className="flex flex-col p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
              style={{
                borderLeft: habit.color
                  ? `4px solid ${habit.color}`
                  : "4px solid #3B82F6",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-medium text-foreground">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color || "#3B82F6" }}
                  />
                  <span>{habit.name}</span>
                  {habit.isTemporary && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Temporary
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreHabit(habit.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                        <span className="text-destructive">Delete Permanently</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete "{habit.name}" 
                          and all of its tracked history from all records, including analytics and calendar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handlePermanentDelete(habit.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Confirm Permanent Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {expandedHabitId === habit.id && (
                <div className="mt-4 text-sm text-muted-foreground">
                  {habit.description && (
                    <div className="mb-2">
                      <strong>Description:</strong> {habit.description}
                    </div>
                  )}
                  {habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
                    <div className="mb-2">
                      <strong>Active days:</strong>{" "}
                      {habit.daysOfWeek
                        .map(
                          (day) =>
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]
                        )
                        .join(", ")}
                    </div>
                  )}
                  {habit.isTemporary && habit.endDate && (
                    <div className="mb-2">
                      <strong>Was set to end on:</strong>{" "}
                      {format(parseISO(habit.endDate), "MMM d, yyyy")}
                    </div>
                  )}
                  {habit.deletedAt && (
                    <div>
                      <strong>Deleted on:</strong>{" "}
                      {format(parseISO(habit.deletedAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-fit"
                onClick={() => toggleExpand(habit.id)}
              >
                {expandedHabitId === habit.id ? "Show Less" : "Show More Details"}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No deleted habits to manage.</p>
        </div>
      )}
    </div>
  );
};

export default DeletedHabitsManager;