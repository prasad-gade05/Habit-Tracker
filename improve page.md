Objective: Evolve the main dashboard from a static overview into a more dynamic, interactive, and insightful hub for the user's daily and weekly habit tracking. We will focus on reducing redundancy, improving interactivity, and adding at-a-glance visuals while maintaining the "minimal" aesthetic.
Task 1: Consolidate and Enhance the Habit Lists
Objective: The current UI has two separate lists for habits ("Today's Progress" and "My Habits") which creates redundancy. We will merge them into a single, more functional "Today's Habits" list.
Visual Description:
Replace the two separate Card components with a single, larger Card titled "Today's Habits".
Each habit in the list will be a single row. From left to right:
A Checkbox component for marking completion. It should be larger than the default for a better touch target.
The habit name (e.g., "hello").
A Badge component from shadcn/ui displaying the current streak (e.g., "🔥 5 days"). The badge should be the secondary or outline variant to not be visually jarring.
On the far right, a ... (kebab or meatball) icon. This will be a DropdownMenuTrigger.
When a habit is checked, the entire row's opacity should reduce slightly (e.g., opacity-60), and the habit name should have a line-through text decoration. This provides immediate visual feedback.
Functional Description:
The primary action is now the Checkbox. Clicking it marks the habit as complete for the day. This action should trigger an API call to update the habit's completion status for the current date.
Upon successful completion, the streak badge should immediately increment (e.g., "5 days" becomes "6 days"). This is an optimistic UI update.
Clicking the ... icon will open a DropdownMenuContent containing "Edit" and "Delete" options, which would trigger the respective modals or actions. This declutters the UI by hiding secondary actions.
Implementation Notes for AI Agent:
Use shadcn/ui components: Card, Checkbox, Badge, DropdownMenu.
The list should be rendered by mapping over an array of habit objects. Each object should contain id, name, isCompletedToday, and currentStreak.
The onCheckedChange handler for the Checkbox will be the main function to trigger the completion logic.
The streak badge should use a fire emoji or a similar icon for gamification. The color of the badge could change based on the length of the streak (e.g., gray for 0-5 days, orange for 6-20, red for 21+).
Task 2: Upgrade the Top Statistics Bar to be Interactive
Objective: Transform the static top-level statistics into interactive elements that provide more context on hover.
Visual Description:
The four stat boxes (ACTIVE HABITS, COMPLETED TODAY, etc.) will remain visually similar.
However, upon hovering over any of these boxes, a Tooltip from shadcn/ui will appear, providing a brief explanation or additional context.
When a habit is completed and a stat updates (e.g., 0/1 becomes 1/1), the text of that specific stat should briefly flash a bright color (like the primary theme color or a subtle green) and then fade back to its normal color. This "celebratory flash" provides positive reinforcement.
Functional Description:
ACTIVE HABITS Tooltip: "This is the total number of habits you are currently tracking."
COMPLETED TODAY Tooltip: "Shows how many habits you've completed today. Keep going!"
COMPLETION RATE Tooltip: "Your overall completion rate across all habits and all time."
PERFECT DAYS Tooltip: "A 'Perfect Day' is a day where you complete 100% of your habits. You have X perfect days so far."
The value in each stat box must be directly tied to the application's state, updating in real-time as habits are checked or unchecked.
Implementation Notes for AI Agent:
Wrap each stat card in the TooltipProvider and Tooltip components from shadcn/ui.
For the "celebratory flash," use a CSS animation. You can apply a class to the stat's text for a short duration (e.g., 1-2 seconds) when its value changes. The class would trigger a @keyframes animation that changes the color or text-shadow.
Ensure state management is robust so that completing a habit in the "Today's Habits" list immediately re-renders the stats bar.
Task 3: Implement a "Weekly Overview" Donut Chart
Objective: Add a new, compact visual that gives the user an immediate sense of their performance for the current week (last 7 days). This is more actionable than the year-long heatmap for daily motivation.
Visual Description:
Create a new Card component titled "This Week". It can replace the static "Keep going!" card to make better use of space.
Inside the card, implement a donut chart.
The chart will have two segments: one for "Completed" (using the theme's primary color) and one for "Missed/Pending" (using a muted gray or the card's background color).
In the center of the donut, display the weekly completion percentage in large, bold text (e.g., "75%"). Below it, in smaller text, show the raw numbers (e.g., "21/28 completed").
Functional Description:
The chart's data is calculated based on the last 7 days. It is (total completions in last 7 days) / (total active habits \* 7).
Hovering over the "Completed" segment of the chart should trigger a tooltip saying "You completed X habits this week."
Hovering over the "Missed/Pending" segment should say "Y habits were missed or are pending this week."
The chart should update instantly when a habit is completed for today.
Implementation Notes for AI Agent:
Use a charting library like Recharts or Chart.js, which are easy to integrate with React.
For Recharts, you would use a PieChart component with an innerRadius to create the donut effect. Use the <Cell> component to specify colors for each segment.
The data passed to the chart would be an array like: [{ name: 'Completed', value: 21, fill: 'hsl(var(--primary))' }, { name: 'Missed', value: 7, fill: 'hsl(var(--muted))' }].
To place text in the center, you can use absolute positioning in CSS or the chart library's built-in features for custom labels.
Task 4: Enhance the "Habit Consistency" Heatmap
Objective: Make the existing heatmap more informative and interactive, allowing the user to drill down into specific habit data.
Visual Description:
Above the heatmap, add a Select dropdown component from shadcn/ui.
The Select will be labeled "Showing consistency for:" and its options will be "All Habits" (default), followed by the name of each individual habit (e.g., "hello", "workout", "read").
The legend below the heatmap should also be more descriptive. Instead of just colors, it should show ranges, e.g., "Less: 0", a middle color for "1-2", and the darkest color for "3+ habits".
Functional Description:
When the user selects a specific habit from the dropdown, the heatmap's data should be filtered and re-rendered to show the completion history only for that habit.
When showing a single habit, the color intensity of a given day on the map will simply be binary (completed or not completed), so the legend should adjust to "Missed" and "Completed".
The tooltip that appears when hovering over a day-square on the heatmap needs to be more detailed.
In "All Habits" view: "September 15, 2025: 2 of 3 habits completed (Workout, Read)".
In single habit view (e.g., "Workout"): "September 15, 2025: Completed".
Implementation Notes for AI Agent:
Use the Select component from shadcn/ui to control the state of a filter.
The component rendering the heatmap should accept a habitId prop (which can be null or 'all').
When the prop changes, refetch or re-filter the dataset that generates the color values for each day.
The heatmap is likely rendered using a library like react-calendar-heatmap or a custom SVG implementation. You will need to modify the data-passing and color-calculating logic within it.
The tooltip functionality is a key part of this enhancement. Ensure the data for the tooltip content is readily available on hover.
