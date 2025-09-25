import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { getToday } from "../utils/dateUtils";
import HabitModal from "./HabitModal";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle } from "lucide-react";

const MinimalTodaysProgress: React.FC = () => {
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
    color?: string,
    days?: number[]
  ) => {
    addHabit(name, description, color, days);
  };

  return (
    <>
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-foreground flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Today's Progress
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="h-7 px-2 text-xs"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Compact progress bar and stats */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{todayCompletions.length}/{habits.length} completed</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
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

export default MinimalTodaysProgress;