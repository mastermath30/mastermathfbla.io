export type PathNodeState = "locked" | "available" | "in_progress" | "mastered" | "needs_review" | "quiz_ready";
export type PathNodeType = "lesson" | "checkpoint" | "mastery" | "milestone";
export type PathLane = "left" | "center" | "right";

export type PathNodeVM = {
  id: string;
  title: string;
  unitTitle: string;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  summary: string;
  masteryGoal: string;
  readinessSignals: string[];
  state: PathNodeState;
  masteryPercent: number;
  lockedReason?: string;
  checkpointComplete: boolean;
  hasQuizAttempt: boolean;
  isFocus: boolean;
  index: number;
  nodeType: PathNodeType;
  chapterIndex: number;
  lane: PathLane;
};
