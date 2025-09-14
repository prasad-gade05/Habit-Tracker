import React, { useState } from "react";
import { useHabitStore } from "../stores/habitStore";
import { db, resetDatabase } from "../lib/db";
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
import { useTheme } from "../components/theme-provider";
import HabitManager from "../components/HabitManager";
import NavigationModule from "../components/NavigationModule";
import QuickActionsModule from "../components/QuickActionsModule";

const SettingsPage: React.FC = () => {
  const { habits, completions } = useHabitStore();
  const { theme, setTheme } = useTheme();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Export data
  const handleExport = async () => {
    try {
      const data = await db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "habit-tracker-backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Import data
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await db.importData(data);
      window.location.reload();
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  // Clear all data
  const handleClearAllData = async () => {
    if (deleteConfirmation !== "DELETE") return;

    try {
      await db.deleteAllData();
      window.location.reload();
    } catch (error) {
      console.error("Clear data failed:", error);
    }
  };

  // Reset database
  const handleResetDatabase = async () => {
    try {
      await resetDatabase();
      window.location.reload();
    } catch (error) {
      console.error("Reset database failed:", error);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Improved Application Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Minimal Habit Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">Build consistency, one day at a time</p>
      </div>
      
      {/* Minimal Navigation at the top */}
      <div className="mb-6">
        <NavigationModule />
      </div>
      
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your data and preferences
        </p>
      </div>
      
      {/* Quick Actions Module */}
      <div className="mb-5">
        <QuickActionsModule />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Appearance
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground text-sm">Theme</h3>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <Button onClick={toggleTheme} variant="outline" size="sm" className="h-8 px-3 text-xs">
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3 h-3 mr-1" />
                    Light
                  </>
                ) : (
                  <>
                    <Moon className="w-3 h-3 mr-1" />
                    Dark
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Data Management
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground text-sm">Export Data</h3>
                <p className="text-xs text-muted-foreground">
                  Download a backup of your habits and completion history
                </p>
              </div>
              <Button onClick={handleExport} variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground text-sm">Import Data</h3>
                <p className="text-xs text-muted-foreground">
                  Restore your habits from a backup file
                </p>
              </div>
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-3 h-3 mr-1" />
                    Import
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Danger Zone
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground text-sm">Reset Database</h3>
                <p className="text-xs text-muted-foreground">
                  Completely reset the database to fix potential issues
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-8 px-3 text-xs">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset Database
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Database?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will completely reset your database schema and fix
                      any potential issues with primary keys or version
                      conflicts. All your data will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetDatabase}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Reset Database
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground text-sm">Clear All Data</h3>
                <p className="text-xs text-muted-foreground">
                  Permanently delete all habits and completion history
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-8 px-3 text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your habits and completion history from your device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      To confirm, type "DELETE" in the box below:
                    </p>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE"
                      className="text-xs"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllData}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={deleteConfirmation !== "DELETE"}
                    >
                      Clear All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <HabitManager />
      </div>

      <div className="mt-5 bg-card rounded-xl p-5 shadow-sm border border-border transition-all duration-300 hover:shadow-md">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-xl font-bold text-foreground">
              {habits.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Habits</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-xl font-bold text-foreground">
              {completions.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Completions</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-xl font-bold text-foreground">
              {habits.length > 0
                ? Math.round((completions.length / habits.length) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-muted-foreground">Overall Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;