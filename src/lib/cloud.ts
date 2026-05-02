import type { LearningProgress } from "@/lib/progress";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export type PostModerationState = "visible" | "flagged" | "hidden";

export type CloudCommunityPost = {
  id: string;
  title: string;
  body: string;
  tag: string;
  author: string;
  createdAt: string;
  moderationState?: PostModerationState;
};

export type CloudPostReport = {
  postId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
};

export type TutoringRequestPayload = {
  studentName: string;
  studentEmail: string;
  subject: string;
  message: string;
  preferredTime?: string;
};

function getClient() {
  return getSupabaseBrowserClient();
}

export async function getSupabaseUserId(): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}

export async function loadLearningProgressFromCloud(userId: string): Promise<LearningProgress | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("learning_progress")
    .select("progress_json")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.progress_json) {
    return null;
  }

  return data.progress_json as LearningProgress;
}

export async function saveLearningProgressToCloud(userId: string, progress: LearningProgress): Promise<void> {
  const client = getClient();
  if (!client) return;

  await client.from("learning_progress").upsert(
    {
      user_id: userId,
      progress_json: progress,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function upsertProfile(profile: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
}): Promise<void> {
  const client = getClient();
  if (!client) return;

  await client.from("profiles").upsert(
    {
      id: profile.userId,
      email: profile.email,
      first_name: profile.firstName,
      last_name: profile.lastName,
      username: profile.username ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}

export async function createCommunityPostCloud(post: CloudCommunityPost): Promise<void> {
  const client = getClient();
  if (!client) return;

  await client.from("community_posts").insert({
    id: post.id,
    title: post.title,
    body: post.body,
    tag: post.tag,
    author: post.author,
    moderation_state: post.moderationState ?? "visible",
    created_at: post.createdAt,
  });
}

export async function reportCommunityPostCloud(report: CloudPostReport): Promise<void> {
  const client = getClient();
  if (!client) return;

  await client.from("community_post_reports").insert({
    post_id: report.postId,
    reporter_id: report.reporterId,
    reason: report.reason,
    created_at: report.createdAt,
  });
}

export async function submitTutoringRequestCloud(payload: TutoringRequestPayload): Promise<void> {
  const client = getClient();
  if (!client) return;

  await client.from("tutoring_requests").insert({
    student_name: payload.studentName,
    student_email: payload.studentEmail,
    subject: payload.subject,
    message: payload.message,
    preferred_time: payload.preferredTime ?? null,
    status: "new",
    created_at: new Date().toISOString(),
  });
}
