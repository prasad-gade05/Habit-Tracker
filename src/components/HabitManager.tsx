import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit } from "../utils/dateUtils";
import HabitModal from "./HabitModal";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

const HabitManager: React.FC = () => {
  const { habits, updateHabit, deleteHabit } = useHabitStore();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdateHabit = (
    name: string,
    description?: string,
    color?: string,
    daysOfWeek?: number[]
  ) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, name, description, color, daysOfWeek);
    }
  };

  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
  };

  const startEditing = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Manage Habits
      </h2>

      {habits.length > 0 ? (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
              style={{
                borderLeft: habit.color
                  ? `4px solid ${habit.color}`
                  : "4px solid #3B82F6",
              }}
            >
              <div>
                <div className="flex items-center space-x-2 font-medium text-foreground">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color || "#3B82F6" }}
                  />
                  <span>{habit.name}</span>
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
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(habit)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      <span className="text-destructive">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{habit.name}" and all of
                        its tracked history. This action cannot be undone.
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
          ))}
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
