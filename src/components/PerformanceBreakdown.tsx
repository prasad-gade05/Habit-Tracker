import React, { useMemo } from 'react'
import { useHabitStore } from '../stores/habitStore'
import { Habit, Completion } from '../utils/dateUtils'

const PerformanceBreakdown: React.FC = () => {
  const { habits, completions } = useHabitStore()
  
  // Calculate performance data for each habit
  const habitPerformance = useMemo(() => {
    return habits.map(habit => {
      // Get all completions for this habit
      const habitCompletions = completions.filter(c => c.habitId === habit.id)
      
      // Calculate completion percentage
      const completionPercentage = habits.length > 0 
        ? Math.round((habitCompletions.length / habits.length) * 100)
        : 0
      
      // Determine qualitative label
      let label = 'Needs Work'
      let labelColor = 'bg-amber-500'
      if (completionPercentage > 80) {
        label = 'Excellent'
        labelColor = 'bg-green-500'
      } else if (completionPercentage >= 60) {
        label = 'Good'
        labelColor = 'bg-blue-500'
      }
      
      return {
        ...habit,
        completions: habitCompletions.length,
        percentage: completionPercentage,
        label,
        labelColor
      }
    })
  }, [habits, completions])
  
  // Calculate overall average
  const overallAverage = useMemo(() => {
    if (habits.length === 0) return 0
    const totalPercentage = habitPerformance.reduce((sum, habit) => sum + habit.percentage, 0)
    return Math.round(totalPercentage / habits.length)
  }, [habitPerformance, habits.length])
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">Performance Distribution</h2>
      
      <div className="mb-6">
        <div className="text-3xl font-bold text-foreground">{overallAverage}%</div>
        <div className="text-muted-foreground">Overall Average</div>
      </div>
      
      <div className="space-y-4">
        {habitPerformance.length > 0 ? (
          habitPerformance.map(habit => (
            <div key={habit.id} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground">{habit.name}</span>
                <span className="text-foreground">{habit.percentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${habit.percentage}%`,
                    backgroundColor: habit.labelColor.replace('bg-', '').replace('-500', '')
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{habit.completions} completions</span>
                <span className={`px-2 py-1 rounded text-xs text-white ${habit.labelColor}`}>
                  {habit.label}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No habits to analyze yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceBreakdown