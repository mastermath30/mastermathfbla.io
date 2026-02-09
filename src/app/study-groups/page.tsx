"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Input, Textarea, Select } from "@/components/Input";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, GlowingOrbs, PageWrapper, HeroText } from "@/components/motion";
import { useTranslations } from "@/components/LanguageProvider";
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Video,
  MessageCircle,
  Crown,
  Star,
  UserPlus,
  Bell,
  Settings,
  ChevronRight,
  Sparkles,
  BookOpen,
  Target,
  Trophy,
  Filter,
  X,
  Check,
  Share2,
  Copy,
  Globe,
  Lock,
  Zap,
} from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: string;
  memberCount: number;
  maxMembers: number;
  schedule: string;
  nextSession: string;
  image: string;
  isOnline: boolean;
  isPrivate: boolean;
  host: {
    name: string;
    image: string;
  };
  members: {
    name: string;
    image: string;
  }[];
  tags: string[];
  isMember?: boolean;
}

const SAMPLE_GROUPS: StudyGroup[] = [
  {
    id: "1",
    name: "AP Calculus BC Study Group",
    description: "Master calculus together! We cover derivatives, integrals, series, and exam prep. Weekly problem-solving sessions and peer tutoring.",
    subject: "Calculus",
    level: "Advanced",
    memberCount: 24,
    maxMembers: 30,
    schedule: "Saturdays at 10:00 AM",
    nextSession: "Tomorrow at 10:00 AM",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
    isOnline: true,
    isPrivate: false,
    host: {
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    members: [
      { name: "Alex", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop" },
      { name: "Maria", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop" },
      { name: "David", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
    ],
    tags: ["AP Exam", "Derivatives", "Integrals"],
    isMember: true,
  },
  {
    id: "2",
    name: "SAT Math Prep",
    description: "Prepare for the SAT Math section with practice tests, strategy sessions, and targeted review. Score 750+ guaranteed with consistent attendance!",
    subject: "SAT Prep",
    level: "Intermediate",
    memberCount: 18,
    maxMembers: 25,
    schedule: "Wednesdays at 4:00 PM",
    nextSession: "Wednesday at 4:00 PM",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
    isOnline: true,
    isPrivate: false,
    host: {
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    members: [
      { name: "Emma", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=50&h=50&fit=crop" },
      { name: "James", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop" },
    ],
    tags: ["SAT", "Test Prep", "Strategy"],
  },
  {
    id: "3",
    name: "Geometry Proofs Workshop",
    description: "Learn to write rigorous mathematical proofs. We focus on two-column proofs, paragraph proofs, and indirect proofs. Perfect for competition math!",
    subject: "Geometry",
    level: "Intermediate",
    memberCount: 12,
    maxMembers: 20,
    schedule: "Tuesdays & Thursdays at 5:00 PM",
    nextSession: "Tuesday at 5:00 PM",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop",
    isOnline: false,
    isPrivate: false,
    host: {
      name: "Emma Rodriguez",
      image: "https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=100&h=100&fit=crop",
    },
    members: [
      { name: "Sophie", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" },
    ],
    tags: ["Proofs", "Competition", "AMC"],
  },
  {
    id: "4",
    name: "Statistics & Data Science",
    description: "Explore statistics from basics to advanced topics. We use Python and R for real data analysis projects. Great for future data scientists!",
    subject: "Statistics",
    level: "Advanced",
    memberCount: 15,
    maxMembers: 20,
    schedule: "Fridays at 3:00 PM",
    nextSession: "Friday at 3:00 PM",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    isOnline: true,
    isPrivate: true,
    host: {
      name: "Priya Patel",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop",
    },
    members: [
      { name: "Kevin", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop" },
      { name: "Lisa", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop" },
    ],
    tags: ["Python", "R", "Data Analysis"],
  },
  {
    id: "5",
    name: "Algebra Fundamentals",
    description: "Strengthen your algebra foundation! Perfect for students who want to build a solid base before moving to advanced math.",
    subject: "Algebra",
    level: "Beginner",
    memberCount: 28,
    maxMembers: 35,
    schedule: "Mondays at 6:00 PM",
    nextSession: "Monday at 6:00 PM",
    image: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=400&h=200&fit=crop",
    isOnline: true,
    isPrivate: false,
    host: {
      name: "Alex Thompson",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    members: [
      { name: "Sam", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
      { name: "Nina", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=50&h=50&fit=crop" },
      { name: "Tom", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop" },
    ],
    tags: ["Equations", "Functions", "Basics"],
  },
];

const SUBJECTS = ["All Subjects", "Calculus", "Algebra", "Geometry", "Statistics", "SAT Prep", "Trigonometry"];
const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const levelColors: Record<string, "success" | "info" | "purple"> = {
  Beginner: "success",
  Intermediate: "info",
  Advanced: "purple",
};

export default function StudyGroupsPage() {
  const { t } = useTranslations();
  const [groups, setGroups] = useState<StudyGroup[]>(SAMPLE_GROUPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState<StudyGroup | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<string[]>(["1"]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === "All Subjects" || group.subject === selectedSubject;
    const matchesLevel = selectedLevel === "All Levels" || group.level === selectedLevel;
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const myGroups = groups.filter(g => joinedGroups.includes(g.id));

  const handleJoinGroup = (groupId: string) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter(id => id !== groupId));
    } else {
      setJoinedGroups([...joinedGroups, groupId]);
    }
  };

  return (
    <PageWrapper>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <GlowingOrbs />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <SectionLabel icon={Users}>{t("Study Groups")}</SectionLabel>
            </FadeIn>

            <HeroText>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Learn Together,{" "}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Succeed Together
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                Join study groups with peers who share your goals. Collaborate, practice, and master math concepts together.
              </p>
            </HeroText>

            {/* Stats */}
            <FadeIn delay={0.2}>
              <div className="flex flex-wrap gap-8 mt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Users className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">50+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Active Groups</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <UserPlus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">500+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Members</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">100+</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Sessions/Week</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* My Groups Section */}
        {myGroups.length > 0 && (
          <section className="py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    My Groups
                  </h2>
                  <Link href="#all-groups">
                    <Button variant="ghost" size="sm">
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myGroups.map((group) => (
                    <motion.div
                      key={group.id}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-violet-200 dark:border-violet-800 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setShowGroupDetail(group)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Image
                            src={group.host.image}
                            alt={group.host.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{group.name}</h3>
                            <p className="text-xs text-slate-500">Hosted by {group.host.name}</p>
                          </div>
                          <Badge color="violet">Member</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {group.nextSession}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {group.memberCount}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Search & Filters */}
        <section className="py-8 px-4" id="all-groups">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search groups by name, topic, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Filter className="w-5 h-5" />
                    Filters
                  </button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Group
                  </Button>
                </div>
              </div>

              {/* Filter Options */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECTS.map((subject) => (
                            <button
                              key={subject}
                              onClick={() => setSelectedSubject(subject)}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selectedSubject === subject
                                  ? "bg-violet-500 text-white"
                                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                              }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Level</label>
                        <div className="flex flex-wrap gap-2">
                          {LEVELS.map((level) => (
                            <button
                              key={level}
                              onClick={() => setSelectedLevel(level)}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selectedLevel === level
                                  ? "bg-violet-500 text-white"
                                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Count */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Showing {filteredGroups.length} of {groups.length} groups
              </p>
            </FadeIn>

            {/* Groups Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => (
                <FadeIn key={group.id} delay={index * 0.05}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-32">
                      <Image
                        src={group.image}
                        alt={group.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 flex gap-2">
                        <Badge color={levelColors[group.level] || "default"}>{group.level}</Badge>
                        {group.isOnline ? (
                          <Badge color="success" className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Online
                          </Badge>
                        ) : (
                          <Badge color="info" className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> In-Person
                          </Badge>
                        )}
                        {group.isPrivate && (
                          <Badge color="default" className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{group.name}</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{group.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {group.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Host & Schedule */}
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          src={group.host.image}
                          alt={group.host.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{group.host.name}</p>
                          <p className="text-xs text-slate-500">{group.schedule}</p>
                        </div>
                      </div>

                      {/* Members & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            {group.members.slice(0, 3).map((member, i) => (
                              <Image
                                key={i}
                                src={member.image}
                                alt={member.name}
                                width={24}
                                height={24}
                                className="rounded-full border-2 border-white dark:border-slate-800"
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                            {group.memberCount}/{group.maxMembers}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowGroupDetail(group)}
                            className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinGroup(group.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              joinedGroups.includes(group.id)
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-violet-500 text-white hover:bg-violet-600"
                            }`}
                          >
                            {joinedGroups.includes(group.id) ? (
                              <>
                                <Check className="w-4 h-4 inline mr-1" />
                                Joined
                              </>
                            ) : (
                              "Join"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No groups found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Try adjusting your filters or create a new group!</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Group
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Create Group Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateGroupModal onClose={() => setShowCreateModal(false)} onSubmit={(newGroup) => {
              setGroups([...groups, { ...newGroup, id: Date.now().toString() }]);
              setShowCreateModal(false);
            }} />
          )}
        </AnimatePresence>

        {/* Group Detail Modal */}
        <AnimatePresence>
          {showGroupDetail && (
            <GroupDetailModal 
              group={showGroupDetail} 
              onClose={() => setShowGroupDetail(null)}
              isJoined={joinedGroups.includes(showGroupDetail.id)}
              onJoin={() => handleJoinGroup(showGroupDetail.id)}
            />
          )}
        </AnimatePresence>
      </main>
    </PageWrapper>
  );
}

function CreateGroupModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (group: Omit<StudyGroup, "id">) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Algebra");
  const [level, setLevel] = useState("Intermediate");
  const [schedule, setSchedule] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState(20);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;

    onSubmit({
      name,
      description,
      subject,
      level,
      schedule: schedule || "TBD",
      nextSession: "TBD",
      memberCount: 1,
      maxMembers,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
      isOnline,
      isPrivate,
      host: {
        name: "You",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      },
      members: [],
      tags: [subject, level],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Study Group</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AP Calculus Study Squad"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will your group focus on?"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {SUBJECTS.filter(s => s !== "All Subjects").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {LEVELS.filter(l => l !== "All Levels").map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Schedule</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g., Saturdays at 10:00 AM"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Members</label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              min={2}
              max={100}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOnline}
                onChange={(e) => setIsOnline(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Online Group</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Private (Invite Only)</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !description.trim()} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GroupDetailModal({ group, onClose, isJoined, onJoin }: { group: StudyGroup; onClose: () => void; isJoined: boolean; onJoin: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://mastermath.io/study-groups/${group.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header Image */}
        <div className="relative h-48">
          <Image src={group.image} alt={group.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 mb-2">
              <Badge color={levelColors[group.level] || "default"}>{group.level}</Badge>
              {group.isOnline ? (
                <Badge color="success">Online</Badge>
              ) : (
                <Badge color="info">In-Person</Badge>
              )}
              {group.isPrivate && <Badge color="default"><Lock className="w-3 h-3" /></Badge>}
            </div>
            <h2 className="text-2xl font-bold text-white">{group.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Host */}
          <div className="flex items-center gap-4">
            <Image
              src={group.host.image}
              alt={group.host.name}
              width={56}
              height={56}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{group.host.name}</p>
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-sm text-slate-500">Group Host</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About</h3>
            <p className="text-slate-600 dark:text-slate-400">{group.description}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Calendar className="w-5 h-5 text-violet-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Schedule</p>
                <p className="text-xs text-slate-500">{group.schedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Next Session</p>
                <p className="text-xs text-slate-500">{group.nextSession}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Members</p>
                <p className="text-xs text-slate-500">{group.memberCount} / {group.maxMembers}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Subject</p>
                <p className="text-xs text-slate-500">{group.subject}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Members</h3>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {group.members.slice(0, 5).map((member, i) => (
                  <Image
                    key={i}
                    src={member.image}
                    alt={member.name}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white dark:border-slate-900"
                  />
                ))}
              </div>
              {group.memberCount > 5 && (
                <span className="text-sm text-slate-500">+{group.memberCount - 5} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={copyInviteLink}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share"}
          </button>
          <Button onClick={onJoin} className="flex-1">
            {isJoined ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Joined
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Join Group
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
