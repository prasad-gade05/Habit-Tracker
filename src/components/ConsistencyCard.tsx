import React from "react";
import { Star } from "lucide-react";
import { useHabitStore } from "../stores/habitStore";

const ConsistencyCard: React.FC = () => {
  const { getCompletionRate } = useHabitStore();
  const completionRate = getCompletionRate();

  // Determine consistency message based on completion rate
  let message = "Keep going!";
  if (completionRate >= 90) {
    message = "Outstanding consistency!";
  } else if (completionRate >= 75) {
    message = "Great progress!";
  } else if (completionRate >= 50) {
    message = "Good consistency!";
  }

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border text-center transition-all duration-300 hover:shadow-md">
      <div className="flex justify-center mb-3">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
          <Star className="size-6 text-white" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">{message}</h3>
      <p className="text-xs text-muted-foreground mt-2">
        Consistency creates lasting change.
      </p>
    </div>
  );
};

export default ConsistencyCard;
