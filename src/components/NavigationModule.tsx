import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, CalendarDays, BarChart3, Settings } from 'lucide-react'

const NavigationModule: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navigationItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <div className="flex justify-center py-2">
      <div className="flex space-x-1 bg-card rounded-full p-1 shadow-sm border border-border">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
              onClick={() => handleNavigation(item.path)}
              title={item.name}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default NavigationModule