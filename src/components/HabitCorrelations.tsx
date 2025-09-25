import React, { useMemo, useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Link, Activity, Filter } from "lucide-react";
import { calculateCorrelation } from "../utils/correlationUtils";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CorrelationMatrix from "./CorrelationMatrix";
import CorrelationRadarChart from "./CorrelationRadarChart";

const HabitCorrelations: React.FC = () => {
  const { habits, completions } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const [chartMode, setChartMode] = useState<"top" | "specific">("top");
  const [numHabitsToShow, setNumHabitsToShow] = useState<number>(5);

  // Check if we have sufficient data
  const hasSufficientData = useMemo(() => {
    return habits.length >= 2 && completions.length > 0;
  }, [habits.length, completions.length]);

  // Get color class based on correlation value
  const getCorrelationColor = (value: number) => {
    // Convert correlation value (-1 to 1) to a color
    if (value === 1) return "bg-blue-500"; // Strong positive correlation
    if (value >= 0.7) return "bg-blue-400";
    if (value >= 0.5) return "bg-blue-300";
    if (value >= 0.3) return "bg-blue-200";
    if (value >= 0.1) return "bg-blue-100";
    if (value > -0.1) return "bg-gray-100"; // Near zero correlation
    if (value > -0.3) return "bg-red-100";
    if (value > -0.5) return "bg-red-200";
    if (value > -0.7) return "bg-red-300";
    if (value > -1) return "bg-red-400";
    return "bg-red-500"; // Strong negative correlation
  };

  // Calculate correlations between habits
  const { correlationMatrix, habitList, topCorrelations, radarData } =
    useMemo(() => {
      if (!hasSufficientData)
        return {
          correlationMatrix: [],
          habitList: [],
          topCorrelations: [],
          radarData: [],
        };

      // Get last 30 days
      const today = new Date();
      const dates = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      // Create completion matrix: for each habit, array of 1/0 for each day
      // Only count completions on days when the habit is active
      const habitCompletionMatrix: Record<string, number[]> = {};
      habits.forEach((habit) => {
        habitCompletionMatrix[habit.id] = dates.map((date) => {
          const dateObj = parseISO(date);
          // Only count completion if habit is active on this date
          if (isHabitActiveOnDate(habit, dateObj)) {
            return completions.some(
              (c) => c.habitId === habit.id && c.date === date
            )
              ? 1
              : 0;
          } else {
            // If habit is not active on this date, we don't count it (neither as completed nor not completed)
            // This means we'll have a sparse array with some undefined values
            // For correlation calculation, we'll need to handle this properly
            return -1; // Special marker for inactive days
          }
        });
      });

      // Create correlation matrix
      const matrix: number[][] = [];
      const habitList = [...habits];

      // For top correlations
      const correlationData: {
        habit1: { id: string; name: string; color?: string };
        habit2: { id: string; name: string; color?: string };
        correlation: number;
      }[] = [];

      for (let i = 0; i < habitList.length; i++) {
        const row: number[] = [];
        for (let j = 0; j < habitList.length; j++) {
          if (i === j) {
            row.push(1); // Correlation with itself is 1
          } else {
            const habit1 = habitList[i];
            const habit2 = habitList[j];

            let completionArr1 = habitCompletionMatrix[habit1.id];
            let completionArr2 = habitCompletionMatrix[habit2.id];

            // Filter out inactive days (-1 values) and only consider days when both habits are active
            const filteredData = dates
              .map((_, index) => ({
                habit1Active: completionArr1[index] !== -1,
                habit2Active: completionArr2[index] !== -1,
                habit1Completed: completionArr1[index] === 1,
                habit2Completed: completionArr2[index] === 1,
              }))
              .filter((data) => data.habit1Active && data.habit2Active);

            // Create new arrays with only the data for active days
            const filteredArr1 = filteredData.map((data) =>
              data.habit1Completed ? 1 : 0
            );
            const filteredArr2 = filteredData.map((data) =>
              data.habit2Completed ? 1 : 0
            );

            if (filteredArr1.length > 0 && filteredArr2.length > 0) {
              const correlation = calculateCorrelation(
                filteredArr1,
                filteredArr2
              );
              row.push(correlation);

              // Store for top correlations list (only store each pair once)
              if (i < j && Math.abs(correlation) > 0.1) {
                correlationData.push({
                  habit1: {
                    id: habit1.id,
                    name: habit1.name,
                    color: habit1.color,
                  },
                  habit2: {
                    id: habit2.id,
                    name: habit2.name,
                    color: habit2.color,
                  },
                  correlation,
                });
              }
            } else {
              row.push(0);
            }
          }
        }
        matrix.push(row);
      }

      // Sort top correlations by absolute value
      const topCorrelations = correlationData
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
        .slice(0, 10);

      // Prepare data for radar chart based on selected mode
      let radarData = [];
      
      if (chartMode === "top") {
        // For top correlations mode, show the top N most correlated habits
        const topHabits = [...new Set([
          ...topCorrelations.slice(0, numHabitsToShow).flatMap(c => [c.habit1.id, c.habit2.id])
        ])].slice(0, numHabitsToShow);
        
        const filteredHabitList = habitList.filter(habit => topHabits.includes(habit.id));
        
        radarData = filteredHabitList.map((habit) => {
          const dataPoint: any = { habit: habit.name };
          filteredHabitList.forEach((otherHabit, index) => {
            const correlationValue =
              matrix[habitList.findIndex((h) => h.id === habit.id)][habitList.findIndex((h) => h.id === otherHabit.id)];
            // Convert correlation to a value between 0 and 100 for the radar chart
            dataPoint[otherHabit.name] = Math.round((correlationValue + 1) * 50);
          });
          return dataPoint;
        });
      } else {
        // For specific habit mode, show correlations of selected habit with others
        if (selectedHabitId !== "all") {
          const selectedHabit = habitList.find(h => h.id === selectedHabitId);
          if (selectedHabit) {
            const otherHabits = habitList
              .filter(habit => habit.id !== selectedHabitId)
              .slice(0, numHabitsToShow);
            
            radarData = otherHabits.map((habit) => {
              const dataPoint: any = { habit: habit.name };
              const correlationValue =
                matrix[habitList.findIndex((h) => h.id === selectedHabitId)][habitList.findIndex((h) => h.id === habit.id)];
              // Convert correlation to a value between 0 and 100 for the radar chart
              dataPoint[selectedHabit.name] = Math.round((correlationValue + 1) * 50);
              return dataPoint;
            });
          }
        } else {
          // Default case - show all habits (limited to prevent clutter)
          const limitedHabitList = habitList.slice(0, Math.min(numHabitsToShow, habitList.length));
          
          radarData = limitedHabitList.map((habit) => {
            const dataPoint: any = { habit: habit.name };
            limitedHabitList.forEach((otherHabit, index) => {
              const correlationValue =
                matrix[habitList.findIndex((h) => h.id === habit.id)][habitList.findIndex((h) => h.id === otherHabit.id)];
              // Convert correlation to a value between 0 and 100 for the radar chart
              dataPoint[otherHabit.name] = Math.round((correlationValue + 1) * 50);
            });
            return dataPoint;
          });
        }
      }

      return {
        correlationMatrix: matrix,
        habitList,
        topCorrelations,
        radarData,
      };
    }, [habits, completions, hasSufficientData, chartMode, selectedHabitId, numHabitsToShow]);

  if (!hasSufficientData) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Habit Correlations
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-secondary/30 p-3 rounded-full mb-4">
            <Link className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">
            Not Enough Data Yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Complete at least 2 habits and track them for a few days to see
            correlation insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Habit Correlations
      </h2>

      {/* Chart Controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-md overflow-hidden border border-border">
            <button
              className={`px-3 py-1 text-xs ${
                chartMode === "top"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-secondary"
              }`}
              onClick={() => setChartMode("top")}
            >
              Top Correlations
            </button>
            <button
              className={`px-3 py-1 text-xs ${
                chartMode === "specific"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-secondary"
              }`}
              onClick={() => setChartMode("specific")}
            >
              Specific Habit
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={numHabitsToShow.toString()} onValueChange={(value) => setNumHabitsToShow(parseInt(value))}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">habits</span>
        </div>
        
        {chartMode === "specific" && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Habit:</span>
            <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Habits</SelectItem>
                {habitList.map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    {habit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Top Correlations List */}
      <div className="mb-8">
        <h3 className="font-medium text-foreground mb-3">
          Strongest Correlations
        </h3>
        <div className="space-y-3">
          {topCorrelations.length > 0 ? (
            topCorrelations.map((correlation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center text-sm">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: correlation.habit1.color || "#3B82F6",
                      }}
                    ></span>
                    <span className="font-medium truncate">
                      {correlation.habit1.name}
                    </span>
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: correlation.habit2.color || "#3B82F6",
                      }}
                    ></span>
                    <span className="font-medium truncate">
                      {correlation.habit2.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getCorrelationColor(
                      correlation.correlation
                    )}`}
                  >
                    {Math.abs(correlation.correlation).toFixed(1)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Activity className="h-5 w-5 mx-auto mb-2" />
              <p className="text-sm">
                No strong correlations found. Keep tracking your habits!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Correlation Matrix and Radar Chart will be rendered in AnalyticsPage directly below PatternRecognition */}
    </div>
  );
};

export default HabitCorrelations;