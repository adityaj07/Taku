"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/store";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Palette,
  Save,
  Settings,
  Target,
  Upload,
  User,
  X,
} from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function SettingsPage() {
  const router = useRouter();
  const {
    currentWorkspace,
    isLoading,
    isHydrated,
    updateWorkspaceSettings,
    setTheme,
    createWorkspace,
  } = useWorkspaceStore();

  // State for form management
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    role: "" as "Student" | "Developer" | "Designer" | "Other",
  });
  const [weeklyGoalsInput, setWeeklyGoalsInput] = useState("");
  const [editingGoals, setEditingGoals] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    taskReminders: true,
    goalProgress: true,
    weeklyReports: false,
    deadlineAlerts: true,
    timerNotifications: true,
  });

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  useEffect(() => {
    if (currentWorkspace) {
      setProfileForm({
        name: currentWorkspace.ownerName,
        role: currentWorkspace.role,
      });
      setWeeklyGoalsInput(currentWorkspace.weeklyGoals.toString());

      // Load last exported timestamp from localStorage
      const lastExport = localStorage.getItem(
        `taku-last-export-${currentWorkspace.id}`
      );
      setLastExported(lastExport);
    }
  }, [currentWorkspace]);

  const handleProfileSave = async () => {
    if (!currentWorkspace || !profileForm.name.trim()) return;

    try {
      // Update workspace with new profile data
      await updateWorkspaceSettings({});

      // Since we can't directly update the workspace name and owner through updateWorkspaceSettings,
      // we would need to add these methods to the store. For now, we'll just close the edit mode.
      setEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleGoalsSave = async () => {
    const newGoals = parseInt(weeklyGoalsInput);
    if (!isNaN(newGoals) && newGoals > 0) {
      await updateWorkspaceSettings({ weeklyGoals: newGoals });
      setEditingGoals(false);
    }
  };

  const handleSettingToggle = async (
    setting: keyof NonNullable<typeof currentWorkspace>["settings"],
    value: boolean
  ) => {
    if (!currentWorkspace) return;
    await updateWorkspaceSettings({ [setting]: value });
  };

  const handleThemeChange = async (theme: "system" | "light" | "dark") => {
    await setTheme(theme);
  };

  const handleExportWorkspace = () => {
    if (!currentWorkspace) return;

    const exportData = {
      workspace: currentWorkspace,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taku-workspace-${currentWorkspace.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save export timestamp
    const timestamp = new Date().toISOString();
    localStorage.setItem(`taku-last-export-${currentWorkspace.id}`, timestamp);
    setLastExported(timestamp);
  };

  const handleImportWorkspace = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setImportFile(file);
      setShowImportDialog(true);
    }
  };

  const processImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const importData = JSON.parse(text);

      if (importMode === "overwrite") {
        // Create new workspace from imported data
        const workspaceData = importData.workspace;
        await createWorkspace({
          name: `${workspaceData.name} (Imported)`,
          ownerName: workspaceData.ownerName,
          role: workspaceData.role,
          columns: workspaceData.columns,
          weeklyGoals: workspaceData.weeklyGoals,
          theme: workspaceData.theme,
          settings: workspaceData.settings,
        });
      } else {
        // Merge with current workspace (you'd implement specific merge logic here)
        console.log("Merge import not fully implemented yet");
      }

      setShowImportDialog(false);
      setImportFile(null);
    } catch (error) {
      console.error("Failed to import workspace:", error);
    }
  };

  if (!isHydrated || isLoading || !currentWorkspace) {
    return (
      <div
        className={`${dosis.variable} min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="font-dosis text-gray-600 dark:text-gray-300">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={`${dosis.variable} h-screen flex bg-gray-50 dark:bg-gray-900`}
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            {/* Header */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/dashboard"
                      className="font-dosis text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      {currentWorkspace.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-dosis text-sm font-medium text-gray-900 dark:text-gray-100">
                      Settings
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Page Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h1 className="font-dosis text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Settings
                      </h1>
                      <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                        Customize your Taku experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
                <motion.div
                  className="max-w-4xl mx-auto space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* User & Workspace Settings */}
                  <motion.div variants={cardVariants}>
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-500" />
                          <CardTitle className="font-dosis">
                            User & Workspace
                          </CardTitle>
                        </div>
                        {!editingProfile ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProfile(true)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleProfileSave}
                              className="h-8 w-8 p-0 text-green-600"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingProfile(false)}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-dosis text-sm font-medium">
                              Display Name
                            </Label>
                            {editingProfile ? (
                              <Input
                                value={profileForm.name}
                                onChange={(e) =>
                                  setProfileForm((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                className="font-dosis"
                              />
                            ) : (
                              <p className="font-dosis p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                {currentWorkspace.ownerName}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="font-dosis text-sm font-medium">
                              Role
                            </Label>
                            {editingProfile ? (
                              <Select
                                value={profileForm.role}
                                onValueChange={(value: any) =>
                                  setProfileForm((prev) => ({
                                    ...prev,
                                    role: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="font-dosis">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Student">
                                    Student
                                  </SelectItem>
                                  <SelectItem value="Developer">
                                    Developer
                                  </SelectItem>
                                  <SelectItem value="Designer">
                                    Designer
                                  </SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="font-dosis p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                {currentWorkspace.role}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-dosis text-sm font-medium">
                            Workspace Name
                          </Label>
                          <p className="font-dosis p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            {currentWorkspace.name}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-dosis text-sm font-medium">
                            Theme
                          </Label>
                          <Select
                            value={currentWorkspace.theme}
                            onValueChange={handleThemeChange}
                          >
                            <SelectTrigger className="font-dosis w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="system">
                                <div className="flex items-center gap-2">
                                  <Palette className="w-4 h-4" />
                                  System
                                </div>
                              </SelectItem>
                              <SelectItem value="light">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Light
                                </div>
                              </SelectItem>
                              <SelectItem value="dark">
                                <div className="flex items-center gap-2">
                                  <EyeOff className="w-4 h-4" />
                                  Dark
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Backup & Restore */}
                  <motion.div variants={cardVariants}>
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-green-500" />
                          <CardTitle className="font-dosis">
                            Backup & Restore
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Export Workspace
                              </h4>
                              <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Download your workspace data as a JSON file for
                                backup or transfer.
                              </p>
                              <Button
                                onClick={handleExportWorkspace}
                                className="font-dosis bg-green-500 hover:bg-green-600 w-full"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Export Workspace
                              </Button>
                            </div>
                            {lastExported && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-dosis">
                                Last exported:{" "}
                                {new Date(lastExported).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-dosis font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Import Workspace
                              </h4>
                              <p className="font-dosis text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Upload a JSON file to restore or merge workspace
                                data.
                              </p>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={handleImportWorkspace}
                                    variant="outline"
                                    className="font-dosis w-full"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Workspace
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    <span>
                                      Importing may overwrite existing data
                                    </span>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Goals & Productivity Settings */}
                  <motion.div variants={cardVariants}>
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-purple-500" />
                          <CardTitle className="font-dosis">
                            Goals & Productivity
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="font-dosis font-medium">
                                Weekly Goals
                              </Label>
                              <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                                Set your target hours per week
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {editingGoals ? (
                                <>
                                  <Input
                                    type="number"
                                    value={weeklyGoalsInput}
                                    onChange={(e) =>
                                      setWeeklyGoalsInput(e.target.value)
                                    }
                                    className="w-20 font-dosis"
                                    min="1"
                                    max="168"
                                  />
                                  <span className="font-dosis text-sm text-gray-600">
                                    hours
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGoalsSave}
                                    className="h-8 w-8 p-0 text-green-600"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingGoals(false);
                                      setWeeklyGoalsInput(
                                        currentWorkspace.weeklyGoals.toString()
                                      );
                                    }}
                                    className="h-8 w-8 p-0 text-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className="font-dosis font-semibold">
                                    {currentWorkspace.weeklyGoals} hours
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingGoals(true)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h4 className="font-dosis font-semibold text-gray-900 dark:text-gray-100">
                              Display Settings
                            </h4>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="font-dosis font-medium">
                                  Activity Heatmap
                                </Label>
                                <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                                  Show activity heatmap on goals page
                                </p>
                              </div>
                              <Switch
                                checked={currentWorkspace.settings.heatmap}
                                onCheckedChange={(checked) =>
                                  handleSettingToggle("heatmap", checked)
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="font-dosis font-medium">
                                  Mascot
                                </Label>
                                <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                                  Show mascot illustrations
                                </p>
                              </div>
                              <Switch
                                checked={currentWorkspace.settings.mascot}
                                onCheckedChange={(checked) =>
                                  handleSettingToggle("mascot", checked)
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="font-dosis font-medium">
                                  Compact Mode
                                </Label>
                                <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                                  Use compact layout for better screen space
                                  usage
                                </p>
                              </div>
                              <Switch
                                checked={currentWorkspace.settings.compactMode}
                                onCheckedChange={(checked) =>
                                  handleSettingToggle("compactMode", checked)
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="font-dosis font-medium">
                                  Auto Backup
                                </Label>
                                <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                                  Automatically backup workspace data
                                </p>
                              </div>
                              <Switch
                                checked={currentWorkspace.settings.autoBackup}
                                onCheckedChange={(checked) =>
                                  handleSettingToggle("autoBackup", checked)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Notification Settings */}
                  <motion.div variants={cardVariants}>
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-orange-500" />
                          <CardTitle className="font-dosis">
                            Notifications
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-dosis font-medium">
                              Task Reminders
                            </Label>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Get reminded about overdue tasks
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.taskReminders}
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                taskReminders: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-dosis font-medium">
                              Goal Progress
                            </Label>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Notifications about weekly and monthly goal
                              progress
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.goalProgress}
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                goalProgress: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-dosis font-medium">
                              Weekly Reports
                            </Label>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Receive weekly productivity summaries
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.weeklyReports}
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                weeklyReports: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-dosis font-medium">
                              Deadline Alerts
                            </Label>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Alerts for upcoming task deadlines
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.deadlineAlerts}
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                deadlineAlerts: checked,
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-dosis font-medium">
                              Timer Notifications
                            </Label>
                            <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                              Notifications when timers start/stop
                            </p>
                          </div>
                          <Switch
                            checked={notificationSettings.timerNotifications}
                            onCheckedChange={(checked) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                timerNotifications: checked,
                              }))
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Import Dialog */}
        <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-dosis flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Import Workspace
              </AlertDialogTitle>
              <AlertDialogDescription className="font-dosis space-y-3">
                <p>
                  You're about to import workspace data from{" "}
                  <strong>{importFile?.name}</strong>.
                </p>
                <div className="space-y-2">
                  <Label className="font-dosis font-medium">Import Mode:</Label>
                  <Select
                    value={importMode}
                    onValueChange={(value: "merge" | "overwrite") =>
                      setImportMode(value)
                    }
                  >
                    <SelectTrigger className="font-dosis">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merge">
                        <div>
                          <div className="font-medium">Merge</div>
                          <div className="text-xs text-gray-500">
                            Add imported data to current workspace
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="overwrite">
                        <div>
                          <div className="font-medium">Overwrite</div>
                          <div className="text-xs text-gray-500">
                            Replace current workspace entirely
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {importMode === "overwrite" && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-orange-800 dark:text-orange-200 text-sm font-dosis">
                      <strong>Warning:</strong> This will permanently replace
                      your current workspace data. Consider exporting your
                      current workspace first.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-dosis">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={processImport}
                className="font-dosis bg-orange-500 hover:bg-orange-600"
              >
                Import
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
