import React from 'react'
import { Activity, CheckCircle2, TrendingUp, Award } from 'lucide-react'

interface GlobalSummaryCardProps {
  label: string
  value: string | number
  type?: 'activeHabits' | 'completedToday' | 'completionRate' | 'perfectDays'
}

const GlobalSummaryCard: React.FC<GlobalSummaryCardProps> = ({ label, value, type }) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'activeHabits':
        return { icon: Activity, color: 'bg-blue-500/20', iconColor: 'text-blue-500' }
      case 'completedToday':
        return { icon: CheckCircle2, color: 'bg-green-500/20', iconColor: 'text-green-500' }
      case 'completionRate':
        return { icon: TrendingUp, color: 'bg-blue-500/20', iconColor: 'text-blue-500' }
      case 'perfectDays':
        return { icon: Award, color: 'bg-yellow-500/20', iconColor: 'text-yellow-500' }
      default:
        return { icon: Activity, color: 'bg-blue-500/20', iconColor: 'text-blue-500' }
    }
  }

  const { icon: Icon, color, iconColor } = getIconAndColor()

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border card-hover fade-in relative overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className={`absolute -top-2 -left-2 w-14 h-14 ${color} rounded-full flex items-center justify-center`}>
        <Icon className={`size-6 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-foreground mb-1 mt-3">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  )
}

export default GlobalSummaryCard