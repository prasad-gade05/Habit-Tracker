import React from 'react'
import { useHabitStore } from '../stores/habitStore'
import { getCompletionPercentageForDate } from '../utils/dateUtils'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks } from 'date-fns'

const WeeklyPatterns: React.FC = () => {
  const { habits, completions } = useHabitStore()
  
  // Get days of the current week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  // Calculate average completion percentage for each day of the week
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayPatterns = dayNames.map((dayName, index) => {
    // For simplicity, we'll calculate based on the current week
    // In a more advanced implementation, we would analyze historical data
    const day = weekDays[index]
    const dateString = format(day, 'yyyy-MM-dd')
    const percentage = getCompletionPercentageForDate(habits, completions, dateString)
    
    return {
      dayName,
      percentage
    }
  })
  
  // Find the best day
  const bestDay = dayPatterns.reduce((best, current) => 
    current.percentage > best.percentage ? current : best
  )
  
  // Calculate weekend vs weekday average
  const weekendDays = dayPatterns.filter((_, index) => index === 0 || index === 6)
  const weekdayDays = dayPatterns.filter((_, index) => index > 0 && index < 6)
  
  const weekendAverage = weekendDays.length > 0 
    ? Math.round(weekendDays.reduce((sum, day) => sum + day.percentage, 0) / weekendDays.length)
    : 0
    
  const weekdayAverage = weekdayDays.length > 0 
    ? Math.round(weekdayDays.reduce((sum, day) => sum + day.percentage, 0) / weekdayDays.length)
    : 0

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">Weekly Patterns</h2>
      
      <div className="space-y-3">
        {dayPatterns.map((day, index) => (
          <div key={index} className="flex items-center">
            <div className="w-10 text-sm text-muted-foreground">{day.dayName}</div>
            <div className="flex-1 ml-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${day.dayName === bestDay.dayName ? 'bg-accent' : 'bg-green-500'}`}
                  style={{ width: `${day.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="w-10 text-right text-sm text-foreground">{day.percentage}%</div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/20 rounded-lg p-3">
            <div className="text-sm text-green-500">Weekends</div>
            <div className="text-lg font-semibold text-foreground">{weekendAverage}%</div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3">
            <div className="text-sm text-blue-500">Weekdays</div>
            <div className="text-lg font-semibold text-foreground">{weekdayAverage}%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-accent/20 rounded-lg p-3">
            <div className="text-sm text-accent">Best Day</div>
            <div className="text-lg font-semibold text-foreground">{bestDay.dayName}</div>
          </div>
          <div className="bg-red-500/20 rounded-lg p-3">
            <div className="text-sm text-red-500">Needs Work</div>
            <div className="text-lg font-semibold text-foreground">
              {dayPatterns.find(day => day.percentage === Math.min(...dayPatterns.map(d => d.percentage)))?.dayName || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyPatterns