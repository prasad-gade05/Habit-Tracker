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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your data and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Appearance
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Theme</h3>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <Button onClick={toggleTheme} variant="outline" size="sm">
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Data Management
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download a backup of your habits and completion history
                </p>
              </div>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Import Data</h3>
                <p className="text-sm text-muted-foreground">
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
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border lg:col-span-2">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Danger Zone
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Reset Database</h3>
                <p className="text-sm text-muted-foreground">
                  Completely reset the database to fix potential issues
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
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
                <h3 className="font-medium text-foreground">Clear All Data</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all habits and completion history
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
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
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      To confirm, type "DELETE" in the box below:
                    </p>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE"
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

      <div className="mt-8">
        <HabitManager />
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {habits.length}
            </div>
            <div className="text-muted-foreground">Total Habits</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {completions.length}
            </div>
            <div className="text-muted-foreground">Total Completions</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {habits.length > 0
                ? Math.round((completions.length / habits.length) * 100)
                : 0}
              %
            </div>
            <div className="text-muted-foreground">Overall Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
