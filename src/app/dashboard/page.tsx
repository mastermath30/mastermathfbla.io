"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { StatCard } from "@/components/StatCard";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, GlowingOrbs } from "@/components/motion";
import { useTranslations } from "@/components/LanguageProvider";
import {
  Clock,
  CheckCircle2,
  Flame,
  Trophy,
  Plus,
  BarChart3,
  Calculator,
  Infinity,
  PieChart,
  FunctionSquare,
  MessageCircle,
  CalendarCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const chartData = [
  { week: "Week 1", problems: 15, accuracy: 65 },
  { week: "Week 2", problems: 22, accuracy: 72 },
  { week: "Week 3", problems: 18, accuracy: 78 },
  { week: "Week 4", problems: 27, accuracy: 81 },
  { week: "This Week", problems: 32, accuracy: 87 },
];

const challenges = [
  { icon: Calculator, title: "Calculus: Derivatives", due: "Due in 2 days", count: "20 problems", progress: 65, completed: 13, total: 20, color: "violet" as const },
  { icon: Infinity, title: "Linear Algebra Basics", due: "Due in 5 days", count: "15 problems", progress: 40, completed: 6, total: 15, color: "green" as const },
  { icon: PieChart, title: "Statistics Quiz", due: "Starts in 3 days", count: "30 min • 10 questions", progress: 0, color: "yellow" as const, isQuiz: true },
  { icon: FunctionSquare, title: "Advanced Functions", due: "Due in 1 week", count: "10 problems", progress: 20, completed: 2, total: 10, color: "purple" as const },
];

const activities = [
  { icon: CheckCircle2, title: "Completed: Derivatives Practice", time: "2 hours ago", xp: "+50 XP", badge: "New Badge: Calculus Explorer", color: "violet" },
  { icon: MessageCircle, title: "New reply on your question", time: "5 hours ago", preview: '"Great question! Have you tried using the formula for..."', color: "purple" },
  { icon: CalendarCheck, title: "Session Booked: Calculus Review", time: "Yesterday", details: "Monday, 2:00 PM - 3:30 PM with Michael Chen", color: "green" },
];

const initialGoals = [
  { title: "Complete Calculus Module", status: "in_progress", progress: 75, label: "75%" },
  { title: "Solve 50 Practice Problems", status: "needs_work", progress: 30, label: "15/50" },
  { title: "Attend 3 Study Sessions", status: "completed", progress: 100, label: "3/3" },
];

export default function DashboardPage() {
  const { t } = useTranslations();
  const [userName, setUserName] = useState("Student");
  const [mounted, setMounted] = useState(false);
  const [goals, setGoals] = useState(initialGoals);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    checkDarkMode();
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    try {
      const profile = JSON.parse(localStorage.getItem("mm_profile") || "null");
      if (profile?.firstName) {
        setUserName(profile.firstName.charAt(0).toUpperCase() + profile.firstName.slice(1));
      }
    } catch {
      // Ignore
    }
    try {
      const storedGoals = JSON.parse(localStorage.getItem("mm_goals") || "null");
      if (Array.isArray(storedGoals) && storedGoals.length) {
        setGoals(storedGoals);
      }
    } catch {
      // Ignore
    }
    
    return () => observer.disconnect();
  }, []);

  const handleAddGoal = () => {
    const title = goalTitle.trim();
    const target = Number(goalTarget);
    if (!title || !target || Number.isNaN(target) || target <= 0) {
      return;
    }
    const newGoal = {
      title,
      status: "in_progress",
      progress: 0,
      label: `0/${target}`,
      target,
      completed: 0,
    };
    const updatedGoals = [newGoal, ...goals];
    setGoals(updatedGoals);
    localStorage.setItem("mm_goals", JSON.stringify(updatedGoals));
    setGoalTitle("");
    setGoalTarget("");
    setShowGoalModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Glowing orbs */}
        <GlowingOrbs variant="section" />
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&h=400&fit=crop"
            alt="Math background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 35%, transparent), transparent)" }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-slate-900 dark:text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/20 dark:bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                {t("Learning Dashboard")}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                {t("Welcome back,")} {userName}!
              </h1>
              <p className="text-slate-900 dark:text-slate-200 text-base md:text-lg">{t("Track your progress and stay on top of your learning journey.")}</p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 md:gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900/20 dark:bg-white/20 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">7</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{t("Day Streak")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900/20 dark:bg-white/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{t("Mastery")}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setShowGoalModal(true)}>
                <Plus className="w-4 h-4" />
                {t("New Goal")}
              </Button>
              <Link href="/dashboard#learning-progress">
                <Button 
                  style={{ 
                    backgroundColor: 'var(--theme-primary)', 
                    color: 'white',
                    borderColor: 'var(--theme-primary)'
                  }}
                  className="hover:opacity-90"
                >
                  <BarChart3 className="w-4 h-4" />
                  {t("Analytics")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-32">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-8">
          <StatCard
            icon={Clock}
            label="Hours Studied"
            value="24.5"
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            iconColor="text-violet-500"
            subtext="12% this week"
            subtextColor="text-green-600"
            trend="up"
          />
          <StatCard
            icon={CheckCircle2}
            label="Problems Solved"
            value="148"
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-500"
            subtext="+32 this week"
            subtextColor="text-green-600"
            trend="up"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value="7 days"
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-500"
            subtext="Keep it going!"
            subtextColor="text-yellow-600"
          />
          <StatCard
            icon={Trophy}
            label="Math Mastery"
            value="87%"
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-500"
            subtext="Advanced Level"
            subtextColor="text-purple-600"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <div className="lg:col-span-2" id="learning-progress">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("Learning Progress")}</CardTitle>
                    <CardDescription>{t("Your weekly performance")}</CardDescription>
                  </div>
                  <select className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option>{t("This Month")}</option>
                    <option>{t("Last Month")}</option>
                    <option>{t("Last 3 Months")}</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {mounted ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorProblems" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                        <XAxis dataKey="week" tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#64748b" }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#64748b" }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#64748b" }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#0f172a" : "white",
                            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: "0 10px 40px -10px rgb(0 0 0 / 0.1)",
                          }}
                          labelStyle={{
                            color: isDark ? "#f8fafc" : "#0f172a",
                          }}
                          itemStyle={{
                            color: isDark ? "#f8fafc" : "#0f172a",
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ 
                            color: isDark ? "#94a3b8" : "#64748b",
                            paddingTop: "20px"
                          }} 
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="problems"
                          name="Problems Solved"
                          stroke="#7c3aed"
                          strokeWidth={3}
                          fill="url(#colorProblems)"
                          dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="accuracy"
                          name="Accuracy %"
                          stroke="#22c55e"
                          strokeWidth={3}
                          fill="url(#colorAccuracy)"
                          dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Challenges */}
          <Card padding="none" className="overflow-hidden" id="challenges">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>{t("Math Challenges")}</CardTitle>
                  <CardDescription>{t("Upcoming assignments")}</CardDescription>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {challenges.map((challenge) => (
                <div key={challenge.title} className="p-4 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${challenge.color}-100 flex items-center justify-center text-${challenge.color}-500 flex-shrink-0`}>
                      <challenge.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white">{challenge.title}</h4>
                      <p className={`text-xs mt-0.5 ${challenge.isQuiz ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        {challenge.due} • {challenge.count}
                      </p>
                      {!challenge.isQuiz && (
                        <div className="mt-2">
                          <ProgressBar value={challenge.progress} color={challenge.color} size="sm" />
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{challenge.completed}/{challenge.total} completed</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => document.getElementById('challenges')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-themed text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
                {t("View all challenges")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Activity */}
          <Card className="overflow-hidden" id="recent-activity">
            <CardHeader className="bg-slate-100 dark:bg-slate-900 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>{t("Recent Activity")}</CardTitle>
                  <CardDescription>{t("Your latest learning actions")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className={`w-10 h-10 rounded-xl bg-${activity.color}-100 flex items-center justify-center text-${activity.color}-500 flex-shrink-0`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white">{activity.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{activity.time}</p>
                      {activity.xp && (
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-primary-themed text-xs font-medium bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">{activity.xp}</span>
                          <span className="text-slate-500 dark:text-slate-400 text-xs">{activity.badge}</span>
                        </div>
                      )}
                      {activity.preview && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic">{activity.preview}</p>
                      )}
                      {activity.details && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => document.getElementById('recent-activity')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-themed text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all mt-4">
                {t("View all activity")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>

          {/* Study Goals */}
          <Card padding="none" className="overflow-hidden" id="study-goals">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-100 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>{t("Study Goals")}</CardTitle>
                  <CardDescription>{t("Track your learning objectives")}</CardDescription>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowGoalModal(true)}>
                <Plus className="w-4 h-4" />
                {t("Add Goal")}
              </Button>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {goals.map((goal) => (
                <div key={goal.title} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-white">{goal.title}</h4>
                    <Badge
                      variant={
                        goal.status === "completed" ? "success" :
                        goal.status === "needs_work" ? "warning" : "info"
                      }
                    >
                      {goal.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                      {goal.status === "needs_work" && <AlertCircle className="w-3 h-3" />}
                      {goal.status === "in_progress" && <Loader2 className="w-3 h-3 animate-spin" />}
                      {goal.status === "completed" ? t("Completed") :
                       goal.status === "needs_work" ? t("Needs Work") : t("In Progress")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar
                        value={goal.progress}
                        color={
                          goal.status === "completed" ? "green" :
                          goal.status === "needs_work" ? "yellow" : "violet"
                        }
                      />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">{goal.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Motivational Banner */}
          <div className="mt-8 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=300&fit=crop"
              alt="Students studying"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/85 to-white/75 dark:from-slate-900/90 dark:to-slate-900/70" />
          </div>
          <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-slate-900 dark:text-white text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">{t("Keep up the great work!")}</h3>
              <p className="text-slate-700 dark:text-slate-200">{t("You're on track to complete your weekly goals. Just 3 more problems to go!")}</p>
            </div>
              <Link href="/resources">
                <Button className="shrink-0">
                  {t("Continue Learning")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
          </div>
        </div>
      </main>

      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowGoalModal(false)}
          />
          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("Add Goal")}</h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 touch-manipulation"
                type="button"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("Goal Title")}</label>
                <input
                  value={goalTitle}
                  onChange={(event) => setGoalTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-base text-slate-700 dark:text-slate-200"
                  placeholder={t("Enter a goal title")}
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("Target Problems")}</label>
                <input
                  type="number"
                  min="1"
                  value={goalTarget}
                  onChange={(event) => setGoalTarget(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-base text-slate-700 dark:text-slate-200"
                  placeholder="50"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 min-h-[48px]" type="button" onClick={() => setShowGoalModal(false)}>
                  {t("Cancel")}
                </Button>
                <Button className="flex-1 min-h-[48px]" type="button" onClick={handleAddGoal}>
                  {t("Create Goal")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
