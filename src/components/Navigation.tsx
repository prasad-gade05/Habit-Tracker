import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  BarChart3, 
  Calendar, 
  Settings 
} from 'lucide-react'

const Navigation: React.FC = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]
  
  return (
    <nav className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between px-4 py-3">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className="flex flex-col items-center justify-center h-16 w-16 rounded-lg"
                asChild
              >
                <Link to={item.path}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation