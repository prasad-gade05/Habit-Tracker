import React, { useMemo } from "react";
import { useHabitStore } from "../stores/habitStore";
import { isHabitActiveOnDate } from "../utils/dateUtils";
import { format, parseISO, subDays, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { 
  CheckCircle2, 
  Circle, 
  Target, 
  TrendingUp, 
  Calendar,
  Zap
} from "lucide-react";

const HabitMomentum: React.FC = () => {
  const { habits, completions, isHabitCompletedOnDate } = useHabitStore();

  const momentumData = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    
    // Get current week
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Get last 7 days for momentum calculation
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      format(subDays(today, i), "yyyy-MM-dd")
    ).reverse();

    // Calculate today's status
    const activeHabitsToday = habits.filter(habit => 
      !habit.isDeleted && isHabitActiveOnDate(habit, today)
    );
    
    const completedToday = activeHabitsToday.filter(habit =>
      isHabitCompletedOnDate(habit.id, todayStr)
    ).length;

    const todayProgress = activeHabitsToday.length > 0 
      ? Math.round((completedToday / activeHabitsToday.length) * 100)
      : 0;

    // Calculate weekly momentum
    const weeklyData = weekDays.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const activeHabits = habits.filter(habit => 
        !habit.isDeleted && isHabitActiveOnDate(habit, day)
      );
      const completed = activeHabits.filter(habit =>
        isHabitCompletedOnDate(habit.id, dayStr)
      ).length;
      
      return {
        day: dayStr,
        dayName: format(day, "EEE"),
        isToday: isToday(day),
        isPast: day < today,
        isFuture: day > today,
        total: activeHabits.length,
        completed,
        percentage: activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0
      };
    });

    // Calculate 7-day momentum score
    const momentumScores = last7Days.map(dayStr => {
      const activeHabits = habits.filter(habit => 
        !habit.isDeleted && isHabitActiveOnDate(habit, parseISO(dayStr))
      );
      const completed = activeHabits.filter(habit =>
        isHabitCompletedOnDate(habit.id, dayStr)
      ).length;
      
      return activeHabits.length > 0 ? (completed / activeHabits.length) * 100 : 0;
    });

    const avgMomentum = momentumScores.length > 0 
      ? Math.round(momentumScores.reduce((a, b) => a + b, 0) / momentumScores.length)
      : 0;

    // Calculate streak (consecutive days with >50% completion)
    let currentStreak = 0;
    for (let i = momentumScores.length - 1; i >= 0; i--) {
      if (momentumScores[i] >= 50) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Determine momentum status
    let momentumStatus: "building" | "strong" | "declining" | "starting" = "starting";
    let statusColor = "text-gray-500";
    let statusIcon = Circle;

    if (avgMomentum >= 80) {
      momentumStatus = "strong";
      statusColor = "text-green-600";
      statusIcon = CheckCircle2;
    } else if (avgMomentum >= 60) {
      momentumStatus = "building";
      statusColor = "text-blue-600";
      statusIcon = TrendingUp;
    } else if (avgMomentum >= 30) {
      momentumStatus = "declining";
      statusColor = "text-orange-600";
      statusIcon = Target;
    }

    return {
      todayProgress,
      completedToday,
      totalToday: activeHabitsToday.length,
      weeklyData,
      avgMomentum,
      currentStreak,
      momentumStatus,
      statusColor,
      statusIcon,
      last7Days: momentumScores
    };
  }, [habits, completions, isHabitCompletedOnDate]);

  const getStatusMessage = () => {
    switch (momentumData.momentumStatus) {
      case "strong":
        return "You're on fire! Keep this amazing momentum going.";
      case "building":
        return "Great progress! Your consistency is paying off.";
      case "declining":
        return "Don't worry, every expert was once a beginner. Stay consistent!";
      default:
        return "Ready to build some momentum? Start with one habit today.";
    }
  };

  const StatusIcon = momentumData.statusIcon;

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-medium">Habit Momentum</h3>
        </div>
        <div className={`flex items-center gap-1 ${momentumData.statusColor}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium capitalize">{momentumData.momentumStatus}</span>
        </div>
      </div>

      {/* Today's Progress Circle */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - momentumData.todayProgress / 100)}`}
              className="text-primary transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{momentumData.todayProgress}%</span>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">This Week</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {momentumData.weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">{day.dayName}</span>
              <div 
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  day.isToday 
                    ? "ring-2 ring-primary ring-offset-1" 
                    : ""
                } ${
                  day.isFuture
                    ? "bg-secondary/30 text-muted-foreground"
                    : day.percentage >= 80
                    ? "bg-green-500 text-white"
                    : day.percentage >= 60
                    ? "bg-blue-500 text-white"
                    : day.percentage >= 30
                    ? "bg-orange-500 text-white"
                    : day.percentage > 0
                    ? "bg-red-500 text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {day.isFuture ? "·" : day.percentage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-sm font-medium text-foreground">{momentumData.avgMomentum}%</div>
          <div className="text-xs text-muted-foreground">7-Day Avg</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-foreground">{momentumData.currentStreak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-foreground">{momentumData.completedToday}/{momentumData.totalToday}</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
        <p className="text-sm text-foreground text-center">{getStatusMessage()}</p>
      </div>
    </div>
  );
};

export default HabitMomentum;