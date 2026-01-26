"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { SectionLabel } from "@/components/SectionLabel";
import { FadeIn, GlowingOrbs } from "@/components/motion";
import {
  Search,
  Rocket,
  Settings,
  Laptop,
  GraduationCap,
  Users,
  Headphones,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const helpCategories = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "New to MathMaster? Learn the basics and set up your account.",
    color: "violet",
    links: [
      { text: "Creating your account", href: "/auth" },
      { text: "Setting up your profile", href: "/dashboard" },
      { text: "Navigating the platform", href: "/about" }
    ],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop",
  },
  {
    icon: Settings,
    title: "Account & Settings",
    description: "Manage your account, preferences, and privacy settings.",
    color: "purple",
    links: [
      { text: "Update your profile", href: "/dashboard" },
      { text: "Change password", href: "/auth" },
      { text: "Notification settings", href: "/dashboard" }
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
  },
  {
    icon: Laptop,
    title: "Technical Support",
    description: "Troubleshoot issues and get help with technical problems.",
    color: "blue",
    links: [
      { text: "Browser compatibility", href: "#faq" },
      { text: "Report a bug", href: "#contact" },
      { text: "System requirements", href: "#faq" }
    ],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
  },
  {
    icon: GraduationCap,
    title: "Learning Resources",
    description: "Find tutorials and guides to enhance your learning.",
    color: "green",
    links: [
      { text: "Video tutorials", href: "/resources" },
      { text: "Practice problems", href: "/resources" },
      { text: "Study guides", href: "/resources" }
    ],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with other learners and share knowledge.",
    color: "yellow",
    links: [
      { text: "Community guidelines", href: "/community" },
      { text: "Discussion forums", href: "/community" },
      { text: "Study groups", href: "/community" }
    ],
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&h=100&fit=crop",
  },
];

const faqs = [
  {
    question: "How do I reset my password?",
    answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your email address, and we\'ll send you instructions to create a new password.',
  },
  {
    question: "How do I book a tutoring session?",
    answer: 'Go to the Schedule page and click "Book Session". You can browse available tutors, view their profiles, and select a time that works for you.',
  },
  {
    question: "Is MathMaster free to use?",
    answer: "Yes! MathMaster offers free access to resources, community forums, and study materials. Some premium features like one-on-one tutoring may have associated costs.",
  },
  {
    question: "How can I become a tutor?",
    answer: "If you're interested in becoming a peer tutor, contact our support team with your qualifications. We'll review your application and get back to you within 48 hours.",
  },
];

const contactMethods = [
  { icon: Mail, title: "Email Us", description: "support@mathmaster.com", action: "Send Email" },
  { icon: MessageCircle, title: "Live Chat", description: "Available 24/7", action: "Start Chat" },
  { icon: Phone, title: "Call Us", description: "+1 (555) 123-4567", action: "Call Now" },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Glowing orbs */}
        <GlowingOrbs variant="section" />
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&h=500&fit=crop"
            alt="Support team"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 35%, transparent), transparent)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium text-white mb-4 md:mb-6">
            <Headphones className="w-4 h-4" />
            We&apos;re here to help
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Find answers to common questions or get in touch with our friendly team
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder:text-slate-400 shadow-xl focus:outline-none focus:ring-4"
                style={{ boxShadow: '0 0 0 4px rgba(var(--theme-primary-rgb), 0.2)' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-32">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-8 mb-12">
          {contactMethods.map((method) => (
            <Card key={method.title} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4" style={{ color: "var(--theme-primary)" }}>
                <method.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{method.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{method.description}</p>
              <Button variant="outline" size="sm" className="mx-auto">
                {method.action}
              </Button>
            </Card>
          ))}
        </div>

        {/* Help Categories */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {helpCategories.map((cat) => (
            <Card key={cat.title} className="group">
              <div className="flex items-start gap-4 mb-4">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-themed transition-colors">{cat.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{cat.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                {cat.links.map((link) => (
                  <a
                    key={link.text}
                    href={link.href}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm hover:text-primary-themed hover:gap-3 transition-all"
                  >
                    <span>{link.text}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </Card>
          ))}

          {/* CTA Card */}
          <Card
            className="border-0 text-white"
            style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <Headphones className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Can&apos;t find what you need?</h3>
            <p className="text-white/80 text-sm mb-4">
              Our support team is ready to help you with any questions.
            </p>
            <a href="#contact">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full">
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(var(--theme-primary-rgb), 0.1)', color: 'var(--theme-primary)' }}>
                <MessageCircle className="w-4 h-4" />
                Still need help?
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Get in Touch</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                Send us a message and we&apos;ll get back to you within 24 hours. Our team is here to help.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card id="contact" className="overflow-hidden relative" padding="none">
              {/* Decorative gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))' }} />
              
              <div className="p-8 md:p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 animate-float"
                      style={{ 
                        background: 'rgba(var(--theme-primary-rgb), 0.1)',
                        borderColor: 'var(--theme-primary)',
                        color: 'var(--theme-primary)'
                      }}
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent Successfully!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">We&apos;ve received your message and will respond within 24 hours.</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                        <Input placeholder="Malhar Pawar" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                        <Input type="email" placeholder="malharspawar@gmail.com" required />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject *</label>
                      <Input placeholder="How can we help you?" required />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message *</label>
                      <Textarea rows={6} placeholder="Describe your issue or question in detail..." required />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--theme-primary)' }} />
                        Average response time: 12 hours
                      </div>
                      <Button 
                        type="submit" 
                        size="lg"
                        className="shadow-lg"
                        style={{ background: 'linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))', color: 'white' }}
                      >
                        Send Message
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </FadeIn>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2026 MathMaster. All rights reserved. Built for FBLA Website Design Competition.
          </p>
        </div>
      </footer>
    </div>
  );
}
