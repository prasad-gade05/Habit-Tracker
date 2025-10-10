import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useHabitStore } from "../stores/habitStore";
import { getToday } from "../utils/dateUtils";
import { format, subDays, parseISO } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WeeklyOverviewChart: React.FC = () => {
  const { habits, completions } = useHabitStore();
  const today = getToday();

  // Calculate weekly data for the last 7 days
  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      format(subDays(parseISO(today), i), "yyyy-MM-dd")
    );

    let totalCompletions = 0;
    const totalPossible = habits.length * 7;

    last7Days.forEach((date) => {
      const dayCompletions = completions.filter(
        (completion) => completion.date === date
      );
      totalCompletions += dayCompletions.length;
    });

    const completed = totalCompletions;
    const missed = totalPossible - completed;
    const percentage =
      totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;

    return {
      data: [
        { name: "Completed", value: completed, fill: "hsl(var(--primary))" },
        { name: "Missed", value: missed, fill: "hsl(var(--muted))" },
      ],
      percentage,
      completed,
      total: totalPossible,
    };
  }, [habits, completions, today]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">
            {data.name === "Completed"
              ? `You completed ${data.value} habits this week.`
              : `${data.value} habits were missed or are pending this week.`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground mb-5">This Week</h2>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={weeklyData.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {weeklyData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-foreground">
            {weeklyData.percentage}%
          </div>
          <div className="text-xs text-muted-foreground">
            {weeklyData.completed}/{weeklyData.total} completed
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(var(--primary))" }}
                />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                You completed {weeklyData.completed} habits this week.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(var(--muted))" }}
                />
                <span className="text-xs text-muted-foreground">Missed</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {weeklyData.data[1].value} habits were missed or are pending
                this week.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default WeeklyOverviewChart;
