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

// Apply the saved theme, colorblind palette, and accessibility settings
// synchronously before React hydrates so there is no flash of the wrong
// theme on load. Runs as the first child of <body>, so document.body exists.
const themeInitScript = `
  (function() {
    try {
      var root = document.documentElement;
      var body = document.body;
      var savedColor = localStorage.getItem('mm_color_theme') || 'indigo';
      var savedMode = localStorage.getItem('mm_dark_mode');
      var isDark = savedMode === null ? true : savedMode === 'true';

      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        body.style.background = '#020617';
        body.style.color = '#f8fafc';
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }

      root.classList.remove(
        'theme-indigo', 'theme-violet', 'theme-teal', 'theme-blue',
        'theme-green', 'theme-red', 'theme-rose', 'theme-orange'
      );
      root.classList.add('theme-' + savedColor);

      if (localStorage.getItem('mm_colorblind_mode') === 'true') {
        root.classList.add('colorblind-mode');
        body.classList.add('colorblind-mode');
      }

      var accessibility = JSON.parse(localStorage.getItem('mm_accessibility') || '{}');
      if (accessibility.fontSize) root.style.fontSize = accessibility.fontSize + '%';
      if (accessibility.highContrast) root.classList.add('high-contrast');
      if (accessibility.reduceMotion) root.classList.add('reduce-motion');
      if (accessibility.dyslexiaFont) root.classList.add('dyslexia-font');
      if (accessibility.largePointer) root.classList.add('large-pointer');
      if (accessibility.focusHighlight) root.classList.add('focus-highlight');
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
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased min-h-screen bg-slate-50 dark:bg-slate-950`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
