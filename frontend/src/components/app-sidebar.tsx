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
import { motion } from "framer-motion";
import {
  Clock,
  Flame,
  Heart,
  LayoutDashboard,
  ListChecks,
  Settings,
  Upload,
} from "lucide-react";
import { Dosis } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

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
        <SidebarHeader className="border-b border-gray-200/50 dark:border-gray-700/50 p-4">
          {/* App Branding */}
          <motion.div
            className="flex items-center gap-2 mb-3"
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <h1 className="font-dosis text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Taku
              </h1>
              <motion.div className="absolute -top-1 -right-3 w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" />
            </div>
          </motion.div>

          {/* Workspace Context */}
          {currentWorkspace && (
            <motion.div
              className="space-y-1"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="font-dosis text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {currentWorkspace.name}
              </p>
              <p className="font-dosis text-xs text-gray-500 dark:text-gray-400">
                {currentWorkspace.ownerName} • {currentWorkspace.role}
              </p>
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
                          {/* Remove animations from navigation items */}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {/* Export/Backup Button */}
            <motion.button
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-dosis font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform duration-200" />
              Export Workspace
            </motion.button>

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
