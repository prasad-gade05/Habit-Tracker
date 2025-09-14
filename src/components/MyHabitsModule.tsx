import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit } from "../utils/dateUtils";
import HabitRowItem from "./HabitRowItem";
import HabitModal from "./HabitModal";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { getToday } from "../utils/dateUtils";

const MyHabitsModule: React.FC = () => {
  const {
    habits,
    addHabit,
    isHabitCompletedOnDate,
    toggleCompletion,
    updateHabit,
    deleteHabit,
  } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = getToday();

  const handleAddHabit = (name: string, description?: string) => {
    addHabit(name, description);
  };

  const handleUpdateHabit = (name: string, description?: string) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, name, description);
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

  // Calculate streak for a habit
  const calculateStreak = (habitId: string) => {
    // For now, we'll implement a simple streak calculation
    // This would ideally be replaced with a more sophisticated algorithm
    const completions = useHabitStore.getState().completions;
    const habitCompletions = completions.filter((c) => c.habitId === habitId);
    return habitCompletions.length;
  };

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

      {habits.length > 0 ? (
        <div className="space-y-3">
          {habits.map((habit: Habit) => {
            const isCompleted = isHabitCompletedOnDate(habit.id, today);
            const streak = calculateStreak(habit.id);

            return (
              <div
                key={habit.id}
                className="bg-secondary/30 rounded-lg p-4 group transition-all duration-200 hover:bg-secondary/40"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    {/* Habit icon (using a placeholder) */}
                    <div className="bg-accent/20 w-9 h-9 rounded-lg flex items-center justify-center">
                      <div className="bg-accent w-5 h-5 rounded"></div>
                    </div>

                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {habit.name}
                      </div>
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
                          ? "bg-success text-primary"
                          : "border-success text-success hover:bg-success/10"
                      }`}
                      onClick={() => handleToggleCompletion(habit.id)}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
                      onClick={() => handleEditHabit(habit)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
                      onClick={() => handleDeleteHabit(habit.id)}
                    >
                      <Trash2 className="h-3 w-3" />
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
