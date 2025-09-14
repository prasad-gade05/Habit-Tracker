import React from 'react'
import { useHabitStore } from '../stores/habitStore'
import { getCompletionPercentageForDate } from '../utils/dateUtils'
import { format, subDays } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'

const SevenDayTrend: React.FC = () => {
  const { habits, completions } = useHabitStore()
  
  // Generate the last 7 days
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    last7Days.push(subDays(new Date(), i))
  }
  
  // Calculate completion percentages for each day
  const completionData = last7Days.map(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    const percentage = getCompletionPercentageForDate(habits, completions, dateString)
    return {
      date,
      dateString,
      percentage,
      dayName: format(date, 'EEE')
    }
  })
  
  // Calculate average rate
  const averageRate = completionData.length > 0 
    ? Math.round(completionData.reduce((sum, day) => sum + day.percentage, 0) / completionData.length)
    : 0
  
  // Find best day
  const bestDay = completionData.length > 0 
    ? completionData.reduce((best, current) => 
        current.percentage > best.percentage ? current : best
      )
    : null
  
  // Calculate trend (comparing today to yesterday)
  const todayPercentage = completionData.length > 0 ? completionData[6].percentage : 0
  const yesterdayPercentage = completionData.length > 1 ? completionData[5].percentage : 0
  const trendPercentage = yesterdayPercentage > 0 
    ? Math.round(((todayPercentage - yesterdayPercentage) / yesterdayPercentage) * 100)
    : 0

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">7-Day Trend</h2>
        {trendPercentage >= 0 && (
          <div className="flex items-center text-green-500">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm font-medium">{trendPercentage}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {completionData.map((day, index) => (
          <div key={index} className="flex items-center">
            <div className="w-10 text-sm text-muted-foreground">{day.dayName}</div>
            <div className="flex-1 ml-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${day.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="w-10 text-right text-sm text-foreground">{day.percentage}%</div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Avg Rate</div>
            <div className="text-lg font-semibold text-foreground">{averageRate}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Best Day</div>
            <div className="text-lg font-semibold text-foreground">
              {bestDay ? `${bestDay.percentage}%` : '0%'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-semibold text-foreground">{habits.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SevenDayTrend