// i18n-allow-hardcoded
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { ThemeSelector } from "@/components/ThemeSelector";
import { MathTip } from "@/components/MathTip";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SkipToContentLink } from "@/components/SkipToContentLink";

import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { KeyboardNavigation } from "@/components/KeyboardNavigation";
import { QuickCalculator } from "@/components/QuickCalculator";
import { UnitConverter } from "@/components/UnitConverter";
import { QuickNotes } from "@/components/QuickNotes";
import { Confetti } from "@/components/Confetti";
import { FloatingParticles } from "@/components/FloatingParticles";
import { FormulaReference } from "@/components/FormulaReference";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { ToolsMenu } from "@/components/ToolsMenu";
import { AIMathTutor } from "@/components/AIMathTutor";
import { InteractiveWhiteboard } from "@/components/InteractiveWhiteboard";
import { SiteTutorialController } from "@/components/SiteTutorialController";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "MathMaster - Guided Math Learning Ecosystem",
  description:
    "A course-aware math learning platform with guided pathways, targeted practice, AI tutoring, accessibility tools, and peer community support.",
  keywords: ["math", "tutoring", "learning", "education", "calculus", "algebra"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-slate-50 dark:bg-slate-950`}>
        <LanguageProvider>
          <SkipToContentLink />
          
          <TopBar />
          <ThemeSelector showTrigger={false} />
          <MathTip />
          <main id="main-content" className="pb-24 md:pb-0" tabIndex={-1}>
            {children}
          </main>
          <Navbar />

          <AccessibilityPanel />
          <KeyboardNavigation />
          <ToolsMenu />
          <QuickCalculator />
          <UnitConverter />
          <QuickNotes />
          <Confetti />
          <FloatingParticles />
          <FormulaReference />
          <PomodoroTimer />
          <AIMathTutor />
          <InteractiveWhiteboard />
          <SiteTutorialController />
        </LanguageProvider>
      </body>
    </html>
  );
}
