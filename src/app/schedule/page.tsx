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
    tutor: "Dr. Sarah Johnson",
    status: "confirmed",
    color: "violet",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop",
  },
  {
    icon: Infinity,
    title: "Linear Algebra: Matrix Operations",
    time: "Friday, 5:00 PM - 6:30 PM",
    tutor: "Priya Patel",
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
    name: "Dr. Sarah Johnson",
    initials: "SJ",
    subjects: "Calculus, Statistics",
    rating: 4.9,
    reviews: 128,
    price: 45,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    available: true,
    // Available time slots by day (0 = Sunday, 6 = Saturday)
    availableSlots: {
      1: ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"], // Monday
      2: ["10:00 AM", "11:00 AM", "3:00 PM", "4:00 PM"], // Tuesday
      3: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"], // Wednesday
      4: ["2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"], // Thursday
      5: ["9:00 AM", "10:00 AM", "11:00 AM"], // Friday
    } as Record<number, string[]>,
  },
  {
    name: "Priya Patel",
    initials: "PP",
    subjects: "Linear Algebra, Geometry",
    rating: 4.8,
    reviews: 96,
    price: 35,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
    available: true,
    availableSlots: {
      1: ["11:00 AM", "12:00 PM", "5:00 PM", "6:00 PM"], // Monday
      2: ["9:00 AM", "10:00 AM", "5:00 PM", "6:00 PM"], // Tuesday
      3: ["12:00 PM", "1:00 PM", "5:00 PM", "6:00 PM"], // Wednesday
      4: ["9:00 AM", "10:00 AM", "11:00 AM"], // Thursday
      5: ["3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"], // Friday
      6: ["10:00 AM", "11:00 AM", "12:00 PM"], // Saturday
    } as Record<number, string[]>,
  },
  {
    name: "Michael Chen",
    initials: "MC",
    subjects: "Algebra, Trigonometry",
    rating: 4.7,
    reviews: 84,
    price: 40,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    available: false,
    availableSlots: {} as Record<number, string[]>,
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
  const [countdown, setCountdown] = useState("--:--:--");
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
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

  // Get available time slots for selected date
  const getAvailableTimeSlots = (): string[] => {
    if (!selectedTutor || !bookingDate) return [];
    const dayOfWeek = bookingDate.getDay();
    return selectedTutor.availableSlots[dayOfWeek] || [];
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
      const hasSlots = selectedTutor?.availableSlots[dayOfWeek]?.length > 0;
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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = currentDate.getDate();
    const isCurrentMonth = currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today;
      const hasEvent = [today + 1, today + 4, today + 6].includes(day);

      calendarDays.push(
        <div
          key={day}
          className={`h-12 flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 ${
            isToday ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white font-semibold shadow-lg" : "text-slate-700 dark:text-slate-300 hover:text-primary-themed"
          }`}
        >
          {day}
          {hasEvent && !isToday && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5" />}
        </div>
      );
    }

    return calendarDays;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
          <div className="flex items-center justify-between p-6 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {days.map((day) => (
                <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-slate-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
          </div>
        </Card>

        {/* Upcoming Sessions */}
        <Card padding="none" className="mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
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
            <Link href="#" className="text-primary-themed text-sm font-medium hover:underline">
              View all tutors
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <Card key={tutor.name} className="overflow-hidden" padding="none">
                <div className="relative h-48 bg-slate-950">
                  <Image
                    src={tutor.image}
                    alt={tutor.name}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 22%, transparent), transparent)" }}
                  />
                  {tutor.available && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--theme-primary)" }} />
                      Available Now
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{tutor.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{tutor.subjects}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-primary-themed">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{tutor.rating}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{tutor.reviews} reviews</span>
                    <span className="ml-auto text-slate-500">
                      <span className="font-bold text-slate-900 dark:text-white text-lg">${tutor.price}</span>/hr
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    disabled={!tutor.available}
                    onClick={() => tutor.available && handleBookNow(tutor)}
                  >
                    {tutor.available ? "Book Now" : "Unavailable"}
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
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
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
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
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
                      getAvailableTimeSlots().length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {getAvailableTimeSlots().map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                                selectedTime === time
                                  ? "text-white shadow-lg"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                              }`}
                              style={selectedTime === time ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                          No available time slots for this day
                        </p>
                      )
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
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
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
                      <p className="text-sm text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
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
