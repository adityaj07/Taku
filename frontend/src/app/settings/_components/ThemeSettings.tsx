"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceStore } from "@/store";
import { Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSettings() {
  const { currentWorkspace, setTheme: setWorkspaceTheme } = useWorkspaceStore();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = async (newTheme: "system" | "light" | "dark") => {
    setTheme(newTheme);
    if (currentWorkspace) {
      await setWorkspaceTheme(newTheme);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-dosis text-sm font-medium">Theme</Label>
      <Select value={theme} onValueChange={handleThemeChange}>
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
              <Sun className="w-4 h-4" />
              Light
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Dark
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
