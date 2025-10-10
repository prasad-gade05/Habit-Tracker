import React, { useMemo, useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { calculateCorrelation } from "../utils/correlationUtils";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const EnhancedHabitCorrelations: React.FC = () => {
  const { habits, completions } = useHabitStore();
  
  // Filter state
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<number>(30);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Check if we have sufficient data
  const hasSufficientData = useMemo(() => {
    return habits.length >= 2 && completions.length > 0;
  }, [habits.length, completions.length]);

  // Calculate habit correlations
  const correlationData = useMemo(() => {
    if (!hasSufficientData) return [];

    // Get date range
    const today = new Date();
    const dates = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // Create completion matrix for each habit for each day
    const habitData: Record<string, number[]> = {};
    habits.forEach((habit) => {
      const habitCompletions = dates.map((date) => {
        const isActive = isHabitActiveOnDate(habit, parseISO(date));
        if (!isActive) return null; // Don't count inactive days
        
        const isCompleted = completions.some(
          (c) => c.habitId === habit.id && c.date === date
        );
        return isCompleted ? 1 : 0;
      }).filter(val => val !== null); // Remove inactive days
      
      habitData[habit.id] = habitCompletions as number[];
    });

    // Calculate correlations
    const correlations: Array<{
      habit1: string;
      habit2: string;
      correlation: number;
      habit1Name: string;
      habit2Name: string;
      strength: "Strong" | "Moderate" | "Weak";
      direction: "positive" | "negative";
      sampleSize: number;
    }> = [];

    const targetHabits = selectedHabitId === "all" 
      ? habits 
      : habits.filter(h => h.id === selectedHabitId);

    targetHabits.forEach((habit1, i) => {
      habits.forEach((habit2, j) => {
        if (habit1.id !== habit2.id && (selectedHabitId !== "all" || i < j)) {
          const data1 = habitData[habit1.id];
          const data2 = habitData[habit2.id];
          
          // Need at least 5 data points for meaningful correlation
          if (data1.length >= 5 && data2.length >= 5) {
            // Align the data arrays (in case habits have different active days)
            const alignedData1: number[] = [];
            const alignedData2: number[] = [];
            
            dates.forEach(date => {
              const isActive1 = isHabitActiveOnDate(habit1, parseISO(date));
              const isActive2 = isHabitActiveOnDate(habit2, parseISO(date));
              
              if (isActive1 && isActive2) {
                const completed1 = completions.some(c => c.habitId === habit1.id && c.date === date) ? 1 : 0;
                const completed2 = completions.some(c => c.habitId === habit2.id && c.date === date) ? 1 : 0;
                alignedData1.push(completed1);
                alignedData2.push(completed2);
              }
            });
            
            if (alignedData1.length >= 5) {
              const correlation = calculateCorrelation(alignedData1, alignedData2);
              const absCorr = Math.abs(correlation);
              
              // Only include meaningful correlations
              if (absCorr > 0.15) {
                let strength: "Strong" | "Moderate" | "Weak";
                if (absCorr >= 0.6) strength = "Strong";
                else if (absCorr >= 0.35) strength = "Moderate";
                else strength = "Weak";

                let direction: "positive" | "negative";
                direction = correlation > 0 ? "positive" : "negative";

                correlations.push({
                  habit1: habit1.id,
                  habit2: habit2.id,
                  correlation,
                  habit1Name: habit1.name,
                  habit2Name: habit2.name,
                  strength,
                  direction,
                  sampleSize: alignedData1.length,
                });
              }
            }
          }
        }
      });
    });

    return correlations
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 8); // Top 8 correlations
  }, [habits, completions, timeRange, selectedHabitId, hasSufficientData]);

  // Prepare chart data
  const chartData = correlationData.map((item, index) => ({
    name: `${item.habit1Name} & ${item.habit2Name}`,
    correlation: Number((item.correlation * 100).toFixed(1)),
    strength: item.strength,
    direction: item.direction,
    index,
    sampleSize: item.sampleSize,
  }));

  const getBarColor = (direction: string, strength: string) => {
    if (direction === "positive") {
      if (strength === "Strong") return "#16a34a"; // green-600
      if (strength === "Moderate") return "#22c55e"; // green-500
      return "#4ade80"; // green-400
    } else if (direction === "negative") {
      if (strength === "Strong") return "#dc2626"; // red-600
      if (strength === "Moderate") return "#ef4444"; // red-500
      return "#f87171"; // red-400
    }
    return "#6b7280"; // gray-500
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === "positive") return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === "negative") return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (!hasSufficientData) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Habit Relationships</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Need at least 2 habits with completion data to analyze relationships.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Habit Relationships</h3>
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Correlations</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Focus on Habit
                </label>
                <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select habit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Habits</SelectItem>
                    {habits.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Time Range
                </label>
                <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 2 weeks</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => setIsFilterDialogOpen(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {correlationData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No significant correlations found with current filters.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting the time range or selecting different habits.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[-100, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover text-popover-foreground p-3 rounded-lg border shadow-lg">
                          <p className="font-medium text-sm">{data.name}</p>
                          <p className="text-sm">
                            Correlation: {data.correlation}%
                          </p>
                          <p className="text-sm">
                            Strength: {data.strength}
                          </p>
                          <p className="text-sm">
                            Sample size: {data.sampleSize} days
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="correlation">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.direction, entry.strength)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Correlations:</h4>
            {correlationData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getDirectionIcon(item.direction)}
                  <span className="truncate">
                    {item.habit1Name} & {item.habit2Name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {(item.correlation * 100).toFixed(0)}%
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.strength === "Strong" ? "bg-blue-100 text-blue-800" :
                    item.strength === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {item.strength}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• <strong>Positive correlations:</strong> Habits tend to be completed together</p>
            <p>• <strong>Negative correlations:</strong> One habit may interfere with another</p>
            <p>• Analysis based on {timeRange} days where both habits were active</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedHabitCorrelations;