"use client";

import { useState, useEffect } from "react";
import {
  IconHome,
  IconInfoCircle,
  IconCalendar,
  IconChartBar,
  IconBook,
  IconUsers,
  IconLifebuoy,
  IconLogin,
  IconUser,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Accessibility, Lightbulb, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "./LanguageProvider";

export function Navbar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("mm_session");
    const loggedInFlag = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!session || loggedInFlag === "true");

    if (session || loggedInFlag === "true") {
      try {
        const profile = JSON.parse(
          localStorage.getItem("mm_profile") || "null"
        );
        if (profile) {
          if (profile.username) {
            setUserName(profile.username);
          } else if (profile.firstName) {
            setUserName(profile.firstName);
          } else {
            setUserName("");
          }
        } else {
          setUserName("");
        }
      } catch (e) {
        setUserName("");
      }
    }
  }, [pathname]);

  const links = [
    { title: t("Home"), icon: <IconHome className="h-6 w-6" />, href: "/" },
    {
      title: t("Learn"),
      icon: <IconBook className="h-6 w-6" />,
      href: "/learn",
    },
    {
      title: t("Schedule"),
      icon: <IconCalendar className="h-6 w-6" />,
      href: "/schedule",
    },
    {
      title: t("Dashboard"),
      icon: <IconChartBar className="h-6 w-6" />,
      href: "/dashboard",
    },
    {
      title: t("Community"),
      icon: <IconUsers className="h-6 w-6" />,
      href: "/community",
    },
    {
      title: t("Support"),
      icon: <IconLifebuoy className="h-6 w-6" />,
      href: "/support",
    },
    {
      title: t("About"),
      icon: <IconInfoCircle className="h-6 w-6" />,
      href: "/about",
    },
    {
      title: isLoggedIn ? userName || t("Account") : t("Sign In"),
      icon: isLoggedIn ? (
        <IconUser className="h-6 w-6" />
      ) : (
        <IconLogin className="h-6 w-6" />
      ),
      href: "/auth",
    },
  ];

  const utilities = [
    {
      title: t("Theme"),
      icon: <Palette className="w-5 h-5" />,
      event: "open-theme-selector",
      color: "bg-[var(--theme-primary)]",
    },
    {
      title: t("Accessibility"),
      icon: <Accessibility className="w-5 h-5" />,
      event: "open-accessibility",
      color: "bg-blue-600",
    },
    {
      title: t("Tools"),
      icon: <Wrench className="w-5 h-5" />,
      event: "open-tools",
      color: "bg-slate-700",
    },
    {
      title: t("Math Tip"),
      icon: <Lightbulb className="w-5 h-5" />,
      event: "open-mathtip",
      color: "bg-amber-500",
    },
  ];

  const handleUtilityClick = (eventName: string) => {
    setIsOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(eventName));
    }, 250);
  };

  return (
    <div className="md:hidden">
      {/* Single FAB Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[102] w-14 h-14 rounded-full bg-[var(--theme-primary)] shadow-lg flex items-center justify-center active:scale-95 transition-all touch-manipulation"
        style={{
          WebkitTapHighlightColor: "transparent",
          marginBottom:
            "max(0px, calc(env(safe-area-inset-bottom) - 1rem))",
        }}
        aria-label={isOpen ? t("Close menu") : t("Open menu")}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <IconX className="w-6 h-6 text-white" />
          ) : (
            <IconMenu2 className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </button>

      {/* Bottom Sheet Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/35 z-[100]"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 34, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-12px_40px_rgba(15,23,42,0.12)] border-t border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto"
              style={{
                paddingBottom: "max(6rem, calc(env(safe-area-inset-bottom) + 5rem))",
              }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>

              {/* Navigation Links */}
              <div className="px-5 pb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                  {t("Navigation")}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {links.map((link, idx) => (
                    <motion.div
                      key={link.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        title={link.href === "/auth" && isLoggedIn && userName ? userName : undefined}
                        className={`flex flex-col items-center justify-start gap-1.5 p-3 rounded-xl transition-colors touch-manipulation h-full ${
                          pathname === link.href
                            ? "text-[var(--theme-primary)]"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
                        }`}
                        style={{
                          WebkitTapHighlightColor: "transparent",
                          ...(pathname === link.href
                            ? {
                                backgroundColor:
                                  "color-mix(in srgb, var(--theme-primary) 12%, white)",
                              }
                            : {}),
                        }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          pathname === link.href
                            ? "text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`} style={pathname === link.href ? { backgroundColor: "var(--theme-primary)" } : undefined}>
                          {link.icon}
                        </div>
                        <span className="w-full max-w-full text-[11px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight whitespace-normal break-words">
                          {link.title}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-5 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                  {t("Quick Actions")}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {utilities.map((util, idx) => (
                    <motion.div
                      key={util.event}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + idx * 0.03 }}
                    >
                      <button
                        onClick={() => handleUtilityClick(util.event)}
                        className="flex flex-col items-center justify-start gap-1.5 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors touch-manipulation w-full h-full"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${util.color} flex items-center justify-center text-white flex-shrink-0`}
                        >
                          {util.icon}
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">
                          {util.title}
                        </span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
