"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Textarea, Select } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, GlowingOrbs } from "@/components/motion";
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
} from "lucide-react";

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
];

function formatTimeAgo(iso: string) {
  const ts = iso ? new Date(iso).getTime() : 0;
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");

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
        const first = profile.firstName?.charAt(0).toUpperCase() + profile.firstName?.slice(1) || "";
        const lastInitial = profile.lastName ? profile.lastName.charAt(0).toUpperCase() + "." : "";
        setUserName([first, lastInitial].filter(Boolean).join(" ") || "User");
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const body = (form.elements.namedItem("body") as HTMLTextAreaElement).value.trim();
    const tag = (form.elements.namedItem("tag") as HTMLSelectElement).value;

    if (!title || !body) {
      setError("Please fill in all fields.");
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
          <div className="absolute inset-0 bg-slate-950/80" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 35%, transparent), transparent)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium text-white mb-4">
              <MessageCircle className="w-4 h-4" />
              Discussion Forum
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Community</h1>
            <p className="text-slate-200 text-xl">
              Connect with fellow math enthusiasts, ask questions, and help others learn.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <GlowingOrbs variant="subtle" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forum Section */}
          <div className="lg:col-span-2">
            <Card padding="none" className="overflow-hidden">
              <div className="p-6 border-b border-slate-700 bg-slate-900">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle>Math Help Forum</CardTitle>
                      <CardDescription>Ask questions, share explanations, help others learn</CardDescription>
                    </div>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    New Post
                  </Button>
                </div>

                {/* Post Form */}
                <div id="ask" className="p-5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                    Ask a Question
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Input name="title" placeholder="e.g., How do I factor this quadratic?" />
                      </div>
                      <Select name="tag" options={tagOptions} />
                    </div>
                    <Textarea
                      name="body"
                      rows={4}
                      placeholder="Include the problem, what you've tried, and where you're stuck."
                    />
                    <div className="flex items-center justify-between">
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <Button type="submit" className="ml-auto">
                        Post Question
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Posts */}
              <div>
                <div className="px-6 py-4 border-b border-slate-700 bg-slate-950">
                  <h3 className="font-semibold text-sm text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Latest Posts
                  </h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {sortedPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-400">No posts yet. Be the first to ask a question!</p>
                    </div>
                  ) : (
                    sortedPosts.map((post) => (
                      <div key={post.id} className="p-5 hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0" style={{ color: "var(--theme-primary)" }}>
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-semibold text-slate-900 dark:text-white hover:text-primary-themed cursor-pointer transition-colors">{post.title}</h4>
                              <span className="text-slate-400 text-xs shrink-0">
                                {formatTimeAgo(post.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant={tagColors[post.tag] || "default"}>{post.tag}</Badge>
                              <span className="text-slate-400 text-xs">by {post.author}</span>
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
          <div className="space-y-6">
            {/* Stats */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-900">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                  Community Stats
                </h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Total Members</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">1,245</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Active Discussions</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{328 + posts.length}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Problems Solved</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">5,723</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Contributors */}
            <Card padding="none" className="overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-900">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                  Top Contributors
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
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-violet-400'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{contributor.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{contributor.points.toLocaleString()} points</p>
                    </div>
                    <Badge
                      variant={
                        contributor.rank === "Gold" ? "warning" :
                        contributor.rank === "Silver" ? "default" : "violet"
                      }
                    >
                      <contributor.icon className="w-3 h-3" />
                      {contributor.rank}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Links */}
            <Card>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/resources" className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-themed transition-all text-sm">
                  <BookOpen className="w-5 h-5" />
                  Browse Resources
                </Link>
                <Link href="/schedule" className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-themed transition-all text-sm">
                  <Calendar className="w-5 h-5" />
                  Book a Session
                </Link>
                <Link href="/support" className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-themed transition-all text-sm">
                  <HelpCircle className="w-5 h-5" />
                  Get Help
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
