"use client";

import { motion } from "framer-motion";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ActionButtons from "@/components/ActiveButtons";
import LandingHeader from "@/components/LandingHeader";
import LandingNavbar from "@/components/LandingNavbar";
import Loading from "@/components/Loading";
import TakuMascot from "@/components/TakuMascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserInfoModal from "@/components/UserInfoModal";
import WorkspaceModal from "@/components/WorkspaceModal";
import { useWorkspaceStore } from "@/store";
import {
  BarChart3,
  CheckCircle,
  ChevronRight,
  Clock,
  Database,
  Shield,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

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
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const floatingVariants = {
  animate: {
    y: [-20, 20, -20],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
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

  const features = [
    {
      icon: Timer,
      title: "Smart Time Tracking",
      description:
        "Effortlessly track time across tasks with intelligent one-click timers. Discover exactly where your productive hours flow.",
      color: "from-blue-500 via-blue-600 to-indigo-600",
      glowColor: "blue-500/20",
    },
    {
      icon: Target,
      title: "Goal Setting & Progress",
      description:
        "Set ambitious weekly goals and watch your progress unfold through beautiful visual insights and achievements.",
      color: "from-emerald-500 via-green-600 to-teal-600",
      glowColor: "emerald-500/20",
    },
    {
      icon: BarChart3,
      title: "Activity Heatmaps",
      description:
        "Transform your productivity patterns into stunning GitHub-style activity heatmaps that tell your success story.",
      color: "from-purple-500 via-violet-600 to-purple-700",
      glowColor: "purple-500/20",
    },
    {
      icon: Database,
      title: "Local-First Privacy",
      description:
        "Your sensitive data stays exactly where it belongs - on your device. Zero cloud dependency, maximum privacy.",
      color: "from-orange-500 via-amber-500 to-yellow-500",
      glowColor: "orange-500/20",
    },
    {
      icon: Zap,
      title: "Lightning Performance",
      description:
        "Experience blazing-fast interactions powered by cutting-edge web technologies. No loading screens, pure speed.",
      color: "from-cyan-500 via-sky-500 to-blue-500",
      glowColor: "cyan-500/20",
    },
    {
      icon: Shield,
      title: "Export & Backup",
      description:
        "Maintain complete ownership of your data with seamless export capabilities and intelligent backup systems.",
      color: "from-rose-500 via-pink-500 to-red-500",
      glowColor: "rose-500/20",
    },
  ];

  const benefits = [
    "Complete privacy - your data never leaves your device",
    "Beautiful, intuitive interface designed for productivity",
    "Perfect for students, developers, and creative professionals",
    "Kanban boards for visual task management",
    "Detailed time tracking and analytics",
    "Smart notifications and productivity insights",
  ];

  return (
    <div className={`${dosis.variable} min-h-screen relative overflow-hidden`}>
      {/* Navbar */}
      <div className="mb-10">
        <LandingNavbar onStartFresh={handleStartFresh} isLoading={isLoading} />
      </div>

      {/* Enhanced Background with multiple layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950/20" />

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1)_0%,transparent_25%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08)_0%,transparent_25%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.06)_0%,transparent_25%)]" />

        {/* Noise texture */}
        <div
          className={`absolute inset-0 opacity-[0.015] bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]`}
        ></div>
      </div>

      {/* Floating geometric elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-[10%] w-24 h-24 bg-gradient-to-br from-orange-400/20 to-amber-400/20 dark:from-orange-400/10 dark:to-amber-400/10 rounded-2xl blur-xl rotate-45"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-40 right-[15%] w-32 h-32 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 dark:from-blue-400/8 dark:to-indigo-400/8 rounded-full blur-xl"
        style={{ animationDelay: "2s" }}
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-32 left-[20%] w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-400/20 dark:from-purple-400/10 dark:to-violet-400/10 rounded-xl blur-xl rotate-12"
        style={{ animationDelay: "4s" }}
      />

      {/* Main content */}
      <div className="relative z-10 pt-16 lg:pt-20">
        {/* Enhanced Hero Section */}
        <motion.section
          id="hero"
          className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent blur-3xl" />

          <div className="max-w-5xl w-full text-center space-y-16 relative">
            <motion.div variants={featureVariants}>
              <LandingHeader />
            </motion.div>

            <motion.div variants={featureVariants}>
              <TakuMascot />
            </motion.div>

            <motion.div variants={featureVariants}>
              <ActionButtons
                onImportSuccess={handleImportSuccess}
                onStartFresh={handleStartFresh}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={featureVariants}
              className="flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400 pt-8"
            >
              <div className="flex items-center gap-2 group">
                <Shield className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                <span className="font-dosis text-sm font-medium">
                  Privacy-first
                </span>
              </div>
              <div className="flex items-center gap-2 group">
                <Zap className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                <span className="font-dosis text-sm font-medium">
                  Instant setup
                </span>
              </div>
              <div className="flex items-center gap-2 group">
                <Database className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                <span className="font-dosis text-sm font-medium">
                  Local storage
                </span>
              </div>
              <div className="flex items-center gap-2 group">
                <Sparkles className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                <span className="font-dosis text-sm font-medium">
                  Modern design
                </span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Features Section */}
        <motion.section
          id="features"
          className="py-32 px-4 sm:px-6 lg:px-8 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-gray-800/30" />

          <div className="max-w-7xl mx-auto relative">
            <motion.div
              variants={featureVariants}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/80 dark:bg-orange-900/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="font-dosis text-sm font-medium text-orange-700 dark:text-orange-300">
                  Powerful Features
                </span>
              </div>

              <h2 className="font-dosis text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 dark:from-orange-400 dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                  stay focused
                </span>
              </h2>
              <p className="font-dosis text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Taku combines powerful time tracking with breathtaking design to
                help you build unstoppable productivity habits and achieve your
                goals.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  custom={index}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl relative overflow-hidden">
                    {/* Card glow effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />
                    <div
                      className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur transition-opacity duration-500 -z-10`}
                    />

                    <CardContent className="p-8 relative">
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                        >
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-dosis text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                            {feature.title}
                          </h3>
                        </div>
                      </div>
                      <p className="font-dosis text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Enhanced Benefits Section */}
        <motion.section
          id="benefits"
          className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Animated background elements */}
          <motion.div
            className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="max-w-7xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={featureVariants}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 dark:bg-green-900/30 rounded-full mb-6">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-dosis text-sm font-medium text-green-700 dark:text-green-300">
                    Why Choose Taku
                  </span>
                </div>

                <h2 className="font-dosis text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight">
                  Built for
                  <br />
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    productivity
                  </span>
                </h2>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={featureVariants}
                      custom={index}
                      className="flex items-start gap-4 group"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-dosis text-lg text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
                        {benefit}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={featureVariants} className="relative">
                {/* Enhanced preview card */}
                <div className="relative">
                  {/* Card glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl" />

                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-200/50 dark:border-gray-700/50 relative">
                    {/* Floating elements */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg shadow-lg"
                      animate={{
                        rotate: [0, 180, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-dosis text-xl font-bold text-gray-900 dark:text-gray-100">
                            Today&apos;s Focus
                          </h4>
                          <p className="font-dosis text-sm text-gray-500 dark:text-gray-400">
                            3 tasks completed • 4h 45m tracked
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            task: "Design mockups",
                            time: "2h 30m",
                            color: "green",
                            done: true,
                          },
                          {
                            task: "Code review",
                            time: "1h 15m",
                            color: "blue",
                            done: true,
                          },
                          {
                            task: "Write documentation",
                            time: "Running...",
                            color: "orange",
                            done: false,
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                              !item.done
                                ? "bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 shadow-sm"
                                : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  item.color === "green"
                                    ? "bg-green-500"
                                    : item.color === "blue"
                                    ? "bg-blue-500"
                                    : "bg-orange-500"
                                } ${!item.done ? "animate-pulse" : ""}`}
                              />
                              <span className="font-dosis text-gray-700 dark:text-gray-300 font-medium">
                                {item.task}
                              </span>
                            </div>
                            <span
                              className={`font-dosis text-sm font-bold ${
                                item.color === "green"
                                  ? "text-green-600"
                                  : item.color === "blue"
                                  ? "text-blue-600"
                                  : "text-orange-600"
                              } ${!item.done ? "animate-pulse" : ""}`}
                            >
                              {item.time}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-dosis text-gray-600 dark:text-gray-400 font-medium">
                            Weekly Goal Progress
                          </span>
                          <span className="font-dosis font-bold text-gray-900 dark:text-gray-100">
                            32h / 40h
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-sm"
                            initial={{ width: 0 }}
                            animate={{ width: "80%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Privacy Section */}
        <motion.section
          id="privacy"
          className="py-32 px-4 sm:px-6 lg:px-8 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={featureVariants} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 dark:bg-blue-900/30 rounded-full mb-6">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-dosis text-sm font-medium text-blue-700 dark:text-blue-300">
                  Privacy & Security
                </span>
              </div>

              <h2 className="font-dosis text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Your data is
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  100% private
                </span>
              </h2>

              <p className="font-dosis text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Taku is built with privacy at its core. All your data stays on
                your device, never uploaded to any cloud service. You have
                complete control over your information.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                  {
                    icon: Database,
                    title: "Local Storage",
                    description: "All data stored locally on your device",
                  },
                  {
                    icon: Shield,
                    title: "No Tracking",
                    description: "Zero analytics or user tracking",
                  },
                  {
                    icon: Zap,
                    title: "Offline First",
                    description: "Works completely offline",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={cardVariants}
                    custom={index}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-dosis text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="font-dosis text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced CTA Section */}
        <motion.section
          className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* CTA background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <div className="max-w-5xl mx-auto text-center relative">
            <motion.div variants={featureVariants} className="space-y-12">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full mb-8">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-dosis text-base font-semibold text-orange-700 dark:text-orange-300">
                  Start Your Journey
                </span>
              </div>

              <h2 className="font-dosis text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Ready to transform
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 dark:from-orange-400 dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                  your productivity?
                </span>
              </h2>

              <p className="font-dosis text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Join thousands of ambitious professionals who&apos;ve
                revolutionized their workflow with Taku. Start tracking your
                time and building unstoppable habits today.
              </p>

              <div className="pt-8">
                <Button
                  onClick={handleStartFresh}
                  disabled={isLoading}
                  size="lg"
                  className="font-dosis text-xl px-12 py-8 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 text-white shadow-2xl hover:shadow-3xl group disabled:opacity-50 min-w-[280px] rounded-2xl border-0 transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 mr-3 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  ) : (
                    <Target className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                  Start Your Journey
                  <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

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
