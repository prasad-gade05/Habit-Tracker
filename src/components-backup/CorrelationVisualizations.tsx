import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { calculateCorrelation } from "../utils/correlationUtils";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { parseISO } from "date-fns";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CorrelationVisualizationsProps {
  chartMode: "top" | "specific";
  selectedHabitId: string;
  numHabitsToShow: number;
}

const CorrelationVisualizations: React.FC<CorrelationVisualizationsProps> = ({
  chartMode,
  selectedHabitId,
  numHabitsToShow
}) => {
  const { habits, completions } = useHabitStore();

  // Check if we have sufficient data
  const hasSufficientData = useMemo(() => {
    return habits.length >= 2 && completions.length > 0;
  }, [habits.length, completions.length]);

  // Calculate correlations between habits
  const { correlationMatrix, habitList, radarData } =
    useMemo(() => {
      if (!hasSufficientData)
        return {
          correlationMatrix: [],
          habitList: [],
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

      // Prepare data for radar chart based on selected mode
      let radarData = [];
      
      if (chartMode === "top") {
        // For top correlations mode, show the top N most correlated habits
        const topHabits = [...new Set([
          ...correlationData.slice(0, numHabitsToShow).flatMap(c => [c.habit1.id, c.habit2.id])
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
        radarData,
      };
    }, [habits, completions, hasSufficientData, chartMode, selectedHabitId, numHabitsToShow]);

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

  // Custom tooltip for radar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">
            Correlation strengths
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {payload[0].payload &&
              Object.entries(payload[0].payload)
                .filter(([key]) => key !== "habit")
                .map(([key, value]: [string, any]) => {
                  // Convert back to correlation value (-1 to 1)
                  const correlationValue = (value as number) / 50 - 1;
                  return (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-foreground truncate mr-2">{key}:</span>
                      <span
                        className={
                          correlationValue > 0
                            ? "text-green-500 font-medium"
                            : correlationValue < 0
                            ? "text-red-500 font-medium"
                            : "text-foreground"
                        }
                      >
                        {correlationValue.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!hasSufficientData) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Correlation Analysis
      </h2>

      {/* Correlation Matrix */}
      <div className="mb-8">
        <h3 className="font-medium text-foreground mb-3">Correlation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-muted-foreground p-2"></th>
                {habitList.map((habit) => (
                  <th
                    key={habit.id}
                    className="text-center text-xs text-muted-foreground p-2 transform -rotate-45 origin-center"
                    style={{ minWidth: "40px" }}
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{
                          backgroundColor: habit.color || "#3B82F6",
                        }}
                      ></span>
                      {habit.name.substring(0, 3)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="text-left text-xs text-muted-foreground p-2">
                    <div className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{
                          backgroundColor:
                            habitList[rowIndex].color || "#3B82F6",
                        }}
                      ></span>
                      {habitList[rowIndex].name.substring(0, 3)}
                    </div>
                  </td>
                  {row.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className={`text-center p-2 text-xs font-medium ${
                        rowIndex === colIndex
                          ? "bg-primary/10"
                          : Math.abs(value) > 0.5
                          ? "bg-secondary"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${getCorrelationColor(
                          value
                        )}`}
                      >
                        {rowIndex !== colIndex ? value.toFixed(1) : "-"}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar Chart */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-foreground">
            {chartMode === "top" 
              ? "Top Correlations Radar" 
              : selectedHabitId === "all" 
                ? "All Habits Correlation Radar" 
                : `Correlations for ${habitList.find(h => h.id === selectedHabitId)?.name || "Selected Habit"}`}
          </h3>
          <div className="text-xs text-muted-foreground">
            {radarData.length} habits shown
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="habit" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              {radarData.length > 0 && Object.keys(radarData[0])
                .filter(key => key !== "habit")
                .map((dataKey, index) => {
                  // Find the habit object for this dataKey
                  const habit = habitList.find(h => h.name === dataKey) || habitList[index % habitList.length];
                  return (
                    <Radar
                      key={index}
                      name={dataKey}
                      dataKey={dataKey}
                      stroke={habit?.color || "#3B82F6"}
                      fill={habit?.color || "#3B82F6"}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  );
                })}
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                content={(props) => {
                  if (!props.payload || props.payload.length === 0) return null;
                  return (
                    <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                      {props.payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center text-xs">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-foreground truncate max-w-[100px]">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Radar chart showing correlation strengths between habits (0-100 scale)</p>
          <p className="mt-1">Values closer to 100 indicate stronger positive correlations</p>
        </div>
      </div>
    </div>
  );
};

export default CorrelationVisualizations;