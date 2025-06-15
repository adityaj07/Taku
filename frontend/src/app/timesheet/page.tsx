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
import { useTimesheet } from "@/hooks/timesheet/useTimesheet";
import { useWorkspaceStore } from "@/store";
import { Dosis } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DailyHeader from "./_components/DailyHeader";
import EmptyTimeEntries from "./_components/emptyStates/EmptyTimeEntries";
import AddTimeEntryModal from "./_components/modals/AddTimeEntryModal";
import TimeEntryEditForm from "./_components/modals/TimeEntryEditForm";
import TimeEntryCard from "./_components/TimeEntryCard";
import WeeklyStrip from "./_components/WeeklyStrip";
import WeeklySummary from "./_components/WeeklySummary";

const dosis = Dosis({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

export default function TimesheetPage() {
  const router = useRouter();
  const { currentWorkspace, isLoading, isHydrated } = useWorkspaceStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    expandedEntries,
    editingEntry,
    selectedDayEntries,
    weeklyStats,
    formatDuration,
    formatTime,
    getColumnColor,
    toggleEntryExpansion,
    startEditingEntry,
    handleAddTimeEntry,
    handleEditEntry,
    handleDeleteEntry,
    updateEditingEntry,
    setEditingEntry,
  } = useTimesheet(selectedDate);

  useEffect(() => {
    if (isHydrated && !isLoading && !currentWorkspace) {
      router.push("/");
    }
  }, [currentWorkspace, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading || !currentWorkspace) {
    return <Loading />;
  }

  return (
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
              currentPageName={"Timesheet"}
            />
          </header>

          {/* Add Time Entry Modal */}
          <AddTimeEntryModal
            isOpen={isAddModalOpen}
            onClose={setIsAddModalOpen}
            onAddEntry={handleAddTimeEntry}
            selectedDate={selectedDate}
            currentWorkspace={currentWorkspace}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Weekly Strip */}
            <WeeklyStrip
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              currentWorkspace={currentWorkspace}
            />

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Time Entries */}
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                <DailyHeader
                  selectedDate={selectedDate}
                  entryCount={selectedDayEntries.length}
                  setIsAddModalOpen={setIsAddModalOpen}
                />

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-4xl mx-auto space-y-3">
                    {selectedDayEntries.length === 0 ? (
                      <EmptyTimeEntries
                        onAddEntry={() => setIsAddModalOpen(true)}
                      />
                    ) : (
                      selectedDayEntries.map((entry) => (
                        <div key={entry.id}>
                          {editingEntry?.id === entry.id ? (
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <TimeEntryEditForm
                                editingEntry={editingEntry}
                                onSave={handleEditEntry}
                                onCancel={() => setEditingEntry(null)}
                                onChange={updateEditingEntry}
                              />
                            </div>
                          ) : (
                            <TimeEntryCard
                              entry={entry}
                              isExpanded={expandedEntries.has(entry.id)}
                              onToggleExpansion={() =>
                                toggleEntryExpansion(entry.id)
                              }
                              onEdit={() => startEditingEntry(entry)}
                              onDelete={() => handleDeleteEntry(entry.id)}
                              formatTime={formatTime}
                              formatDuration={formatDuration}
                              getColumnColor={getColumnColor}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Summary Sidebar */}
              <WeeklySummary
                weeklyStats={weeklyStats}
                weeklyGoal={currentWorkspace.weeklyGoals}
                formatDuration={formatDuration}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
