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
  X,
} from "lucide-react";

interface Profile {
  email: string;
  firstName: string;
  lastName: string;
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [bookingAction, setBookingAction] = useState(false);

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
  }, [searchParams, router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup") {
      const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value.trim();
      const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value.trim();
      const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

      if (!firstName || !lastName) {
        setError("Please fill in all fields.");
        return;
      }

      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      const newProfile: Profile = { email, firstName, lastName };
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
        setError("Account not found. Please sign up first.");
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

    if (!firstName || !lastName || !email) {
      setError("Please fill in all fields.");
      return;
    }

    const updatedProfile: Profile = { email, firstName, lastName };
    localStorage.setItem("mm_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("mm_session", JSON.stringify({ email }));
    setProfile(updatedProfile);
    setIsEditingProfile(false);
    setSuccessMessage("Profile updated successfully!");
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
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // In a real app, you'd verify the current password
    // For now, we'll just simulate success
    setIsChangingPassword(false);
    setSuccessMessage("Password changed successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
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
                {profile.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--theme-primary-light)' }}>Welcome back</p>
                <h1 className="text-4xl font-bold">{profile.firstName} {profile.lastName}</h1>
                <p className="text-slate-400 mt-1">{profile.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 pb-32">
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dashboard</span>
              </Link>
              <Link href="/schedule" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <Calendar className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule</span>
              </Link>
              <Link href="/resources" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <BookOpen className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Resources</span>
              </Link>
              <Link href="/community" className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-center transition-all group shadow-sm hover:shadow-md">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: "var(--theme-primary)" }} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Community</span>
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
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">Profile Settings</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>Edit</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">Change Password</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsChangingPassword(true)}>Update</Button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" onClick={handleSignOut} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Edit Profile Modal */}
          {isEditingProfile && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                  <button onClick={() => { setIsEditingProfile(false); setError(""); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                    <Input
                      type="text"
                      name="firstName"
                      defaultValue={profile.firstName}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                    <Input
                      type="text"
                      name="lastName"
                      defaultValue={profile.lastName}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <Input
                      type="email"
                      name="email"
                      defaultValue={profile.email}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setIsEditingProfile(false); setError(""); }} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {isChangingPassword && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>
                  <button onClick={() => { setIsChangingPassword(false); setError(""); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setIsChangingPassword(false); setError(""); }} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Update Password
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
            {bookingAction ? "Sign in to Book a Session" : "Start Your Math Journey"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-md">
            {bookingAction 
              ? "Create an account or sign in to book tutoring sessions with our expert peer tutors."
              : "Join thousands of students improving their math skills through peer learning and collaboration."
            }
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">Access to 500+ learning resources</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">Connect with peer tutors 24/7</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">Track your progress with analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70" />
              <span className="text-white/80">Join a supportive community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative overflow-hidden">
        <GlowingOrbs variant="hero" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-transparent to-slate-950" />
        <FadeIn className="relative w-full max-w-md">
          {/* Booking redirect notice */}
          {bookingAction && (
            <div 
              className="mb-6 p-4 rounded-xl border text-sm"
              style={{ 
                backgroundColor: "color-mix(in srgb, var(--theme-primary) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--theme-primary) 30%, transparent)",
                color: "var(--theme-primary-light)"
              }}
            >
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                <span>Sign in to complete your booking</span>
              </div>
            </div>
          )}
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <MathLogo className="w-10 h-10" />
              <span className="text-xl font-bold text-white">MathMaster</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-slate-400 mt-2">
              {mode === "signin" 
                ? (bookingAction ? "Sign in to book your tutoring session" : "Sign in to continue learning")
                : "Start your math journey today"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-slate-900 rounded-xl">
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950 border border-red-900 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <Input name="firstName" label="First Name" placeholder="John" required />
                <Input name="lastName" label="Last Name" placeholder="Doe" required />
              </div>
            )}
            <Input name="email" label="Email" type="email" placeholder="you@example.com" required />
            <Input name="password" label="Password" type="password" placeholder="••••••••" required />
            {mode === "signup" && (
              <Input name="confirm" label="Confirm Password" type="password" placeholder="••••••••" required />
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-violet-500 hover:underline">Forgot password?</a>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {mode === "signin" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                className="text-violet-500 font-medium hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
