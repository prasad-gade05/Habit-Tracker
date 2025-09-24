# Minimal Habit Tracker

A privacy-first, client-side habit tracking application built with modern web technologies. All data is stored locally in your browser using IndexedDB.

**[Live Demo](https://prasad-gade05.github.io/Habit-Tracker/)**

## Features

- **Privacy First**: All your data is stored locally in your browser. Nothing is ever sent to a server.
- **Minimal & Clean Design**: A distraction-free interface that helps you focus on building your habits.
- **Habit Management**:
  - Create, edit, and delete habits.
  - Assign custom colors to habits for better organization.
  - Set habits for specific days of the week.
- **Daily Tracking**:
  - Mark habits as complete for each day.
  - A dedicated dashboard to see and manage your habits for the current day.
- **Data Visualization & Analytics**:
  - A GitHub-style contribution chart to visualize your consistency.
  - Detailed analytics to track your completion rates, streaks, and performance.
  - A calendar view to see your habit history at a glance.
- **Data Management**:
  - Export your data in JSON format.
  - Import your data from a JSON file.
  - Delete all your data with a single click.
- **Dark & Light Theme**: Switch between dark and light themes to match your preference.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Local Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Routing**: [React Router](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Date & Time**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/prasad-gade05/Habit-Tracker.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd Habit-Tracker
    ```

3.  **Install the dependencies:**

    ```bash
    pnpm install
    ```

### Running the Development Server

To start the development server, run the following command:

```bash
pnpm dev
```

This will start the application in development mode and open it in your default browser at `http://localhost:5173`.

### Building for Production

To build the application for production, run the following command:

```bash
pnpm build
```

This will create a `dist` folder with the optimized production build.

## Deployment

This project is deployed to GitHub Pages. The `deploy` script in `package.json` handles the deployment process. To deploy the application, run the following command:

```bash
pnpm deploy
```

This will build the application and deploy the `dist` folder to the `gh-pages` branch of your repository.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries and database setup (db.ts)
├── pages/          # Page components for different routes
├── stores/         # Zustand store for global state management
├── utils/          # Utility functions
└── styles/         # Global styles
```

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
