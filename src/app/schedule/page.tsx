"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, GlowingOrbs } from "@/components/motion";
import { useTranslations } from "@/components/LanguageProvider";
import {
  CalendarCheck,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  SquareRadical,
  Infinity,
  Calculator,
  Star,
  Users,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";

const sessions = [
  {
    icon: SquareRadical,
    title: "Calculus Study Group: Integrals",
    time: "Tomorrow, 3:00 PM - 4:30 PM",
    tutor: "Ayaan Oberoi",
    status: "confirmed",
    color: "violet",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop",
  },
  {
    icon: Infinity,
    title: "Linear Algebra: Matrix Operations",
    time: "Friday, 5:00 PM - 6:30 PM",
    tutor: "Malhar Pawar",
    status: "pending",
    color: "purple",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop",
  },
  {
    icon: Calculator,
    title: "Algebra Review: Quadratics",
    time: "Monday, 2:00 PM - 3:30 PM",
    tutor: "Michael Chen",
    status: "confirmed",
    color: "blue",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop",
  },
];

const tutors = [
  {
    name: "Ayaan Oberoi",
    initials: "SJ",
    subjects: "Calculus, Statistics, Differential Equations",
    rating: 4.9,
    reviews: 128,
    price: 45,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    available: true,
    specialties: ["AP Calculus BC", "College Statistics", "Research Methods"],
  },
  {
    name: "Emma Rodriguez",
    initials: "ER",
    subjects: "Precalculus, Geometry, Algebra",
    rating: 4.9,
    reviews: 112,
    price: 38,
    image: "https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=200&h=200&fit=crop",
    available: true,
    specialties: ["Geometry Proofs", "Trigonometry", "Pre-Calc"],
  },
  {
    name: "Malhar Pawar",
    initials: "PP",
    subjects: "Linear Algebra, Geometry, Discrete Math",
    rating: 4.8,
    reviews: 96,
    price: 35,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
    available: true,
    specialties: ["Linear Algebra", "Proof Writing", "Competition Math"],
  },
];

const studyGroups = [
  {
    title: "AP Calculus BC Study Group",
    schedule: "Saturdays at 10:00 AM",
    description: "Weekly review sessions covering AP Calculus BC topics. Great for exam prep!",
    members: 8,
    maxMembers: 12,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
  },
  {
    title: "SAT Math Prep",
    schedule: "Wednesdays at 4:00 PM",
    description: "Practice SAT math problems together and share test-taking strategies.",
    members: 14,
    maxMembers: 20,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
  },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currentDate = new Date();

type ScheduleItem = {
  time: string;
  title: string;
  type?: "session" | "study" | "deadline";
};

const scheduleTemplates: Array<{ day: number; items: ScheduleItem[] }> = [
  {
    day: 2,
    items: [
      { time: "3:00 PM", title: "Calculus Study Group", type: "study" },
      { time: "7:00 PM", title: "Homework Check-in", type: "session" },
    ],
  },
  {
    day: 5,
    items: [{ time: "5:00 PM", title: "Linear Algebra Workshop", type: "study" }],
  },
  {
    day: 8,
    items: [
      { time: "2:00 PM", title: "Algebra Review Session", type: "session" },
      { time: "6:30 PM", title: "Quiz Prep Block", type: "deadline" },
    ],
  },
  {
    day: 12,
    items: [{ time: "4:00 PM", title: "SAT Math Prep", type: "study" }],
  },
  {
    day: 18,
    items: [{ time: "1:00 PM", title: "Office Hours", type: "session" }],
  },
  {
    day: 22,
    items: [{ time: "6:00 PM", title: "Practice Test Review", type: "deadline" }],
  },
  {
    day: 27,
    items: [{ time: "3:30 PM", title: "Statistics Project Checkpoint", type: "deadline" }],
  },
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

const getWeekDates = (date: Date) => {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
  });
};

const getScheduleItemsForMonth = (year: number, month: number) => {
  return scheduleTemplates.flatMap(({ day, items }) =>
    items.map((item) => ({
      ...item,
      date: new Date(year, month, day),
    }))
  );
};

const getScheduleItemsForDate = (date: Date) => {
  return getScheduleItemsForMonth(date.getFullYear(), date.getMonth()).filter((item) =>
    isSameDay(item.date, date)
  );
};

// Generate realistic time slots
const generateTimeSlots = (): string[] => {
  const slots = [];
  // Morning slots: 8 AM - 12 PM
  for (let hour = 8; hour < 12; hour++) {
    slots.push(`${hour}:00 AM`);
    if (hour < 11) slots.push(`${hour}:30 AM`);
  }
  slots.push("12:00 PM");
  slots.push("12:30 PM");
  
  // Afternoon/Evening slots: 1 PM - 8 PM
  for (let hour = 1; hour <= 8; hour++) {
    slots.push(`${hour}:00 PM`);
    if (hour < 8) slots.push(`${hour}:30 PM`);
  }
  return slots;
};

// Seeded random function for consistent results
const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

// Get available slots with consistent seeding
const getSeededAvailableSlots = (tutorName: string, dayOfWeek: number, allSlots: string[], availability: number = 0.7): string[] => {
  return allSlots.filter((slot, index) => {
    const seed = `${tutorName}-${dayOfWeek}-${slot}-${index}`;
    return seededRandom(seed) < availability;
  });
};

// Check if a day is fully booked (no available slots)
const isDayFullyBooked = (tutorName: string, dayOfWeek: number): boolean => {
  const seed = `${tutorName}-${dayOfWeek}-fullbook`;
  return seededRandom(seed) < 0.15; // 15% chance of being fully booked
};

const ALL_TIME_SLOTS = generateTimeSlots();

interface BookedSession {
  id: string;
  tutorName: string;
  tutorImage: string;
  subjects: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  status: "confirmed" | "pending";
}

export default function SchedulePage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [countdown, setCountdown] = useState("--:--:--");
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<typeof tutors[0] | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("1 hour");
  const [bookingMonth, setBookingMonth] = useState(currentDate.getMonth());
  const [bookingYear, setBookingYear] = useState(currentDate.getFullYear());

  // Calculate price based on duration
  const getDurationHours = (duration: string): number => {
    switch (duration) {
      case "1 hour": return 1;
      case "1.5 hours": return 1.5;
      case "2 hours": return 2;
      default: return 1;
    }
  };

  const calculatePrice = (): number => {
    if (!selectedTutor) return 0;
    return selectedTutor.price * getDurationHours(selectedDuration);
  };

  // Get all time slots with availability info for selected date
  const getAllTimeSlotsWithAvailability = (): Array<{slot: string, available: boolean}> => {
    if (!selectedTutor || !bookingDate) return ALL_TIME_SLOTS.map(slot => ({slot, available: false}));
    
    const dayOfWeek = bookingDate.getDay();
    
    // Check if day is fully booked
    if (isDayFullyBooked(selectedTutor.name, dayOfWeek)) {
      return ALL_TIME_SLOTS.map(slot => ({slot, available: false}));
    }
    
    // Get availability based on tutor and day patterns
    const availabilityRate = getTutorAvailability(selectedTutor.name, dayOfWeek);
    const availableSlots = getSeededAvailableSlots(selectedTutor.name, dayOfWeek, ALL_TIME_SLOTS, availabilityRate);
    
    return ALL_TIME_SLOTS.map(slot => ({
      slot,
      available: availableSlots.includes(slot)
    }));
  };

  // Get tutor availability rate based on patterns
  const getTutorAvailability = (tutorName: string, dayOfWeek: number): number => {
    const patterns = {
      "Ayaan Oberoi": [0.3, 0.8, 0.6, 0.7, 0.8, 0.5, 0.4], // Sunday to Saturday
      "Malhar Pawar": [0.4, 0.6, 0.8, 0.7, 0.5, 0.9, 0.7],
      "Michael Chen": [0.4, 0.7, 0.8, 0.9, 0.7, 0.6, 0.3],
      "Emma Rodriguez": [0.3, 0.7, 0.6, 0.8, 0.7, 0.5, 0.8],
      "Alex Thompson": [0.5, 0.4, 0.8, 0.6, 0.9, 0.7, 0.6]
    };
    return patterns[tutorName as keyof typeof patterns]?.[dayOfWeek] || 0.6;
  };

  // Get available time slots for selected date (for compatibility)
  const getAvailableTimeSlots = (): string[] => {
    return getAllTimeSlotsWithAvailability()
      .filter(({available}) => available)
      .map(({slot}) => slot);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    // Check if user is logged in - check both methods for compatibility
    const session = localStorage.getItem("mm_session");
    const isLoggedInFlag = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!session || isLoggedInFlag === "true");
    
    // Load booked sessions from localStorage
    const savedBookings = localStorage.getItem("mm_booked_sessions");
    if (savedBookings) {
      try {
        setBookedSessions(JSON.parse(savedBookings));
      } catch {
        // Ignore parse errors
      }
    }

    // Check if user came from tutors page with selected tutor
    const urlParams = new URLSearchParams(window.location.search);
    const shouldBook = urlParams.get('book');
    const selectedTutorData = localStorage.getItem("selectedTutor");
    
    if (shouldBook && selectedTutorData && isLoggedIn) {
      try {
        const tutorData = JSON.parse(selectedTutorData);
        // Find matching tutor in our tutors array
        const matchingTutor = tutors.find(t => t.name === tutorData.name);
        if (matchingTutor) {
          handleBookNow(matchingTutor);
          localStorage.removeItem("selectedTutor");
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    const nextSession = new Date();
    nextSession.setDate(nextSession.getDate() + 1);
    nextSession.setHours(15, 0, 0, 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = nextSession.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("Starting now!");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBookNow = (tutor: typeof tutors[0]) => {
    if (!isLoggedIn) {
      // Redirect to auth page with return URL
      window.location.href = "/auth?redirect=/schedule&action=book";
      return;
    }
    setSelectedTutor(tutor);
    setShowBookingModal(true);
    setBookingConfirmed(false);
    setBookingDate(null);
    setSelectedTime(null);
    setSelectedDuration("1 hour");
    setBookingMonth(currentDate.getMonth());
    setBookingYear(currentDate.getFullYear());
  };

  const confirmBooking = () => {
    if (!selectedTutor || !bookingDate || !selectedTime) return;
    
    // Create the new booking
    const newBooking: BookedSession = {
      id: Date.now().toString(),
      tutorName: selectedTutor.name,
      tutorImage: selectedTutor.image,
      subjects: selectedTutor.subjects,
      date: formatDate(bookingDate),
      time: selectedTime,
      duration: selectedDuration,
      price: calculatePrice(),
      status: "confirmed",
    };
    
    // Add to booked sessions
    const updatedBookings = [...bookedSessions, newBooking];
    setBookedSessions(updatedBookings);
    
    // Save to localStorage
    localStorage.setItem("mm_booked_sessions", JSON.stringify(updatedBookings));
    
    setBookingConfirmed(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingConfirmed(false);
      // Reset form
      setBookingDate(null);
      setSelectedTime(null);
      setSelectedDuration("1 hour");
    }, 2000);
  };

  // Render booking calendar
  const renderBookingCalendar = () => {
    const daysInMonth = getDaysInMonth(bookingMonth, bookingYear);
    const firstDay = getFirstDayOfMonth(bookingMonth, bookingYear);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(bookingYear, bookingMonth, day);
      const dayOfWeek = date.getDay();
      const isPast = date < today;
      const hasSlots = selectedTutor && !isDayFullyBooked(selectedTutor.name, dayOfWeek) && 
                      getTutorAvailability(selectedTutor.name, dayOfWeek) > 0.3;
      const isSelected = bookingDate && 
        bookingDate.getDate() === day && 
        bookingDate.getMonth() === bookingMonth && 
        bookingDate.getFullYear() === bookingYear;
      const isAvailable = !isPast && hasSlots;

      calendarDays.push(
        <button
          key={day}
          onClick={() => {
            if (isAvailable) {
              setBookingDate(date);
              setSelectedTime(null); // Reset time when date changes
            }
          }}
          disabled={!isAvailable}
          className={`h-10 w-full rounded-lg text-sm transition-all ${
            isSelected
              ? "text-white font-semibold shadow-lg"
              : isPast
              ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
              : hasSlots
              ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
          }`}
          style={isSelected ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
        >
          {day}
          {hasSlots && !isPast && !isSelected && (
            <div className="w-1 h-1 rounded-full mx-auto mt-0.5" style={{ backgroundColor: "var(--theme-primary)" }} />
          )}
        </button>
      );
    }

    return calendarDays;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateCalendar = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      const delta = direction === "prev" ? -1 : 1;
      const nextDate = new Date(currentYear, currentMonth + delta, 1);
      setCurrentMonth(nextDate.getMonth());
      setCurrentYear(nextDate.getFullYear());
      setSelectedDate(nextDate);
      return;
    }

    const dayDelta = viewMode === "week" ? 7 : 1;
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + (direction === "prev" ? -dayDelta : dayDelta));
    setSelectedDate(nextDate);
  };

  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    setViewMode(mode);
    if (mode === "month") {
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
    }
  };

  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return `${monthNames[currentMonth]} ${currentYear}`;
    }
    if (viewMode === "week") {
      const start = getStartOfWeek(selectedDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${t("Week")} ${t("of")} ${startLabel} - ${endLabel}`;
    }
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div
          key={`empty-${i}`}
          className="h-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-950/30"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = isCurrentMonth && day === today.getDate();
      const isSelected = isSameDay(date, selectedDate);
      const items = getScheduleItemsForDate(date);
      const maxItems = 2;

      calendarDays.push(
        <button
          key={day}
          type="button"
          onClick={() => setSelectedDate(date)}
          className={`h-24 rounded-xl border p-2 text-left text-sm transition-all ${
            isSelected
              ? "border-[var(--theme-primary)] shadow-lg"
              : "border-slate-200 dark:border-slate-800"
          } ${
            isToday
              ? "bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-slate-900 dark:text-white"
              : "bg-white/70 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${isToday ? "text-[var(--theme-primary)]" : ""}`}>{day}</span>
            {items.length > 0 && (
              <span className="text-xs text-slate-400">{items.length} {t("items")}</span>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {items.slice(0, maxItems).map((item) => (
              <div key={`${item.time}-${item.title}`} className="text-xs truncate text-slate-600 dark:text-slate-300">
                <span className="font-medium">{item.time}</span> {item.title}
              </div>
            ))}
            {items.length > maxItems && (
              <div className="text-xs text-slate-400">+{items.length - maxItems} {t("more")}</div>
            )}
          </div>
        </button>
      );
    }

    return calendarDays;
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    return weekDates.map((date) => {
      const items = getScheduleItemsForDate(date);
      const isToday = isSameDay(date, new Date());
      return (
        <button
          key={date.toISOString()}
          type="button"
          onClick={() => setSelectedDate(date)}
          className={`h-32 rounded-xl border p-3 text-left transition-all ${
            isSameDay(date, selectedDate)
              ? "border-[var(--theme-primary)] shadow-lg"
              : "border-slate-200 dark:border-slate-800"
          } ${
            isToday
              ? "bg-gradient-to-br from-violet-500/20 to-purple-500/10"
              : "bg-white/70 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">
            <span>{days[date.getDay()]}</span>
            <span className="text-slate-400">{date.getDate()}</span>
          </div>
          <div className="mt-2 space-y-1">
            {items.length === 0 && <div className="text-xs text-slate-400">{t("No tasks")}</div>}
            {items.slice(0, 3).map((item) => (
              <div key={`${item.time}-${item.title}`} className="text-xs text-slate-600 dark:text-slate-300 truncate">
                <span className="font-medium">{item.time}</span> {item.title}
              </div>
            ))}
            {items.length > 3 && <div className="text-xs text-slate-400">+{items.length - 3} {t("more")}</div>}
          </div>
        </button>
      );
    });
  };

  const renderDayView = () => {
    const items = getScheduleItemsForDate(selectedDate);
    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 p-8 text-center text-slate-500 dark:text-slate-400">
          {t("No scheduled items for this day.")}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.time}-${item.title}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 p-4"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.time}</div>
            </div>
            <Badge variant="default">{item.type ?? "session"}</Badge>
          </div>
        ))}
      </div>
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Glowing orbs */}
        <GlowingOrbs variant="section" />
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=400&fit=crop"
            alt="Tutoring session"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 35%, transparent), transparent)" }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%200L30%2015L15%2030L0%2015z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%2F%3E%3C%2Fsvg%3E')]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-4">
                <CalendarCheck className="w-4 h-4" />
                Tutoring Sessions
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Schedule</h1>
              <p className="text-slate-200 text-lg mb-4">
                Manage your study sessions and tutoring appointments.
              </p>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                <Clock className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                <span className="text-slate-200">Next session in:</span>
                <span className="font-mono text-2xl font-bold text-white">{countdown}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href="/schedule">
                <Button>
                  <Plus className="w-4 h-4" />
                  Book Session
                </Button>
              </Link>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        {/* Calendar */}
        <Card className="mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-950 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {getHeaderTitle()}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 p-1">
                {(["day", "week", "month"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleViewModeChange(mode)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-all ${
                      viewMode === mode
                        ? "bg-[var(--theme-primary)] text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {mode === "day" ? t("Day") : mode === "week" ? t("Week") : t("Month")}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigateCalendar("prev")}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
              <button
                onClick={() => navigateCalendar("next")}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {viewMode === "month" && (
              <>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {days.map((day) => (
                    <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-slate-400">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-3">{renderCalendar()}</div>
              </>
            )}
            {viewMode === "week" && (
              <div className="grid grid-cols-7 gap-3">{renderWeekView()}</div>
            )}
            {viewMode === "day" && (
              <div className="space-y-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                {renderDayView()}
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Sessions */}
        <Card padding="none" className="mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Sessions</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Your next scheduled tutoring sessions</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* User's booked sessions */}
            {bookedSessions.length > 0 && bookedSessions.map((booking) => (
              <div key={booking.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <Image
                  src={booking.tutorImage}
                  alt={booking.tutorName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{booking.subjects} Session</h4>
                  <p className="text-slate-500 text-sm">{booking.date}, {booking.time} ({booking.duration})</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">With: {booking.tutorName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmed
                  </Badge>
                </div>
              </div>
            ))}
            
            {/* Sample sessions for demo */}
            {sessions.map((session) => (
              <div key={session.title} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <Image
                  src={session.image}
                  alt={session.tutor}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{session.title}</h4>
                  <p className="text-slate-500 text-sm">{session.time}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">With: {session.tutor}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={session.status === "confirmed" ? "success" : "warning"}>
                    {session.status === "confirmed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {session.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Available Tutors */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Available Tutors</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Book a session with our expert peer tutors</p>
            </div>
            <Link href="/tutors" className="text-primary-themed text-sm font-medium hover:underline">
              View all tutors
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor, index) => (
              <Card key={tutor.name} className="overflow-hidden group/tutor" padding="none" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  <Image
                    src={tutor.image}
                    alt={tutor.name}
                    fill
                    className="object-cover object-top group-hover/tutor:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 25%, transparent), transparent)" }}
                  />
                  {tutor.available && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1.5 shadow-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      Available Now
                    </div>
                  )}
                  {/* Rating overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-lg">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-semibold">{tutor.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg group-hover/tutor:text-[var(--theme-primary)] transition-colors">{tutor.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{tutor.subjects}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>${tutor.price}</span>
                      <span className="text-slate-400 text-sm">/hr</span>
                    </div>
                  </div>
                  
                  {/* Specialties */}
                  {(tutor as any).specialties && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(tutor as any).specialties.slice(0, 2).map((specialty: string) => (
                          <span 
                            key={specialty}
                            className="text-xs px-2.5 py-1 rounded-full transition-colors"
                            style={{ 
                              background: 'rgba(var(--theme-primary-rgb), 0.1)',
                              color: 'var(--theme-primary)'
                            }}
                          >
                            {specialty}
                          </span>
                        ))}
                        {(tutor as any).specialties.length > 2 && (
                          <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                            +{(tutor as any).specialties.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>{tutor.reviews} reviews</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {Math.floor(tutor.reviews * 0.7)}+ students
                    </span>
                  </div>
                  <Button 
                    className="w-full group/btn" 
                    disabled={!tutor.available}
                    onClick={() => tutor.available && handleBookNow(tutor)}
                  >
                    {tutor.available ? (
                      <>
                        <CalendarPlus className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        Book Now
                      </>
                    ) : "Unavailable"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Study Groups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Open Study Groups</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join collaborative learning sessions with other students</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyGroups.map((group) => (
              <Card key={group.title} className="overflow-hidden" padding="none">
                <div className="relative h-40">
                  <Image
                    src={group.image}
                    alt={group.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-white text-lg">{group.title}</h3>
                    <p className="text-slate-300 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {group.schedule}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">{group.members}/{group.maxMembers} members</span>
                    </div>
                    <Button variant="secondary" size="sm">Join Group</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header with tutor image */}
            <div className="relative h-32 bg-slate-950">
              <Image
                src={selectedTutor.image}
                alt={selectedTutor.name}
                fill
                className="object-cover object-top opacity-50"
              />
              <div 
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 50%, transparent), transparent)" }}
              />
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-xl font-bold text-white">{selectedTutor.name}</h3>
                <p className="text-white/80 text-sm">{selectedTutor.subjects}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {!bookingConfirmed ? (
                <>
                  {/* Step 1: Select Date */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--theme-primary)" }}>1</div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Select a Date</h4>
                    </div>
                    
                    {/* Mini Calendar */}
                    <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => {
                            if (bookingMonth === 0) {
                              setBookingMonth(11);
                              setBookingYear(bookingYear - 1);
                            } else {
                              setBookingMonth(bookingMonth - 1);
                            }
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {monthNames[bookingMonth]} {bookingYear}
                        </span>
                        <button
                          onClick={() => {
                            if (bookingMonth === 11) {
                              setBookingMonth(0);
                              setBookingYear(bookingYear + 1);
                            } else {
                              setBookingMonth(bookingMonth + 1);
                            }
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                          <div key={i} className="h-8 flex items-center justify-center text-xs font-medium text-slate-500">
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {renderBookingCalendar()}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                        <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "var(--theme-primary)" }} />
                        Dots indicate available days
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Select Time */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${!bookingDate ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400" : "text-white"}`}
                        style={bookingDate ? { background: "var(--theme-primary)" } : {}}
                      >2</div>
                      <h4 className={`font-semibold ${bookingDate ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                        Select a Time {bookingDate && `- ${formatDate(bookingDate)}`}
                      </h4>
                    </div>
                    
                    {bookingDate ? (
                      <div>
                        <div className="grid grid-cols-3 gap-2">
                          {getAllTimeSlotsWithAvailability().map(({slot, available}) => (
                            <button
                              key={slot}
                              onClick={() => available && setSelectedTime(slot)}
                              disabled={!available}
                              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                                selectedTime === slot
                                  ? "text-white shadow-lg"
                                  : available
                                  ? "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                                  : "bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                              }`}
                              style={selectedTime === slot ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
                            >
                              {slot}
                              {!available && <div className="text-xs mt-1 opacity-70">Booked</div>}
                            </button>
                          ))}
                        </div>
                        {getAvailableTimeSlots().length === 0 && (
                          <div className="text-center py-6 mt-4 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="font-medium text-lg mb-1">🚫 Fully Booked</div>
                            <div className="text-sm">No available slots for this day</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-center">
                        Please select a date first
                      </p>
                    )}
                  </div>

                  {/* Step 3: Duration */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedTime ? "text-white" : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400"}`}
                        style={selectedTime ? { background: "var(--theme-primary)" } : {}}
                      >3</div>
                      <h4 className={`font-semibold ${selectedTime ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
                        Session Duration
                      </h4>
                    </div>
                    
                    {selectedTime ? (
                      <div className="grid grid-cols-3 gap-2">
                        {["1 hour", "1.5 hours", "2 hours"].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => setSelectedDuration(duration)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              selectedDuration === duration
                                ? "text-white shadow-lg"
                                : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                            style={selectedDuration === duration ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
                          >
                            <div className="text-sm font-medium">{duration}</div>
                            <div className={`text-xs mt-1 ${selectedDuration === duration ? "text-white/80" : "text-slate-500"}`}>
                              ${selectedTutor.price * getDurationHours(duration)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-center">
                        Please select a time first
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="flex items-center justify-between mb-6 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--theme-primary)" }}>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 text-sm">Session Total</span>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {selectedDuration} × ${selectedTutor.price}/hr
                      </div>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: "var(--theme-primary)" }}>${calculatePrice()}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={confirmBooking}
                    disabled={!bookingDate || !selectedTime}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Confirm Booking
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">
                    Your session with {selectedTutor.name} has been scheduled.
                  </p>
                  <p className="text-sm" style={{ color: "var(--theme-primary)" }}>
                    {bookingDate && formatDate(bookingDate)} at {selectedTime}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
