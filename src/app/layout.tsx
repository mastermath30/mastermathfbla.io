import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AIAssistant } from "@/components/AIAssistant";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { MathTipOfDay } from "@/components/MathTipOfDay";
import { KeyboardNavigation } from "@/components/KeyboardNavigation";
import { QuickCalculator } from "@/components/QuickCalculator";
import { UnitConverter } from "@/components/UnitConverter";
import { QuickNotes } from "@/components/QuickNotes";
import { StudyStreak } from "@/components/StudyStreak";
import { Confetti } from "@/components/Confetti";
import { FloatingParticles } from "@/components/FloatingParticles";
import { FormulaReference } from "@/components/FormulaReference";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { ToolsMenu } from "@/components/ToolsMenu";
import { AIMathTutor } from "@/components/AIMathTutor";
import { InteractiveWhiteboard } from "@/components/InteractiveWhiteboard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "MathMaster - Master Mathematics Together",
  description: "An interactive learning platform created by students, for students. Unlock the beauty of numbers through peer tutoring and collaboration.",
  keywords: ["math", "tutoring", "learning", "education", "calculus", "algebra"],
};

// Script to apply theme and accessibility before React hydrates (prevents flash)
const themeInitScript = `
  (function() {
    try {
      const savedColor = localStorage.getItem('mm_color_theme') || 'violet';
      const savedMode = localStorage.getItem('mm_dark_mode');
      const isDark = savedMode === null ? true : savedMode === 'true';

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.body.style.background = '#020617';
        document.body.style.color = '#f8fafc';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.body.style.background = '#f8fafc';
        document.body.style.color = '#0f172a';
      }
      
      document.documentElement.classList.add('theme-' + savedColor);
      
      // Apply accessibility settings
      const accessibility = JSON.parse(localStorage.getItem('mm_accessibility') || '{}');
      if (accessibility.fontSize) document.documentElement.style.fontSize = accessibility.fontSize + '%';
      if (accessibility.highContrast) document.documentElement.classList.add('high-contrast');
      if (accessibility.reduceMotion) document.documentElement.classList.add('reduce-motion');
      if (accessibility.dyslexiaFont) document.documentElement.classList.add('dyslexia-font');
      if (accessibility.largePointer) document.documentElement.classList.add('large-pointer');
      if (accessibility.focusHighlight) document.documentElement.classList.add('focus-highlight');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen bg-slate-50 dark:bg-slate-950`}>
        <LanguageProvider>
          {/* Skip to main content link for keyboard navigation */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          
          <TopBar />
          <main id="main-content" className="pb-24 md:pb-0" tabIndex={-1}>
            {children}
          </main>
          <Navbar />
          <AIAssistant />
          <AccessibilityPanel />
          <MathTipOfDay />
          <KeyboardNavigation />
          <ToolsMenu />
          <QuickCalculator />
          <UnitConverter />
          <QuickNotes />
          <StudyStreak />
          <Confetti />
          <FloatingParticles />
          <FormulaReference />
          <PomodoroTimer />
          <AIMathTutor />
          <InteractiveWhiteboard />
        </LanguageProvider>
      </body>
    </html>
  );
}
