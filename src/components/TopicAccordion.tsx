"use client";

import Link from "next/link";
import { useState } from "react";
import { UnitNode } from "@/data/courses";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CheckCircle2, ChevronDown, MessageCircle, Sparkles, Trophy } from "lucide-react";

type TopicAccordionProps = {
  units: UnitNode[];
  completedTopicIds: string[];
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onMarkComplete: (topicId: string) => void;
};

export function TopicAccordion({
  units,
  completedTopicIds,
  selectedTopicId,
  onSelectTopic,
  onMarkComplete,
}: TopicAccordionProps) {
  const [openUnits, setOpenUnits] = useState<string[]>(units.length ? [units[0].id] : []);

  const toggleUnit = (unitId: string) => {
    setOpenUnits((current) =>
      current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId]
    );
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose a unit and topic</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Follow your class path and pick the topic you need right now.
      </p>

      <div className="space-y-3 mt-4">
        {units.map((unit) => {
          const open = openUnits.includes(unit.id);
          return (
            <Card key={unit.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleUnit(unit.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{unit.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{unit.summary}</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="px-5 pb-5 grid md:grid-cols-2 gap-3">
                  {unit.topics.map((topic) => {
                    const completed = completedTopicIds.includes(topic.id);
                    const selected = selectedTopicId === topic.id;

                    return (
                      <div
                        key={topic.id}
                        className={`rounded-xl border p-4 ${
                          selected
                            ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{topic.title}</h4>
                          {completed && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{topic.summary}</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => onSelectTopic(topic.id)}>
                            <Sparkles className="w-4 h-4" />
                            Focus Topic
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onMarkComplete(topic.id)}>
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Done
                          </Button>
                          {topic.quizSlugs[0] && (
                            <Link href={`/resources/quiz/${topic.quizSlugs[0]}`}>
                              <Button size="sm" variant="ghost">
                                <Trophy className="w-4 h-4" />
                                Quiz
                              </Button>
                            </Link>
                          )}
                          <Link href="/community">
                            <Button size="sm" variant="ghost">
                              <MessageCircle className="w-4 h-4" />
                              Help
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
