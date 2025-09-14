import React, { useState } from "react";
import { Habit } from "../utils/dateUtils";
import { useHabitStore } from "../stores/habitStore";
import { getToday } from "../utils/dateUtils";
import { Check, Edit, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface HabitRowItemProps {
  habit: Habit;
}

const HabitRowItem: React.FC<HabitRowItemProps> = ({ habit }) => {
  const { isHabitCompletedOnDate, toggleCompletion, updateHabit, deleteHabit } =
    useHabitStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const today = getToday();
  const isCompleted = isHabitCompletedOnDate(habit.id, today);

  const handleToggle = () => {
    toggleCompletion(habit.id, today);
  };

  const handleUpdateHabit = (name: string, description?: string) => {
    updateHabit(habit.id, name, description);
  };

  const handleDeleteHabit = () => {
    deleteHabit(habit.id);
  };

  return (
    <>
      <div
        className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
          isCompleted ? "bg-secondary/50" : "hover:bg-secondary/30"
        }`}
      >
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-md border mr-4 transition-all duration-200 cursor-pointer ${
            isCompleted
              ? "bg-green-500 border-green-500"
              : "border-muted-foreground hover:border-primary"
          }`}
          onClick={handleToggle}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1 cursor-pointer" onClick={handleToggle}>
          <div
            className={`text-foreground ${
              isCompleted ? "opacity-70 line-through" : ""
            }`}
          >
            {habit.name}
          </div>
          {habit.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {habit.description}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{habit.name}" and all of its
                  tracked history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteHabit}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <HabitModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        habit={habit}
        onConfirm={handleUpdateHabit}
      />
    </>
  );
};

export default HabitRowItem;
