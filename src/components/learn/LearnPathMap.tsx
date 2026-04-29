"use client";

import { useMemo } from "react";
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

function laneToSvgX(lane: PathNodeVM["lane"]) {
  if (lane === "left") return 16.666;
  if (lane === "center") return 50;
  return 83.333;
}

function getConnectorPath(prev: PathNodeVM, current: PathNodeVM) {
  const startX = laneToSvgX(prev.lane);
  const endX = laneToSvgX(current.lane);

  return `M ${startX} 0 C ${startX} 42, ${endX} 58, ${endX} 100`;
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
    <div className="dlp-map-scroll">
      <section className="dlp-map" aria-label="Learning path">
        {ordered.map((node, idx) => {
          const prevNode = idx > 0 ? ordered[idx - 1] : null;
          const connectorKind =
            prevNode && prevNode.chapterIndex === node.chapterIndex ? getConnectorKind(prevNode, node) : null;
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
              >
                {prevNode && connectorKind && (
                  <svg
                    className={`dlp-connector dlp-connector-${connectorKind}`}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d={getConnectorPath(prevNode, node)} />
                  </svg>
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
    </div>
  );
}
