"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Award, Edit3, Save, Trophy, X } from "lucide-react";
import { useState } from "react";

interface MonthlyTaskCardProps {
  current: number;
  goal: number;
  percentage: number;
  onGoalUpdate: (newGoal: number) => void;
}

export const MonthlyTaskCard = ({
  current,
  goal,
  percentage,
  onGoalUpdate,
}: MonthlyTaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(goal.toString());

  const handleSave = () => {
    const newGoal = parseInt(goalInput);
    if (!isNaN(newGoal) && newGoal > 0) {
      onGoalUpdate(newGoal);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setGoalInput(goal.toString());
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-dosis font-medium text-gray-900 dark:text-gray-100">
                Monthly Tasks
              </h3>
              <p className="font-dosis text-sm text-gray-600 dark:text-gray-400">
                Tasks completed
              </p>
            </div>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-dosis text-gray-900 dark:text-gray-100">
              {current}
            </span>
            <span className="font-dosis text-gray-600 dark:text-gray-400">
              /
              {isEditing ? (
                <Input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="inline-flex w-16 h-6 text-sm p-1 mx-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  autoFocus
                />
              ) : (
                ` ${goal}`
              )}
            </span>
          </div>
          <div className="space-y-2">
            <Progress value={percentage} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-dosis text-gray-600 dark:text-gray-400">
                {Math.round(percentage)}% complete
              </span>
              {percentage >= 100 && (
                <span className="font-dosis text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Goal reached!
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
