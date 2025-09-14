import React from 'react'
import { useHabitStore } from '../stores/habitStore'
import GlobalSummaryCard from './GlobalSummaryCard'

const GlobalSummaryHeader: React.FC = () => {
  const { 
    getActiveHabitsCount, 
    getCompletedTodayCount, 
    getCompletionRate, 
    getPerfectDaysCount 
  } = useHabitStore()

  const activeHabits = getActiveHabitsCount()
  const completedToday = getCompletedTodayCount()
  const completionRate = getCompletionRate()
  const perfectDays = getPerfectDaysCount()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <GlobalSummaryCard 
        label="Active Habits" 
        value={activeHabits} 
      />
      <GlobalSummaryCard 
        label="Completed Today" 
        value={`${completedToday} / ${activeHabits}`} 
      />
      <GlobalSummaryCard 
        label="Completion Rate" 
        value={`${completionRate}%`} 
      />
      <GlobalSummaryCard 
        label="Perfect Days" 
        value={perfectDays} 
      />
    </div>
  )
}

export default GlobalSummaryHeader