"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { MathLogo } from "@/components/MathLogo";
import { FadeIn, GlowingOrbs } from "@/components/motion";
import { useLanguage } from "@/components/LanguageProvider";
import { languages } from "@/lib/i18n";
import {
  User,
  Lock,
  Mail,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  BarChart3,
  Calendar,
  CalendarCheck,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  GraduationCap,
  Globe,
  Accessibility,
  X,
} from "lucide-react";

interface Profile {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [bookingAction, setBookingAction] = useState(false);
  const [isColorblindMode, setIsColorblindMode] = useState(false);

  useEffect(() => {
    // Check for redirect params
    const redirect = searchParams.get("redirect");
    const action = searchParams.get("action");
    if (redirect) {
      setRedirectUrl(redirect);
    }
    if (action === "book") {
      setBookingAction(true);
    }
    
    try {
      const stored = JSON.parse(localStorage.getItem("mm_profile") || "null");
      const session = JSON.parse(localStorage.getItem("mm_session") || "null");
      if (stored && session && session.email === stored.email) {
        setProfile(stored);
        // If already logged in and there's a redirect, go there
        if (redirect) {
          localStorage.setItem("isLoggedIn", "true");
          router.push(redirect);
        }
      }
    } catch {
      // Ignore
    }

    const storedColorblind = localStorage.getItem("mm_colorblind_mode") === "true";
    setIsColorblindMode(storedColorblind);
    if (storedColorblind) {
      document.documentElement.classList.add("colorblind-mode");
      document.body.classList.add("colorblind-mode");
    } else {
      document.documentElement.classList.remove("colorblind-mode");
      document.body.classList.remove("colorblind-mode");
    }
  }, [searchParams, router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) {
      setError(t("Please fill in all fields."));
      return;
    }

    if (mode === "signup") {
      const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value.trim();
      const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value.trim();
      const username = (form.elements.namedItem("username") as HTMLInputElement)?.value.trim() || "";
      const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

      if (!firstName || !lastName) {
        setError(t("Please fill in all fields."));
        return;
      }

      if (password !== confirm) {
        setError(t("Passwords do not match."));
        return;
      }

      // Use username if provided, otherwise default to FirstName LastName
      const displayUsername = username || `${firstName} ${lastName}`;
      const newProfile: Profile = { email, firstName, lastName, username: displayUsername };
      localStorage.setItem("mm_profile", JSON.stringify(newProfile));
      localStorage.setItem("mm_session", JSON.stringify({ email }));
      localStorage.setItem("isLoggedIn", "true");
      setProfile(newProfile);
      router.push(redirectUrl || "/dashboard");
    } else {
      const storedProfile = JSON.parse(localStorage.getItem("mm_profile") || "null");
      if (storedProfile && storedProfile.email === email) {
        localStorage.setItem("mm_session", JSON.stringify({ email }));
        localStorage.setItem("isLoggedIn", "true");
        setProfile(storedProfile);
        router.push(redirectUrl || "/dashboard");
      } else {
        setError(t("Account not found. Please sign up first."));
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("mm_session");
    localStorage.removeItem("isLoggedIn");
    setProfile(null);
  };

  const handleUpdateProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    const form = e.currentTarget;
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value.trim();
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const username = (form.elements.namedItem("username") as HTMLInputElement)?.value.trim() || "";

    if (!firstName || !lastName || !email) {
      setError(t("Please fill in all fields."));
      return;
    }

    // Use username if provided, otherwise default to FirstName LastName
    const displayUsername = username || `${firstName} ${lastName}`;
    const updatedProfile: Profile = { email, firstName, lastName, username: displayUsername };
    localStorage.setItem("mm_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("mm_session", JSON.stringify({ email }));
    setProfile(updatedProfile);
    setIsEditingProfile(false);
    setSuccessMessage(t("Profile updated successfully!"));
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("Please fill in all fields."));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("New passwords do not match."));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("Password must be at least 6 characters."));
      return;
    }

    // In a real app, you'd verify the current password
    // For now, we'll just simulate success
    setIsChangingPassword(false);
    setSuccessMessage(t("Password changed successfully!"));
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleColorblindToggle = () => {
    setIsColorblindMode((prev) => {
      const next = !prev;
      localStorage.setItem("mm_colorblind_mode", String(next));
      if (next) {
        document.documentElement.classList.add("colorblind-mode");
        document.body.classList.add("colorblind-mode");
      } else {
        document.documentElement.classList.remove("colorblind-mode");
        document.body.classList.remove("colorblind-mode");
      }
      return next;
    });
  };

  if (profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
        {/* Hero Header */}
        <header className="relative overflow-hidden">
          <GlowingOrbs variant="section" />
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=400&fit=crop"
              alt="Account"
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/98 via-slate-950/95 to-black/98" />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }}>
                {(profile.username || profile.firstName).charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--theme-primary-light)' }}>{t("Welcome back")}</p>
                <h1 className="text-4xl font-bold">{profile.username || `${profile.firstName} ${profile.lastName}`}</h1>
                <p className="text-slate-400 mt-1">{profile.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 pb-32">
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t("Quick Actions")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Dashboard")}</span>
              </Link>
              <Link href="/schedule" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <Calendar className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Schedule")}</span>
              </Link>
              <Link href="/resources" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <BookOpen className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Resources")}</span>
              </Link>
              <Link href="/community" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Community")}</span>
              </Link>
            </div>
          </Card>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-300 font-medium">{successMessage}</span>
            </div>
          )}

          <Card>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t("Account Settings")}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">{t("Profile Settings")}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>{t("Edit")}</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">{t("Change Password")}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsChangingPassword(true)}>{t("Update")}</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{t("Language")}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t("Choose your language")}</div>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as typeof language)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Accessibility className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{t("Colorblind Mode")}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t("Use a high-contrast, colorblind-safe palette")}</div>
                  </div>
                </div>
                <Button
                  variant={isColorblindMode ? "primary" : "outline"}
                  size="sm"
                  onClick={handleColorblindToggle}
                  type="button"
                >
                  {isColorblindMode ? t("On") : t("Off")}
                </Button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" onClick={handleSignOut} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
                <LogOut className="w-4 h-4" />
                {t("Sign Out")}
              </Button>
            </div>
          </Card>

          {/* Edit Profile Modal */}
          {isEditingProfile && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white dark:bg-slate-950 rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("Edit Profile")}</h3>
                  <button onClick={() => { setIsEditingProfile(false); setError(""); }} type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("First Name")}</label>
                    <Input
                      type="text"
                      name="firstName"
                      defaultValue={profile.firstName}
                      placeholder={t("Enter first name")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("Last Name")}</label>
                    <Input
                      type="text"
                      name="lastName"
                      defaultValue={profile.lastName}
                      placeholder={t("Enter last name")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("Username")}</label>
                    <Input
                      type="text"
                      name="username"
                      defaultValue={profile.username !== `${profile.firstName} ${profile.lastName}` ? profile.username : ""}
                      placeholder={t("Optional - for privacy")}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("Leave blank to use your full name as display name")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("Email")}</label>
                    <Input
                      type="email"
                      name="email"
                      defaultValue={profile.email}
                      placeholder={t("Enter email")}
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setIsEditingProfile(false); setError(""); }} className="flex-1">
                      {t("Cancel")}
                    </Button>
                    <Button type="submit" className="flex-1">
                      {t("Save Changes")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {isChangingPassword && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white dark:bg-slate-950 rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("Change Password")}</h3>
                  <button onClick={() => { setIsChangingPassword(false); setError(""); }} type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("Current Password")}</label>
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder={t("Enter current password")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("New Password")}</label>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder={t("Enter new password")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("Confirm New Password")}</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder={t("Confirm new password")}
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setIsChangingPassword(false); setError(""); }} className="flex-1">
                      {t("Cancel")}
                    </Button>
                    <Button type="submit" className="flex-1">
                      {t("Update Password")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1596496050755-c923e73e42e1?w=1200&h=1600&fit=crop"
          alt="Student studying"
          fill
          className="object-cover"
        />
        <div 
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 90%, transparent), color-mix(in srgb, var(--theme-primary-light) 85%, transparent))" }}
        />
        <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            {bookingAction ? t("Sign In to Book a Session") : t("Start Your Math Journey")}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-md">
            {bookingAction 
              ? t("Create an account or sign in to book tutoring sessions with our expert peer tutors.")
              : t("Join thousands of students improving their math skills through peer learning and collaboration.")
            }
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">{t("Access to 500+ learning resources")}</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">{t("Connect with peer tutors 24/7")}</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">{t("Track your progress with analytics")}</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">{t("Join a supportive community")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <GlowingOrbs variant="hero" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 dark:from-slate-950 via-transparent to-slate-50 dark:to-slate-950" />
        <FadeIn className="relative w-full max-w-md">
          {/* Booking redirect notice */}
          {bookingAction && (
            <div 
              className="mb-6 p-4 rounded-xl border text-sm bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
            >
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <CalendarCheck className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                <span>{t("Sign in to complete your booking")}</span>
              </div>
            </div>
          )}
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <MathLogo className="w-10 h-10" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">MathMaster</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {mode === "signin" ? t("Welcome back") : t("Create your account")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {mode === "signin" 
                ? (bookingAction ? t("Sign in to book your tutoring session") : t("Sign in to continue learning"))
                : t("Start your math journey today")}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              {t("Sign In")}
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              {t("Sign Up")}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="firstName" label={t("First Name")} placeholder={t("Malhar")} required />
                  <Input name="lastName" label={t("Last Name")} placeholder={t("Pawar")} required />
                </div>
                <div>
                  <Input 
                    name="username" 
                    label={t("Username")} 
                    placeholder={t("Optional - for privacy")} 
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("Leave blank to use your full name as display name")}
                  </p>
                </div>
              </>
            )}
            <Input name="email" label={t("Email")} type="email" placeholder={t("you@example.com")} required />
            <Input name="password" label={t("Password")} type="password" placeholder={t("••••••••")} required />
            {mode === "signup" && (
              <Input name="confirm" label={t("Confirm Password")} type="password" placeholder={t("••••••••")} required />
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" onClick={() => alert(t("Password reset functionality coming soon!"))} className="text-sm hover:underline" style={{ color: "var(--theme-primary)" }}>{t("Forgot password?")}</button>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {mode === "signin" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  {t("Sign In")}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {t("Create Account")}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 dark:text-slate-500 text-sm">
              {mode === "signin" ? t("Don't have an account?") : t("Already have an account?")}{" "}
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                className="font-medium hover:underline" style={{ color: "var(--theme-primary)" }}
              >
                {mode === "signin" ? t("Sign up") : t("Sign in")}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {t("By continuing, you agree to our Terms of Service and Privacy Policy.")}
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
