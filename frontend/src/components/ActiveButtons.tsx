"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Sparkles, Loader2 } from "lucide-react";

interface ActionButtonsProps {
  onImportWorkspace: () => void;
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
  onImportWorkspace,
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
          <Button
            onClick={onImportWorkspace}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="font-dosis text-lg px-8 py-6 border-2 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/50 shadow-lg hover:shadow-xl group disabled:opacity-50"
          >
            <Upload className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform duration-300" />
            Import Workspace
          </Button>
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
