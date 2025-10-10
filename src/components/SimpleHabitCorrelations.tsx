import React, { useMemo, useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { calculateCorrelation } from "../utils/correlationUtils";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Info
} from "lucide-react";

const SimpleHabitCorrelations: React.FC = () => {
  const { habits, completions } = useHabitStore();
  
  // Simple state management
  const [timeRange, setTimeRange] = useState<number>(30);
  const [selectedHabit, setSelectedHabit] = useState<string>("auto");
  
  // Calculate simple correlations
  const correlationInsights = useMemo(() => {
    if (habits.length < 2) {
      return {
        insights: [],
        hasData: false,
        summary: "Need at least 2 habits to find patterns."
      };
    }

    // Get date range
    const today = new Date();
    const dates = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // Calculate habit completion data
    const habitData = habits.map(habit => {
      const completionData = dates.map(date => {
        const isActive = isHabitActiveOnDate(habit, parseISO(date));
        if (!isActive) return null;
        
        const isCompleted = completions.some(
          c => c.habitId === habit.id && c.date === date
        );
        return isCompleted ? 1 : 0;
      }).filter(val => val !== null);
      
      return {
        habit,
        data: completionData as number[],
        avgCompletion: completionData.length > 0 
          ? (completionData as number[]).reduce((a, b) => a + b, 0) / completionData.length 
          : 0
      };
    }).filter(h => h.data.length >= 5); // Only habits with enough data

    if (habitData.length < 2) {
      return {
        insights: [],
        hasData: false,
        summary: "Not enough data yet. Keep tracking for a few more days!"
      };
    }

    // Find correlations
    const correlations = [];
    for (let i = 0; i < habitData.length; i++) {
      for (let j = i + 1; j < habitData.length; j++) {
        const habit1 = habitData[i];
        const habit2 = habitData[j];
        
        // Align data for days both habits were active
        const alignedData1: number[] = [];
        const alignedData2: number[] = [];
        
        dates.forEach(date => {
          const active1 = isHabitActiveOnDate(habit1.habit, parseISO(date));
          const active2 = isHabitActiveOnDate(habit2.habit, parseISO(date));
          
          if (active1 && active2) {
            const completed1 = completions.some(c => c.habitId === habit1.habit.id && c.date === date) ? 1 : 0;
            const completed2 = completions.some(c => c.habitId === habit2.habit.id && c.date === date) ? 1 : 0;
            alignedData1.push(completed1);
            alignedData2.push(completed2);
          }
        });
        
        if (alignedData1.length >= 5) {
          const correlation = calculateCorrelation(alignedData1, alignedData2);
          
          if (Math.abs(correlation) > 0.2) { // Only meaningful correlations
            correlations.push({
              habit1: habit1.habit,
              habit2: habit2.habit,
              correlation,
              sampleSize: alignedData1.length,
              habit1Avg: habit1.avgCompletion,
              habit2Avg: habit2.avgCompletion
            });
          }
        }
      }
    }

    // Generate simple insights
    const insights = [];
    
    if (correlations.length === 0) {
      insights.push({
        type: "neutral" as const,
        message: "No strong patterns found between your habits yet. This might mean your habits are independent, which is perfectly fine!"
      });
    } else {
      // Sort by strength
      correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
      
      // Top positive correlation
      const topPositive = correlations.find(c => c.correlation > 0);
      if (topPositive) {
        const strength = Math.abs(topPositive.correlation);
        const strengthWord = strength > 0.6 ? "strongly" : strength > 0.4 ? "moderately" : "somewhat";
        
        insights.push({
          type: "positive" as const,
          message: `When you do "${topPositive.habit1.name}", you ${strengthWord} tend to also do "${topPositive.habit2.name}". These habits work well together!`,
          habits: [topPositive.habit1.name, topPositive.habit2.name],
          strength: Math.round(topPositive.correlation * 100)
        });
      }
      
      // Top negative correlation
      const topNegative = correlations.find(c => c.correlation < 0);
      if (topNegative) {
        const strength = Math.abs(topNegative.correlation);
        const strengthWord = strength > 0.6 ? "strongly" : strength > 0.4 ? "often" : "sometimes";
        
        insights.push({
          type: "negative" as const,
          message: `"${topNegative.habit1.name}" and "${topNegative.habit2.name}" ${strengthWord} don't happen on the same day. Consider if one might be interfering with the other.`,
          habits: [topNegative.habit1.name, topNegative.habit2.name],
          strength: Math.round(Math.abs(topNegative.correlation) * 100)
        });
      }
    }

    return {
      insights,
      correlations: correlations.slice(0, 3), // Top 3
      hasData: true,
      summary: `Found ${correlations.length} pattern${correlations.length !== 1 ? 's' : ''} in your habits over the last ${timeRange} days.`
    };
  }, [habits, completions, timeRange]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "negative": return <TrendingDown className="h-4 w-4 text-orange-600" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive": return "border-l-green-500 bg-green-50 dark:bg-green-950";
      case "negative": return "border-l-orange-500 bg-orange-50 dark:bg-orange-950";
      default: return "border-l-gray-500 bg-gray-50 dark:bg-gray-950";
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Habit Patterns</h3>
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64">
              Discover which habits you tend to do together or which ones might interfere with each other.
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="14">2 weeks</SelectItem>
              <SelectItem value="30">1 month</SelectItem>
              <SelectItem value="60">2 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
          {correlationInsights.summary}
        </div>

        {/* Insights */}
        {correlationInsights.insights.length > 0 ? (
          <div className="space-y-3">
            {correlationInsights.insights.map((insight, index) => (
              <div
                key={index}
                className={`border-l-4 pl-4 py-3 rounded-r-lg ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{insight.message}</p>
                    {'strength' in insight && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pattern strength: {insight.strength}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 opacity-50" />
              <p className="text-sm">Keep tracking your habits to discover patterns!</p>
            </div>
          </div>
        )}

        {/* Simple correlation list */}
        {correlationInsights.correlations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Pattern Details:</h4>
            {correlationInsights.correlations.map((corr, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  {corr.correlation > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-orange-600" />
                  )}
                  <span className="truncate">
                    {corr.habit1.name} + {corr.habit2.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(Math.abs(corr.correlation) * 100)}% pattern
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>💡 <strong>Tip:</strong> Use these patterns to build habit stacks - pair habits that work well together!</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleHabitCorrelations;