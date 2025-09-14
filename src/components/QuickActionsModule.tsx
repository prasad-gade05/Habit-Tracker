import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import HabitRowItem from "./HabitRowItem";
import { getToday } from "../utils/dateUtils";
import HabitModal from "./HabitModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const QuickActionsModule: React.FC = () => {
  const { habits, getCompletionsForDate, addHabit } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = getToday();
  const todayCompletions = getCompletionsForDate(today);

  // Calculate completion percentage for today
  const completionPercentage =
    habits.length > 0
      ? Math.round((todayCompletions.length / habits.length) * 100)
      : 0;

  const handleAddHabit = (
    name: string,
    description?: string,
    color?: string
  ) => {
    addHabit(name, description, color);
  };

  return (
    <>
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border card-hover fade-in transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Today's Progress
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="button-hover h-8 px-3 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Habit
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2 mb-5">
          <div
            className="bg-green-500 h-2 rounded-full progress-bar transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {/* Progress text */}
        <div className="text-xs text-muted-foreground mb-4">
          {todayCompletions.length} of {habits.length} habits completed (
          {completionPercentage}%)
        </div>

        {/* Habits list */}
        <div className="space-y-2">
          {habits.length > 0 ? (
            habits.map((habit) => <HabitRowItem key={habit.id} habit={habit} />)
          ) : (
            <div className="text-center py-6 text-muted-foreground fade-in">
              <p className="text-sm">
                No habits yet. Add your first habit to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      <HabitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleAddHabit}
      />
    </>
  );
};

export default QuickActionsModule;
