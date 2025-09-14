import React, { useMemo, useRef, useEffect, useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import {
  getLast365Days,
  getCompletionPercentageForDate,
} from "../utils/dateUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isSameDay } from "date-fns";

const EnhancedContributionChart: React.FC = () => {
  const { habits, completions } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Generate the last 365 days
  const last365Days = useMemo(() => getLast365Days(), []);

  // Filter completions based on selected habit
  const filteredCompletions = useMemo(() => {
    if (selectedHabitId === "all") {
      return completions;
    }
    return completions.filter(
      (completion) => completion.habitId === selectedHabitId
    );
  }, [completions, selectedHabitId]);

  // Group completions by date for easier access
  const completionsByDate = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredCompletions.forEach((completion) => {
      grouped[completion.date] = (grouped[completion.date] || 0) + 1;
    });
    return grouped;
  }, [filteredCompletions]);

  // Calculate completion percentages for each day
  const completionPercentages = useMemo(() => {
    if (selectedHabitId === "all") {
      return last365Days.map((date) => {
        return getCompletionPercentageForDate(habits, completions, date);
      });
    } else {
      // For single habit, return binary completion (0 or 100)
      return last365Days.map((date) => {
        const isCompleted = completionsByDate[date] > 0;
        return isCompleted ? 100 : 0;
      });
    }
  }, [last365Days, habits, completions, selectedHabitId, completionsByDate]);

  // Get today's index for highlighting
  const todayIndex = useMemo(() => {
    const today = new Date();
    return last365Days.findIndex((date) => isSameDay(parseISO(date), today));
  }, [last365Days]);

  // Get color class based on completion percentage
  const getColorClass = (percentage: number) => {
    if (selectedHabitId === "all") {
      if (percentage === 0) return "bg-secondary";
      if (percentage < 34) return "bg-green-500/20";
      if (percentage < 67) return "bg-green-500/50";
      if (percentage < 100) return "bg-green-500/80";
      return "bg-green-500";
    } else {
      // Binary colors for single habit
      return percentage === 100 ? "bg-green-500" : "bg-secondary";
    }
  };

  // Group days into weeks (7 rows for days of week, 53 columns for weeks)
  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let week = 0; week < 53; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const index = week * 7 + day;
        if (index < completionPercentages.length) {
          weekDays.push({
            date: last365Days[index],
            percentage: completionPercentages[index],
            isToday: index === todayIndex,
          });
        } else {
          weekDays.push(null);
        }
      }
      weeksArray.push(weekDays);
    }
    return weeksArray;
  }, [completionPercentages, last365Days, todayIndex]);

  // Get month labels for the chart
  const monthLabels = useMemo(() => {
    const labels = [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let week = 0; week < weeks.length; week++) {
      const weekDays = weeks[week];
      if (!weekDays || weekDays.length === 0) continue;

      const firstDay = weekDays.find((day) => day !== null);
      if (!firstDay) continue;

      const date = parseISO(firstDay.date);
      const month = date.getMonth();

      if (
        week === 0 ||
        month !==
          parseISO(
            weeks[week - 1]?.find((day) => day !== null)?.date || ""
          ).getMonth()
      ) {
        labels.push({
          weekIndex: week,
          label: months[month],
        });
      }
    }

    return labels;
  }, [weeks]);

  // Get habit names for completed habits on a specific date
  const getCompletedHabitNames = (date: string): string[] => {
    if (selectedHabitId === "all") {
      const dayCompletions = completions.filter(
        (completion) => completion.date === date
      );
      return dayCompletions.map((completion) => {
        const habit = habits.find((h) => h.id === completion.habitId);
        return habit?.name || "Unknown";
      });
    } else {
      const isCompleted = completionsByDate[date] > 0;
      const habit = habits.find((h) => h.id === selectedHabitId);
      return isCompleted ? [habit?.name || "Unknown"] : [];
    }
  };

  // Scroll to today's position when component mounts
  useEffect(() => {
    if (chartContainerRef.current && todayRef.current) {
      const todayPosition = todayIndex * 16;
      chartContainerRef.current.scrollLeft =
        todayPosition - chartContainerRef.current.clientWidth / 2;
    }
  }, [todayIndex]);

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Habit Consistency
        </h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-muted-foreground">
            Showing consistency for:
          </label>
          <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Habits</SelectItem>
              {habits.map((habit) => (
                <SelectItem key={habit.id} value={habit.id}>
                  {habit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <div className="text-xs text-muted-foreground mr-3">
          {selectedHabitId === "all" ? "Less" : "Missed"}
        </div>
        <div className="flex space-x-1">
          {selectedHabitId === "all" ? (
            <>
              <div className="w-3 h-3 bg-secondary rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500/20 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500/50 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500/80 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-secondary rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground ml-3">
          {selectedHabitId === "all" ? "More" : "Completed"}
        </div>
      </div>

      <div className="overflow-x-auto" ref={chartContainerRef}>
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex ml-7 mb-1">
            {monthLabels.map((month, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground w-4 text-center"
                style={{
                  marginLeft:
                    month.weekIndex > 0
                      ? `${
                          (month.weekIndex -
                            (monthLabels[index - 1]?.weekIndex || 0) -
                            1) *
                          16
                        }px`
                      : 0,
                }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Day labels and chart */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-between h-28 pt-1">
              <div className="text-xs text-muted-foreground">M</div>
              <div className="text-xs text-muted-foreground">W</div>
              <div className="text-xs text-muted-foreground">F</div>
            </div>

            {/* Chart */}
            <TooltipProvider>
              <div className="flex space-x-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col space-y-1">
                    {week.map((day, dayIndex) => {
                      if (!day) return null;

                      const completedHabits = getCompletedHabitNames(day.date);
                      const completionCount = completedHabits.length;

                      return (
                        <Tooltip key={`${weekIndex}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              ref={day.isToday ? todayRef : null}
                              className={`w-3 h-3 rounded-sm transition-all duration-200 ${getColorClass(
                                day.percentage
                              )} ${
                                day.isToday
                                  ? "border-2 border-white ring-2 ring-yellow-400"
                                  : ""
                              }`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div>
                                {format(
                                  parseISO(day.date),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </div>
                              {selectedHabitId === "all" ? (
                                <>
                                  <div className="mt-1">
                                    {completionCount} / {habits.length} habits
                                    completed
                                  </div>
                                  {completedHabits.length > 0 && (
                                    <div className="mt-1 text-muted-foreground">
                                      ({completedHabits.join(", ")})
                                    </div>
                                  )}
                                  <div className="mt-1">
                                    {day.percentage}% completion
                                  </div>
                                </>
                              ) : (
                                <div className="mt-1">
                                  {day.percentage === 100
                                    ? "Completed"
                                    : "Missed"}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedContributionChart;
