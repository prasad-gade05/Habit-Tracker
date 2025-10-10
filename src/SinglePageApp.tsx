import React, { useEffect, useState } from "react";
import { useHabitStore } from "./stores/habitStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Settings,
} from "lucide-react";

// Import all the page components
import GlobalSummaryHeader from "./components/GlobalSummaryHeader";
import TodaysHabits from "./components/TodaysHabits";
import ContributionChart from "./components/ContributionChart";
import MyHabitsModule from "./components/MyHabitsModule";
import HabitMomentum from "./components/HabitMomentum";

// Analytics components
import PerformanceBreakdown from "./components/PerformanceBreakdown";
import StreakAnalytics from "./components/StreakAnalytics";
import PatternRecognition from "./components/PatternRecognition";
import CompletionRatesVisual from "./components/CompletionRatesVisual";
import DeletedHabitsManager from "./components/DeletedHabitsManager";
import SimpleHabitCorrelations from "./components/SimpleHabitCorrelations";

// Calendar components
import CalendarView from "./components/CalendarView";
import SevenDayTrend from "./components/SevenDayTrend";
import WeeklyPatterns from "./components/WeeklyPatterns";
import MonthlyCompletionHeatmap from "./components/MonthlyCompletionHeatmap";
import HabitStreakVisualization from "./components/HabitStreakVisualization";

// Settings components
import HabitManager from "./components/HabitManager";
import { db, resetDatabase } from "./lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download,
  Upload,
  Trash2,
  Palette,
  Moon,
  Sun,
  RotateCcw,
} from "lucide-react";
import { useTheme } from "./components/theme-provider";

const SinglePageApp: React.FC = () => {
  const { fetchAllData, loading, habits, completions } = useHabitStore();
  const { theme, setTheme } = useTheme();
  
  // Analytics state
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const [chartMode, setChartMode] = useState<"top" | "specific">("top");
  const [numHabitsToShow, setNumHabitsToShow] = useState<number>(5);
  
  // Settings state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Analytics filter handler
  const handleFilterChange = (
    mode: "top" | "specific",
    habitId: string,
    numHabits: number
  ) => {
    setChartMode(mode);
    setSelectedHabitId(habitId);
    setNumHabitsToShow(numHabits);
  };

  // Settings handlers
  const handleExport = async () => {
    try {
      const data = await db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habit-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await db.importData(data);
        fetchAllData();
      } catch (error) {
        console.error("Import failed:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmation !== "DELETE ALL DATA") return;
    
    try {
      await resetDatabase();
      setDeleteConfirmation("");
      fetchAllData();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your habits...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Application Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Habit Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build consistency, one day at a time
        </p>
      </div>

      <GlobalSummaryHeader />

      {/* Single Page Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left column - Calendar and Momentum */}
            <div className="md:col-span-1 space-y-5">
              <CalendarView initialDate={new Date()} />
              <HabitMomentum />
            </div>

            {/* Right column (main content) */}
            <div className="md:col-span-2 space-y-5">
              <MyHabitsModule />
              <ContributionChart />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Calendar insights moved from calendar tab */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SevenDayTrend />
              <WeeklyPatterns />
              <MonthlyCompletionHeatmap />
            </div>

            {/* Performance and Streak Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceBreakdown 
                selectedHabitId={selectedHabitId}
                chartMode={chartMode}
                numHabitsToShow={numHabitsToShow}
                onFilterChange={handleFilterChange}
              />
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-lg font-medium mb-2">Streak Overview</h3>
                  <StreakAnalytics />
                </div>
                <HabitStreakVisualization />
              </div>
            </div>

            {/* Pattern Recognition */}
            <PatternRecognition />

            {/* Completion Rates and Simple Correlations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompletionRatesVisual />
              <SimpleHabitCorrelations />
            </div>
            
            {/* Deleted Habits Management */}
            <DeletedHabitsManager />
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Habit Management */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Habit Management</h2>
                <HabitManager />
              </div>
            </div>

            {/* Settings and Data Management */}
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Settings
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>

              {/* Data Export/Import */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Export your data for backup or transfer
                    </p>
                    <Button
                      onClick={handleExport}
                      className="flex items-center gap-2 w-full justify-start"
                      variant="outline"
                    >
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Import data from a backup file
                    </p>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 w-full justify-start"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Import Data
                      </Button>
                      <input
                        id="file-input"
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Total habits: {habits.length} | Total completions: {completions.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-destructive/10 rounded-lg p-6 border border-destructive/20">
                <h3 className="text-lg font-medium mb-4 text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all your habits and data. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your habits,
                        completions, and data from the database.
                        <br />
                        <br />
                        To confirm, type "DELETE ALL DATA" below:
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE ALL DATA"
                      className="mt-2"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAll}
                        disabled={deleteConfirmation !== "DELETE ALL DATA"}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SinglePageApp;