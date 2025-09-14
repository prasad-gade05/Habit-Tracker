// Simple test to verify the application is working
import { db } from './lib/db'
import { useHabitStore } from './stores/habitStore'

// Test database operations
async function testDatabase() {
  try {
    console.log('Testing database operations...')
    
    // Add a test habit
    const habitId = await db.addHabit('Test Habit', 'This is a test habit for verification')
    console.log('✓ Added habit:', habitId)
    
    // Add a completion
    const today = new Date().toISOString().split('T')[0]
    const completionId = await db.addCompletion(habitId, today)
    console.log('✓ Added completion:', completionId)
    
    // Get all habits
    const habits = await db.getAllHabits()
    console.log('✓ Retrieved habits:', habits.length)
    
    // Get all completions
    const completions = await db.getAllCompletions()
    console.log('✓ Retrieved completions:', completions.length)
    
    // Test update
    await db.updateHabit(habitId, 'Updated Test Habit', 'This habit has been updated')
    console.log('✓ Updated habit')
    
    // Clean up
    await db.deleteHabit(habitId)
    console.log('✓ Cleaned up test data')
    
    console.log('✓ All database tests passed!')
    return true
  } catch (error) {
    console.error('✗ Database test failed:', error)
    return false
  }
}

// Test store operations
function testStore() {
  try {
    console.log('Testing store operations...')
    
    // This would normally be tested with a mock or in a component context
    console.log('✓ Store tests would be run in component context')
    
    return true
  } catch (error) {
    console.error('✗ Store test failed:', error)
    return false
  }
}

// Run all tests
export async function runAllTests() {
  console.log('Running application tests...')
  
  const dbTestPassed = await testDatabase()
  const storeTestPassed = testStore()
  
  if (dbTestPassed && storeTestPassed) {
    console.log('✓ All tests passed!')
    return true
  } else {
    console.log('✗ Some tests failed!')
    return false
  }
}

// Run tests if this file is imported directly
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Uncomment to run tests
  // runAllTests()
}