import React from "react";
import { ThemeProvider } from "./components/theme-provider";
import SinglePageApp from "./SinglePageApp";

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <SinglePageApp />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
