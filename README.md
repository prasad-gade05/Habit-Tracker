# Habit Tracker - [Demo](https://prasad-gade05.github.io/Habit-Tracker/)

A privacy-first, client-side habit tracking application built with modern web technologies. All data is stored locally in your browser using IndexedDB.

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

### Available Scripts

- **Run the development server:**
  ```bash
  pnpm dev
  ```
- **Build the application for production:**
  ```bash
  pnpm build
  ```
- **Deploy to GitHub Pages:**
  ```bash
  pnpm deploy
  ```
