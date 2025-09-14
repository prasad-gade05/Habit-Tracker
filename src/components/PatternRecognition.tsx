import React, { useMemo } from 'react'
import { useHabitStore } from '../stores/habitStore'
import { Completion } from '../utils/dateUtils'
import { parseISO, isWeekend, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday } from 'date-fns'
import { Lightbulb } from 'lucide-react'

const PatternRecognition: React.FC = () => {
  const { habits, completions } = useHabitStore()
  
  // Calculate completion rates by day of week
  const weeklyPatterns = useMemo(() => {
    // Initialize counters for each day
    const dayCounts: Record<string, { total: number, completed: number }> = {
      'Sunday': { total: 0, completed: 0 },
      'Monday': { total: 0, completed: 0 },
      'Tuesday': { total: 0, completed: 0 },
      'Wednesday': { total: 0, completed: 0 },
      'Thursday': { total: 0, completed: 0 },
      'Friday': { total: 0, completed: 0 },
      'Saturday': { total: 0, completed: 0 }
    }
    
    // Count completions by day
    completions.forEach(completion => {
      const date = parseISO(completion.date)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      
      if (dayCounts[dayName]) {
        dayCounts[dayName].completed += 1
      }
    })
    
    // Count total possible completions by day (habits * number of occurrences)
    const datesByDay: Record<string, Set<string>> = {
      'Sunday': new Set(),
      'Monday': new Set(),
      'Tuesday': new Set(),
      'Wednesday': new Set(),
      'Thursday': new Set(),
      'Friday': new Set(),
      'Saturday': new Set()
    }
    
    completions.forEach(completion => {
      const date = parseISO(completion.date)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      datesByDay[dayName].add(completion.date)
    })
    
    // Calculate totals
    Object.keys(datesByDay).forEach(day => {
      dayCounts[day].total = datesByDay[day].size * habits.length
    })
    
    // Calculate percentages
    const percentages: Record<string, number> = {}
    Object.keys(dayCounts).forEach(day => {
      percentages[day] = dayCounts[day].total > 0 
        ? Math.round((dayCounts[day].completed / dayCounts[day].total) * 100)
        : 0
    })
    
    return { counts: dayCounts, percentages }
  }, [habits, completions])
  
  // Calculate weekend vs weekday averages
  const weekendWeekdayStats = useMemo(() => {
    const weekendCompleted = 
      weeklyPatterns.counts.Saturday.completed + 
      weeklyPatterns.counts.Sunday.completed
    const weekendTotal = 
      weeklyPatterns.counts.Saturday.total + 
      weeklyPatterns.counts.Sunday.total
      
    const weekdayCompleted = 
      weeklyPatterns.counts.Monday.completed + 
      weeklyPatterns.counts.Tuesday.completed + 
      weeklyPatterns.counts.Wednesday.completed + 
      weeklyPatterns.counts.Thursday.completed + 
      weeklyPatterns.counts.Friday.completed
    const weekdayTotal = 
      weeklyPatterns.counts.Monday.total + 
      weeklyPatterns.counts.Tuesday.total + 
      weeklyPatterns.counts.Wednesday.total + 
      weeklyPatterns.counts.Thursday.total + 
      weeklyPatterns.counts.Friday.total
      
    const weekendAverage = weekendTotal > 0 
      ? Math.round((weekendCompleted / weekendTotal) * 100)
      : 0
    const weekdayAverage = weekdayTotal > 0 
      ? Math.round((weekdayCompleted / weekdayTotal) * 100)
      : 0
      
    return { weekendAverage, weekdayAverage }
  }, [weeklyPatterns])
  
  // Generate insights based on patterns
  const insights = useMemo(() => {
    const insights = []
    
    // Find best and worst days
    const days = Object.keys(weeklyPatterns.percentages)
    const bestDay = days.reduce((a, b) => 
      weeklyPatterns.percentages[a] > weeklyPatterns.percentages[b] ? a : b
    )
    const worstDay = days.reduce((a, b) => 
      weeklyPatterns.percentages[a] < weeklyPatterns.percentages[b] ? a : b
    )
    
    // Insight 1: Best vs worst day comparison
    if (weeklyPatterns.percentages[bestDay] > weeklyPatterns.percentages[worstDay] + 20) {
      insights.push(`"${bestDay}s" are your power day. Schedule your most important habits then.`)
    }
    
    // Insight 2: Weekend vs weekday comparison
    if (weekendWeekdayStats.weekendAverage > weekendWeekdayStats.weekdayAverage + 20) {
      insights.push("Weekends are your most productive time. Plan your challenging habits for Saturday and Sunday.")
    } else if (weekendWeekdayStats.weekdayAverage > weekendWeekdayStats.weekendAverage + 20) {
      insights.push("You're more consistent on weekdays. Try to maintain this momentum throughout the week.")
    }
    
    // Insight 3: Low performance day
    if (weeklyPatterns.percentages[worstDay] < 40) {
      insights.push(`"${worstDay}s" seem tough. Consider reducing your habit load or finding new triggers to get started.`)
    }
    
    return insights
  }, [weeklyPatterns, weekendWeekdayStats])
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">Pattern Recognition</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-3">Weekly Patterns</h3>
          <div className="space-y-2">
            {Object.entries(weeklyPatterns.percentages).map(([day, percentage]) => (
              <div key={day} className="flex items-center">
                <div className="w-24 text-sm text-muted-foreground">{day.substring(0, 3)}</div>
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-right text-sm text-foreground">{percentage}%</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Weekend vs Weekday</h3>
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">{weekendWeekdayStats.weekendAverage}%</div>
                <div className="text-sm text-muted-foreground">Weekends</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{weekendWeekdayStats.weekdayAverage}%</div>
                <div className="text-sm text-muted-foreground">Weekdays</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {insights.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="text-foreground flex">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default PatternRecognition