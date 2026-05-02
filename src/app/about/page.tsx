// i18n-allow-hardcoded
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import malharPawarImage from "../../../Images/Malhar Pawar.png";
import ayaanOberoiImage from "../../../Images/Ayaan Oberoi.png";
import khushKothariImage from "../../../Images/Khush Kothari.png";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, FadeInStagger, FadeInStaggerItem, GlowingOrbs, PageWrapper, HeroText, CardReveal } from "@/components/motion";
import { useTranslations } from "@/components/LanguageProvider";
import {
  Heart,
  Target,
  Rocket,
  MessageCircle,
  Users,
  Lightbulb,
  TrendingUp,
  Accessibility,
  HandHelping,
  Award,
  GraduationCap,
  Globe,
  X,
} from "lucide-react";

const getStats = (t: (key: string) => string) => [
  { value: "10K+", label: t("Active Learners"), sublabel: t("Improving weekly"), icon: Users },
  { value: "500+", label: t("Lessons & Resources"), sublabel: t("Guided explanations"), icon: GraduationCap },
  { value: "24/7", label: t("Community Help"), sublabel: t("Ask anytime"), icon: Globe },
];

const getSteps = (t: (key: string) => string) => [
  { number: "01", title: t("Join the Community"), description: t("Create your free account and set up your student profile. Tell us about your learning goals."), image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop" },
  { number: "02", title: t("Connect & Learn"), description: t("Access resources, join study groups, attend live sessions, and ask questions in the forum."), image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop" },
  { number: "03", title: t("Track & Succeed"), description: t("Monitor your progress on the dashboard, earn achievements, and watch your skills grow."), image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop" },
];

const getTeam = (t: (key: string) => string) => [
  {
    id: "malhar-pawar",
    name: "Malhar Pawar",
    role: t("Founder"),
    initials: "MP",
    bio: t("Leads MathMaster with a focus on accessible, high-quality math learning."),
    fullBio: t(
      "Malhar Pawar founded MathMaster to give students a clearer, more supportive way to learn math. He leads product direction and learning experience quality, with a focus on making the platform approachable without losing rigor."
    ),
    image: malharPawarImage,
  },
  {
    id: "ayaan-oberoi",
    name: "Ayaan Oberoi",
    role: t("Head of Technology"),
    initials: "AO",
    bio: t("Leads the technical foundation of MathMaster and turns ideas into reliable software."),
    fullBio: t(
      "Ayaan Oberoi leads technology at MathMaster, with a focus on performance, scalability, and the systems behind the learning experience. He works across the stack to keep the platform fast, reliable, and easy to extend."
    ),
    image: ayaanOberoiImage,
  },
  {
    id: "khush-kothari",
    name: "Khush Kothari",
    role: t("Community Manager"),
    initials: "KK",
    bio: t("Shapes the community experience so students can connect, collaborate, and keep learning together."),
    fullBio: t(
      "Khush Kothari leads the MathMaster community experience, shaping how students connect, ask questions, and support one another. He focuses on creating a welcoming environment where peer learning stays active and useful every day."
    ),
    image: khushKothariImage,
  },
];

const teamImageStyle = {
  objectPosition: "center 20%",
} as const;

const getValues = (t: (key: string) => string) => [
  { icon: Accessibility, title: t("Accessibility"), description: t("Quality education should be available to everyone, regardless of background or location."), color: "violet" },
  { icon: HandHelping, title: t("Community"), description: t("Learning is better together. We foster collaboration and peer support."), color: "green" },
  { icon: Lightbulb, title: t("Clarity"), description: t("Complex concepts deserve clear explanations. No jargon, just understanding."), color: "blue" },
  { icon: TrendingUp, title: t("Growth"), description: t("Every student can improve. We celebrate progress, not perfection."), color: "purple" },
];

function getTeamImageStyle(memberId: string) {
  if (memberId === "ayaan-oberoi") {
    return { objectPosition: "center 34%" } as const;
  }

  if (memberId === "khush-kothari") {
    return { objectPosition: "center 36%" } as const;
  }

  return teamImageStyle;
}

export default function AboutPage() {
  const { t } = useTranslations();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const stats = getStats(t);
  const steps = getSteps(t);
  const team = getTeam(t);
  const values = getValues(t);
  const selectedMember = team.find((member) => member.id === selectedMemberId) ?? null;

  return (
    <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      {/* Team Member Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedMemberId(null)}
        >
          <div 
            className="animate-scale-pop flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative bg-slate-200/70 px-4 pb-4 pt-14 dark:bg-slate-800/70 sm:px-6 sm:pb-6 sm:pt-16">
              <button
                onClick={() => setSelectedMemberId(null)}
                className="absolute right-4 top-4 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/50 sm:right-5 sm:top-5"
                aria-label={t("Close")}
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-[28px] bg-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.14)] dark:bg-slate-950/70 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)] sm:max-w-[280px] md:max-w-[320px]">
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                  style={getTeamImageStyle(selectedMember.id)}
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
              </div>
              <div className="px-2 pb-0 pt-4 text-center sm:px-4 sm:pt-5">
                <h3 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{selectedMember.name}</h3>
                <p className="text-sm font-medium sm:text-base" style={{ color: 'var(--theme-primary)' }}>{selectedMember.role}</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 pt-5 sm:p-8 sm:pt-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                {selectedMember.fullBio}
              </p>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button className="w-full sm:w-auto" onClick={() => setSelectedMemberId(null)}>
                  {t("Close")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop"
            alt="Students collaborating"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 md:right-20 w-40 h-40 md:w-64 md:h-64 rounded-full blur-3xl opacity-30" style={{ background: 'var(--theme-primary)' }} />
        <div className="absolute bottom-20 left-10 md:left-20 w-32 h-32 md:w-48 md:h-48 rounded-full blur-3xl opacity-25" style={{ background: 'var(--theme-primary-light)' }} />
        
        {/* Floating math symbols - hidden on mobile */}
        <div className="hidden md:block absolute top-24 left-[10%] text-4xl md:text-7xl font-serif animate-bounce opacity-10" style={{ animationDuration: '3s', color: 'var(--theme-primary-light)' }}>∫</div>
        <div className="hidden md:block absolute top-36 right-[15%] text-3xl md:text-6xl font-serif animate-bounce opacity-10" style={{ animationDuration: '4s', animationDelay: '1s', color: 'var(--theme-primary)' }}>π</div>
        <div className="hidden lg:block absolute bottom-32 left-[8%] text-3xl md:text-5xl font-serif animate-bounce opacity-10" style={{ animationDuration: '3.5s', animationDelay: '0.5s', color: 'var(--theme-primary-light)' }}>∑</div>
        <div className="hidden lg:block absolute bottom-24 right-[12%] text-3xl md:text-6xl font-serif animate-bounce opacity-10" style={{ animationDuration: '4.5s', animationDelay: '1.5s', color: 'var(--theme-primary)' }}>√</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur border rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(var(--theme-primary-rgb), 0.2)', borderColor: 'rgba(var(--theme-primary-rgb), 0.3)', color: 'var(--theme-primary-light)' }}>
              <Heart className="w-4 h-4" />
              {t("Our Story")}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
              {t("About")} <span className="gradient-text">MathMaster</span>
            </h1>
            <p className="text-base sm:text-xl text-white leading-relaxed mb-8">
              {t("We make math feel learnable again — with clear practice, strong explanations, and a community that helps you when you're stuck.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth">
                <Button size="lg">
                  <Rocket className="w-5 h-5" />
                  {t("Get Started")}
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" variant="outline" className="border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/15 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                  {t("Visit the Forum")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800/50 relative overflow-hidden">
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div 
                key={stat.label} 
                className="text-center p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 group"
                style={{ boxShadow: '0 0 25px rgba(var(--theme-primary-rgb), 0.1)' }}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" style={{ color: "var(--theme-primary)" }}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-bold gradient-text font-mono mb-2">{stat.value}</div>
                <p className="text-slate-900 dark:text-white font-medium">{stat.label}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative aspect-square max-w-lg">
                <div className="absolute inset-0 rounded-3xl rotate-3 opacity-20" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))' }} />
                <Image
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=600&fit=crop"
                  alt="Students learning together"
                  fill
                  className="object-cover rounded-3xl"
                />
              </div>
              {/* Floating badge — hidden on mobile to avoid overflow collision */}
              <div
                className="hidden sm:block absolute -bottom-6 -right-6 bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-4 border border-slate-200 dark:border-slate-700 animate-float"
                style={{ boxShadow: '0 10px 40px rgba(var(--theme-primary-rgb), 0.15)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">98% {t("Success Rate")}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t("Students improving grades")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <SectionLabel icon={Target} className="mb-6">
                {t("Our Mission")}
              </SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                {t("Making Math Accessible to Everyone")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {t("MathMaster was founded on the belief that everyone deserves access to quality math education. We're building a community where students can learn from each other, share knowledge, and grow together in their mathematical journey.")}
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {t("Whether you're struggling with basic algebra or diving into calculus, we're here to help you succeed. Our platform combines the power of peer learning with expert resources to create an environment where every student can thrive.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Background gradient orbs */}
        <GlowingOrbs variant="section" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel icon={Rocket} className="mb-6">
              {t("Getting Started")}
            </SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-6">
              {t("How It Works")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-32 left-[60%] w-full h-0.5 z-0" style={{ background: 'linear-gradient(to right, var(--theme-primary-light), transparent)' }} />
                )}
                <Card className="relative overflow-hidden" padding="none">
                  <div className="relative h-48">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                    />
                    <div
                      className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                      style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel icon={Users} className="mb-6">
              {t("Meet the Team")}
            </SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-6">
              {t("Meet the Team")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((member) => (
              <button
                key={member.name}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className="h-full text-left"
              >
                <Card className="group flex h-full flex-col overflow-hidden text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" padding="none">
                  <div className="relative aspect-[4/5] bg-slate-200 dark:bg-slate-950">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500"
                      style={getTeamImageStyle(member.id)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors md:bg-black/0 md:group-hover:bg-black/20">
                      <span className="rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white opacity-100 transition-opacity backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100">
                        {t("Click to learn more")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--theme-primary)' }}>{member.role}</p>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{member.bio}</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Background gradient orbs */}
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionLabel icon={Heart} className="mb-6">
              {t("What We Believe")}
            </SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-6">
              {t("Our Core Values")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4" style={{ color: "var(--theme-primary)" }}>
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 md:py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Glowing orbs */}
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t("Ready to Start Learning?")}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg mb-8 max-w-xl mx-auto text-slate-600 dark:text-slate-300">
              {t("Become part of a growing community of learners and educators who are passionate about mathematics.")}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Link href="/auth">
              <Button size="lg" className="shadow-xl" style={{ background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))", color: "white" }}>
                <Rocket className="w-5 h-5" />
                {t("Get Started Today")}
              </Button>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-4">{t("No credit card required • Free forever")}</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 pb-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t("© 2026 MathMaster. All rights reserved. Built for FBLA Website Design Competition.")}
          </p>
        </div>
      </footer>
    </PageWrapper>
  );
}
