Feature 1.1: Global Summary Header
Objective: To provide an instant, high-level overview of the user's current standing.
Component Breakdown: A horizontal flex container at the top of the page holding four distinct, equally-sized cards. Each card has a subtle background (#1A1A1A) and a soft focus glow on hover.
Active Habits Card:
Content: Displays a large, bold number (e.g., "4") using the primary text color (#E5E5E5). Below it, a label in smaller, secondary text (#A0A0A0) reads "Active Habits."
Completed Today Card:
Content: Displays a dynamic ratio (e.g., "3 / 4"). The first number is the count of habits marked complete today; the second is the total active habits.
Behavior: The first number animates with a quick "count-up" effect each time a habit is checked or unchecked, providing satisfying feedback.
Completion Rate Card:
Content: Displays a large percentage (e.g., "75%") followed by a percent sign. The label below reads "Completion Rate."
Behavior: The percentage value is calculated in real-time (Completed Today / Active Habits \* 100) and animates in sync with the "Completed Today" card.
Perfect Days Card:
Content: Displays a large number representing the total count of days in the user's history where the completion rate was 100%. The label reads "Perfect Days."
Behavior: This number increments by one at the end of any day where all habits were marked complete.
Feature 1.2: Today's Quick Actions Module
Objective: To provide a frictionless, focused area for the user's primary daily task: marking habits as complete.
Component Breakdown: A dedicated card with a title "Today's Progress."
Master Progress Bar: A thin, animated progress bar sits directly below the title. Its fill is the Success Green (#2EBD59), and its width is directly proportional to the daily completion percentage. It animates smoothly between states.
Habit List: A vertically stacked list of all active habits. Each habit is a row item.
Habit Row Item:
Custom Animated Checkbox: A square checkbox on the left.
Default State: Gray border (#A0A0A0), empty fill.
Hover State: Border color changes to the Accent Blue (#3A7DFF).
Checked State: The checkbox animates, filling with Success Green. A white checkmark icon animates, drawing itself from the center outwards.
Habit Name: The name of the habit (e.g., "Read for 15 mins") displayed in primary text. When the habit is checked, the text's opacity subtly reduces to 70% to de-emphasize it.
Behavior:
Clicking an unchecked box triggers the checked state animation and updates the global summary and progress bar.
Clicking a checked box reverts the animation and updates all metrics accordingly.
This module only controls the completion status for the current date.
Feature 1.3: Habit Contribution Chart
Objective: To create a powerful, visual representation of consistency over time, motivating the user to maintain their streak.
Component Breakdown: A large grid component, visually similar to a GitHub contribution chart.
Grid Cells: A grid of 53 columns (weeks) by 7 rows (days), representing the last 365 days. Each cell is a square with rounded corners.
Color Logic: The fill color of each cell is determined by the habit completion percentage for that specific day.
0% Completion: Base Surface color (#1A1A1A).
1-33% Completion: A dark shade of Success Green.
34-66% Completion: A medium shade of Success Green.
67-99% Completion: A bright shade of Success Green.
100% Completion (Perfect Day): The full, vibrant Success Green (#2EBD59).
Labels: Month labels (e.g., "Jan," "Feb") are displayed above the grid. Day labels ("M," "W," "F") are displayed to the left of the grid.
Tooltip: A custom-styled tooltip component.
Behavior:
On page load, the grid is rendered with the appropriate colors for the past year's data.
The cell representing "today" has a subtle, solid white border to make it easily identifiable.
Hover Interaction: Hovering over any cell causes it to slightly scale up and gain a subtle border. Simultaneously, a tooltip appears above it.
Tooltip Content: The tooltip displays the full date (e.g., "Saturday, October 26, 2024") and the completion status ("3 / 4 Habits Completed").
EPIC 2: Analytics & Insights Page
A dedicated view for users who want to deep-dive into their data, understand their patterns, and get actionable advice.
Feature 2.1: Performance Breakdown Module
Objective: To give users a clear, quantitative measure of their performance, both overall and for each individual habit.
Component Breakdown: A card titled "Performance Distribution."
Overall Average KPI: A large, prominent display showing the all-time average completion rate across all habits and all days.
Per-Habit Analysis List: A list where each row represents a single habit.
Habit Name: The name of the habit.
Performance Bar: A horizontal bar chart visually showing the habit's all-time completion percentage.
Percentage Text: The exact percentage (e.g., "87%") displayed to the right of the bar.
Qualitative Label: A colored tag/badge based on the percentage:
Excellent (Green): > 80%
Good (Blue): 60% - 79%
Needs Work (Amber): < 60%
Feature 2.2: Streak Analytics Module
Objective: To leverage gamification and the human desire for continuity by prominently displaying streak data.
Component Breakdown: A card titled "Streak Analytics."
Habit Streak List: Each row in the list details the streaks for one habit.
Content: Displays the habit name, followed by two distinct metrics:
🔥 Current Streak: [X] days
🏆 Longest Streak: [Y] days
The numbers are highlighted in the Accent Blue color.
Feature 2.3: Progress Momentum Engine
Objective: To act as an early warning system, identifying habits that are declining in consistency before the streak is broken.
Component Breakdown: A card titled "Habit Momentum."
Logic: For each habit, the system calculates two metrics: the rolling 7-day completion average and the rolling 30-day completion average.
Momentum List: A list of all habits, each with a status tag determined by the logic:
On Track (Green Tag): 7-day average is greater than or equal to the 30-day average.
Stagnant (Gray Tag): Activity is sparse or has flatlined (e.g., zero completions in the last 7 days but some in the last 30).
At Risk (Amber Tag): 7-day average is significantly lower than the 30-day average, indicating a recent drop-off in performance.
Feature 2.4: Pattern Recognition Module
Objective: To reveal subconscious behavioral patterns and help users optimize their schedules.
Component Breakdown: A multi-part module.
Weekly Patterns Chart: A vertical bar chart with 7 bars, one for each day of the week (Sun-Sat). The height of each bar represents the average completion rate for that day. The bar for the "Best Day" is filled with Accent Blue; the "Weakest Day" is a muted gray.
Weekend vs. Weekday Cards: Two simple stat cards side-by-side displaying the average completion rate for "Weekends (Sat, Sun)" and "Weekdays (Mon-Fri)."
Generated Insights Box: A text box with a lightbulb icon.
Logic: This is a rule-based system that generates plain-language advice based on the user's data.
Example Rule 1: IF "Saturday Average" > "Weekday Average" by 20%+, THEN display: "Saturdays are your power day. Schedule your most important habits then."
Example Rule 2: IF "Sunday Average" < 40% AND is the "Weakest Day", THEN display: "Sundays seem tough. Consider reducing your habit load or finding new triggers to get started."
EPIC 3: Habit & Data Management
This covers the essential utility features for creating, managing, and controlling habits and their associated data.
Feature 3.1: Habit Creation and Management (CRUD)
Objective: To provide a simple and intuitive interface for managing the list of habits.
Component Breakdown:
"Add Habit" Button: A prominent button with a plus icon, using the Accent Blue color, on the main dashboard.
Add/Edit Modal: Clicking "Add Habit" (or an "Edit" icon on an existing habit) opens a clean, centered modal window.
Fields: A single text input field for "Habit Name."
Actions: "Save" and "Cancel" buttons.
Habit List Management: On the dashboard, each habit in the main list has subtle icons on the far right (visible on hover) for "Edit" and "Delete."
Delete Confirmation: Clicking the "Delete" icon opens a second, more aggressive confirmation modal. It will state: "This will permanently delete '[Habit Name]' and all of its tracked history. This action cannot be undone." The user must click a red "Confirm Delete" button to proceed.
Feature 3.2: Interactive Calendar View
Objective: To allow users to view their history at a glance and make retrospective edits.
Component Breakdown: A dedicated "Calendar" page in the navigation.
Calendar Grid: A full-screen monthly calendar interface with standard navigation to move between months and years.
Day Cell Styling: Each day cell in the calendar is color-coded with the same logic as the contribution chart (color intensity based on that day's completion percentage).
Behavior:
Clicking a Date: Clicking on any day in the calendar opens a slide-over panel from the right side of the screen.
Editing Panel: This panel is titled with the selected date (e.g., "Editing for October 24, 2024"). It contains a list of all habits with checkboxes reflecting their completion status for that specific day. The user can check/uncheck these boxes to edit their history. Changes are saved automatically.
Feature 3.3: Settings and Data Portability
Objective: To give users complete ownership and control over their data, reinforcing the app's privacy-first ethos.
Component Breakdown: A dedicated "Settings" page.
Export Data Button: A button labeled "Export My Data." Clicking it generates a momentum-backup.json file and initiates a browser download.
Import Data Button: A button labeled "Import Data." Clicking it opens the system's file picker, allowing the user to select a previously exported JSON file. Upon successful import, the app reloads with the new data.
Danger Zone: A visually distinct section with a red border.
Clear All Data Button: A red button labeled "Clear All Data." Clicking it opens a confirmation modal similar to the delete habit flow, requiring the user to type the word "DELETE" into a text field to enable the final confirmation button, preventing accidental deletion.
