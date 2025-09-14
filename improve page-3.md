Objective: Transform the current isolated "Calendar" page into a fully integrated view within a global application shell. This involves creating a persistent sidebar with navigation and quick actions, and populating the main content area with the calendar and relevant analytics modules as shown in the target design.

Analysis of Missing \& Incomplete Features:

Missing Global Layout: The application lacks a persistent shell. The navigation and quick actions sidebar, which should be visible on all pages, is completely absent.

Missing Global Component: Today's Progress / Quick Actions Card: The primary card for daily interaction is missing from the view.

Missing Analytics Context: The calendar is shown in isolation. The target design displays it alongside contextual analytics cards (7-Day Trend and Weekly Patterns) to provide a richer data experience.

Incomplete Visual Design: The calendar component itself is minimalistic and lacks the visual cues (color-coding, legends) that make the target design informative and engaging.

Directive 1: Implement the Global Application Shell Layout

Description: This is the most fundamental architectural change. Refactor the application to use a main layout component that contains a persistent left sidebar and a main content area. The content of this main area will change based on the user's navigation.

Implementation Steps:

Create a new root layout component, AppShell.tsx.

Layout Structure: Use CSS Grid to define a two-column layout for desktop views.

Grid Definition: display: grid, md:grid-template-columns: 300px 1fr (a fixed 300px sidebar and a flexible main content area), gap-6.

Left Sidebar (LeftSidebar.tsx):

This component will be static and rendered permanently within the AppShell.

It will contain the Navigation card and the Today's Progress / Quick Actions card.

Main Content Area:

This is the flexible part of the grid.

Use a router (e.g., React Router) to render the appropriate page component (DashboardPage, CalendarPage, AnalyticsPage) in this area based on the current URL.

Directive 2: Implement the Global Today's Progress / Quick Actions Card

Description: Add the essential daily tracking module to the new LeftSidebar component so it is accessible from every page, including the Calendar view.

Implementation Steps:

Create the QuickActionsCard component and place it inside the LeftSidebar.

Component Breakdown:

Header: A flex container with the title "Today's Progress," the completion ratio (e.g., "4/4"), and the completion percentage ("100%").

Progress Bar: A thin, animated progress bar below the header, filled with bg-success.

Habit List: A list of all active habits.

Habit Item: Each item in the list should display:

The habit name (e.g., "Data analytics").

A custom animated toggle switch on the right.

Toggle Switch Styling: The switch track should be bg-border (#2B2B2B). When toggled on, the track color animates to bg-success (#2EBD59), and a white circular thumb slides to the right.

Directive 3: Implement the Global Navigation Card

Description: Add the primary navigation menu to the LeftSidebar to allow seamless movement between pages.

Implementation Steps:

Create the NavigationCard component and place it above the QuickActionsCard in the LeftSidebar.

Component Breakdown:

Render a list of navigation links: "Overview," "Calendar," "Analytics."

Each link should have an icon from lucide-react to its left (<LayoutDashboard />, <CalendarDays />, <BarChart3 />).

Active State Logic: The link corresponding to the currently active page must be visually distinct.

Styling: Set its background color to bg-accent (#3A7DFF) and its text/icon color to text-primary (#E5E5E5). All other links should have a transparent background and text-secondary color.

Directive 4: Re-architect the Calendar Page's Main Content Area

Description: The calendar should not be the only element in the main content area. It should be the primary focus, but flanked by relevant analytics cards as seen in the PDF.

Implementation Steps:

Within the CalendarPage.tsx component, create a two-column grid for its content. grid-template-columns: 2fr 1fr.

Left Column (Larger): Place the HabitCalendar component here.

Right Column (Smaller): Create a vertical stack (flex flex-col gap-6) and place the SevenDayTrend and WeeklyPatterns components inside it.

Directive 5: Implement the Missing Analytics Cards

Description: Create and add the 7-Day Trend and Weekly Patterns cards to the right column of the CalendarPage.

Implementation Steps:

A) SevenDayTrend Card:

Header: Title "7-Day Trend" and a green trend indicator (e.g., "+33.3%") with an <ArrowUpRight /> icon.

Body: A list of horizontal bar charts, one for each of the last 7 days (Sun-Sat), showing completion percentage.

Footer: Summary stats: "Avg Rate," "Best Day," "Total."

B) WeeklyPatterns Card:

Header: Title "Weekly Patterns."

Body: A list of horizontal bar charts for each day of the week, showing the all-time average completion rate for that day.

Highlighting: The bar for the day with the highest average ("BEST") should be filled with bg-accent.

Footer: Include the "Weekends vs Weekdays" summary cards and the "Best Day / Needs Work" cards with their respective green and red backgrounds.

Directive 6: Visually Enhance the HabitCalendar Component

Description: Upgrade the current basic calendar to match the more informative and visually appealing design from the PDF.

Implementation Steps:

Date Cell Styling:

Change the date cells from simple text numbers to padded, rounded squares (rounded-md).

Give all cells a subtle background color, e.g., bg-surface (#1A1A1A).

Dynamic Highlighting:

Selected Day: The currently clicked/selected day should have a solid bg-success background.

Days with 100% Completion: Days with a perfect score should have a prominent, solid border in the accent color: border-2 border-accent.

Days with Partial Completion: Days with > 0% but < 100% completion should have a more subtle, dashed border: border border-dashed border-secondary.

Footer and Legend:

Below the calendar grid, add a footer.

Legend: Implement the "Less ... More" color scale legend. This should be a series of small squares going from a dark gray to a bright green, indicating the color intensity of completed days.

Instructional Text: Add the text "Click dates to view details" to guide the user.

