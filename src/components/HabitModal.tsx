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

interface HabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  } | null;
  onConfirm: (name: string, description?: string, color?: string) => void;
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

  useEffect(() => {
    if (open) {
      setName(habit?.name || "");
      setDescription(habit?.description || "");
      setColor(habit?.color || "#3B82F6");
      setError("");
    }
  }, [open, habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Habit name is required");
      return;
    }

    onConfirm(name, description, color);
    setName("");
    setDescription("");
    setColor("#3B82F6");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
