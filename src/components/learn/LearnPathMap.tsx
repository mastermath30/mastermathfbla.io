"use client";

import { CSSProperties, useMemo } from "react";
import { LearnPathNode } from "@/components/learn/LearnPathNode";
import { PathNodeVM } from "@/components/learn/types";

type LearnPathMapProps = {
  nodes: PathNodeVM[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  highlightedNodeId?: string | null;
};

function getConnectorKind(prev: PathNodeVM, current: PathNodeVM) {
  if (prev.state === "locked" || current.state === "locked") return "locked";
  if (prev.state === "mastered") return "completed";
  return "available";
}

function laneToIdx(lane: PathNodeVM["lane"]) {
  if (lane === "left") return 0;
  if (lane === "center") return 1;
  return 2;
}

function laneToPercent(lane: PathNodeVM["lane"]) {
  if (lane === "left") return "16.666%";
  if (lane === "center") return "50%";
  return "83.333%";
}

function getDirectionClass(prev: PathNodeVM, current: PathNodeVM) {
  const diff = laneToIdx(current.lane) - laneToIdx(prev.lane);
  if (diff > 0) return "dlp-connector-right";
  if (diff < 0) return "dlp-connector-left";
  return "dlp-connector-straight";
}

export function LearnPathMap({
  nodes,
  selectedNodeId,
  onSelectNode,
  highlightedNodeId = null,
}: LearnPathMapProps) {
  const ordered = useMemo(() => nodes.slice().sort((a, b) => a.index - b.index), [nodes]);

  const chapters = useMemo(() => {
    const grouped = new Map<number, PathNodeVM[]>();
    ordered.forEach((node) => {
      const list = grouped.get(node.chapterIndex) ?? [];
      list.push(node);
      grouped.set(node.chapterIndex, list);
    });
    return grouped;
  }, [ordered]);

  return (
    <section className="dlp-map" aria-label="Learning path">
      {ordered.map((node, idx) => {
        const prevNode = idx > 0 ? ordered[idx - 1] : null;
        const chapterNodes = chapters.get(node.chapterIndex) ?? [];
        const chapterMastered = chapterNodes.filter((entry) => entry.state === "mastered").length;
        const chapterTotal = chapterNodes.length;
        const showChapterDivider = idx === 0 || (prevNode && prevNode.chapterIndex !== node.chapterIndex);

        return (
          <div key={node.id} className="dlp-group">
            {showChapterDivider && (
              <div className="dlp-chapter-divider" aria-hidden="true">
                <div className="dlp-chapter-line" />
                <div className="dlp-chapter-chip">
                  <span>{node.chapterTitle}</span>
                  <span>•</span>
                  <span>{chapterMastered}/{chapterTotal} mastered</span>
                </div>
                {idx > 0 && (
                  <div className="dlp-milestone-row">
                    <LearnPathNode
                      node={{
                        id: `milestone-${node.chapterIndex}`,
                        title: `Chest ${node.chapterIndex + 1}`,
                        unitTitle: node.unitTitle,
                        estimatedMinutes: 0,
                        difficulty: "beginner",
                        summary: "",
                        masteryGoal: "",
                        readinessSignals: [],
                        state: chapterMastered === chapterTotal ? "mastered" : "available",
                        masteryPercent: chapterTotal ? Math.round((chapterMastered / chapterTotal) * 100) : 0,
                        checkpointComplete: false,
                        hasQuizAttempt: false,
                        isFocus: false,
                        index: -1,
                        nodeType: "milestone",
                        chapterIndex: node.chapterIndex,
                        chapterTitle: node.chapterTitle,
                        lane: "center",
                      }}
                      nonInteractive
                    />
                  </div>
                )}
              </div>
            )}

            <div
              id={`path-node-${node.id}`}
              className={`dlp-row dlp-lane-${node.lane} ${selectedNodeId === node.id ? "dlp-row-selected" : ""}`}
              style={{
                "--dlp-prev-x": prevNode ? laneToPercent(prevNode.lane) : laneToPercent(node.lane),
                "--dlp-current-x": laneToPercent(node.lane),
              } as CSSProperties}
            >
              {prevNode && (
                <div
                  className={`dlp-connector dlp-connector-${getConnectorKind(prevNode, node)} ${getDirectionClass(prevNode, node)}`}
                  aria-hidden="true"
                />
              )}

              <LearnPathNode
                node={node}
                onOpen={onSelectNode}
                emphasized={highlightedNodeId === node.id}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
