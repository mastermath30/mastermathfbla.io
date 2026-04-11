import { allTopics, studyGroupSpotlights } from "@/data/courses";

export const learnActionKinds = ["view", "open-ai", "open-community", "open-quiz"] as const;
export const learnTabs = ["concept", "video", "practice", "quiz", "ai", "community"] as const;

export type LearnActionKind = (typeof learnActionKinds)[number];
export type LearnTab = (typeof learnTabs)[number];

export type LearnActionRequest = {
  action: LearnActionKind;
  tab?: LearnTab;
  topicId?: string;
  slug?: string;
  difficulty?: "easy" | "medium" | "hard";
  groupId?: string;
  thread?: string;
};

function clean(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseLearnActionFromSearchParams(searchParams: URLSearchParams): LearnActionRequest | null {
  const action = clean(searchParams.get("action")) as LearnActionKind | undefined;
  if (!action || !learnActionKinds.includes(action)) return null;

  const tab = clean(searchParams.get("tab")) as LearnTab | undefined;
  const topicId = clean(searchParams.get("topic"));
  const slug = clean(searchParams.get("slug"));
  const difficulty = clean(searchParams.get("difficulty")) as "easy" | "medium" | "hard" | undefined;
  const groupId = clean(searchParams.get("group"));
  const thread = clean(searchParams.get("thread"));

  return {
    action,
    tab: tab && learnTabs.includes(tab) ? tab : undefined,
    topicId,
    slug,
    difficulty: difficulty && ["easy", "medium", "hard"].includes(difficulty) ? difficulty : undefined,
    groupId,
    thread,
  };
}

export function toLearnActionHref(request: LearnActionRequest): string {
  const params = new URLSearchParams();
  params.set("action", request.action);
  if (request.tab) params.set("tab", request.tab);
  if (request.topicId) params.set("topic", request.topicId);
  if (request.slug) params.set("slug", request.slug);
  if (request.difficulty) params.set("difficulty", request.difficulty);
  if (request.groupId) params.set("group", request.groupId);
  if (request.thread) params.set("thread", request.thread);
  return `/learn?${params.toString()}`;
}

export function resolveQuizSlug(topicId?: string, fallbackSlug?: string): string | null {
  if (fallbackSlug) return fallbackSlug;
  if (!topicId) return null;
  const topic = allTopics.find((item) => item.id === topicId);
  return topic?.quizSlugs?.[0] ?? null;
}

export function buildCommunityHref(input: {
  studyGroupId?: string;
  discussionLabel?: string;
  groupId?: string;
  thread?: string;
}): string {
  const groupId = input.groupId || input.studyGroupId;
  const thread = input.thread || input.discussionLabel;

  if (groupId) {
    const params = new URLSearchParams();
    params.set("group", groupId);
    if (thread) params.set("thread", thread);
    return `/study-groups?${params.toString()}`;
  }

  const params = new URLSearchParams();
  if (thread) params.set("thread", thread);
  return params.toString() ? `/community?${params.toString()}` : "/community";
}

export function resolveCommunityGroupFromCourseId(courseId?: string | null): string | null {
  if (!courseId) return null;
  const prefix = courseId.split("-")[0] ?? "";
  const group = studyGroupSpotlights.find((item) =>
    item.name.toLowerCase().includes(prefix.toLowerCase())
  );
  return group?.id ?? studyGroupSpotlights[0]?.id ?? null;
}
