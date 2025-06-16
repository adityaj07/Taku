"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { ImportButton } from "./ImportButton";

interface ActionButtonsProps {
  onImportSuccess?: (workspaceId?: string) => void;
  onStartFresh: () => void;
  isLoading?: boolean;
}

const buttonContainerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const buttonHover = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

const buttonTap = {
  scale: 0.95,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

export default function ActionButtons({
  onImportSuccess,
  onStartFresh,
  isLoading = false,
}: ActionButtonsProps) {
  return (
    <motion.div variants={buttonContainerVariants} className="space-y-6">
      {/* Primary actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <motion.div
          variants={buttonVariants}
          whileHover={!isLoading ? buttonHover : {}}
          whileTap={!isLoading ? buttonTap : {}}
        >
          <Button
            onClick={onStartFresh}
            disabled={isLoading}
            size="lg"
            className="font-dosis text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl group disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            )}
            {isLoading ? "Creating..." : "Start Fresh"}
            {!isLoading && (
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-md"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Button>
        </motion.div>

        <motion.div
          variants={buttonVariants}
          whileHover={!isLoading ? buttonHover : {}}
          whileTap={!isLoading ? buttonTap : {}}
        >
          <ImportButton
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8 py-3 text-base font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all duration-200"
            onSuccess={onImportSuccess}
            redirectOnSuccess={true}
          >
            Import Existing Workspace
          </ImportButton>
        </motion.div>
      </div>

      {/* Helper text */}
      <motion.p
        variants={buttonVariants}
        className="font-dosis text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1"
      >
        <Sparkles className="w-4 h-4" />
        Your data stays on your device
      </motion.p>
    </motion.div>
  );
}
