import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHabitStore } from "../stores/habitStore";
import ColorPicker from "./ColorPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { addDays, format } from "date-fns";

interface HabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    daysOfWeek?: number[]; // Array of day numbers (0-6) where 0 is Sunday
    isTemporary?: boolean;
    durationDays?: number;
    endDate?: string;
    isPaused?: boolean;
    pausedUntil?: string;
  } | null;
  onConfirm: (
    name: string,
    description?: string,
    color?: string,
    daysOfWeek?: number[],
    isTemporary?: boolean,
    durationDays?: number,
    endDate?: string,
    isPaused?: boolean,
    pausedUntil?: string
  ) => void;
}

const HabitModal: React.FC<HabitModalProps> = ({
  open,
  onOpenChange,
  habit,
  onConfirm,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [error, setError] = useState("");
  const [isDaySpecific, setIsDaySpecific] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isTemporary, setIsTemporary] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseDays, setPauseDays] = useState(7);

  const daysOfWeek = [
    { id: 0, name: "Sunday" },
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
  ];

  useEffect(() => {
    if (open) {
      setName(habit?.name || "");
      setDescription(habit?.description || "");
      setColor(habit?.color || "#3B82F6");
      setError("");

      // Handle day-specific settings
      if (habit?.daysOfWeek && habit.daysOfWeek.length > 0) {
        setIsDaySpecific(true);
        setSelectedDays(habit.daysOfWeek);
      } else {
        setIsDaySpecific(false);
        setSelectedDays([]);
      }

      // Handle temporary habit settings
      setIsTemporary(habit?.isTemporary || false);
      setDurationDays(habit?.durationDays || 7);

      // Handle paused habit settings
      setIsPaused(habit?.isPaused || false);
      setPauseDays(7); // Default to 7 days pause
    }
  }, [open, habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Habit name is required");
      return;
    }

    // If day-specific is enabled but no days are selected, show an error
    if (isDaySpecific && selectedDays.length === 0) {
      setError("Please select at least one day for this habit");
      return;
    }

    // Calculate endDate for temporary habits
    let endDate: string | undefined;
    if (isTemporary) {
      const today = new Date();
      const end = addDays(today, durationDays);
      endDate = format(end, "yyyy-MM-dd");
    }

    // Calculate pausedUntil for paused habits
    let pausedUntil: string | undefined;
    if (isPaused) {
      const today = new Date();
      const pausedEnd = addDays(today, pauseDays);
      pausedUntil = format(pausedEnd, "yyyy-MM-dd");
    }

    // Pass days array only if day-specific is enabled and days are selected
    const daysToSave =
      isDaySpecific && selectedDays.length > 0 ? selectedDays : undefined;

    onConfirm(
      name,
      description,
      color,
      daysToSave,
      isTemporary,
      isTemporary ? durationDays : undefined,
      endDate,
      isPaused,
      pausedUntil
    );
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#3B82F6");
    setError("");
    setIsDaySpecific(false);
    setSelectedDays([]);
    setIsTemporary(false);
    setDurationDays(7);
    setIsPaused(false);
    setPauseDays(7);
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((id) => id !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  const toggleAllDays = () => {
    if (selectedDays.length === 7) {
      // If all days are selected, deselect all
      setSelectedDays([]);
    } else {
      // If not all days are selected, select all
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "Add New Habit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Enter habit name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <ColorPicker selectedColor={color} onColorChange={setColor} />

          {/* Temporary habit options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="temporary-habit"
                checked={isTemporary}
                onCheckedChange={(checked) => setIsTemporary(!!checked)}
              />
              <label
                htmlFor="temporary-habit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Make this a temporary habit
              </label>
            </div>

            {isTemporary && (
              <div className="space-y-2 ml-6">
                <p className="text-sm text-muted-foreground">
                  Duration (in days):
                </p>
                <Input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-32"
                />
              </div>
            )}
          </div>

          {/* Paused habit options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paused-habit"
                checked={isPaused}
                onCheckedChange={(checked) => setIsPaused(!!checked)}
              />
              <label
                htmlFor="paused-habit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pause this habit initially
              </label>
            </div>

            {isPaused && (
              <div className="space-y-2 ml-6">
                <p className="text-sm text-muted-foreground">
                  Pause duration (in days):
                </p>
                <Input
                  type="number"
                  min="1"
                  value={pauseDays}
                  onChange={(e) => setPauseDays(Number(e.target.value))}
                  className="w-32"
                />
              </div>
            )}
          </div>

          {/* Day-specific options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="day-specific"
                checked={isDaySpecific}
                onCheckedChange={(checked) => setIsDaySpecific(!!checked)}
              />
              <label
                htmlFor="day-specific"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Make this habit day-specific
              </label>
            </div>

            {isDaySpecific && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Select the days when this habit should be tracked:
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleAllDays}
                  >
                    {selectedDays.length === 7 ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.id}`}
                        checked={selectedDays.includes(day.id)}
                        onCheckedChange={() => toggleDay(day.id)}
                      />
                      <label
                        htmlFor={`day-${day.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{habit ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitModal;