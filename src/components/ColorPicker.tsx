import React from "react";

interface ColorPickerProps {
  selectedColor?: string;
  onColorChange: (color: string) => void;
}

const defaultColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#A855F7", // Violet
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Color</label>
      <div className="grid grid-cols-6 gap-2">
        {defaultColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-md border-2 transition-all duration-200 hover:scale-110 ${
              selectedColor === color
                ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-primary"
                : "border-muted-foreground hover:border-foreground"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            title={color}
          />
        ))}
      </div>
      {selectedColor && (
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-xs text-muted-foreground">{selectedColor}</span>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
