"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/store";
import { getRoleColor, getRoleIcon } from "@/utils";
import { motion } from "framer-motion";
import {
  Clock,
  Flame,
  Heart,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import { Dosis } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ExportButton } from "./ExportButton";
import { ThemeToggle } from "./ThemeToggle";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

// Navigation items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListChecks,
  },
  {
    title: "Timesheet",
    url: "/timesheet",
    icon: Clock,
  },
  {
    title: "Goals & Streaks",
    url: "/goals",
    icon: Flame,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { currentWorkspace } = useWorkspaceStore();
  const pathname = usePathname();

  return (
    <div className={dosis.variable}>
      <Sidebar className="border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <SidebarHeader className="border-b border-gray-200/50 dark:border-gray-700/50 px-5 py-4 space-y-4">
          {/* App Branding */}

          <div className="flex items-center gap-3">
            <img
              src="/takulogo.png"
              alt="Taku Logo"
              className="w-8 h-8 object-contain rounded-sm shadow-sm"
            />
            <div className="relative">
              <h1 className="font-dosis text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-wide">
                Taku
              </h1>
              {/* <span className="absolute -top-1 -right-3 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 shadow-md" /> */}
            </div>
          </div>

          {/* Workspace Switcher */}
          {currentWorkspace && <WorkspaceSwitcher />}

          <Separator className="!my-3 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

          {/* Enhanced Workspace Info */}
          {currentWorkspace && (
            <motion.div
              className="space-y-3 p-3 rounded-xl bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 border border-gray-200/50 dark:border-gray-700/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-sm" />
                  <p className="font-dosis text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {currentWorkspace.name}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        className={`text-xs px-2 py-1 font-medium ${getRoleColor(
                          currentWorkspace.role
                        )} shadow-sm`}
                      >
                        <div className="flex items-center gap-1">
                          {React.createElement(
                            getRoleIcon(currentWorkspace.role),
                            { className: "w-3 h-3" }
                          )}
                          {currentWorkspace.role}
                        </div>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your role in this workspace</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Users className="w-3 h-3" />
                <span className="font-dosis">
                  by {currentWorkspace.ownerName}
                </span>
              </div>
            </motion.div>
          )}
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className="font-dosis text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`
                          font-dosis relative group transition-all duration-200 rounded-lg
                          ${
                            isActive
                              ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                          }
                        `}
                      >
                        <Link href={item.url}>
                          <div className="flex items-center gap-3 w-full">
                            <item.icon
                              className={`
                              w-4 h-4 transition-colors duration-200
                              ${
                                isActive
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                              }
                            `}
                            />
                            <span className="font-dosis text-sm font-medium">
                              {item.title}
                            </span>
                          </div>

                          {/* Active indicator with smooth transition */}
                          {isActive && (
                            <motion.div
                              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full"
                              layoutId="activeIndicator"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
          <motion.div
            className="space-y-3"
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {/* Export/Backup Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ExportButton
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 h-auto py-2"
              >
                Export Workspace
              </ExportButton>
            </motion.div>

            {/* Version & Love */}
            <div className="flex items-center justify-center gap-1 text-xs font-dosis text-gray-500 dark:text-gray-400">
              <span>v1.0.0</span>
              <span>—</span>
              <span>Made with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart className="w-3 h-3 text-red-500 fill-current" />
              </motion.div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                Theme
              </span>
              <ThemeToggle />
            </div>
          </motion.div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
