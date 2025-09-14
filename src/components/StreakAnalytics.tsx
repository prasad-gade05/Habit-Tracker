import React, { useMemo } from 'react'
import { useHabitStore } from '../stores/habitStore'
import { Completion } from '../utils/dateUtils'
import { Flame, Trophy } from 'lucide-react'

const StreakAnalytics: React.FC = () => {
  const { habits, completions } = useHabitStore()
  
  // Calculate streaks for each habit
  const habitStreaks = useMemo(() => {
    return habits.map(habit => {
      // Get all completions for this habit, sorted by date
      const habitCompletions = completions
        .filter(c => c.habitId === habit.id)
        .sort((a, b) => a.date.localeCompare(b.date))
      
      if (habitCompletions.length === 0) {
        return {
          ...habit,
          currentStreak: 0,
          longestStreak: 0
        }
      }
      
      // Calculate current streak (consecutive days ending with today or last completion)
      let currentStreak = 0
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Find the most recent completion date
      const lastCompletion = habitCompletions[habitCompletions.length - 1]
      const lastCompletionDate = new Date(lastCompletion.date)
      
      // If the last completion was today or yesterday, calculate current streak
      const daysSinceLastCompletion = Math.floor(
        (today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceLastCompletion <= 1) {
        // Count backwards from the last completion to find the streak
        currentStreak = 1
        for (let i = habitCompletions.length - 2; i >= 0; i--) {
          const currentDate = new Date(habitCompletions[i].date)
          const nextDate = new Date(habitCompletions[i + 1].date)
          const dayDifference = Math.floor(
            (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          
          if (dayDifference === 1) {
            currentStreak++
          } else {
            break
          }
        }
      }
      
      // Calculate longest streak
      let longestStreak = 0
      let tempStreak = 1
      
      for (let i = 1; i < habitCompletions.length; i++) {
        const currentDate = new Date(habitCompletions[i].date)
        const prevDate = new Date(habitCompletions[i - 1].date)
        const dayDifference = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (dayDifference === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
      
      return {
        ...habit,
        currentStreak,
        longestStreak
      }
    })
  }, [habits, completions])
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">Streak Analytics</h2>
      
      <div className="space-y-4">
        {habitStreaks.length > 0 ? (
          habitStreaks.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-foreground">{habit.name}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Flame className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-foreground font-medium">{habit.currentStreak}</span>
                  <span className="text-muted-foreground text-sm ml-1">current</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-foreground font-medium">{habit.longestStreak}</span>
                  <span className="text-muted-foreground text-sm ml-1">longest</span>
                </div>
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

export default StreakAnalytics