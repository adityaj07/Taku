"use client";

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
import { useWorkspaceStore } from "@/store";
import { Edit3, Save, User, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfileFormData {
  name: string;
  role: "Student" | "Developer" | "Designer" | "Other";
}

export function ProfileSettings() {
  const { currentWorkspace, updateWorkspaceSettings } = useWorkspaceStore();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    role: "Other",
  });

  useEffect(() => {
    if (currentWorkspace) {
      setProfileForm({
        name: currentWorkspace.ownerName,
        role: currentWorkspace.role,
      });
    }
  }, [currentWorkspace]);

  const handleProfileSave = async () => {
    if (!currentWorkspace || !profileForm.name.trim()) return;

    try {
      // Note: This would need to be extended in the store to update name and role
      await updateWorkspaceSettings({});
      setEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!currentWorkspace) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-blue-500" />
          <CardTitle className="font-dosis">User & Workspace</CardTitle>
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
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
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
            <Label className="font-dosis text-sm font-medium">Role</Label>
            {editingProfile ? (
              <Select
                value={profileForm.role}
                onValueChange={(
                  value: "Student" | "Developer" | "Designer" | "Other"
                ) => setProfileForm((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="font-dosis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
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
      </CardContent>
    </Card>
  );
}
