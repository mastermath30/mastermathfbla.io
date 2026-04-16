import { allTopics, studyGroupSpotlights } from "@/data/courses";
import type { ResourceItem } from "@/data/courses";

export const learnActionKinds = ["view", "open-ai", "open-community", "open-quiz"] as const;
export const learnTabs = ["concept", "video", "practice", "quiz"] as const;

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
  result?: "mastered" | "review";
  score?: number;
  recommended?: "retry-easy" | "continue-medium" | "continue-hard" | "ask-ai" | "next-topic";
  source?: "quiz";
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
  const result = clean(searchParams.get("result")) as "mastered" | "review" | undefined;
  const scoreValue = Number(searchParams.get("score"));
  const score = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, Math.round(scoreValue))) : undefined;
  const recommended = clean(searchParams.get("recommended")) as
    | "retry-easy"
    | "continue-medium"
    | "continue-hard"
    | "ask-ai"
    | "next-topic"
    | undefined;
  const source = clean(searchParams.get("source")) as "quiz" | undefined;

  return {
    action,
    tab: tab && learnTabs.includes(tab) ? tab : undefined,
    topicId,
    slug,
    difficulty: difficulty && ["easy", "medium", "hard"].includes(difficulty) ? difficulty : undefined,
    groupId,
    thread,
    result: result && ["mastered", "review"].includes(result) ? result : undefined,
    score,
    recommended:
      recommended &&
      ["retry-easy", "continue-medium", "continue-hard", "ask-ai", "next-topic"].includes(recommended)
        ? recommended
        : undefined,
    source: source === "quiz" ? source : undefined,
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
  if (request.result) params.set("result", request.result);
  if (typeof request.score === "number") params.set("score", String(Math.round(request.score)));
  if (request.recommended) params.set("recommended", request.recommended);
  if (request.source) params.set("source", request.source);
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
  void input;
  return "/community";
}

export function resolveCommunityGroupFromCourseId(courseId?: string | null): string | null {
  if (!courseId) return null;
  const prefix = courseId.split("-")[0] ?? "";
  const group = studyGroupSpotlights.find((item) =>
    item.name.toLowerCase().includes(prefix.toLowerCase())
  );
  return group?.id ?? studyGroupSpotlights[0]?.id ?? null;
}

export type NormalizedPlaybackTarget = {
  mode: "youtube-embed" | "native-video" | "external" | "unavailable";
  src: string;
};

const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;

function normalizeYoutubeId(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return youtubeIdPattern.test(trimmed) ? trimmed : null;
}

function extractYoutubeId(input: string): string | null {
  const rawId = normalizeYoutubeId(input);
  if (rawId) return rawId;

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return normalizeYoutubeId(id);
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") {
        return normalizeYoutubeId(url.searchParams.get("v"));
      }
      if (url.pathname.startsWith("/shorts/")) {
        return normalizeYoutubeId(url.pathname.split("/")[2]);
      }
      if (url.pathname.startsWith("/embed/")) {
        return normalizeYoutubeId(url.pathname.split("/")[2]);
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function normalizeResourcePlaybackTarget(resource: ResourceItem): NormalizedPlaybackTarget {
  const directExt = /\.(mp4|webm|ogg)(\?.*)?$/i;
  const seed = resource.embedUrl || resource.href;

  if (resource.provider === "direct" || directExt.test(seed)) {
    return { mode: "native-video", src: seed };
  }

  const youtubeId = extractYoutubeId(seed) || extractYoutubeId(resource.href);
  if (resource.provider === "youtube" || youtubeId) {
    if (youtubeId) {
      return {
        mode: "youtube-embed",
        src: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
      };
    }
    return { mode: "unavailable", src: "" };
  }

  return { mode: "external", src: resource.href };
}
