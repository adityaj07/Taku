"use client";

import { useWorkspaceStore } from "@/store";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { currentWorkspace } = useWorkspaceStore();

  // Sync workspace theme with next-themes
  React.useEffect(() => {
    if (currentWorkspace?.theme) {
      // This will be handled by next-themes
    }
  }, [currentWorkspace?.theme]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={currentWorkspace?.theme || "system"}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
