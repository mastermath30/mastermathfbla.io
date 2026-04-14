"use client";

import { Check, Flame, Gift, Lock, RotateCcw, Trophy } from "lucide-react";
import { PathNodeVM } from "@/components/learn/types";

type LearnPathNodeProps = {
  node: PathNodeVM;
  onOpen?: (nodeId: string) => void;
  emphasized?: boolean;
  nonInteractive?: boolean;
};

function getNodeVisual(state: PathNodeVM["state"]) {
  switch (state) {
    case "locked":
      return {
        label: "Locked",
        icon: Lock,
        classes: "dlp-node-locked",
      };
    case "mastered":
      return {
        label: "Mastered",
        icon: Check,
        classes: "dlp-node-mastered",
      };
    case "needs_review":
      return {
        label: "Review",
        icon: RotateCcw,
        classes: "dlp-node-review",
      };
    case "quiz_ready":
      return {
        label: "Quiz",
        icon: Trophy,
        classes: "dlp-node-quiz",
      };
    case "in_progress":
      return {
        label: "Learning",
        icon: Flame,
        classes: "dlp-node-progress",
      };
    default:
      return {
        label: "Start",
        icon: Flame,
        classes: "dlp-node-available",
      };
  }
}

function getNodeTypeLabel(nodeType: PathNodeVM["nodeType"]) {
  if (nodeType === "checkpoint") return "Checkpoint";
  if (nodeType === "mastery") return "Mastery";
  if (nodeType === "milestone") return "Milestone";
  return "Lesson";
}

export function LearnPathNode({ node, onOpen, emphasized = false, nonInteractive = false }: LearnPathNodeProps) {
  const visual = getNodeVisual(node.state);
  const Icon = visual.icon;
  const typeLabel = getNodeTypeLabel(node.nodeType);
  const interactive = !nonInteractive && typeof onOpen === "function";

  const content = (
    <>
      <span className="dlp-node-core" aria-hidden="true">
        {node.nodeType === "milestone" ? <Gift className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </span>
      {node.state === "locked" && <span className="dlp-node-badge">🔒</span>}
      {node.state === "needs_review" && <span className="dlp-node-badge dlp-node-badge-review">!</span>}
    </>
  );

  return (
    <div className="dlp-node-wrap">
      {interactive ? (
        <button
          type="button"
          onClick={() => onOpen(node.id)}
          className={`dlp-node ${visual.classes} dlp-node-type-${node.nodeType} ${node.isFocus ? "dlp-node-focus" : ""} ${emphasized ? "dlp-node-emphasis" : ""}`}
          aria-label={`${node.title}: ${typeLabel}, ${visual.label}${node.lockedReason ? `, ${node.lockedReason}` : ""}`}
          aria-disabled={node.state === "locked"}
        >
          {content}
        </button>
      ) : (
        <div
          className={`dlp-node ${visual.classes} dlp-node-type-${node.nodeType} ${node.isFocus ? "dlp-node-focus" : ""} ${emphasized ? "dlp-node-emphasis" : ""} dlp-node-static`}
          aria-label={`${node.title}: ${typeLabel}, ${visual.label}`}
        >
          {content}
        </div>
      )}

      <div className="dlp-node-meta">
        {(node.nodeType === "checkpoint" || node.nodeType === "mastery") && (
          <span className="dlp-node-type-pill">{typeLabel}</span>
        )}
        <p className="dlp-node-title">{node.title}</p>
        <p className="dlp-node-status">{visual.label}</p>
      </div>
    </div>
  );
}
