import React, { useEffect, useMemo, useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import PerformanceBreakdown from "../components/PerformanceBreakdown";
import StreakAnalytics from "../components/StreakAnalytics";
import PatternRecognition from "../components/PatternRecognition";
import GlobalSummaryHeader from "../components/GlobalSummaryHeader";
import NavigationModule from "../components/NavigationModule";
import QuickActionsModule from "../components/QuickActionsModule";
// Removed MyHabitsModule import since it's no longer needed
import CompletionRatesVisual from "../components/CompletionRatesVisual";
import HabitCorrelations from "../components/HabitCorrelations";
import CorrelationMatrix from "../components/CorrelationMatrix";
import CorrelationRadarChart from "../components/CorrelationRadarChart";
import { calculateCorrelation } from "../utils/correlationUtils";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { parseISO } from "date-fns";

const AnalyticsPage: React.FC = () => {
  const { habits, completions, fetchAllData } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const [chartMode, setChartMode] = useState<"top" | "specific">("top");
  const [numHabitsToShow, setNumHabitsToShow] = useState<number>(5);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
  const { correlationMatrix, habitList, radarData } = useMemo(() => {
    // Check if we have sufficient data
    const hasSufficientData = habits.length >= 2 && completions.length > 0;
    
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
  }, [habits, completions, chartMode, selectedHabitId, numHabitsToShow]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Improved Application Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Habit Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build consistency, one day at a time
        </p>
      </div>

      {/* Minimal Navigation at the top */}
      <div className="mb-6">
        <NavigationModule />
      </div>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">
          Analytics & Insights
        </h1>
        <p className="text-muted-foreground text-sm">
          Deep dive into your habit data
        </p>
      </div>

      <GlobalSummaryHeader />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {/* Left column (sidebar) */}
        <div className="md:col-span-1 space-y-5">
          <QuickActionsModule />
          <CompletionRatesVisual />
          <HabitCorrelations />
        </div>

        {/* Right column (main content) */}
        <div className="md:col-span-2 space-y-5">
          {/* Removed MyHabitsModule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PerformanceBreakdown />
            <StreakAnalytics />
          </div>
          <PatternRecognition />
          
          {/* Correlation Matrix and Radar Chart directly below PatternRecognition */}
          {habits.length >= 2 && completions.length > 0 && (
            <>
              <CorrelationMatrix 
                correlationMatrix={correlationMatrix}
                habitList={habitList}
                getCorrelationColor={getCorrelationColor}
              />
              <CorrelationRadarChart 
                radarData={radarData}
                habitList={habitList}
                chartMode={chartMode}
                selectedHabitId={selectedHabitId}
                getCorrelationColor={getCorrelationColor}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;