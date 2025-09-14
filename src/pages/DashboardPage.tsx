import React, { useEffect } from 'react'
import { useHabitStore } from '../stores/habitStore'
import GlobalSummaryHeader from '../components/GlobalSummaryHeader'
import QuickActionsModule from '../components/QuickActionsModule'
import ContributionChart from '../components/ContributionChart'

const DashboardPage: React.FC = () => {
  const { fetchAllData, loading } = useHabitStore()

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your habits...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Habit Tracker</h1>
        <p className="text-muted-foreground">Build better habits, one day at a time.</p>
      </div>
      
      <GlobalSummaryHeader />
      
      <div className="mt-8">
        <QuickActionsModule />
      </div>
      
      <div className="mt-8">
        <ContributionChart />
      </div>
    </div>
  )
}

export default DashboardPage