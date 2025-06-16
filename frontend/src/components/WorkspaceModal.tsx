"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Folder, X } from "lucide-react";
import { useState } from "react";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workspaceName: string) => void;
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.5,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.3,
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function WorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
}: WorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState("");

  const handleSubmit = () => {
    if (workspaceName.trim()) {
      onSubmit(workspaceName.trim());
      setWorkspaceName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-dosis text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Create Workspace
                    </h3>
                    <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                      Give your workspace a name
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="workspace-name"
                    className="font-dosis text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Workspace Name
                  </label>
                  <input
                    id="workspace-name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="e.g., My Projects, Work Tasks..."
                    className="font-dosis w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  {/* Cancel Button */}
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="font-dosis flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-muted transition-colors"
                  >
                    Cancel
                  </Button>

                  {/* Continue Button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!workspaceName.trim()}
                    className={cn(
                      "font-dosis flex-1 px-4 py-2 rounded-xl text-white flex items-center justify-center gap-2",
                      "bg-gradient-to-r from-orange-500 to-amber-500",
                      "hover:from-orange-600 hover:to-amber-600",
                      "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    )}
                    whileHover={workspaceName.trim() ? { scale: 1.02 } : {}}
                    whileTap={workspaceName.trim() ? { scale: 0.98 } : {}}
                  >
                    Continue
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={workspaceName.trim() ? { x: 4 } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
