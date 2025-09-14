Objective: Upgrade the existing "Analytics & Insights" page . This involves adding entirely new components and significantly enhancing existing ones. All implementations must adhere to the "Cyber Noir" design system.
Analysis of Missing & Incomplete Features:
Missing Component: "Completion Rates" Card: A primary module for per-habit performance analysis is completely absent.
Missing Component: "Progress Momentum" Card: The predictive engine for tracking habit momentum is missing.
Missing Component: "Habit Correlations" Card: The module for discovering relationships between habits is missing.
Missing Component: "7-Day Trend" Card: A small but vital card for tracking short-term trends is missing.
Incomplete Component: "Streak Analytics": The current implementation is just a placeholder. The target design shows a detailed breakdown.
Incomplete Component: "Weekly Patterns": The current design is static. The target design is dynamic, highlighting best/worst days and using color more effectively.
Directive 1: Implement the "Completion Rates" Card
Description: This is a crucial new module that provides a detailed breakdown of performance for each individual habit, moving beyond the simple "Overall Average" currently shown in the "Performance Distribution" card.
Implementation Steps:
Create a new card component named CompletionRates to the right of the Streak Analytics card.
Component Breakdown:
Card Header: A title "Completion Rates."
Overall Average Display: A prominent section at the top of the card showing the overall average completion rate as a large percentage (e.g., "100%").
Habit List: Below the average, create a list of HabitCompletionItem components, one for each active habit.
HabitCompletionItem Sub-Component Details:
Layout: A flex row with four main elements aligned horizontally. Add a subtle bottom border (border-border) to separate items.
Element 1: Progress Circle (SVG):
Create a 40x40 SVG element.
Draw two circles: a background circle with a stroke of border (#2B2B2B) and a foreground progress circle with a stroke of success (#2EBD59).
Use stroke-dasharray and stroke-dashoffset on the foreground circle to represent the habit's completion percentage. Animate the stroke-dashoffset when it first appears.
Overlay the percentage text (e.g., "100%") in the center of the circle.
Element 2: Habit Name & Rating:
Display the habit name (e.g., "Data analytics") in text-primary.
Below the name, display a qualitative rating tag (e.g., "Excellent") in text-success.
Element 3: Exact Percentage: Display the precise completion percentage with one decimal place (e.g., "100.0%") in text-secondary.
Element 4: Consistency Label: Display a label indicating consistency (e.g., "Consistent") in text-secondary.
Directive 2: Implement the "Progress Momentum" Card
Description: This is a predictive analytics module designed to act as an early warning system for habits that are losing consistency. It is a completely new feature.
Implementation Steps:
Create a new card component named ProgressMomentum placed below the Streak Analytics and Completion Rates cards, spanning the full width.
Component Breakdown:
Card Header: A title "Progress Momentum" and a subtitle "Track your habit momentum and predict future success."
Overall Momentum Score: A circular display in the header showing the overall score (initially "0").
Habit Momentum List: A list of HabitMomentumItem components.
Summary Footer: A flex container at the bottom with three summary "pills": "On Track," "At Risk," and "Struggling."
HabitMomentumItem Sub-Component Details:
Layout: A flex row with the habit name on the left and status on the right.
Habit Name & Status: Display the habit name. Next to it, show a status tag with an icon.
Status: Stagnant: Use a gray tag (bg-secondary/20, text-secondary).
Status: Needs Attention: Use a warning tag (bg-warning/20, text-warning) accompanied by an <AlertTriangle /> icon from lucide-react.
Logic:
Calculate momentum by comparing the rolling 7-day completion average against the rolling 30-day average for each habit.
If 7day_avg < 30day_avg, the status is Needs Attention.
Otherwise, the status is Stagnant or On Track.
Summary Footer Visuals:
Each pill should contain a number and a label.
On Track: Use text-success.
At Risk: Use text-warning.
Struggling: Use a muted red color.
Directive 3: Implement the "Habit Correlations" Card
Description: An advanced feature that visualizes which habits users tend to complete together. This module should only appear after sufficient data has been collected.
Implementation Steps:
Create a new card component named HabitCorrelations.
Conditional Rendering Logic: This card should only render if the user has 2 or more habits and at least 7 days of tracking data.
Empty/Insufficient Data State:
If the conditions are not met, display a placeholder inside the card.
Visuals: Show an icon representing linked nodes (as in the PDF).
Text: Display the message: "Need at least 2 habits with 7+ days of data to show correlations."
Data-Rich State (Future Implementation):
When data is sufficient, display a visualization (e.g., a simple node graph or a heatmap) that shows the strength of the correlation between pairs of habits.
Directive 4: Implement the "7-Day Trend" Card
Description: A small, focused module providing a snapshot of performance over the last week. This is a new component.
Implementation Steps:
Create a new card component SevenDayTrend. This can be placed next to the Habit Correlations card.
Component Breakdown:
Header: A title "7-Day Trend" and a trend indicator on the right.
Trend Indicator:
Display a percentage change (e.g., "+33.3%").
If the trend is positive, color the text text-success and use an <ArrowUpRight /> icon.
If negative, use a muted red and an <ArrowDownRight /> icon.
Bar Chart: A simple horizontal bar chart showing the completion rate for each of the last seven days.
Footer: Display "Avg Rate," "Best Day," and "Total" completions for the period.
Directive 5 & 6: Enhance Existing Components
Upgrade Streak Analytics Card:
Current State: Simple placeholder text.
Target State: Rebuild the card to have two main sections.
Top Section: Two stat cards side-by-side for "Active Streaks" and "Avg Streak."
Bottom Section: Two lists.
"Current Streaks": Lists each habit and its current streak in days (e.g., "Data analytics - 1 days"). Use a colored tag for the day count.
"Streak Progress": Lists each habit with a progress bar showing current_streak / longest_streak.
Upgrade Weekly Patterns Card:
Current State: Static list with 0% values.
Target State:
Highlighting: The bar corresponding to the day with the highest average completion rate should be filled with accent color (#3A7DFF) and labeled "BEST."
Summary Cards: Replace the "Weekend vs Weekday" section with two dedicated summary cards below the chart:
Best Day Card: Green background (bg-success/10), showing the best day (e.g., "Saturday") and its percentage.
Needs Work Card: Red background (bg-red-500/10), showing the weakest day (e.g., "Sunday") and its percentage.