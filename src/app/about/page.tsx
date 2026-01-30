"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, FadeInStagger, FadeInStaggerItem, GlowingOrbs } from "@/components/motion";
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

const stats = [
  { value: "10K+", label: "Active Learners", sublabel: "Improving weekly", icon: Users },
  { value: "500+", label: "Lessons & Resources", sublabel: "Guided explanations", icon: GraduationCap },
  { value: "24/7", label: "Community Help", sublabel: "Ask anytime", icon: Globe },
];

const steps = [
  { number: "01", title: "Join the Community", description: "Create your free account and set up your student profile. Tell us about your learning goals.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop" },
  { number: "02", title: "Connect & Learn", description: "Access resources, join study groups, attend live sessions, and ask questions in the forum.", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop" },
  { number: "03", title: "Track & Succeed", description: "Monitor your progress on the dashboard, earn achievements, and watch your skills grow.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop" },
];

const team = [
  { 
    name: "Sarah Johnson", 
    role: "Founder & Lead Educator", 
    initials: "SJ", 
    bio: "PhD in Mathematics with 10+ years of teaching experience at top universities.", 
    fullBio: "Dr. Sarah Johnson earned her PhD in Applied Mathematics from MIT and has dedicated her career to making math accessible to everyone. With over 10 years of teaching experience at Stanford and Berkeley, she noticed that many students struggled not because they lacked ability, but because they lacked the right resources and support. This inspired her to create MathMaster. Sarah believes that every student can excel in mathematics with the right guidance and community support. When she's not teaching, she enjoys hiking, playing chess, and mentoring young educators.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" 
  },
  { 
    name: "Michael Chen", 
    role: "Head of Technology", 
    initials: "MC", 
    bio: "Software Engineer & Education Technology Specialist. Built platforms for millions of users.", 
    fullBio: "Michael Chen brings 15 years of experience in software engineering and education technology to MathMaster. Previously, he led engineering teams at Google and Coursera, where he built learning platforms used by millions of students worldwide. Michael is passionate about creating intuitive, accessible technology that removes barriers to education. He holds a Master's degree in Computer Science from Carnegie Mellon and is a strong advocate for open-source education tools. In his free time, Michael contributes to coding education nonprofits and enjoys building robots with his two kids.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" 
  },
  { 
    name: "Priya Patel", 
    role: "Community Manager", 
    initials: "PP", 
    bio: "Expert in building and nurturing learning communities. Passionate about student success.", 
    fullBio: "Priya Patel has spent her career fostering supportive learning environments where students thrive. With a background in Educational Psychology from Columbia University, she understands the importance of community in the learning process. Before joining MathMaster, Priya managed student success programs at Khan Academy and built volunteer tutor networks serving underrepresented students. She believes that peer support and mentorship are just as important as great content. Priya is fluent in four languages and loves connecting with students from diverse backgrounds around the world.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop" 
  },
];

const values = [
  { icon: Accessibility, title: "Accessibility", description: "Quality education should be available to everyone, regardless of background or location.", color: "violet" },
  { icon: HandHelping, title: "Community", description: "Learning is better together. We foster collaboration and peer support.", color: "green" },
  { icon: Lightbulb, title: "Clarity", description: "Complex concepts deserve clear explanations. No jargon, just understanding.", color: "blue" },
  { icon: TrendingUp, title: "Growth", description: "Every student can improve. We celebrate progress, not perfection.", color: "purple" },
];

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState<typeof team[0] | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      {/* Team Member Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-48 sm:h-64 bg-slate-200 dark:bg-slate-800">
              <Image
                src={selectedMember.image}
                alt={selectedMember.name}
                fill
                className="object-cover object-[center_20%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{selectedMember.name}</h3>
                <p className="text-sm sm:text-base font-medium" style={{ color: 'var(--theme-primary-light)' }}>{selectedMember.role}</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 sm:p-8">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                {selectedMember.fullBio}
              </p>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button className="w-full sm:w-auto" onClick={() => setSelectedMember(null)}>
                  Close
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

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur border rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(var(--theme-primary-rgb), 0.2)', borderColor: 'rgba(var(--theme-primary-rgb), 0.3)', color: 'var(--theme-primary-light)' }}>
              <Heart className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              About <span className="gradient-text">MathMaster</span>
            </h1>
            <p className="text-xl text-white leading-relaxed mb-8">
              We make math feel learnable again — with clear practice, strong explanations, and a community that helps you when you&apos;re stuck.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth">
                <Button size="lg">
                  <Rocket className="w-5 h-5" />
                  Get Started
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" style={{ backgroundColor: 'var(--theme-primary)', color: 'white', borderColor: 'var(--theme-primary)' }}>
                  <MessageCircle className="w-5 h-5" />
                  Visit the Forum
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800/50 relative overflow-hidden">
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-5xl mx-auto px-6">
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
              {/* Floating badge */}
              <div 
                className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-4 border border-slate-200 dark:border-slate-700 animate-float"
                style={{ boxShadow: '0 10px 40px rgba(var(--theme-primary-rgb), 0.15)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center" style={{ color: "var(--theme-primary)" }}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">98% Success Rate</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Students improving grades</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <SectionLabel icon={Target} className="mb-6">
                Our Mission
              </SectionLabel>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Making Math Accessible to Everyone
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                MathMaster was founded on the belief that everyone deserves access to quality math education. 
                We&apos;re building a community where students can learn from each other, share knowledge, and grow 
                together in their mathematical journey.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you&apos;re struggling with basic algebra or diving into calculus, we&apos;re here to help you succeed.
                Our platform combines the power of peer learning with expert resources to create an environment where
                every student can thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Background gradient orbs */}
        <GlowingOrbs variant="section" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel icon={Rocket} className="mb-6">
              Getting Started
            </SectionLabel>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-6">
              How It Works
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
      <section className="py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel icon={Users} className="mb-6">
              Meet the Team
            </SectionLabel>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-6">
              The People Behind MathMaster
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <button
                key={member.name}
                type="button"
                onClick={() => setSelectedMember(member)}
                className="text-left"
              >
                <Card className="text-center overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" padding="none">
                  <div className="relative h-72 bg-slate-200 dark:bg-slate-950">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                        Click to learn more
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--theme-primary)' }}>{member.role}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{member.bio}</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Background gradient orbs */}
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel icon={Heart} className="mb-6">
              What We Believe
            </SectionLabel>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-6">
              Our Core Values
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
      <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Glowing orbs */}
        <GlowingOrbs variant="subtle" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Start Learning?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg mb-8 max-w-xl mx-auto text-slate-600 dark:text-slate-300">
              Become part of a growing community of learners and educators who are passionate about mathematics.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Link href="/auth">
              <Button size="lg" className="shadow-xl" style={{ background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))", color: "white" }}>
                <Rocket className="w-5 h-5" />
                Get Started Today
              </Button>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-4">No credit card required • Free forever</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 pb-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2026 MathMaster. All rights reserved. Built for FBLA Website Design Competition.
          </p>
        </div>
      </footer>
    </div>
  );
}
