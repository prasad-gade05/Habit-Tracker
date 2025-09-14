import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { Link, Activity } from "lucide-react";
import { calculateCorrelation } from "../utils/correlationUtils";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

const HabitCorrelations: React.FC = () => {
  const { habits, completions } = useHabitStore();
  
  // Check if we have sufficient data
  const hasSufficientData = useMemo(() => {
    return habits.length >= 2 && completions.length > 0;
  }, [habits.length, completions.length]);
  
  // Calculate correlations between habits
  const { correlationMatrix, habitList, topCorrelations, radarData } = useMemo(() => {
    if (!hasSufficientData) return { correlationMatrix: [], habitList: [], topCorrelations: [], radarData: [] };
    
    // Get last 30 days
    const today = new Date();
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Create completion matrix: for each habit, array of 1/0 for each day
    const habitCompletionMatrix: Record<string, number[]> = {};
    habits.forEach(habit => {
      habitCompletionMatrix[habit.id] = dates.map(date => {
        return completions.some(c => c.habitId === habit.id && c.date === date) ? 1 : 0;
      });
    });
    
    // Create correlation matrix
    const matrix: number[][] = [];
    const habitList = [...habits];
    
    // For top correlations
    const correlationData: { 
      habit1: { id: string; name: string; color?: string }; 
      habit2: { id: string; name: string; color?: string }; 
      correlation: number 
    }[] = [];
    
    for (let i = 0; i < habitList.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < habitList.length; j++) {
        if (i === j) {
          row.push(1); // Correlation with itself is 1
        } else {
          const habit1 = habitList[i];
          const habit2 = habitList[j];
          
          const completionArr1 = habitCompletionMatrix[habit1.id];
          const completionArr2 = habitCompletionMatrix[habit2.id];
          
          if (completionArr1 && completionArr2) {
            const correlation = calculateCorrelation(completionArr1, completionArr2);
            row.push(correlation);
            
            // Store for top correlations list (only store each pair once)
            if (i < j && Math.abs(correlation) > 0.1) {
              correlationData.push({
                habit1: { id: habit1.id, name: habit1.name, color: habit1.color },
                habit2: { id: habit2.id, name: habit2.name, color: habit2.color },
                correlation
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
    const radarData = habitList.map(habit => {
      const dataPoint: any = { habit: habit.name };
      habitList.forEach((otherHabit, index) => {
        const correlationValue = matrix[habitList.findIndex(h => h.id === habit.id)][index];
        // Convert correlation to a value between 0 and 100 for the radar chart
        dataPoint[otherHabit.name] = Math.round((correlationValue + 1) * 50);
      });
      return dataPoint;
    });
    
    return { correlationMatrix: matrix, habitList, topCorrelations, radarData };
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
            {payload[0].payload && Object.entries(payload[0].payload)
              .filter(([key]) => key !== "habit")
              .map(([key, value]: [string, any]) => {
                // Convert back to correlation value (-1 to 1)
                const correlationValue = (value as number) / 50 - 1;
                return (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-foreground">{key}:</span>
                    <span className={correlationValue > 0 ? "text-green-500" : correlationValue < 0 ? "text-red-500" : "text-foreground"}>
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
        <h2 className="text-xl font-semibold text-foreground mb-4">Habit Correlations</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-secondary/30 p-3 rounded-full mb-4">
            <Link className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Need at least 2 habits with 7+ days of data to show correlations.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">Habit Correlations</h2>
      <p className="text-sm text-muted-foreground mb-4">
        How habits relate to each other based on completion patterns
      </p>
      
      {/* Radar Chart Visualization */}
      {radarData.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-foreground mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Correlation Radar
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="habit" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                {habitList.slice(0, Math.min(5, habitList.length)).map((habit, index) => (
                  <Radar
                    key={habit.id}
                    name={habit.name}
                    dataKey={habit.name}
                    stroke={habit.color || "#3B82F6"}
                    fill={habit.color || "#3B82F6"}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip content={<CustomTooltip />} />
                {habitList.length > 1 && (
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    content={(props) => (
                      <div className="text-xs text-muted-foreground ml-4">
                        {props.payload?.slice(0, Math.min(5, props.payload.length)).map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center mb-1">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: entry.color }}
                            ></div>
                            <span>{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Radar chart showing correlation strengths. Values are scaled 0-100 (0 = -1 correlation, 50 = 0 correlation, 100 = +1 correlation).
          </p>
        </div>
      )}
      
      {/* Top correlations list (compact view for sidebar) */}
      {topCorrelations.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-foreground">Strongest Patterns</h3>
          {topCorrelations.map((corr, index) => (
            <div key={`${corr.habit1.id}-${corr.habit2.id}`} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: corr.habit1.color || '#3B82F6' }}
                  ></div>
                  <span className="text-sm font-medium text-foreground truncate">{corr.habit1.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {corr.correlation > 0 ? '↑' : '↓'} {Math.abs(corr.correlation).toFixed(2)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground truncate">{corr.habit2.name}</span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: corr.habit2.color || '#3B82F6' }}
                  ></div>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${corr.correlation > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 mb-6">
          <p className="text-muted-foreground text-sm">
            No strong correlations found yet.
          </p>
        </div>
      )}
      
      {/* Full correlation matrix (expanded view) */}
      {correlationMatrix.length > 0 && habitList.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header row with habit names */}
            <div className="flex mb-2">
              <div className="w-24 flex-shrink-0"></div>
              {habitList.map((habit, index) => (
                <div 
                  key={habit.id} 
                  className="w-10 h-10 flex flex-col items-center justify-center text-xs p-1"
                  title={habit.name}
                >
                  <div 
                    className="w-5 h-5 rounded-full mb-1"
                    style={{ backgroundColor: habit.color || '#3B82F6' }}
                  ></div>
                  <span className="truncate w-full text-center text-xs">{habit.name}</span>
                </div>
              ))}
            </div>
            
            {/* Correlation matrix */}
            {correlationMatrix.map((row, rowIndex) => (
              <div key={habitList[rowIndex].id} className="flex mb-1">
                {/* Row header with habit name */}
                <div 
                  className="w-24 flex-shrink-0 flex items-center p-1"
                  title={habitList[rowIndex].name}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: habitList[rowIndex].color || '#3B82F6' }}
                  ></div>
                  <span className="text-xs truncate">{habitList[rowIndex].name}</span>
                </div>
                
                {/* Correlation values */}
                {row.map((value, colIndex) => (
                  <div
                    key={`${habitList[rowIndex].id}-${habitList[colIndex].id}`}
                    className={`w-10 h-10 flex items-center justify-center text-xs font-medium rounded-sm ${getCorrelationColor(value)}`}
                    title={`${habitList[rowIndex].name} vs ${habitList[colIndex].name}: ${value.toFixed(2)}`}
                  >
                    {rowIndex !== colIndex ? value.toFixed(1) : "-"}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Strong Negative</span>
              <span className="text-muted-foreground">No Correlation</span>
              <span className="text-muted-foreground">Strong Positive</span>
            </div>
            <div className="flex h-3 rounded overflow-hidden">
              <div className="w-1/6 bg-red-500"></div>
              <div className="w-1/6 bg-red-300"></div>
              <div className="w-1/6 bg-red-100"></div>
              <div className="w-1/6 bg-gray-100"></div>
              <div className="w-1/6 bg-blue-100"></div>
              <div className="w-1/6 bg-blue-300"></div>
              <div className="w-1/6 bg-blue-500"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">
            No correlation data available yet.
          </p>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Values range from -1 to 1. Positive values indicate habits completed together, 
          negative values indicate habits rarely completed on the same days.
        </p>
      </div>
    </div>
  );
};

export default HabitCorrelations;