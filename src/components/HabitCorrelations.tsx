import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Link, Activity } from "lucide-react";
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

const HabitCorrelations: React.FC = () => {
  const { habits, completions } = useHabitStore();

  // Check if we have sufficient data
  const hasSufficientData = useMemo(() => {
    return habits.length >= 2 && completions.length > 0;
  }, [habits.length, completions.length]);

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
            const filteredData = dates.map((_, index) => ({
              habit1Active: completionArr1[index] !== -1,
              habit2Active: completionArr2[index] !== -1,
              habit1Completed: completionArr1[index] === 1,
              habit2Completed: completionArr2[index] === 1,
            })).filter(data => data.habit1Active && data.habit2Active);

            // Create new arrays with only the data for active days
            const filteredArr1 = filteredData.map(data => data.habit1Completed ? 1 : 0);
            const filteredArr2 = filteredData.map(data => data.habit2Completed ? 1 : 0);

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
        .slice(0, 5);

      // Prepare data for radar chart
      const radarData = habitList.map((habit) => {
        const dataPoint: any = { habit: habit.name };
        habitList.forEach((otherHabit, index) => {
          const correlationValue =
            matrix[habitList.findIndex((h) => h.id === habit.id)][index];
          // Convert correlation to a value between 0 and 100 for the radar chart
          dataPoint[otherHabit.name] = Math.round((correlationValue + 1) * 50);
        });
        return dataPoint;
      });

      return {
        correlationMatrix: matrix,
        habitList,
        topCorrelations,
        radarData,
      };
    }, [habits, completions, hasSufficientData]);

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
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Correlation strengths to other habits
          </p>
          <div className="mt-2 space-y-1">
            {payload[0].payload &&
              Object.entries(payload[0].payload)
                .filter(([key]) => key !== "habit")
                .map(([key, value]: [string, any]) => {
                  // Convert back to correlation value (-1 to 1)
                  const correlationValue = (value as number) / 50 - 1;
                  return (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-foreground">{key}:</span>
                      <span
                        className={
                          correlationValue > 0
                            ? "text-green-500"
                            : correlationValue < 0
                            ? "text-red-500"
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                          getCorrelationColor(value)
                        }`}
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
        <h3 className="font-medium text-foreground mb-3">
          Correlation Radar Chart
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="habit" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              {habitList.map((habit, index) => (
                <Radar
                  key={index}
                  name={habit.name}
                  dataKey={habit.name}
                  stroke={habit.color || "#3B82F6"}
                  fill={habit.color || "#3B82F6"}
                  fillOpacity={0.3}
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HabitCorrelations;