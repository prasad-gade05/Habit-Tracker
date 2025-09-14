import React, { useState } from 'react'
import { useHabitStore } from '../stores/habitStore'
import HabitRowItem from './HabitRowItem'
import { getToday } from '../utils/dateUtils'
import HabitModal from './HabitModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const QuickActionsModule: React.FC = () => {
  const { habits, getCompletionsForDate, addHabit } = useHabitStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const today = getToday()
  const todayCompletions = getCompletionsForDate(today)
  
  // Calculate completion percentage for today
  const completionPercentage = habits.length > 0 
    ? Math.round((todayCompletions.length / habits.length) * 100) 
    : 0

  const handleAddHabit = (name: string, description?: string) => {
    addHabit(name, description)
  }

  return (
    <>
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border card-hover fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">Today's Progress</h2>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="button-hover">
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2 mb-6">
          <div 
            className="bg-green-500 h-2 rounded-full progress-bar"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        {/* Habits list */}
        <div className="space-y-3">
          {habits.length > 0 ? (
            habits.map(habit => (
              <HabitRowItem 
                key={habit.id} 
                habit={habit} 
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground fade-in">
              <p>No habits yet. Add your first habit to get started!</p>
            </div>
          )}
        </div>
      </div>
      
      <HabitModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onConfirm={handleAddHabit} 
      />
    </>
  )
}

export default QuickActionsModule