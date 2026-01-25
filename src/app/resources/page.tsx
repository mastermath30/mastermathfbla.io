"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, GlowingOrbs } from "@/components/motion";
import {
  BookOpen,
  Book,
  CheckSquare,
  PlayCircle,
  ExternalLink,
  SquareRadical,
  Shapes,
  Calculator,
  GraduationCap,
  Puzzle,
  Play,
  Download,
  FileText,
  Sparkles,
  Video,
  FileDown,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    icon: Book,
    title: "Lessons & Guides",
    description: "Step-by-step tutorials and study guides for every topic.",
    color: "violet",
    href: "#lessons",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop",
  },
  {
    icon: CheckSquare,
    title: "Practice Problems",
    description: "Hundreds of problems with detailed solutions.",
    color: "green",
    href: "#practice",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
  },
  {
    icon: PlayCircle,
    title: "Video Lessons",
    description: "Watch expert explanations and walkthroughs.",
    color: "purple",
    href: "#videos",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
  },
];

const lessons = [
  {
    icon: Book,
    title: "OpenStax Mathematics",
    description: "Free textbooks for Algebra, Precalculus, Calculus, Statistics, and more.",
    tags: ["Algebra", "Calculus", "Statistics"],
    link: "https://openstax.org/subjects/math",
    color: "violet",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=100&h=100&fit=crop",
  },
  {
    icon: GraduationCap,
    title: "Paul's Online Math Notes",
    description: "Clear explanations with tons of worked examples for Calculus and Algebra.",
    tags: ["Calculus", "Algebra"],
    link: "https://tutorial.math.lamar.edu/",
    color: "blue",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop",
  },
];

const practice = [
  {
    icon: CheckSquare,
    title: "Khan Academy Practice",
    description: "Skill-based practice for every level from arithmetic to calculus.",
    link: "https://www.khanacademy.org/math",
    color: "green",
    image: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=100&h=100&fit=crop",
  },
  {
    icon: Puzzle,
    title: "Art of Problem Solving",
    description: "Challenge problems and deep explanations for competitions.",
    link: "https://artofproblemsolving.com/",
    color: "purple",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=100&h=100&fit=crop",
  },
];

const quizzes = [
  {
    icon: SquareRadical,
    title: "Algebra Basics",
    time: "15 questions • 20 min",
    description: "Test your understanding of equations, expressions, and inequalities.",
    color: "violet",
    difficulty: "Beginner",
  },
  {
    icon: Shapes,
    title: "Geometry Proofs",
    time: "10 questions • 15 min",
    description: "Practice writing and understanding geometric proofs.",
    color: "green",
    difficulty: "Intermediate",
  },
  {
    icon: Calculator,
    title: "Calculus: Derivatives",
    time: "20 questions • 30 min",
    description: "Master the fundamentals of differentiation and derivative rules.",
    color: "blue",
    difficulty: "Advanced",
  },
];

const videos = [
  {
    title: "Essence of Linear Algebra",
    description: "Beautiful visual explanations of linear algebra concepts.",
    channel: "3Blue1Brown",
    link: "https://www.3blue1brown.com/",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop",
    duration: "16 videos",
  },
  {
    title: "Calculus Fundamentals",
    description: "Step-by-step calculus lessons from basics to advanced.",
    channel: "Khan Academy",
    link: "https://www.youtube.com/@khanacademy",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop",
    duration: "40+ hours",
  },
  {
    title: "Quick Math Tutorials",
    description: "Short, focused videos on specific math topics.",
    channel: "PatrickJMT",
    link: "https://www.youtube.com/@patrickjmt",
    thumbnail: "https://images.unsplash.com/photo-1596496050755-c923e73e42e1?w=400&h=225&fit=crop",
    duration: "500+ videos",
  },
];

const downloads = [
  { title: "Algebra Formula Sheet", description: "All essential formulas in one place", icon: "📐" },
  { title: "Trig Identities Cheat Sheet", description: "Quick reference for all trig identities", icon: "📊" },
  { title: "Calculus Reference Guide", description: "Derivatives and integrals reference", icon: "∫" },
  { title: "Practice Worksheet Pack", description: "50+ problems with solutions", icon: "📝" },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Glowing orbs */}
        <GlowingOrbs variant="section" />
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&h=500&fit=crop"
            alt="Library"
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
              <Sparkles className="w-4 h-4" />
              Learning Hub
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Resources</h1>
            <p className="text-slate-200 text-xl">
              Access lessons, videos, quizzes, and downloadable materials to supercharge your learning.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 pb-32">
        {/* Quick Access Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 -mt-8">
          {categories.map((cat) => (
            <Link key={cat.title} href={cat.href}>
              <Card className="h-full cursor-pointer overflow-hidden group" padding="none">
                <div className="relative h-32">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.2), transparent)' }} />
                  <div
                    className="absolute bottom-4 left-4 w-12 h-12 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    style={{ background: 'rgba(var(--theme-primary-rgb), 0.8)', color: 'white' }}
                  >
                    <cat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[var(--theme-primary)] transition-colors">{cat.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{cat.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Lessons Section */}
        <section id="lessons" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }}>
                <Book className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Lessons & Study Guides</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Free, high-quality resources to help you learn</p>
              </div>
            </div>
            <Link href="#" className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all group" style={{ color: 'var(--theme-primary)' }}>
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <a
                key={lesson.title}
                href={lesson.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full hover:border-[var(--theme-primary)]/30 group" interactive>
                  <div className="flex items-start gap-4">
                    <Image
                      src={lesson.image}
                      alt={lesson.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-[var(--theme-primary)] transition-colors">{lesson.title}</h4>
                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-[var(--theme-primary)] transition-colors" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">{lesson.description}</p>
                      <div className="flex gap-2 mt-3">
                        {lesson.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                            style={{ 
                              background: 'rgba(var(--theme-primary-rgb), 0.1)',
                              color: 'var(--theme-primary)'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Practice Section */}
        <section id="practice" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }}>
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Practice Problems</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Test your knowledge and improve your skills</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {practice.map((item) => (
              <a
                key={item.title}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full hover:border-green-200 group">
                  <div className="flex items-start gap-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-themed transition-colors">{item.title}</h4>
                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Quizzes Section */}
        <section id="quizzes" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interactive Quizzes</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Test your knowledge and improve your skills</p>
              </div>
            </div>
            <Link href="#" className="text-primary-themed text-sm font-medium hover:underline">View all</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.title} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-200 text-xs font-medium rounded-bl-xl border-l border-b border-slate-200 dark:border-slate-700">
                  {quiz.difficulty}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <quiz.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{quiz.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{quiz.time}</p>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{quiz.description}</p>
                <Button className="w-full">
                  <Play className="w-4 h-4" />
                  Start Quiz
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Videos Section */}
        <section id="videos" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Video Lessons</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Visual explanations to help concepts click</p>
              </div>
            </div>
            <Link href="#" className="text-primary-themed text-sm font-medium hover:underline">View all</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <a
                key={video.title}
                href={video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card padding="none" className="overflow-hidden group">
                  <div className="relative aspect-video">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                        <Play className="w-8 h-8 ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {video.duration}
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 border border-slate-700 text-slate-200 text-xs font-medium rounded">
                      {video.channel}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-themed transition-colors">{video.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{video.description}</p>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Downloads Section */}
        <Card id="downloads" className="overflow-hidden" padding="none">
          <div className="p-6 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-slate-300 dark:to-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-400/20 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Downloads</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Cheat sheets, worksheets, and reference guides</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {downloads.map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">{item.description}</p>
                  <Button variant="outline" size="sm" className="w-full group-hover:border-slate-500 group-hover:text-primary-themed">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
