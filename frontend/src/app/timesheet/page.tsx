"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/store";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function TimesheetPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading, isHydrated } = useWorkspaceStore();

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading || !currentWorkspace) {
    return (
      <div
        className={`${dosis.variable} min-h-screen flex items-center justify-center`}
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
    <div className={dosis.variable}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header with Breadcrumbs */}
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 px-4">
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
                      Timesheet
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* Main Content */}
          <motion.main
            className="flex-1 p-6 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Page Header */}
            <motion.div variants={cardVariants} className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <h1 className="font-dosis text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Timesheet
                  </h1>
                  <p className="font-dosis text-lg text-gray-600 dark:text-gray-400">
                    Track and analyze your time
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timesheet Content */}
            <motion.div variants={cardVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Clock className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Time Tracking
                  </h3>
                  <p className="font-dosis text-gray-600 dark:text-gray-400">
                    Time entries, analytics, reports, and productivity insights coming soon...
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}