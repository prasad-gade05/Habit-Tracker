import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { getCompletionPercentageForDate, getCompletionsForDate } from "../utils/dateUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onDateSelect, selectedDate }) => {
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
      const completionPercentage = getCompletionPercentageForDate(habits, completions, formattedDate);
      const completionCount = habits.filter(habit => {
        // Count habits that are actually completed (not just inactive)
        return dayCompletions.some(c => c.habitId === habit.id);
      }).length;

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
    if (percentage === 0) return "bg-muted";
    if (percentage < 34) return "bg-green-500/30";
    if (percentage < 67) return "bg-green-500/60";
    if (percentage < 100) return "bg-green-500/90";
    return "bg-green-500";
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-6 w-6 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-6 w-6 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0 px-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="p-1">
        {rows.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0">
            {week.map((dayData, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => handleDateClick(dayData.date)}
                className={cn(
                  "relative h-8 w-full text-xs transition-colors focus:outline-none",
                  dayData.isCurrentMonth ? "text-foreground" : "text-muted-foreground/30",
                  dayData.isToday && !dayData.isSelected ? "bg-accent/30 rounded" : "",
                  dayData.isSelected ? "bg-primary text-primary-foreground rounded" : "",
                  !dayData.isCurrentMonth && !dayData.isSelected ? "hover:bg-secondary/20" : "",
                  dayData.isCurrentMonth && !dayData.isSelected ? "hover:bg-secondary/40" : ""
                )}
              >
                {/* Date number */}
                <div className="absolute top-0.5 left-0.5">
                  {format(dayData.date, "d")}
                </div>
                
                {/* Completion indicator - only show for current month */}
                {dayData.completionCount > 0 && dayData.isCurrentMonth && (
                  <div className="absolute bottom-0.5 right-0.5 flex items-center justify-center">
                    <div 
                      className={cn(
                        "h-3 w-3 rounded-full flex items-center justify-center",
                        getCompletionColor(dayData.completionPercentage)
                      )}
                    >
                      <span className="text-[0.5rem] font-medium">
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
    </div>
  );
};

export default CustomCalendar;