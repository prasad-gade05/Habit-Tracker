import React from 'react'

interface GlobalSummaryCardProps {
  label: string
  value: string | number
}

const GlobalSummaryCard: React.FC<GlobalSummaryCardProps> = ({ label, value }) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border card-hover fade-in">
      <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

export default GlobalSummaryCard