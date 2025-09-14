// Test data for development
import { db } from './lib/db'

export const createTestData = async () => {
  try {
    // Clear existing data
    await db.deleteAllData()
    
    // Add test habits
    const habit1Id = await db.addHabit('Morning Meditation')
    const habit2Id = await db.addHabit('Read for 30 minutes')
    const habit3Id = await db.addHabit('Exercise')
    const habit4Id = await db.addHabit('Drink 8 glasses of water')
    
    // Add some test completions
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]
    
    // Add completions for today
    await db.addCompletion(habit1Id, todayStr)
    await db.addCompletion(habit2Id, todayStr)
    await db.addCompletion(habit3Id, todayStr)
    
    // Add completions for yesterday
    await db.addCompletion(habit1Id, yesterdayStr)
    await db.addCompletion(habit2Id, yesterdayStr)
    await db.addCompletion(habit4Id, yesterdayStr)
    
    // Add completions for two days ago
    await db.addCompletion(habit1Id, twoDaysAgoStr)
    await db.addCompletion(habit3Id, twoDaysAgoStr)
    await db.addCompletion(habit4Id, twoDaysAgoStr)
    
    console.log('Test data created successfully!')
  } catch (error) {
    console.error('Error creating test data:', error)
  }
}

// Run the function if this file is imported
if (typeof window !== 'undefined') {
  // Uncomment the line below to create test data
  // createTestData()
}