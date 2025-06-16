"use client";

import { AppSidebar } from "@/components/app-sidebar";
import HeaderBreadcrumb from "@/components/HeaderBreadcrumb";
import Loading from "@/components/Loading";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/store";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Import the new components
import { BackupSettings } from "./_components/BackupSettings";
import { ProductivitySettings } from "./_components/ProductivitySettings";
import { ProfileSettings } from "./_components/ProfileSettings";
import { ThemeSettings } from "./_components/ThemeSettings";
// import { NotificationSettings } from "./_components/NotificationSettings";

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
  const { currentWorkspace, isLoading, isHydrated } = useWorkspaceStore();

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading || !currentWorkspace) {
    return <Loading />;
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
              <HeaderBreadcrumb
                currentWorkspace={currentWorkspace}
                currentPageName={"Settings"}
              />
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
                  {/* Profile Settings */}
                  <motion.div variants={cardVariants}>
                    <ProfileSettings />
                    <div className="mt-4">
                      <ThemeSettings />
                    </div>
                  </motion.div>

                  {/* Backup Settings */}
                  <motion.div variants={cardVariants}>
                    <BackupSettings />
                  </motion.div>

                  {/* Productivity Settings */}
                  <motion.div variants={cardVariants}>
                    <ProductivitySettings />
                  </motion.div>

                  {/* Notification Settings */}
                  {/* <motion.div variants={cardVariants}>
                    <NotificationSettings />
                  </motion.div> */}
                </motion.div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
