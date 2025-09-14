import React from 'react'
import NavigationCard from './NavigationCard'
import QuickActionsCard from './QuickActionsCard'

const LeftSidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      <NavigationCard />
      <QuickActionsCard />
    </div>
  )
}

export default LeftSidebar