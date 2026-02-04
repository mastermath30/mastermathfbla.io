"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionLabel } from "@/components/SectionLabel";
import { Avatar } from "@/components/Avatar";
import { AnimatedNumberClient } from "@/components/AnimatedNumberClient";
import { TestimonialsScroll } from "@/components/TestimonialsScroll";
import { FadeIn, FadeInStagger, FadeInStaggerItem, GlowingOrbs } from "@/components/motion";
import { useTranslations } from "@/components/LanguageProvider";
import {
  GraduationCap,
  Rocket,
  PlayCircle,
  Brain,
  TrendingUp,
  Users,
  MessageCircle,
  Star,
  UserPlus,
  BookOpen,
  Trophy,
  ArrowRight,
  ChevronDown,
  Quote,
  Sparkles,
  Zap,
  Target,
  Clock,
  CalendarPlus,
  SquareRadical,
  Infinity,
  Calculator,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
} from "lucide-react";

const getStats = (t: (key: string) => string) => [
  { value: 12000, label: t("Students Helped") },
  { value: 320, label: t("Peer Tutors") },
  { value: 98, label: t("Success Rate") },
  { value: 24, label: t("Support") },
];

const sessions = [
  {
    icon: SquareRadical,
    title: "Calculus Study Group: Integrals",
    time: "Tomorrow, 3:00 PM - 4:30 PM",
    tutor: "Sarah Johnson",
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

// Top 3 rated tutors for home page
const topTutors = [
  {
    name: "Sarah Johnson",
    initials: "SJ",
    subjects: "Calculus, Statistics, Differential Equations",
    rating: 4.9,
    reviews: 128,
    price: 52,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    available: true,
    specialties: ["AP Calculus BC", "College Statistics", "Research Methods"],
  },
  {
    name: "Emma Rodriguez",
    initials: "ER",
    subjects: "Precalculus, Geometry, Algebra",
    rating: 4.5,
    reviews: 112,
    price: 42,
    image: "https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=200&h=200&fit=crop",
    available: true,
    specialties: ["Geometry Proofs", "Trigonometry", "Pre-Calc"],
  },
  {
    name: "Priya Patel",
    initials: "PP",
    subjects: "Linear Algebra, Geometry, Discrete Math",
    rating: 4.1,
    reviews: 96,
    price: 35,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
    available: true,
    specialties: ["Linear Algebra", "Proof Writing", "Competition Math"],
  },
];

const getFeatures = (t: (key: string) => string) => [
  {
    icon: Brain,
    title: t("Interactive Learning"),
    description: t("Engage with step-by-step lessons and practice problems that adapt to your learning pace."),
    link: "/resources",
    linkText: t("Explore Resources"),
    image: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=400&h=300&fit=crop",
  },
  {
    icon: TrendingUp,
    title: t("Track Progress"),
    description: t("Monitor your learning journey with detailed analytics and personalized goal tracking."),
    link: "/dashboard",
    linkText: t("View Dashboard"),
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
  },
  {
    icon: Users,
    title: t("Peer Tutoring"),
    description: t("Connect with experienced peer tutors for live sessions and personalized help."),
    link: "/schedule",
    linkText: t("Book a Session"),
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
  },
  {
    icon: MessageCircle,
    title: t("Community Forum"),
    description: t("Ask questions, share solutions, and learn together with our supportive community."),
    link: "/community",
    linkText: t("Join Discussion"),
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
  },
];

const getSteps = (t: (key: string) => string) => [
  {
    icon: UserPlus,
    title: t("Create Your Profile"),
    description: t("Sign up for free and tell us about your learning goals. Our system will personalize your experience based on your current level and objectives."),
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
  },
  {
    icon: BookOpen,
    title: t("Learn & Practice"),
    description: t("Access interactive lessons, video tutorials, and practice problems. Book sessions with peer tutors when you need extra help."),
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop",
  },
  {
    icon: Trophy,
    title: t("Track & Succeed"),
    description: t("Monitor your progress on the dashboard, earn achievements, and watch your math skills grow over time."),
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=300&h=200&fit=crop",
  },
];

// Generate realistic time slots
const generateTimeSlots = (): string[] => {
  const slots = [];
  for (let hour = 8; hour < 12; hour++) {
    slots.push(`${hour}:00 AM`);
    if (hour < 11) slots.push(`${hour}:30 AM`);
  }
  slots.push("12:00 PM");
  slots.push("12:30 PM");
  for (let hour = 1; hour <= 8; hour++) {
    slots.push(`${hour}:00 PM`);
    if (hour < 8) slots.push(`${hour}:30 PM`);
  }
  return slots;
};

const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

const getSeededAvailableSlots = (tutorName: string, dayOfWeek: number, allSlots: string[], availability: number = 0.7): string[] => {
  return allSlots.filter((slot, index) => {
    const seed = `${tutorName}-${dayOfWeek}-${slot}-${index}`;
    return seededRandom(seed) < availability;
  });
};

const isDayFullyBooked = (tutorName: string, dayOfWeek: number): boolean => {
  const seed = `${tutorName}-${dayOfWeek}-fullbook`;
  return seededRandom(seed) < 0.15;
};

const getTutorAvailability = (tutorName: string, dayOfWeek: number): number => {
  const patterns: Record<string, number[]> = {
    "Sarah Johnson": [0.3, 0.8, 0.6, 0.7, 0.8, 0.5, 0.4],
    "Emma Rodriguez": [0.3, 0.7, 0.6, 0.8, 0.7, 0.5, 0.8],
    "Priya Patel": [0.4, 0.6, 0.8, 0.7, 0.5, 0.9, 0.7],
  };
  return patterns[tutorName]?.[dayOfWeek] || 0.6;
};

const ALL_TIME_SLOTS = generateTimeSlots();
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentDate = new Date();

const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

export default function Home() {
  const { t } = useTranslations();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [countdown, setCountdown] = useState("--:--:-");
  const [expandedSpecialties, setExpandedSpecialties] = useState<Record<string, boolean>>({});
  const stats = getStats(t);
  const features = getFeatures(t);
  const steps = getSteps(t);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<typeof topTutors[0] | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("1 hour");
  const [bookingMonth, setBookingMonth] = useState(currentDate.getMonth());
  const [bookingYear, setBookingYear] = useState(currentDate.getFullYear());
  
  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("mm_session");
    const isLoggedInFlag = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!session || isLoggedInFlag === "true");
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

  const handleBookNow = (tutor: typeof topTutors[0]) => {
    if (!isLoggedIn) {
      window.location.href = "/auth?redirect=/&action=book";
      return;
    }
    setSelectedTutor(tutor);
    setShowBookingModal(true);
    setBookingConfirmed(false);
    setShowCheckout(false);
    setBookingDate(null);
    setSelectedTime(null);
    setSelectedDuration("1 hour");
    setBookingMonth(currentDate.getMonth());
    setBookingYear(currentDate.getFullYear());
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardName("");
    setBillingZip("");
    setPaymentError("");
  };

  // Booking helper functions
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

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getAllTimeSlotsWithAvailability = (): Array<{slot: string, available: boolean}> => {
    if (!selectedTutor || !bookingDate) return ALL_TIME_SLOTS.map(slot => ({slot, available: false}));
    const dayOfWeek = bookingDate.getDay();
    if (isDayFullyBooked(selectedTutor.name, dayOfWeek)) {
      return ALL_TIME_SLOTS.map(slot => ({slot, available: false}));
    }
    const availabilityRate = getTutorAvailability(selectedTutor.name, dayOfWeek);
    const availableSlots = getSeededAvailableSlots(selectedTutor.name, dayOfWeek, ALL_TIME_SLOTS, availabilityRate);
    return ALL_TIME_SLOTS.map(slot => ({
      slot,
      available: availableSlots.includes(slot)
    }));
  };

  const getAvailableTimeSlots = (): string[] => {
    return getAllTimeSlotsWithAvailability()
      .filter(({available}) => available)
      .map(({slot}) => slot);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setPaymentError("Please enter a valid card number");
      return false;
    }
    if (cardExpiry.length < 5) {
      setPaymentError("Please enter a valid expiry date");
      return false;
    }
    if (cardCvc.length < 3) {
      setPaymentError("Please enter a valid CVC");
      return false;
    }
    if (cardName.trim().length < 2) {
      setPaymentError("Please enter the cardholder name");
      return false;
    }
    if (billingZip.length < 5) {
      setPaymentError("Please enter a valid ZIP code");
      return false;
    }
    return true;
  };

  const proceedToCheckout = () => {
    if (!selectedTutor || !bookingDate || !selectedTime) return;
    setShowCheckout(true);
  };

  const processPayment = async () => {
    if (!validateCard()) return;
    setIsProcessing(true);
    setPaymentError("");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!selectedTutor || !bookingDate || !selectedTime) {
      setIsProcessing(false);
      return;
    }
    
    const newBooking = {
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
    
    const savedBookings = localStorage.getItem("mm_booked_sessions");
    const bookedSessions = savedBookings ? JSON.parse(savedBookings) : [];
    bookedSessions.push(newBooking);
    localStorage.setItem("mm_booked_sessions", JSON.stringify(bookedSessions));
    
    setIsProcessing(false);
    setBookingConfirmed(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingConfirmed(false);
      setShowCheckout(false);
      setBookingDate(null);
      setSelectedTime(null);
      setSelectedDuration("1 hour");
    }, 2500);
  };

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
          type="button"
          onClick={() => {
            if (isAvailable) {
              setBookingDate(date);
              setSelectedTime(null);
            }
          }}
          disabled={!isAvailable}
          className={`h-10 min-h-[44px] w-full rounded-lg text-sm transition-all touch-manipulation select-none ${
            isSelected
              ? "text-white font-semibold shadow-lg"
              : isPast
              ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
              : hasSlots
              ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
          }`}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            ...(isSelected ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {})
          }}
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
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-safe">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&h=1080&fit=crop"
            alt="Mathematics background"
            fill
            className="object-cover opacity-5 dark:opacity-20"
            priority
          />
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 rounded-full blur-3xl animate-pulse opacity-20 dark:opacity-10" style={{ background: 'var(--theme-primary)' }} />
        <div className="absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 rounded-full blur-3xl animate-pulse delay-1000 opacity-15 dark:opacity-10" style={{ background: 'var(--theme-primary-light)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[600px] md:h-[600px] rounded-full blur-3xl opacity-10 dark:opacity-5" style={{ background: 'var(--theme-primary)' }} />

        {/* Floating math symbols - hidden on small screens */}
        <div className="hidden md:block absolute top-20 left-[15%] text-5xl md:text-7xl font-serif animate-bounce opacity-10 dark:opacity-15" style={{ animationDuration: '3s', color: 'var(--theme-primary)' }}>∫</div>
        <div className="hidden md:block absolute top-32 right-[20%] text-4xl md:text-6xl font-serif animate-bounce opacity-10 dark:opacity-15" style={{ animationDuration: '4s', animationDelay: '1s', color: 'var(--theme-primary-light)' }}>π</div>
        <div className="hidden md:block absolute bottom-40 left-[10%] text-3xl md:text-5xl font-serif animate-bounce opacity-10 dark:opacity-15" style={{ animationDuration: '3.5s', animationDelay: '0.5s', color: 'var(--theme-primary)' }}>∑</div>
        <div className="hidden md:block absolute bottom-32 right-[15%] text-4xl md:text-6xl font-serif animate-bounce opacity-10 dark:opacity-15" style={{ animationDuration: '4.5s', animationDelay: '1.5s', color: 'var(--theme-primary-light)' }}>√</div>
        <div className="hidden lg:block absolute top-1/2 left-[5%] text-3xl md:text-5xl font-serif animate-bounce opacity-5 dark:opacity-10" style={{ animationDuration: '5s', animationDelay: '2s', color: 'var(--theme-primary)' }}>∞</div>
        <div className="hidden lg:block absolute top-[40%] right-[8%] text-3xl md:text-4xl font-serif animate-bounce opacity-5 dark:opacity-10" style={{ animationDuration: '3.8s', animationDelay: '0.8s', color: 'var(--theme-primary-light)' }}>θ</div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6 leading-tight break-words">
                {t("Master Mathematics")}
                <br />
                <span className="gradient-text relative inline-block">
                  {t("With Expert Tutors")}
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 10C50 4 150 4 298 10" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop style={{ stopColor: 'var(--theme-primary)' }} />
                        <stop offset="1" style={{ stopColor: 'var(--theme-primary-light)' }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-6 md:mb-8 max-w-xl leading-relaxed">
                {t("Connect with top-rated peer tutors and master mathematics through personalized, interactive learning sessions.")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start mb-6 md:mb-8">
                <Link href="/auth">
                  <Button size="lg" className="shadow-xl group" style={{ boxShadow: '0 10px 40px rgba(var(--theme-primary-rgb), 0.25)' }}>
                    <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    {t("Start Learning Now")}
                  </Button>
                </Link>
                <Link href="/tutors">
                  <Button variant="outline" size="lg" className="bg-white/60 dark:bg-slate-950/60 backdrop-blur border-slate-300 dark:border-slate-700">
                    <Users className="w-5 h-5" />
                    {t("Browse All Tutors")}
                  </Button>
                </Link>
              </div>

              {/* Stats inline */}
              <div className="flex flex-wrap gap-4 md:gap-8 justify-center lg:justify-start">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center group cursor-default" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="text-2xl md:text-3xl font-bold gradient-text font-mono group-hover:scale-110 transition-transform duration-300">
                      <AnimatedNumberClient value={stat.value} duration={900} label={stat.label} />
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right content - Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main image */}
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 rounded-3xl rotate-6 opacity-20" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }} />
                  <div className="absolute inset-0 rounded-3xl -rotate-3 opacity-10" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }} />
                  <div className="relative bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <Image
                      src="https://images.unsplash.com/photo-1596496050755-c923e73e42e1?w=600&h=600&fit=crop"
                      alt="Student studying mathematics"
                      width={600}
                      height={600}
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Floating cards */}
                <Link
                  href="/tutors"
                  aria-label={t("Top Rated")}
                  className="absolute -top-4 -left-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-slate-200/50 dark:border-slate-700/50 animate-float hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--theme-primary-rgb), 0.1)' }}>
                      <Star className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">4.9 ⭐</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t("Top Rated")}</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/schedule"
                  aria-label={t("Next Session")}
                  className="absolute -bottom-4 -right-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-slate-200/50 dark:border-slate-700/50 animate-float hover:scale-105 transition-transform cursor-pointer"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--theme-primary-rgb), 0.1)' }}>
                      <Clock className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{countdown}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t("Next Session")}</p>
                    </div>
                  </div>
                </Link>

                {/* Additional floating element */}
                <Link
                  href="/dashboard"
                  aria-label={t("This week")}
                  className="absolute top-1/2 -right-8 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm rounded-2xl shadow-xl p-3 border border-slate-200/50 dark:border-slate-700/50 animate-float hover:scale-105 transition-transform cursor-pointer"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600">+24%</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{t("This week")}</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        
        {/* Recent Sessions - only for logged in users */}
        {isLoggedIn && (
          <Card className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{t("Your Recent Sessions")}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t("Manage your upcoming and past sessions")}</p>
              </div>
              <Link href="/schedule" className="text-primary-themed text-sm font-medium hover:underline">
                {t("View all sessions")}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session, index) => (
                <div key={index} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${session.color === 'violet' ? 'bg-violet-500/15' : session.color === 'purple' ? 'bg-purple-500/15' : 'bg-blue-500/15'}`}>
                      <session.icon className={`w-4 h-4 ${session.color === 'violet' ? 'text-violet-600' : session.color === 'purple' ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{session.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{session.time}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={session.image} alt={session.tutor} className="w-6 h-6 rounded-full object-cover object-[center_20%]" />
                          <span className="text-xs text-slate-600 dark:text-slate-300">{session.tutor}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'confirmed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {session.status === 'confirmed' ? t("Confirmed") : t("Pending")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* For logged in users: Show tutors first */}
        {isLoggedIn && (
          <>
            {/* Top Rated Tutors - for logged in users */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t("Top Rated Tutors")}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t("Our highest-rated math tutors ready to help you succeed")}</p>
                </div>
                <Link href="/tutors" className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all group whitespace-nowrap" style={{ color: 'var(--theme-primary)' }}>
                  {t("View all tutors")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {topTutors.map((tutor, index) => (
                  <Card key={tutor.name} className="overflow-hidden group/tutor" padding="none" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative h-52 sm:h-64 overflow-hidden">
                      <Image
                        src={tutor.image}
                        alt={tutor.name}
                        fill
                        className="object-cover object-[center_20%] group-hover/tutor:scale-105 transition-transform duration-500"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {tutor.available && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1.5 shadow-lg">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          {t("Available Now")}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg">
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
                      
                      {tutor.specialties && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(expandedSpecialties[tutor.name + '-top'] ? tutor.specialties : tutor.specialties.slice(0, 2)).map(specialty => (
                              <span 
                                key={specialty}
                                className="text-xs px-2.5 py-1 rounded-full transition-colors bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                              >
                                {specialty}
                              </span>
                            ))}
                            {tutor.specialties.length > 2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedSpecialties(prev => ({
                                    ...prev,
                                    [tutor.name + '-top']: !prev[tutor.name + '-top']
                                  }));
                                }}
                                className="text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer hover:opacity-80 font-medium"
                                style={{ 
                                  background: 'var(--theme-primary)',
                                color: 'white'
                              }}
                            >
                              {expandedSpecialties[tutor.name + '-top'] ? t("Show less") : `+${tutor.specialties.length - 2}`}
                            </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>{tutor.reviews} {t("reviews")}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {Math.floor(tutor.reviews * 0.7)}+ {t("students")}
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
                            {t("Book Now")}
                          </>
                        ) : (
                          t("Unavailable")
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* For new users: Show marketing sections before tutors */}
      {!isLoggedIn && (
        <>
          {/* Trusted By Section */}
          <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <p className="text-center text-slate-500 text-xs sm:text-sm mb-8 md:mb-10 uppercase tracking-widest">{t("Trusted by students from top institutions")}</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
                <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                    <Image src="/logos/mit.png" alt="MIT" fill className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">MIT</span>
                </div>
                <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                    <Image src="/logos/stanford.png" alt="Stanford" fill className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Stanford</span>
                </div>
                <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                    <Image src="/logos/harvard.png" alt="Harvard" fill className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Harvard</span>
                </div>
                <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                    <Image src="/logos/berkeley.png" alt="Berkeley" fill className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Berkeley</span>
                </div>
                <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                    <Image src="/logos/caltech.png" alt="Caltech" fill className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Caltech</span>
                </div>
                <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                    <Image src="/logos/princeton-new.png" alt="Princeton" fill className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Princeton</span>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            <GlowingOrbs variant="section" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 md:mb-16">
                <SectionLabel icon={Zap} className="mb-4">
                  {t("Why Choose MathMaster?")}
                </SectionLabel>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-6 mb-4 tracking-tight px-4">
                  {t("Learn Smarter,")} <span className="gradient-text">{t("Not Harder")}</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
                  {t("Our platform combines the best of peer learning with powerful tools to help you succeed in mathematics.")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card key={feature.title} className="group overflow-hidden hover:shadow-2xl" padding="none" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="md:w-2/5 relative h-48 md:h-auto min-h-[200px] overflow-hidden">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/40 dark:to-slate-950/40" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.2), transparent)' }} />
                      </div>
                      <div className="md:w-3/5 p-6 flex flex-col">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[var(--theme-primary)] transition-colors">{feature.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                          {feature.description}
                        </p>
                        <Link
                          href={feature.link}
                          className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all group/link"
                          style={{ color: 'var(--theme-primary)' }}
                        >
                          {feature.linkText}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            <GlowingOrbs variant="subtle" />
            <div className="relative max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                <SectionLabel icon={Rocket} className="mb-4">
                  {t("Your Learning Journey")}
                </SectionLabel>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-6 mb-4">
                  {t("How MathMaster Works")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
                  {t("Three simple steps to transform your math skills")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {steps.map((step, index) => (
                  <div key={step.title} className="relative h-full">
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-24 left-[60%] w-full h-0.5" style={{ background: 'linear-gradient(to right, var(--theme-primary-light), transparent)' }} />
                    )}
                    <Card variant="gradient" padding="none" className="relative overflow-visible h-full flex flex-col">
                      <div
                        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10"
                        style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                      >
                        {index + 1}
                      </div>
                      <div className="relative h-44 mb-4 overflow-hidden rounded-t-2xl">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="flex-1 flex flex-col px-6 pb-6">
                        <div
                          className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950/60 flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-700"
                          style={{ color: "var(--theme-primary)" }}
                        >
                          <step.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{step.description}</p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            <GlowingOrbs variant="section" />
            <div className="relative max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-6 mb-4">
                  {t("What Students Say")}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                  {t("See what our students have to say about us.")}
                </p>
              </div>
              <TestimonialsScroll />
            </div>
          </section>

          {/* Now show Top Rated Tutors for new users */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t("Top Rated Tutors")}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t("Our highest-rated math tutors ready to help you succeed")}</p>
                </div>
                <Link href="/tutors" className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all group whitespace-nowrap" style={{ color: 'var(--theme-primary)' }}>
                  {t("View all tutors")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {topTutors.map((tutor, index) => (
                  <Card key={tutor.name} className="overflow-hidden group/tutor" padding="none" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative h-52 sm:h-64 overflow-hidden">
                      <Image
                        src={tutor.image}
                        alt={tutor.name}
                        fill
                        className="object-cover object-[center_20%] group-hover/tutor:scale-105 transition-transform duration-500"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 30%, transparent), transparent)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {tutor.available && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1.5 shadow-lg">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          {t("Available Now")}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg">
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
                      
                      {tutor.specialties && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(expandedSpecialties[tutor.name + '-bottom'] ? tutor.specialties : tutor.specialties.slice(0, 2)).map(specialty => (
                              <span 
                                key={specialty}
                                className="text-xs px-2.5 py-1 rounded-full transition-colors bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                              >
                                {specialty}
                              </span>
                            ))}
                            {tutor.specialties.length > 2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedSpecialties(prev => ({
                                    ...prev,
                                    [tutor.name + '-bottom']: !prev[tutor.name + '-bottom']
                                  }));
                                }}
                                className="text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer hover:opacity-80 font-medium"
                                style={{ 
                                  background: 'var(--theme-primary)',
                                color: 'white'
                              }}
                            >
                              {expandedSpecialties[tutor.name + '-bottom'] ? t("Show less") : `+${tutor.specialties.length - 2}`}
                            </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>{tutor.reviews} {t("reviews")}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {Math.floor(tutor.reviews * 0.7)}+ {t("students")}
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
                            {t("Book Now")}
                          </>
                        ) : (
                          t("Unavailable")
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* For logged-in users: Show Trusted By + marketing sections after tutors */}
      {isLoggedIn && (
        <>
          {/* Trusted By Section */}
          <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <p className="text-center text-slate-500 text-xs sm:text-sm mb-8 md:mb-10 uppercase tracking-widest">{t("Trusted by students from top institutions")}</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
            <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                <Image src="/logos/mit.png" alt="MIT" fill className="object-contain" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">MIT</span>
            </div>
            <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                <Image src="/logos/stanford.png" alt="Stanford" fill className="object-contain" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Stanford</span>
            </div>
            <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                <Image src="/logos/harvard.png" alt="Harvard" fill className="object-contain" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Harvard</span>
            </div>
            <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                <Image src="/logos/berkeley.png" alt="Berkeley" fill className="object-contain" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Berkeley</span>
            </div>
            <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                <Image src="/logos/caltech.png" alt="Caltech" fill className="object-contain" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Caltech</span>
            </div>
            <div className="group flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 relative transition-all duration-300 rounded-lg p-2 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.08)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.15)]">
                <Image src="/logos/princeton-new.png" alt="Princeton" fill className="object-contain" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Princeton</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Background gradient orbs */}
        <GlowingOrbs variant="section" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <SectionLabel icon={Zap} className="mb-4">
              {t("Why Choose MathMaster?")}
            </SectionLabel>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-6 mb-4 tracking-tight px-4">
              {t("Learn Smarter,")} <span className="gradient-text">{t("Not Harder")}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              {t("Our platform combines the best of peer learning with powerful tools to help you succeed in mathematics.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="group overflow-hidden hover:shadow-2xl" padding="none" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-2/5 relative h-48 md:h-auto min-h-[200px] overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/40 dark:to-slate-950/40" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.2), transparent)' }} />
                  </div>
                  <div className="md:w-3/5 p-6 flex flex-col">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[var(--theme-primary)] transition-colors">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                      {feature.description}
                    </p>
                    <Link
                      href={feature.link}
                      className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all group/link"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {feature.linkText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Glowing orbs */}
        <GlowingOrbs variant="subtle" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel icon={Rocket} className="mb-4">
              {t("Your Learning Journey")}
            </SectionLabel>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-6 mb-4">
              {t("How MathMaster Works")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
              {t("Three simple steps to transform your math skills")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {steps.map((step, index) => (
              <div key={step.title} className="relative h-full">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 left-[60%] w-full h-0.5" style={{ background: 'linear-gradient(to right, var(--theme-primary-light), transparent)' }} />
                )}
                <Card variant="gradient" padding="none" className="relative overflow-visible h-full flex flex-col">
                  {/* Step number badge */}
                  <div
                    className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10"
                    style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                  >
                    {index + 1}
                  </div>
                  {/* Image */}
                  <div className="relative h-44 mb-4 overflow-hidden rounded-t-2xl">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 flex flex-col px-6 pb-6">
                    <div
                      className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950/60 flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-700"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{step.description}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Background gradient orbs */}
        <GlowingOrbs variant="section" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
      
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-6 mb-4">
              {t("What Students Say")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              {t("See what our students have to say about us.")}
            </p>
          </div>

          <TestimonialsScroll />
        </div>
      </section>
        </>
      )}

      {/* CTA Section - shown for everyone */}
      <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Glowing orbs */}
        <GlowingOrbs variant="subtle" />
        {/* Subtle gradient background */}
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t("Ready to Master Math?")}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg mb-8 max-w-xl mx-auto text-slate-600 dark:text-slate-300">
              {t("Join thousands of students who are already improving their math skills with MathMaster.")}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Link href="/auth">
              <Button size="lg" className="shadow-xl" style={{ background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))", color: "white" }}>
                <Rocket className="w-5 h-5" />
                {t("Get Started Free")}
              </Button>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-4">{t("No credit card required • Free forever")}</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 pb-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold font-serif text-xl" style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}>
                  π
                </div>
                <span className="text-xl font-bold">{t("MathMaster")}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t("Empowering students to master mathematics through peer learning and collaboration.")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{t("Platform")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">Dashboard</Link></li>
                <li><Link href="/schedule" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">Schedule</Link></li>
                <li><Link href="/resources" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">Resources</Link></li>
                <li><Link href="/community" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">Community</Link></li>
                </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{t("Company")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">{t("About Us")}</Link></li>
                <li><Link href="/support" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">{t("Support")}</Link></li>
                <li><Link href="/support#faq" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">{t("Privacy Policy")}</Link></li>
                <li><Link href="/support#faq" className="text-slate-500 dark:text-slate-400 hover:text-primary-themed transition-colors">{t("Terms of Service")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{t("Connect")}</h4>
              <div className="flex gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-950 hover:bg-[var(--theme-primary)] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[rgba(var(--theme-primary-rgb),0.3)]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-950 hover:bg-[var(--theme-primary)] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[rgba(var(--theme-primary-rgb),0.3)]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-950 hover:bg-[var(--theme-primary)] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[rgba(var(--theme-primary-rgb),0.3)]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
            <p className="text-center text-slate-500 text-sm">
              {t("© 2026 MathMaster. All rights reserved. Built for FBLA Website Design Competition.")}
            </p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {showBookingModal && selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          />
          
          <div className="relative bg-white dark:bg-slate-950 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
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

            <div className="p-4 sm:p-6 max-h-[calc(90vh-8rem)] sm:max-h-[70vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              {bookingConfirmed ? (
                <div className="text-center py-8">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("Payment Successful!")}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">
                    {t("Your session with")} {selectedTutor.name} {t("has been scheduled.")}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    {t("Payment of")} ${calculatePrice()} {t("confirmed")}
                  </div>
                  <p className="text-sm" style={{ color: "var(--theme-primary)" }}>
                    {bookingDate && formatDate(bookingDate)} at {selectedTime}
                  </p>
                </div>
              ) : showCheckout ? (
                <>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t("Back to booking")}
                  </button>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{t("Order Summary")}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{t("Session")}</span>
                        <span className="text-slate-900 dark:text-white">{bookingDate && formatDate(bookingDate)} • {selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{t("Duration")}</span>
                        <span className="text-slate-900 dark:text-white">{selectedDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{t("Rate")}</span>
                        <span className="text-slate-900 dark:text-white">${selectedTutor.price}/hr</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-900 dark:text-white">{t("Total")}</span>
                          <span className="text-lg gradient-text">${calculatePrice()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                      <h4 className="font-semibold text-slate-900 dark:text-white">{t("Payment Details")}</h4>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Lock className="w-3 h-3" />
                        {t("Secure")}
                      </div>
                    </div>

                    {paymentError && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
                        {paymentError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        {t("Card Number")}
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {t("Expiry Date")}
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {t("CVC")}
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        {t("Cardholder Name")}
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        {t("Billing ZIP Code")}
                      </label>
                      <input
                        type="text"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        placeholder="12345"
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm text-green-700 dark:text-green-400">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <p>{t("Your payment is encrypted and secure.")}</p>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={processPayment}
                    disabled={isProcessing}
                    style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("Processing...")}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {t("Pay")} ${calculatePrice()}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* Step 1: Select Date */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--theme-primary)" }}>1</div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{t("Select a Date")}</h4>
                    </div>
                    
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
                        {t("Dots indicate available days")}
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
                        {t("Select a Time")} {bookingDate && `- ${formatDate(bookingDate)}`}
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
                              type="button"
                              className={`p-3 min-h-[44px] rounded-lg text-sm font-medium transition-all touch-manipulation select-none ${
                                selectedTime === slot
                                  ? "text-white shadow-lg"
                                  : available
                                  ? "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                                  : "bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                              }`}
                              style={selectedTime === slot ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
                            >
                              {slot}
                              {!available && <div className="text-xs mt-1 opacity-70">{t("Booked")}</div>}
                            </button>
                          ))}
                        </div>
                        {getAvailableTimeSlots().length === 0 && (
                          <div className="text-center py-6 mt-4 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="font-medium text-lg mb-1">🚫 {t("Fully Booked")}</div>
                            <div className="text-sm">{t("No available slots for this day")}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-center">
                        {t("Please select a date first")}
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
                        {t("Choose Duration")}
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
                            <div className="text-sm font-medium">{t(duration)}</div>
                            <div className={`text-xs mt-1 ${selectedDuration === duration ? "text-white/80" : "text-slate-500"}`}>
                              ${selectedTutor.price * getDurationHours(duration)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-center">
                        {t("Please select a time first")}
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="flex items-center justify-between mb-6 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--theme-primary)" }}>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 text-sm">{t("Session Total")}</span>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {t(selectedDuration)} × ${selectedTutor.price}/hr
                      </div>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: "var(--theme-primary)" }}>${calculatePrice()}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={proceedToCheckout}
                    disabled={!bookingDate || !selectedTime}
                    style={bookingDate && selectedTime ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
                  >
                    <CreditCard className="w-4 h-4" />
                    {bookingDate && selectedTime ? `${t("Proceed to Checkout")} - $${calculatePrice()}` : t("Select date and time")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
