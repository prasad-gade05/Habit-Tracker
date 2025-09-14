import { format, subDays, isSameDay, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, addWeeks, isBefore, isAfter } from 'date-fns'

export interface Habit {
  id: string
  name: string
  description?: string
  createdAt: string // ISO string
}

export interface Completion {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
}

export const getToday = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

export const getLast365Days = (): string[] => {
  const days = []
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    days.push(format(subDays(today, i), 'yyyy-MM-dd'))
  }
  return days
}

export const getCompletionsForDate = (completions: Completion[], date: string): Completion[] => {
  return completions.filter(completion => completion.date === date)
}

export const isHabitCompletedOnDate = (habitId: string, completions: Completion[], date: string): boolean => {
  return completions.some(completion => 
    completion.habitId === habitId && completion.date === date
  )
}

export const getCompletionPercentageForDate = (habits: Habit[], completions: Completion[], date: string): number => {
  if (habits.length === 0) return 0
  
  const completionsForDate = getCompletionsForDate(completions, date)
  const completedHabits = completionsForDate.length
  const totalHabits = habits.length
  
  return Math.round((completedHabits / totalHabits) * 100)
}

export const getWeekDays = (startDate: Date): Date[] => {
  const start = startOfWeek(startDate, { weekStartsOn: 0 }) // Sunday as start
  const end = endOfWeek(startDate, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export const formatDateForDisplay = (dateString: string): string => {
  const date = parseISO(dateString)
  return format(date, 'EEEE, MMMM d, yyyy')
}

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return !isBefore(date, startDate) && !isAfter(date, endDate)
}