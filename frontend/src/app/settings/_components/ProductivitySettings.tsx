"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useWorkspaceStore } from "@/store";
import { Edit3, Save, Target, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ProductivitySettings() {
  const { currentWorkspace, updateWorkspaceSettings } = useWorkspaceStore();
  const [editingGoals, setEditingGoals] = useState(false);
  const [weeklyGoalsInput, setWeeklyGoalsInput] = useState("");

  useEffect(() => {
    if (currentWorkspace) {
      setWeeklyGoalsInput(currentWorkspace.weeklyGoals.toString());
    }
  }, [currentWorkspace]);

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

  if (!currentWorkspace) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-purple-500" />
          <CardTitle className="font-dosis">Goals & Productivity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-dosis font-medium">Weekly Goals</Label>
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
                    onChange={(e) => setWeeklyGoalsInput(e.target.value)}
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

            {/* <div className="flex items-center justify-between">
              <div>
                <Label className="font-dosis font-medium">Mascot</Label>
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
            </div> */}

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-dosis font-medium">Compact Mode</Label>
                <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                  Use compact layout for better screen space usage
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
                <Label className="font-dosis font-medium">Auto Backup</Label>
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
  );
}
