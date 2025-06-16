"use client";

import { motion } from "framer-motion";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ActionButtons from "@/components/ActiveButtons";
import LandingHeader from "@/components/LandingHeader";
import TakuMascot from "@/components/TakuMascot";
import UserInfoModal from "@/components/UserInfoModal";
import WorkspaceModal from "@/components/WorkspaceModal";
import { useWorkspaceStore } from "@/store";
import { toast } from "sonner";
import Loading from "@/components/Loading";

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
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export default function Home() {
  const router = useRouter();
  const { createWorkspace, isLoading, currentWorkspace, isHydrated } =
    useWorkspaceStore();

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  // Redirect to dashboard if workspace exists
  useEffect(() => {
    if (isHydrated && currentWorkspace && !isLoading) {
      router.push("/dashboard");
    }
  }, [currentWorkspace, isHydrated, isLoading, router]);

  const handleImportSuccess = (workspaceId?: string) => {
    console.log(
      "Workspace imported successfully from landing page:",
      workspaceId
    );
    // The ImportButton will handle navigation with redirectOnSuccess prop
  };

  const handleStartFresh = () => {
    setIsWorkspaceModalOpen(true);
  };

  const handleWorkspaceCreated = (name: string) => {
    setWorkspaceName(name);
    setIsWorkspaceModalOpen(false);
    setIsUserInfoModalOpen(true);
  };

  const handleUserInfoSubmitted = async (userInfo: {
    name: string;
    role: "Student" | "Developer" | "Designer" | "Other";
  }) => {
    try {
      await createWorkspace({
        name: workspaceName,
        ownerName: userInfo.name,
        role: userInfo.role,
        columns: ["Todo", "In Progress", "Done"],
        weeklyGoals: 40,
        theme: "system",
        settings: {
          heatmap: true,
          mascot: true,
          autoBackup: false,
          compactMode: false,
        },
      });

      setIsUserInfoModalOpen(false);

      // Add a small delay for the modal to close before redirecting
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  const handleCloseModals = () => {
    setIsWorkspaceModalOpen(false);
    setIsUserInfoModalOpen(false);
    setWorkspaceName("");
  };

  // Show loading while hydrating
  if (!isHydrated) {
    return <Loading />;
  }

  // Don't render landing page if there's already a workspace (will redirect)
  if (currentWorkspace) {
    return null;
  }

  return (
    <div className={`${dosis.variable} min-h-screen relative overflow-hidden`}>
      {/* Background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950" />

      {/* Subtle animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-orange-200/20 dark:bg-orange-400/10 rounded-full blur-xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-amber-200/20 dark:bg-amber-400/10 rounded-full blur-xl"
        animate={{
          x: [0, -25, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <motion.main
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl w-full text-center space-y-12">
          <LandingHeader />
          <TakuMascot />
          <ActionButtons
            onImportSuccess={handleImportSuccess}
            onStartFresh={handleStartFresh}
            isLoading={isLoading}
          />
        </div>
      </motion.main>

      {/* Workspace Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleWorkspaceCreated}
      />

      {/* User Info Modal */}
      <UserInfoModal
        isOpen={isUserInfoModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleUserInfoSubmitted}
        workspaceName={workspaceName}
      />
    </div>
  );
}
