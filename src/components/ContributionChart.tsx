import React, { useMemo, useRef, useEffect } from "react";
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
import { format, parseISO, isSameDay } from "date-fns";

const ContributionChart: React.FC = () => {
  const { habits, completions } = useHabitStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Generate the last 365 days
  const last365Days = useMemo(() => getLast365Days(), []);

  // Group completions by date for easier access
  const completionsByDate = useMemo(() => {
    const grouped: Record<string, number> = {};
    completions.forEach((completion) => {
      grouped[completion.date] = (grouped[completion.date] || 0) + 1;
    });
    return grouped;
  }, [completions]);

  // Calculate completion percentages for each day
  const completionPercentages = useMemo(() => {
    return last365Days.map((date) => {
      return getCompletionPercentageForDate(habits, completions, date);
    });
  }, [last365Days, habits, completions]);

  // Get today's index for highlighting
  const todayIndex = useMemo(() => {
    const today = new Date();
    return last365Days.findIndex((date) => isSameDay(parseISO(date), today));
  }, [last365Days]);

  // Get color class based on completion percentage
  const getColorClass = (percentage: number) => {
    if (percentage === 0) return "bg-secondary";
    if (percentage < 34) return "bg-green-500/20";
    if (percentage < 67) return "bg-green-500/50";
    if (percentage < 100) return "bg-green-500/80";
    return "bg-green-500";
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

      // Find the first non-null day in the week
      const firstDay = weekDays.find((day) => day !== null);
      if (!firstDay) continue;

      const date = parseISO(firstDay.date);
      const month = date.getMonth();

      // Only add label if this is the first week of the month or every 2 months
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

  // Scroll to today's position when component mounts
  useEffect(() => {
    if (chartContainerRef.current && todayRef.current) {
      // Calculate the position of today's element
      const todayPosition = todayIndex * 16; // Each week is 16px wide (4px * 4 weeks)
      // Scroll to position today in the center of the view
      chartContainerRef.current.scrollLeft =
        todayPosition - chartContainerRef.current.clientWidth / 2;
    }
  }, [todayIndex]);

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground mb-5">
        Habit Consistency
      </h2>

      <div className="flex items-center mb-4">
        <div className="text-xs text-muted-foreground mr-3">Less</div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-secondary rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500/20 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500/50 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500/80 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <div className="text-xs text-muted-foreground ml-3">More</div>
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
                              <div className="mt-1">
                                {completionsByDate[day.date] || 0} /{" "}
                                {habits.length} habits completed
                              </div>
                              <div className="mt-1">
                                {day.percentage}% completion
                              </div>
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

export default ContributionChart;
