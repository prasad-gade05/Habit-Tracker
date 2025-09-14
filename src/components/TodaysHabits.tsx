import React, { useState, useMemo, useCallback } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Habit, isHabitActiveOnDate } from "../utils/dateUtils";
import {
  calculateHabitStreak,
  getStreakBadgeColor,
  getStreakEmoji,
} from "../utils/streakUtils";
import { getToday } from "../utils/dateUtils";
import { parseISO } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";
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

const TodaysHabits: React.FC = () => {
  const {
    habits,
    completions,
    toggleCompletion,
    updateHabit,
    deleteHabit,
    addHabit,
    isHabitCompletedOnDate,
  } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = getToday();

  const handleAddHabit = useCallback(
    (name: string, description?: string, color?: string, daysOfWeek?: number[]) => {
      addHabit(name, description, color, daysOfWeek);
    },
    [addHabit]
  );

  const handleUpdateHabit = useCallback(
    (name: string, description?: string, color?: string, daysOfWeek?: number[]) => {
      if (editingHabit) {
        updateHabit(editingHabit.id, name, description, color, daysOfWeek);
        setEditingHabit(null);
      }
    },
    [editingHabit, updateHabit]
  );

  const handleToggleCompletion = useCallback(
    (habitId: string) => {
      toggleCompletion(habitId, today);
    },
    [toggleCompletion, today]
  );

  const handleEditHabit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  }, []);

  const handleDeleteHabit = useCallback(
    (habitId: string) => {
      deleteHabit(habitId);
    },
    [deleteHabit]
  );

  const habitsWithStreaks = useMemo(
    () =>
      habits
        .map((habit) => {
          const isHabitActiveToday = isHabitActiveOnDate(habit, parseISO(today));
          let isCompletedTodayValue = false;
          let currentStreakValue = 0;
          
          if (isHabitActiveToday) {
            currentStreakValue = calculateHabitStreak(habit, completions, today);
            isCompletedTodayValue = isHabitCompletedOnDate(habit.id, today);
          } else {
            // For inactive habits, they are not considered completed
            isCompletedTodayValue = false;
          }
          
          return {
            ...habit,
            currentStreak: currentStreakValue,
            isCompletedToday: isCompletedTodayValue,
            isHabitActiveToday,
          };
        }),
    [habits, completions, today, isHabitCompletedOnDate]
  );

  return (
    <>
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Today's Habits
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-accent-foreground h-8 px-3 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Habit
          </Button>
        </div>

        {habitsWithStreaks.length > 0 ? (
          <div className="space-y-3">
            {habitsWithStreaks.map((habit) => (
              <div
                key={habit.id}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-secondary/30 ${
                  habit.isCompletedToday && habit.isHabitActiveToday ? "opacity-60" : ""
                } ${!habit.isHabitActiveToday ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                style={{
                  borderLeft: habit.color
                    ? `4px solid ${habit.color}`
                    : "4px solid #3B82F6",
                }}
              >
                {/* Large Checkbox */}
                <div className="mr-4">
                  <Checkbox
                    checked={habit.isCompletedToday}
                    onCheckedChange={() => {
                      // Only allow toggling for active habits
                      if (habit.isHabitActiveToday) {
                        handleToggleCompletion(habit.id);
                      }
                    }}
                    className="w-5 h-5"
                    aria-label={`Mark ${habit.name} as ${
                      habit.isCompletedToday ? "incomplete" : "complete"
                    }`}
                    disabled={!habit.isHabitActiveToday}
                  />
                </div>

                {/* Habit Name */}
                <div className="flex-1 min-w-0 mr-2">
                  <div
                    className={`text-sm font-medium text-foreground ${
                      habit.isCompletedToday && habit.isHabitActiveToday ? "line-through" : ""
                    } ${!habit.isHabitActiveToday ? "text-gray-500 dark:text-gray-400" : ""}`}
                  >
                    {habit.name}
                  </div>
                  {habit.description && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {habit.description}
                    </div>
                  )}
                  {habit.daysOfWeek && habit.daysOfWeek.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Active: {habit.daysOfWeek.map(day => 
                        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                      ).join(', ')}
                    </div>
                  )}
                  {!habit.isHabitActiveToday && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Not scheduled for today
                    </div>
                  )}
                </div>

                {/* Streak Badge */}
                <div className="mr-2 hidden sm:block">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStreakBadgeColor(
                      habit.currentStreak
                    )}`}
                  >
                    {getStreakEmoji(habit.currentStreak)} {habit.currentStreak}{" "}
                    day{habit.currentStreak !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Mobile Streak Badge */}
                <div className="mr-2 sm:hidden">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStreakBadgeColor(
                      habit.currentStreak
                    )}`}
                  >
                    {getStreakEmoji(habit.currentStreak)} {habit.currentStreak}
                  </Badge>
                </div>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={`More options for ${habit.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditHabit(habit)}>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">
              No habits yet. Add your first habit to get started!
            </p>
          </div>
        )}
      </div>

      <HabitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        habit={editingHabit}
        onConfirm={editingHabit ? handleUpdateHabit : handleAddHabit}
      />
    </>
  );
};

export default TodaysHabits;