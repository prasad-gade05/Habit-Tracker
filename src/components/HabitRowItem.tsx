import React, { useState } from "react";
import { Habit, isHabitActiveOnDate } from "../utils/dateUtils";
import { useHabitStore } from "../stores/habitStore";
import { getToday } from "../utils/dateUtils";
import { parseISO, format, isBefore, isToday } from "date-fns";
import { Check, Edit, Trash2, Pause, Play } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface HabitRowItemProps {
  habit: Habit;
}

const HabitRowItem: React.FC<HabitRowItemProps> = ({ habit }) => {
  const { isHabitCompletedOnDate, toggleCompletion, updateHabit, deleteHabit, pauseHabit, unpauseHabit } =
    useHabitStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const today = getToday();
  const isCompleted = isHabitCompletedOnDate(habit.id, today);
  // Check if habit is active today
  const isHabitActiveToday = isHabitActiveOnDate(habit, parseISO(today));

  // Check if a paused habit is still paused
  const isHabitPaused = (): boolean => {
    if (!habit.isPaused || !habit.pausedUntil) return false;
    const pauseEndDate = parseISO(habit.pausedUntil);
    const todayDate = new Date();
    return isBefore(todayDate, pauseEndDate) || isToday(pauseEndDate);
  };

  const handleToggle = () => {
    // Only allow toggling for active habits
    if (isHabitActiveToday && !isHabitPaused()) {
      toggleCompletion(habit.id, today);
    }
  };

  const handleUpdateHabit = (
    name: string,
    description?: string,
    color?: string,
    days?: number[]
  ) => {
    updateHabit(habit.id, name, description, color, days);
  };

  const handleDeleteHabit = () => {
    deleteHabit(habit.id);
  };

  const handlePauseHabit = () => {
    const pauseEndDate = new Date();
    pauseEndDate.setDate(pauseEndDate.getDate() + 7); // Pause for 7 days by default
    const pausedUntil = format(pauseEndDate, "yyyy-MM-dd");
    pauseHabit(habit.id, pausedUntil);
  };

  const handleUnpauseHabit = () => {
    unpauseHabit(habit.id);
  };

  const isPaused = isHabitPaused();

  return (
    <>
      <div
        className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
          isCompleted ? "bg-secondary/50" : "hover:bg-secondary/30"
        } ${
          !isHabitActiveToday || isPaused ? "bg-gray-100 dark:bg-gray-800 opacity-60" : ""
        }`}
        style={{
          borderLeft: habit.color
            ? `4px solid ${habit.color}`
            : "4px solid #3B82F6",
        }}
      >
        <div
          className={`flex items-center justify-center w-5 h-5 rounded-md border mr-3 transition-all duration-200 ${
            isHabitActiveToday && !isPaused ? "cursor-pointer" : "cursor-not-allowed"
          } ${
            isCompleted
              ? "border-current"
              : "border-muted-foreground hover:border-primary"
          }`}
          style={{
            backgroundColor: isCompleted
              ? habit.color || "#3B82F6"
              : "transparent",
          }}
          onClick={isHabitActiveToday && !isPaused ? handleToggle : undefined}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </div>
        <div
          className={`flex-1 ${
            isHabitActiveToday && !isPaused ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          onClick={isHabitActiveToday && !isPaused ? handleToggle : undefined}
        >
          <div
            className={`text-foreground text-sm ${
              isCompleted ? "opacity-70 line-through" : ""
            } ${!isHabitActiveToday || isPaused ? "text-gray-500 dark:text-gray-400" : ""}`}
          >
            {habit.name}
            {isPaused && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Paused
              </span>
            )}
          </div>
          {habit.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {habit.description}
            </div>
          )}
          {!isHabitActiveToday && (
            <div className="text-xs text-muted-foreground mt-1">
              Not scheduled for today
            </div>
          )}
          {isPaused && habit.pausedUntil && (
            <div className="text-xs text-muted-foreground mt-1">
              Paused until: {format(parseISO(habit.pausedUntil), "MMM d, yyyy")}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label={`More options for ${habit.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPaused ? (
                <DropdownMenuItem onClick={handleUnpauseHabit}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handlePauseHabit}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
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