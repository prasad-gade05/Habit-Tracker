import React, { useEffect } from 'react'
import { useHabitStore } from '../stores/habitStore'
import CalendarView from '../components/CalendarView'

const CalendarPage: React.FC = () => {
  const { fetchAllData } = useHabitStore()

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground">View and edit your habit history</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <CalendarView />
      </div>
    </div>
  )
}

export default CalendarPage