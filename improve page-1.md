Objective: Upgrade the current application UI  using the established "Cyber Noir" design system.
Analysis of Missing Features:
Application Header: The simple left-aligned title is missing the intended branding and motivational messaging.
Summary Card Icons: The four main summary cards lack visual icons, making them less scannable and engaging.
Core Layout Structure: The current single-column layout is incorrect. The target design uses a sophisticated two-column dashboard layout.
Left Sidebar Modules: The entire left sidebar, which includes navigation, quick daily actions, and a motivational card, is completely absent.
Main Content Modules: The main content area is empty. The critical "My Habits" list, which is the primary interface for managing and viewing habits, is missing.
Directive 1: Implement the Main Application Header
Description: The current header is minimal. Implement a centered, multi-line header to establish a strong brand identity and set a motivational tone.
Implementation Steps:
Create a header container at the top of the main application body.
Main Title:
Text: "Minimal Habit Tracker"
Styling: text-4xl, font-bold, text-primary (#E5E5E5), text-center.
Subtitle:
Text: "Build consistency, one day at a time"
Styling: text-lg, text-secondary (#A0A0A0), text-center, mt-2.
Motivational Quote:
Text: "The compound effect of small habits creates extraordinary results."
Styling: text-md, text-secondary, italic, text-center, mt-1.
Directive 2: Enhance the Global Summary Cards
Description: The four summary cards at the top are functionally present but visually barren. They are missing icons that provide quick visual context for each metric.
Implementation Steps:
For each of the four summary cards (Active Habits, Completed Today, Completion Rate, Perfect Days), add an icon element.
Visual Structure:
The icon should be placed inside a colored, circular container.
This container should be positioned in the top-left corner of the card, slightly overlapping the card's padding for a modern look. Use absolute positioning relative to the card.
Container Styling: w-10 h-10, rounded-full, flex, items-center, justify-center.
Icon Styling: The icon itself should be size-5, with a stroke of white.
Specific Icons and Colors (from lucide-react library):
Active Habits:
Icon: <Activity />
Container Background: A muted blue, e.g., bg-blue-500/80.
Completed Today:
Icon: <CheckCircle2 />
Container Background: The success color, bg-success/80 (#2EBD59).
Completion Rate:
Icon: <TrendingUp />
Container Background: The accent color, bg-accent/80 (#3A7DFF).
Perfect Days:
Icon: <Award />
Container Background: The warning color, bg-warning/80 (#F59E0B).
Directive 3: Re-architect to a Two-Column Dashboard Layout
Description: This is the most critical structural change. The screenshot's single-column layout must be replaced with the PDF's two-column grid. This creates a clear separation between daily actions/navigation and main content/overview.
Implementation Steps:
Wrap the main content area of the dashboard in a CSS Grid container.
Grid Definition:
display: grid
grid-template-columns: repeat(1, 1fr) for mobile screens.
md:grid-template-columns: repeat(3, 1fr) for medium screens and up.
gap-6 for spacing between columns.
Column Allocation:
Left Column (Sidebar): This container will span one of the three grid columns (md:col-span-1). It will hold the Navigation, Quick Actions, and Consistency modules.
Right Column (Main Content): This container will span the remaining two grid columns (md:col-span-2). It will hold the My Habits, Habit Contribution Chart, and Settings modules.
Directive 4: Implement the Left Sidebar Modules
Description: The empty space on the left needs to be populated with three distinct, functional modules as seen in the PDF.
Implementation Steps:
A) Navigation Module:
Create a card with bg-surface (#1A1A1A).
Add a title "Navigation."
Create a list of navigation links: "Overview," "Calendar," "Analytics."
Styling: Each link should be a button-like element.
Default State: Transparent background, text-secondary (#A0A0A0).
Active State: The currently viewed page's link should have a solid bg-accent (#3A7DFF) background and text-primary (#E5E5E5) text.
B) Quick Actions Module ("Today's Progress"):
Create a card titled "Quick Actions."
Below the title, display the progress text (e.g., "4/4") and percentage ("100%").
Include a thin progress bar that animates its width based on the completion percentage. Use bg-success for the fill.
Create a list of habits. Each list item should contain:
The habit name (e.g., "Data analytics").
A toggle switch on the right.
Toggle Switch Visuals: Design a custom toggle. It should be a rounded rectangle (bg-border). When toggled on, the background becomes bg-success, and a white circle inside slides to the right.
C) Consistency "Gamification" Card:
Create a smaller card at the bottom of the left column.
Place a large star icon (<Star /> from Lucide) in the center. Style it with a blue-to-purple gradient to make it stand out.
Add the title: "Outstanding consistency!"
Add the subtitle: "Consistency creates lasting change."
Directive 5: Implement the Main Content Modules
Description: The right-hand side of the dashboard is currently blank except for the contribution chart. It needs the primary "My Habits" list, which is the core of the application's habit management.
Implementation Steps:
A) "My Habits" List Module:
Create a large card that will contain the entire list.
Header: The card header should be a flex container with the title "My Habits" on the left and a styled "+ Add Habit" button on the right. The button should have bg-accent and text-primary.
Habit Cards: For each habit, render a dedicated card within this main list. Each of these sub-cards should contain:
Left Side: A small icon representing the habit, followed by the Habit Name (e.g., "Data analytics") and a small tag indicating the current streak (e.g., "1 day").
Middle Section: A label "Today's Progress."
Right Side: A group of action items:
A "Completed" button.
Default State: bg-surface, border-success, text-success.
Completed State: bg-success, text-primary, with a <Check /> icon.
Subtle edit (<Pencil />) and delete (<Trash2 />) icons next to the button, visible on hover. They should use text-secondary.
