"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn } from "@/components/motion";
import { useTranslations } from "@/components/LanguageProvider";
import {
  Star,
  Users,
  Clock,
  MapPin,
  Video,
  Search,
  Filter,
  BookOpen,
  Calculator,
  SquareRadical,
  Infinity,
  TrendingUp,
  Zap,
  Target,
  Brain,
  Award,
  Globe,
  ArrowLeft,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
} from "lucide-react";

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
    hash = hash & hash;
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

// Check if a day is fully booked
const isDayFullyBooked = (tutorName: string, dayOfWeek: number): boolean => {
  const seed = `${tutorName}-${dayOfWeek}-fullbook`;
  return seededRandom(seed) < 0.15;
};

// Get tutor availability rate based on patterns
const getTutorAvailability = (tutorName: string, dayOfWeek: number): number => {
  const patterns: Record<string, number[]> = {
    "Sarah Johnson": [0.3, 0.8, 0.6, 0.7, 0.8, 0.5, 0.4],
    "Priya Patel": [0.4, 0.6, 0.8, 0.7, 0.5, 0.9, 0.7],
    "Michael Chen": [0.4, 0.7, 0.8, 0.9, 0.7, 0.6, 0.3],
    "Emma Rodriguez": [0.3, 0.7, 0.6, 0.8, 0.7, 0.5, 0.8],
    "Alex Thompson": [0.5, 0.4, 0.8, 0.6, 0.9, 0.7, 0.6],
    "Dr. Jessica Wu": [0.3, 0.7, 0.8, 0.6, 0.7, 0.5, 0.4],
    "David Kim": [0.4, 0.8, 0.7, 0.8, 0.6, 0.7, 0.3],
    "Maria Santos": [0.5, 0.6, 0.7, 0.8, 0.7, 0.8, 0.6],
    "Robert Foster": [0.3, 0.7, 0.6, 0.7, 0.8, 0.6, 0.5],
    "Lisa Zhang": [0.4, 0.8, 0.7, 0.6, 0.7, 0.8, 0.4],
    "James Wilson": [0.3, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5],
    "Dr. Rachel Green": [0.4, 0.7, 0.6, 0.8, 0.7, 0.5, 0.4],
  };
  return patterns[tutorName]?.[dayOfWeek] || 0.6;
};

const ALL_TIME_SLOTS = generateTimeSlots();
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currentDate = new Date();

const allTutors = [
  {
    name: "Sarah Johnson",
    initials: "SJ",
    subjects: "Calculus, Statistics, Differential Equations",
    rating: 4.9,
    reviews: 128,
    price: 52,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    available: true,
    experience: "8 years",
    education: "PhD Mathematics, MIT",
    specialties: ["AP Calculus BC", "College Statistics", "Research Methods"],
    languages: ["English", "Spanish"],
    responseTime: "< 2 hours",
    completedSessions: 340,
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
    experience: "5 years",
    education: "MS Mathematics, Stanford",
    specialties: ["Linear Algebra", "Proof Writing", "Competition Math"],
    languages: ["English", "Hindi"],
    responseTime: "< 1 hour",
    completedSessions: 280,
  },
  {
    name: "Michael Chen",
    initials: "MC", 
    subjects: "Algebra, Trigonometry, SAT Math",
    rating: 3.9,
    reviews: 84,
    price: 29,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    available: true,
    experience: "4 years",
    education: "BS Mathematics, UC Berkeley", 
    specialties: ["SAT/ACT Prep", "Algebra II", "Pre-Calculus"],
    languages: ["English", "Mandarin"],
    responseTime: "< 3 hours",
    completedSessions: 195,
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
    experience: "6 years",
    education: "MS Applied Mathematics, UCLA",
    specialties: ["Geometry Proofs", "Trigonometry", "Pre-Calc"],
    languages: ["English", "Spanish", "French"],
    responseTime: "< 1 hour", 
    completedSessions: 267,
  },
  {
    name: "Alex Thompson",
    initials: "AT",
    subjects: "AP Calculus, Physics, Advanced Math",
    rating: 4.3,
    reviews: 73,
    price: 38,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    available: true,
    experience: "3 years",
    education: "BS Physics & Mathematics, Caltech",
    specialties: ["AP Calculus AB/BC", "Physics Integration", "Competition Math"],
    languages: ["English"],
    responseTime: "< 4 hours",
    completedSessions: 156,
  },
  {
    name: "Dr. Jessica Wu",
    initials: "JW",
    subjects: "Statistics, Data Science, Research",
    rating: 4.8,
    reviews: 89,
    price: 48,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop",
    available: true,
    experience: "7 years",
    education: "PhD Statistics, Harvard",
    specialties: ["Statistical Modeling", "Data Analysis", "Research Design"],
    languages: ["English", "Mandarin"],
    responseTime: "< 2 hours",
    completedSessions: 203,
  },
  {
    name: "David Kim",
    initials: "DK",
    subjects: "Calculus, Physics, Engineering Math",
    rating: 4.6,
    reviews: 67,
    price: 44,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
    available: true,
    experience: "5 years",
    education: "MS Applied Mathematics, MIT",
    specialties: ["Engineering Calculus", "Differential Equations", "Vector Calculus"],
    languages: ["English", "Korean"],
    responseTime: "< 3 hours",
    completedSessions: 189,
  },
  {
    name: "Maria Santos",
    initials: "MS",
    subjects: "Algebra, Precalculus, SAT Prep",
    rating: 4.0,
    reviews: 95,
    price: 32,
    image: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=200&h=200&fit=crop",
    available: true,
    experience: "4 years",
    education: "BS Mathematics Education, UT Austin",
    specialties: ["Algebra I/II", "Test Prep", "Study Skills"],
    languages: ["English", "Spanish", "Portuguese"],
    responseTime: "< 2 hours",
    completedSessions: 234,
  },
  {
    name: "Robert Foster",
    initials: "RF",
    subjects: "Geometry, Trigonometry, Competition Math",
    rating: 4.4,
    reviews: 78,
    price: 40,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
    available: true,
    experience: "6 years",
    education: "MS Mathematics, Princeton",
    specialties: ["Euclidean Geometry", "Math Olympiad", "Proof Techniques"],
    languages: ["English", "German"],
    responseTime: "< 1 hour",
    completedSessions: 167,
  },
  {
    name: "Lisa Zhang",
    initials: "LZ",
    subjects: "Linear Algebra, Abstract Algebra, Logic",
    rating: 4.7,
    reviews: 85,
    price: 46,
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop",
    available: true,
    experience: "5 years",
    education: "PhD Pure Mathematics, Yale",
    specialties: ["Abstract Algebra", "Logic & Set Theory", "Advanced Linear Algebra"],
    languages: ["English", "Mandarin"],
    responseTime: "< 2 hours",
    completedSessions: 145,
  },
  {
    name: "James Wilson",
    initials: "JW2",
    subjects: "Calculus, AP Math, College Prep",
    rating: 4.2,
    reviews: 92,
    price: 36,
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop",
    available: true,
    experience: "4 years", 
    education: "MS Applied Mathematics, Columbia",
    specialties: ["AP Calculus", "College Transition", "Study Strategies"],
    languages: ["English"],
    responseTime: "< 3 hours",
    completedSessions: 178,
  },
  {
    name: "Dr. Rachel Green",
    initials: "RG", 
    subjects: "Statistics, Probability, Biostatistics",
    rating: 4.8,
    reviews: 76,
    price: 48,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    available: true,
    experience: "9 years",
    education: "PhD Biostatistics, Johns Hopkins",
    specialties: ["Medical Statistics", "Probability Theory", "Experimental Design"],
    languages: ["English"],
    responseTime: "< 2 hours",
    completedSessions: 213,
  },
];

export default function TutorsPage() {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  
  // Expanded specialties state
  const [expandedSpecialties, setExpandedSpecialties] = useState<Record<string, boolean>>({});
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<typeof allTutors[0] | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("1 hour");
  const [bookingMonth, setBookingMonth] = useState(currentDate.getMonth());
  const [bookingYear, setBookingYear] = useState(currentDate.getFullYear());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
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
    const session = localStorage.getItem("mm_session");
    const isLoggedInFlag = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!session || isLoggedInFlag === "true");
  }, []);

  // Get unique subjects
  const subjects = ["All", ...new Set(allTutors.flatMap(tutor => 
    tutor.subjects.split(", ").map(s => s.trim())
  ))];

  // Filter and sort tutors
  const filteredTutors = allTutors
    .filter(tutor => {
      const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.subjects.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === "All" || 
                            tutor.subjects.toLowerCase().includes(selectedSubject.toLowerCase());
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "experience":
          return parseInt(b.experience) - parseInt(a.experience);
        default:
          return 0;
      }
    });

  // Duration price calculation
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

  // Get all time slots with availability
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

  // Format date for display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleBookNow = (tutor: typeof allTutors[0]) => {
    if (!isLoggedIn) {
      window.location.href = "/auth?redirect=/tutors&action=book";
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
    // Reset payment fields
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardName("");
    setBillingZip("");
    setPaymentError("");
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  // Validate card details
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

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (!selectedTutor || !bookingDate || !selectedTime) return;
    setShowCheckout(true);
  };

  // Process payment and confirm booking
  const processPayment = async () => {
    if (!validateCard()) return;
    
    setIsProcessing(true);
    setPaymentError("");
    
    // Simulate payment processing
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
      paymentMethod: `•••• ${cardNumber.slice(-4)}`,
    };
    
    // Save to localStorage
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24 pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 md:mb-8">
        <FadeIn>
          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <Link 
              href="/schedule"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("Back to Schedule")}</span>
              <span className="sm:hidden">{t("Back")}</span>
            </Link>
          </div>
          
          <div className="text-center mb-6 md:mb-8">
            <SectionLabel>{t("Our Tutors")}</SectionLabel>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t("Expert Math Tutors")}
              <span className="gradient-text block">{t("Ready to Help")}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4">
              {t("Connect with experienced peer tutors and professionals who are passionate about helping you succeed in mathematics.")}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t("Search tutors or subjects...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              />
            </div>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject === "All" ? t("All") : subject}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <option value="rating">{t("Highest Rated")}</option>
              <option value="price_low">{t("Price: Low to High")}</option>
              <option value="price_high">{t("Price: High to Low")}</option>
              <option value="experience">{t("Most Experience")}</option>
            </select>
          </div>
        </FadeIn>
      </div>

      {/* Tutors Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTutors.map((tutor, index) => (
            <FadeIn key={tutor.name} delay={index * 0.05}>
              <Card className="p-6 hover:shadow-2xl transition-all duration-300 group/tutor h-full flex flex-col">
                <div className="text-center mb-4">
                  <div className="relative w-36 h-44 mx-auto mb-4 group-hover/tutor:scale-105 transition-transform duration-300">
                    <img
                      src={tutor.image}
                      alt={tutor.name}
                      className="w-full h-full object-cover object-[center_20%] rounded-2xl shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-white dark:border-slate-800 flex items-center justify-center shadow-md">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover/tutor:text-[var(--theme-primary)] transition-colors">
                    {tutor.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {tutor.education}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <div className="flex items-center gap-0.5 px-2 py-1 rounded-full" style={{ background: 'rgba(var(--theme-primary-rgb), 0.1)' }}>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        {tutor.rating}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      ({tutor.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-4 flex-1">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                      {t("Subjects")}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {tutor.subjects}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      {t("Specialties")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(expandedSpecialties[tutor.name] ? tutor.specialties : tutor.specialties.slice(0, 2)).map(specialty => (
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
                              [tutor.name]: !prev[tutor.name]
                            }));
                          }}
                          className="text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer hover:opacity-80 font-medium"
                          style={{ 
                            background: 'var(--theme-primary)',
                            color: 'white'
                          }}
                        >
                          {expandedSpecialties[tutor.name] ? t("Show less") : `+${tutor.specialties.length - 2}`}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                      <span className="text-slate-600 dark:text-slate-300">
                        {tutor.responseTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                      <span className="text-slate-600 dark:text-slate-300">
                        {tutor.completedSessions}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                          ${tutor.price}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">/hr</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {tutor.experience}
                        </p>
                        <div className="flex gap-1 mt-1 justify-end">
                          {tutor.languages.slice(0, 2).map(lang => (
                            <span 
                              key={lang}
                              className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button 
                    onClick={() => handleBookNow(tutor)}
                    className="w-full group/btn"
                    style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                  >
                    <CalendarPlus className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                    {t("Book Now")}
                  </Button>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>

        {filteredTutors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t("No tutors found")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("Try adjusting your search criteria or browse all available tutors.")}
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-950 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            {bookingConfirmed ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}>
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("Payment Successful!")}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {t("Your session with")} {selectedTutor.name} {t("has been booked for")} {bookingDate && formatDate(bookingDate)} {t("at")} {selectedTime}.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  {t("Payment of")} ${calculatePrice()} {t("confirmed")}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("Check your schedule for details. A confirmation email has been sent.")}
                </p>
              </div>
            ) : showCheckout ? (
              /* Checkout / Payment Step */
              <>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowCheckout(false)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("Checkout")}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t("Complete your booking")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowBookingModal(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Summary */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={selectedTutor.image} 
                        alt={selectedTutor.name}
                        className="w-12 h-12 rounded-full object-cover object-[center_20%]"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{selectedTutor.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {bookingDate && formatDate(bookingDate)} • {selectedTime} • {selectedDuration}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{t("Session Rate")}</span>
                        <span className="text-slate-900 dark:text-white">${selectedTutor.price}/hr × {getDurationHours(selectedDuration)} hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{t("Platform Fee")}</span>
                        <span className="text-slate-900 dark:text-white">$0.00</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-900 dark:text-white">{t("Total")}</span>
                        <span className="text-lg gradient-text">${calculatePrice()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
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
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{ boxShadow: cardNumber ? '0 0 0 2px rgba(var(--theme-primary-rgb), 0.2)' : undefined }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 opacity-50" />
                        </div>
                      </div>
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

                  {/* Security Note */}
                  <div className="flex items-center gap-2 mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm text-green-700 dark:text-green-400">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <p>{t("Your payment information is encrypted and secure. We never store your card details.")}</p>
                  </div>

                  {/* Pay Button */}
                  <Button 
                    className="w-full mt-6" 
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
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedTutor.image} 
                        alt={selectedTutor.name}
                        className="w-14 h-14 rounded-full object-cover object-[center_20%]"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTutor.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedTutor.subjects}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowBookingModal(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Step 1: Select Date */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "var(--theme-primary)" }}
                      >1</div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{t("Select a Date")}</h4>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
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
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {new Date(bookingYear, bookingMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button 
                          onClick={() => {
                            if (bookingMonth === 11) {
                              setBookingMonth(0);
                              setBookingYear(bookingYear + 1);
                            } else {
                              setBookingMonth(bookingMonth + 1);
                            }
                          }}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {days.map(day => (
                          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">{day}</div>
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
                              {!available && <div className="text-xs mt-1 opacity-70">{t("Booked")}</div>}
                            </button>
                          ))}
                        </div>
                        {getAvailableTimeSlots().length === 0 && (
                          <div className="text-center py-6 mt-4 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="font-medium text-lg mb-1">{t("🚫 Fully Booked")}</div>
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
                        {t("Select Duration")}
                      </h4>
                    </div>
                    
                    {selectedTime ? (
                      <div className="flex gap-2">
                        {["1 hour", "1.5 hours", "2 hours"].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => setSelectedDuration(duration)}
                            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all ${
                              selectedDuration === duration
                                ? "text-white shadow-lg"
                                : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                            style={selectedDuration === duration ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-center">
                        {t("Please select a time first")}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedTime && (
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 mb-6">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{t("Booking Summary")}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t("Tutor")}</span>
                          <span className="text-slate-900 dark:text-white font-medium">{selectedTutor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t("Date")}</span>
                          <span className="text-slate-900 dark:text-white font-medium">{bookingDate && formatDate(bookingDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t("Time")}</span>
                          <span className="text-slate-900 dark:text-white font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">{t("Duration")}</span>
                          <span className="text-slate-900 dark:text-white font-medium">{t(selectedDuration)}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-slate-900 dark:text-white font-semibold">{t("Total")}</span>
                            <span className="text-lg font-bold gradient-text">${calculatePrice()}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            ${selectedTutor.price}/hr × {getDurationHours(selectedDuration)} {t("hours")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <Button 
                    className="w-full" 
                    onClick={proceedToCheckout}
                    disabled={!bookingDate || !selectedTime}
                    style={bookingDate && selectedTime ? { background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" } : {}}
                  >
                    <CreditCard className="w-4 h-4" />
                    {bookingDate && selectedTime ? `${t("Proceed to Checkout")} - $${calculatePrice()}` : t("Select date and time to book")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}