"use client";

import { CourseNode } from "@/data/courses";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { BookOpen, CheckCircle2 } from "lucide-react";

type CourseCardProps = {
  course: CourseNode;
  selected: boolean;
  completionPercent: number;
  onSelect: (courseId: string) => void;
};

export function CourseCard({ course, selected, completionPercent, onSelect }: CourseCardProps) {
  return (
    <Card
      className={`h-full ${
        selected ? "border-[var(--theme-primary)] shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.25)]" : ""
      }`}
      interactive
      onClick={() => onSelect(course.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{course.title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{course.summary}</p>
        </div>
        <BookOpen className="w-5 h-5 text-[var(--theme-primary)] shrink-0" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>Course readiness</span>
          <span>{completionPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${completionPercent}%`,
              background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))",
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">{course.units.length} units</span>
        <Button size="sm" variant={selected ? "primary" : "outline"}>
          <CheckCircle2 className="w-4 h-4" />
          {selected ? "Selected" : "Start Here"}
        </Button>
      </div>
    </Card>
  );
}
