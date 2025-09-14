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

interface HabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    daysOfWeek?: number[]; // Array of day numbers (0-6) where 0 is Sunday
  } | null;
  onConfirm: (
    name: string,
    description?: string,
    color?: string,
    daysOfWeek?: number[]
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

    // Pass days array only if day-specific is enabled and days are selected
    const daysToSave =
      isDaySpecific && selectedDays.length > 0 ? selectedDays : undefined;

    onConfirm(name, description, color, daysToSave);
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
      <DialogContent>
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
