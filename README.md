# Minimal Habit Tracker

A privacy-first, client-side habit tracking application built with modern web technologies. All data is stored locally in your browser using IndexedDB.

## Features

- **Privacy First**: All data is stored locally in your browser, never sent to any server
- **Minimal Design**: Clean, distraction-free interface focused on building habits
- **Habit Tracking**: Create, edit, and delete habits with optional descriptions
- **Daily Progress**: Mark habits as completed each day with visual feedback
- **Habit Consistency**: Visualize your consistency with a GitHub-style contribution chart
- **Analytics & Insights**: Gain insights into your habit performance with detailed analytics
- **Calendar View**: View and edit your habit history on a calendar
- **Data Management**: Export, import, and clear your data with full control

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Zustand
- **Database**: IndexedDB with Dexie.js
- **UI Components**: shadcn/ui, Tailwind CSS
- **Date Handling**: date-fns
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version compatible with pnpm 8.10.0)
- pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd minimal-habit-tracker
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Build for production:
   ```bash
   pnpm build
   ```

6. Preview the production build:
   ```bash
   pnpm preview
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries and database setup
├── pages/          # Page components
├── stores/         # Zustand stores for state management
├── utils/          # Utility functions
└── styles/         # Global styles
```

## Features Implementation

### Dashboard
- Global summary header with key metrics
- Quick actions module for daily habit tracking
- Contribution chart for habit consistency visualization

### Analytics
- Performance breakdown with completion rates
- Streak analytics showing current and longest streaks
- Pattern recognition with insights

### Calendar
- Interactive calendar view
- Date-specific habit editing

### Settings
- Theme switching (light/dark mode)
- Data export and import
- Data clearing with confirmation

## Data Model

### Habit
- `id`: Unique identifier
- `name`: Habit name
- `description`: Optional habit description
- `createdAt`: Creation timestamp

### Completion
- `id`: Unique identifier
- `habitId`: Reference to habit
- `date`: Date of completion (YYYY-MM-DD)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Dexie.js](https://dexie.org/) for the IndexedDB wrapper
- [date-fns](https://date-fns.org/) for date manipulation