import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface DaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onDaysChange,
}) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      onDaysChange(selectedDays.filter((day) => day !== dayIndex));
    } else {
      onDaysChange([...selectedDays, dayIndex].sort());
    }
  };

  const toggleAllDays = () => {
    if (selectedDays.length === 7) {
      // If all days are selected, deselect all
      onDaysChange([]);
    } else {
      // If not all days are selected, select all
      onDaysChange([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Days of the week</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleAllDays}
        >
          {selectedDays.length === 7 ? "Deselect All" : "Select All"}
        </Button>
      </div>
      <div className="flex space-x-1">
        {days.map((day, index) => (
          <Button
            key={index}
            type="button"
            variant={selectedDays.includes(index) ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => toggleDay(index)}
          >
            {day}
          </Button>
        ))}
      </div>
      {selectedDays.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Habit will only appear on the selected days
        </p>
      )}
    </div>
  );
};

export default DaySelector;
