Application Type: Client-Side Single Page Application (SPA)
Core Mission: To create an ultra-minimalist, privacy-first habit tracker. The entire application runs in the user's browser with no server-side component. All data is stored locally using IndexedDB. The primary goal is to provide a beautiful, fast, and motivational user experience that helps users build and maintain habits by visualizing their consistency. 2. Guiding Principles for Development
Client-Side Logic Only: Do not generate any code that requires a server, backend API, or database calls over a network. All logic, state management, and data persistence must be handled within the browser.
Component-Based Architecture: Decompose the UI into small, reusable React components. Prioritize stateless functional components that receive data via props.
Type Safety First: Use TypeScript for all components, functions, and state definitions. Define clear interfaces for all data structures.
Atomic & Centralized State: State should be managed centrally using Zustand. Components should subscribe to the necessary state slices and use actions to mutate the state. Avoid local useState for globally relevant data.
Styling via Utility Classes: All styling must be implemented using Tailwind CSS. Adhere strictly to the design system variables defined below. Do not write custom CSS files unless absolutely necessary for complex animations. 3. Technology Stack & Environment
Framework: React 18+ (using Vite for the build tool)
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui (as a base for styled, accessible components like Modals, Buttons, Tooltips)
State Management: Zustand
Data Persistence: IndexedDB, managed via the dexie.js library for a simplified API.
Animations: Framer Motion

6. Detailed Component Specification
   Page: DashboardPage.tsx
   Purpose: The main view of the application.
   Layout: A vertical layout containing GlobalSummaryHeader, QuickActionsModule, and ContributionChart.
   Data: Fetches all initial data by calling the fetchData action from the Zustand store on mount.
   Component: GlobalSummaryHeader.tsx
   Purpose: Displays four key metrics at the top of the dashboard.
   Layout: A flex container with four GlobalSummaryCard components.
   Data: Subscribes to the habits and completions state from Zustand. It calculates the required metrics (total habits, today's completions, etc.) based on this data.
   Component Children:
   <GlobalSummaryCard label="Active Habits" value={...} />
   <GlobalSummaryCard label="Completed Today" value={...} />
   ...etc.
   Component: GlobalSummaryCard.tsx
   Purpose: A reusable card to display a single metric.
   Props: label: string, value: number | string.
   Visuals: A div with bg-surface, p-4, rounded-lg. Displays the value in a large, bold font (text-primary, font-bold, text-3xl) and the label below it (text-secondary, text-sm).
   Component: QuickActionsModule.tsx
   Purpose: The primary interaction point for daily tracking.
   Layout: A card (bg-surface) containing a title, MasterProgressBar, and a list of HabitRowItem components.
   Data: Subscribes to the habits and completions state. Maps over the habits array to render a HabitRowItem for each.
   Behavior: Determines which habits are completed for the current date (YYYY-MM-DD) and passes this information as a prop to each HabitRowItem.
   Component: HabitRowItem.tsx
   Purpose: Represents a single habit in the daily list.
   Props: habit: Habit, isCompleted: boolean.
   Layout: A flex item with a checkbox and the habit name.
   Visuals:
   Checkbox: A custom-styled checkbox. border-secondary when unchecked, bg-success with a checkmark icon when checked. Animate the transition.
   Habit Name: text-primary. When isCompleted is true, apply opacity-70.
   Behavior: onClick of the component, it calls the toggleCompletion action from the Zustand store, passing habit.id and the current date.
   Component: ContributionChart.tsx
   Purpose: Visualizes habit consistency over the past year.
   Layout: A grid of div elements representing days. Requires complex date logic to map the past 365 days into a 7x53 grid.
   Data: Subscribes to the completions state. It needs a utility function to process the completions array into a data structure that maps each date (YYYY-MM-DD) to its completion percentage.
   Visuals:
   Each grid cell (DayCell.tsx) receives a completionPercentage prop.
   The background color is determined by this percentage:
   0%: bg-surface
   1-33%: bg-success/20
   34-66%: bg-success/50
   67-99%: bg-success/80
   100%: bg-success
   Use a shadcn/ui Tooltip component on each DayCell to show the date and completion details on hover.
   Page: AnalyticsPage.tsx
   Purpose: Displays deep insights into user data.
   Layout: A vertical layout containing PerformanceBreakdown, StreakAnalytics, and PatternRecognition components.
   Data: This page will require extensive data processing. Create memoized selector functions (e.g., using reselect or simple useMemo hooks) to compute complex stats from the base habits and completions state without re-calculating on every render.
   Component: PerformanceBreakdown.tsx
   Purpose: Shows completion rates per habit.
   Logic: For each habit, calculate (total_completions / days_since_creation) \* 100.
   Visuals: Render a list where each item shows the habit name and a horizontal bar representing the completion percentage. Use colored tags (green, blue, amber) for qualitative labels.
