import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import {
  getCompletionPercentageForDate,
  getCompletionsForDate,
} from "../utils/dateUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  onDateSelect,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { habits, completions } = useHabitStore();

  // Get the first day of the month and the last day of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);

  // Get the start of the first week of the month and the end of the last week of the month
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Generate an array of dates to display in the calendar
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "yyyy-MM-dd");
      const dayCompletions = getCompletionsForDate(completions, formattedDate);
      const completionCount = dayCompletions.length;
      const completionPercentage =
        habits.length > 0
          ? Math.round((completionCount / habits.length) * 100)
          : 0;

      days.push({
        date: day,
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isSameDay(day, new Date()),
        isSelected: selectedDate ? isSameDay(day, selectedDate) : false,
        completionCount,
        completionPercentage,
      });
      day = new Date(day);
      day.setDate(day.getDate() + 1);
    }
    rows.push(days);
    days = [];
  }

  // Handle previous month
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Handle next month
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Get color class based on completion percentage
  const getCompletionColor = (percentage: number) => {
    if (percentage === 0) return "bg-secondary/50";
    if (percentage < 34) return "bg-green-500/30";
    if (percentage < 67) return "bg-green-500/60";
    if (percentage < 100) return "bg-green-500/90";
    return "bg-green-500";
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 px-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="p-2">
        {rows.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((dayData, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => handleDateClick(dayData.date)}
                className={cn(
                  "relative h-10 w-full rounded text-sm transition-colors focus:outline-none",
                  dayData.isCurrentMonth
                    ? "text-foreground"
                    : "text-muted-foreground/50",
                  dayData.isToday && !dayData.isSelected ? "bg-accent/50" : "",
                  dayData.isSelected
                    ? "bg-primary text-primary-foreground"
                    : "",
                  !dayData.isCurrentMonth && !dayData.isSelected
                    ? "hover:bg-secondary/30"
                    : "",
                  dayData.isCurrentMonth && !dayData.isSelected
                    ? "hover:bg-secondary/70"
                    : ""
                )}
              >
                {/* Date number */}
                <div className="absolute top-1 left-1">
                  {format(dayData.date, "d")}
                </div>

                {/* Completion indicator */}
                {dayData.completionCount > 0 && (
                  <div className="absolute bottom-1 right-1 flex items-center justify-center">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center text-[0.6rem]",
                        getCompletionColor(dayData.completionPercentage)
                      )}
                    >
                      <span className="font-bold text-[0.55rem]">
                        {dayData.completionCount}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center justify-between p-3 border-t border-border text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-secondary/50 mr-1"></div>
            <span className="text-muted-foreground">0</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-green-500/30 mr-1"></div>
            <span className="text-muted-foreground">1-33%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-green-500/60 mr-1"></div>
            <span className="text-muted-foreground">67%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-green-500 mr-1"></div>
            <span className="text-muted-foreground">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
