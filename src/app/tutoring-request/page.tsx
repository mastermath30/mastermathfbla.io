// i18n-allow-hardcoded
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PageWrapper, HeroText, FadeIn, GlowingOrbs } from "@/components/motion";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Textarea, Select } from "@/components/Input";
import { submitTutoringRequestCloud } from "@/lib/cloud";

const subjectOptions = [
  { value: "Algebra 1", label: "Algebra 1" },
  { value: "Geometry", label: "Geometry" },
  { value: "Algebra 2", label: "Algebra 2" },
  { value: "Precalculus", label: "Precalculus" },
  { value: "Calculus", label: "Calculus" },
];

export default function TutoringRequestPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = event.currentTarget;

    const studentName = (form.elements.namedItem("studentName") as HTMLInputElement).value.trim();
    const studentEmail = (form.elements.namedItem("studentEmail") as HTMLInputElement).value.trim();
    const subject = (form.elements.namedItem("subject") as HTMLSelectElement).value;
    const preferredTime = (form.elements.namedItem("preferredTime") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

    if (!studentName || !studentEmail || !subject || !message) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      await submitTutoringRequestCloud({
        studentName,
        studentEmail,
        subject,
        preferredTime,
        message,
      });
      const local = JSON.parse(localStorage.getItem("mm_tutoring_requests") || "[]");
      localStorage.setItem(
        "mm_tutoring_requests",
        JSON.stringify([
          ...local,
          { studentName, studentEmail, subject, preferredTime, message, createdAt: new Date().toISOString() },
        ])
      );
      setSuccess("Request sent. A tutor coordinator will respond within 24 hours.");
      form.reset();
    } catch {
      setError("We could not submit right now. Please try again in a moment.");
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      <header className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <GlowingOrbs variant="section" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
          <FadeIn>
            <HeroText>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Tutoring Request
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-3">
                Submit a real request for tutoring support. No instant booking promises; we confirm based on tutor availability.
              </p>
            </HeroText>
          </FadeIn>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="studentName" placeholder="Student name" />
              <Input name="studentEmail" placeholder="Email address" type="email" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select name="subject" options={subjectOptions} />
              <Input name="preferredTime" placeholder="Preferred times (optional)" />
            </div>
            <Textarea
              name="message"
              rows={5}
              placeholder="Tell us your goals, upcoming assessments, and where you are stuck."
            />

            {error && <p className="text-sm text-rose-500">{error}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

            <div className="flex flex-wrap gap-2">
              <Button type="submit">Send tutoring request</Button>
              <Link href="/learn">
                <Button type="button" variant="outline">
                  Back to Learn
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </PageWrapper>
  );
}
