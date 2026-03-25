"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Textarea, Select } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, GlowingOrbs, PageWrapper, HeroText } from "@/components/motion";
import { useTranslations } from "@/components/LanguageProvider";
import {
  MessageCircle,
  Plus,
  Users,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Calendar,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Sparkles,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  UserPlus,
  Bell,
  CheckCircle2,
  MessageSquare,
  Video,
  ChevronRight,
}from "lucide-react";

interface Post {
  id: string;
  title: string;
  body: string;
  tag: string;
  author: string;
  createdAt: string;
}

const tagOptions = [
  { value: "Algebra", label: "Algebra" },
  { value: "Geometry", label: "Geometry" },
  { value: "Calculus", label: "Calculus" },
  { value: "Statistics", label: "Statistics" },
  { value: "Other", label: "Other" },
];

const tagColors: Record<string, "violet" | "success" | "info" | "purple" | "default"> = {
  Algebra: "violet",
  Geometry: "success",
  Calculus: "info",
  Statistics: "purple",
  Other: "default",
};

const topContributors = [
  { name: "Alex Johnson", initials: "AJ", points: 1245, rank: "Gold", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", icon: Trophy },
  { name: "David Kim", initials: "DK", points: 1098, rank: "Silver", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", icon: Medal },
  { name: "Maria Garcia", initials: "MG", points: 987, rank: "Bronze", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", icon: Award },
];

const featuredStudyGroups = [
  {
    id: "1",
    name: "AP Calculus BC Study Group",
    memberCount: 24,
    nextSession: "Tomorrow at 10:00 AM",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
  },
  {
    id: "2",
    name: "SAT Math Prep",
    memberCount: 18,
    nextSession: "Wednesday at 4:00 PM",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
  },
];

const activityFeed = [
  {
    id: "1",
    type: "achievement",
    user: { name: "Sarah J.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" },
    content: "earned the 'Calculus Master' badge!",
    time: "2 hours ago",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    id: "2",
    type: "join",
    user: { name: "Michael C.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
    content: "joined AP Calculus BC Study Group",
    time: "3 hours ago",
    icon: UserPlus,
    color: "text-green-500",
  },
  {
    id: "3",
    type: "solved",
    user: { name: "Emma R.", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=50&h=50&fit=crop" },
    content: "solved 10 calculus problems today!",
    time: "5 hours ago",
    icon: CheckCircle2,
    color: "text-violet-500",
  },
  {
    id: "4",
    type: "session",
    user: { name: "Alex T.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop" },
    content: "is hosting a live study session now",
    time: "Live",
    icon: Video,
    color: "text-red-500",
  },
];

const seedPosts: Post[] = [
  {
    id: "seed_1",
    title: "How do I factor x² + 5x + 6?",
    body: "I know it should be (x + ?)(x + ?), but I get stuck finding the numbers.",
    tag: "Algebra",
    author: "Student",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_2",
    title: "Can someone explain limits?",
    body: "What does it really mean when we say lim x→a f(x) = L? A simple example would help.",
    tag: "Calculus",
    author: "Student",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_3",
    title: "Best way to remember SOH-CAH-TOA?",
    body: "I keep mixing up sine and cosine in right-triangle problems. Any memory tricks that actually stick?",
    tag: "Geometry",
    author: "Nina P.",
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_4",
    title: "Quick check on standard deviation steps",
    body: "When we compute sample standard deviation, do we divide by n-1 before or after taking the square root?",
    tag: "Statistics",
    author: "Jordan K.",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_5",
    title: "Derivative of ln(3x^2 + 1)",
    body: "I got 1/(3x^2+1). I think I forgot chain rule somewhere. Can someone show the clean steps?",
    tag: "Calculus",
    author: "Ari M.",
    createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_6",
    title: "Systems of equations word problems are confusing",
    body: "I can solve equations but translating the story into equations takes forever. Any strategy?",
    tag: "Algebra",
    author: "Sam R.",
    createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_7",
    title: "How do you study for a timed math test?",
    body: "I understand concepts at home, but I freeze on timed tests. Looking for practical routine ideas.",
    tag: "Other",
    author: "Maya L.",
    createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed_8",
    title: "Need feedback on this geometry proof structure",
    body: "I can write statements but reasons feel repetitive. Is there a cleaner format teachers prefer?",
    tag: "Geometry",
    author: "Leo D.",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

function formatTimeAgo(iso: string, locale: string = "en") {
  const ts = iso ? new Date(iso).getTime() : 0;
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / (1000 * 60));
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (mins < 1) return rtf.format(0, "minute");
    if (mins < 60) return rtf.format(-mins, "minute");
    const hours = Math.floor(mins / 60);
    if (hours < 24) return rtf.format(-hours, "hour");
    const days = Math.floor(hours / 24);
    return rtf.format(-days, "day");
  } catch {
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const { t, language } = useTranslations();

  const translatedTagOptions = tagOptions.map((opt) => ({
    ...opt,
    label: t(opt.label),
  }));

  useEffect(() => {
    // Load posts from localStorage
    const savedPosts = localStorage.getItem("mm_forum_posts");
    if (savedPosts) {
      try {
        const parsed = JSON.parse(savedPosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
        } else {
          setPosts(seedPosts);
          localStorage.setItem("mm_forum_posts", JSON.stringify(seedPosts));
        }
      } catch {
        setPosts(seedPosts);
        localStorage.setItem("mm_forum_posts", JSON.stringify(seedPosts));
      }
    } else {
      setPosts(seedPosts);
      localStorage.setItem("mm_forum_posts", JSON.stringify(seedPosts));
    }

    // Check auth
    try {
      const profile = JSON.parse(localStorage.getItem("mm_profile") || "null");
      const session = JSON.parse(localStorage.getItem("mm_session") || "null");
      if (profile && session && session.email === profile.email) {
        setIsSignedIn(true);
        // Use username if available, otherwise use full name
        if (profile.username) {
          setUserName(profile.username);
        } else {
          const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
          setUserName(fullName || "User");
        }
      }
    } catch {
      // Ignore
    }

    const handlePostsUpdated = () => {
      const updatedPosts = localStorage.getItem("mm_forum_posts");
      if (updatedPosts) {
        try {
          const parsed = JSON.parse(updatedPosts);
          if (Array.isArray(parsed)) {
            setPosts(parsed);
          }
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("mm_forum_posts_updated", handlePostsUpdated);

    return () => {
      window.removeEventListener("mm_forum_posts_updated", handlePostsUpdated);
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const body = (form.elements.namedItem("body") as HTMLTextAreaElement).value.trim();
    const tag = (form.elements.namedItem("tag") as HTMLSelectElement).value;

    if (!title || !body) {
      setError(t("Please fill in all fields."));
      return;
    }

    const newPost: Post = {
      id: `p_${Date.now()}`,
      title,
      body,
      tag,
      author: isSignedIn ? userName : "Guest",
      createdAt: new Date().toISOString(),
    };

    const updatedPosts = [...posts, newPost];
    setPosts(updatedPosts);
    localStorage.setItem("mm_forum_posts", JSON.stringify(updatedPosts));

    form.reset();
  };

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Glowing orbs */}
        <GlowingOrbs variant="section" />
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=500&fit=crop"
            alt="Community"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/90" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 25%, transparent), transparent)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12 md:pt-36 md:pb-16">
          <HeroText className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium text-white mb-4">
              <MessageCircle className="w-4 h-4" />
              {t("Discussion Forum")}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{t("Community")}</h1>
            <p className="text-slate-200 text-base sm:text-lg md:text-xl">
              {t("Connect with fellow math enthusiasts, ask questions, and help others learn.")}
            </p>
          </HeroText>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-32 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <GlowingOrbs variant="subtle" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
          {/* Forum Section */}
          <div className="lg:col-span-8 min-w-0">
            <Card padding="none" className="overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle>{t("Math Help Forum")}</CardTitle>
                      <CardDescription>{t("Ask questions, share explanations, help others learn")}</CardDescription>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Plus className="w-4 h-4" />
                    {t("New Post")}
                  </Button>
                </div>

                {/* Post Form */}
                <div id="ask" className="p-5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                    {t("Ask a Question")}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Input name="title" placeholder={t("e.g., How do I factor this quadratic?")} />
                      </div>
                      <Select name="tag" options={translatedTagOptions} />
                    </div>
                    <Textarea
                      name="body"
                      rows={4}
                      placeholder={t("Include the problem, what you've tried, and where you're stuck.")}
                    />
                    <div className="flex items-center justify-between">
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <Button type="submit" className="ml-auto">
                        {t("Post Question")}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Posts */}
              <div>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                  <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t("Latest Posts")}
                  </h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {sortedPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                      </div>
                      <p className="text-slate-400">{t("No posts yet. Be the first to ask a question!")}</p>
                    </div>
                  ) : (
                    sortedPosts.map((post) => (
                      <div key={post.id} className="p-5 hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0" style={{ color: "var(--theme-primary)" }}>
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-semibold text-slate-900 dark:text-white">{post.title}</h4>
                              <span className="text-slate-400 text-xs shrink-0">
                                {formatTimeAgo(post.createdAt, language)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant={tagColors[post.tag] || "default"}>{post.tag}</Badge>
                              <span className="text-slate-400 text-xs">{t("by")} {post.author}</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-2 line-clamp-2">{post.body}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-4 lg:w-full lg:max-w-sm lg:justify-self-end min-w-0">
            {/* Study Groups Section */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                  {t("Study Groups")}
                </h2>
                <Link href="/study-groups" className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  {t("View All")} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {featuredStudyGroups.map((group) => (
                  <Link
                    key={group.id}
                    href="/study-groups"
                    className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={group.image}
                        alt={group.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{group.name}</p>
                        <p className="text-xs text-slate-500">{group.memberCount} {t("members")}</p>
                        <p className="text-xs text-green-600">{t(group.nextSession)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/study-groups"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-violet-600 hover:border-violet-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("Create or Join a Group")}</span>
                </Link>
              </div>
            </Card>

            {/* Activity Feed */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                  {t("Activity Feed")}
                </h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-start gap-3">
                    <div className="relative">
                      <Image
                        src={activity.user.image}
                        alt={activity.user.name}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center`}>
                        <activity.icon className={`w-3 h-3 ${activity.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium text-slate-900 dark:text-white">{activity.user.name}</span>{" "}
                        {t(activity.content)}
                      </p>
                      <p className={`text-xs mt-0.5 ${activity.time === "Live" ? "text-red-500 font-medium" : "text-slate-500"}`}>
                        {activity.time === "Live" && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />}
                        {activity.time === "Live" ? t("Live") : activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                  {t("Community Stats")}
                </h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t("Total Members")}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">1,245</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t("Active Discussions")}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{328 + posts.length}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t("Problems Solved")}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">5,723</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Contributors */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                  {t("Top Contributors")}
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {topContributors.map((contributor, index) => (
                  <div
                    key={contributor.name}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="relative">
                      <Image
                        src={contributor.image}
                        alt={contributor.name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-xl object-cover object-[center_20%]"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-violet-400'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{contributor.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{contributor.points.toLocaleString(language)} {t("points")}</p>
                    </div>
                    <Badge
                      variant={
                        contributor.rank === "Gold" ? "warning" :
                        contributor.rank === "Silver" ? "default" : "violet"
                      }
                    >
                      <contributor.icon className="w-3 h-3" />
                      {t(contributor.rank)}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Links */}
            <Card>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t("Quick Links")}</h3>
              <div className="space-y-3">
                <Link href="/learn" className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-themed transition-all text-sm">
                  <BookOpen className="w-5 h-5" />
                  {t("Browse Resources")}
                </Link>
                <Link href="/schedule" className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-themed transition-all text-sm">
                  <Calendar className="w-5 h-5" />
                  {t("Book a Session")}
                </Link>
                <Link href="/support" className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-themed transition-all text-sm">
                  <HelpCircle className="w-5 h-5" />
                  {t("Get Help")}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
