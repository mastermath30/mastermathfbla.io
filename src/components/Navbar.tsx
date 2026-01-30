"use client";

import { useState, useEffect } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
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
} from "@tabler/icons-react";
import { ThemeSelector } from "./ThemeSelector";
import { useTranslations } from "./LanguageProvider";

export function Navbar() {
  const { t } = useTranslations();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("mm_session");
    const loggedInFlag = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!session || loggedInFlag === "true");

    if (session || loggedInFlag === "true") {
      try {
        const profile = JSON.parse(localStorage.getItem("mm_profile") || "null");
        if (profile) {
          // Use username if available, otherwise use first name
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
  }, []);

  const links = [
    {
      title: t("Home"),
      icon: (
        <IconHome className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/",
    },
    {
      title: t("About"),
      icon: (
        <IconInfoCircle className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/about",
    },
    {
      title: t("Schedule"),
      icon: (
        <IconCalendar className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/schedule",
    },
    {
      title: t("Dashboard"),
      icon: (
        <IconChartBar className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/dashboard",
    },
    {
      title: t("Resources"),
      icon: (
        <IconBook className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/resources",
    },
    {
      title: t("Community"),
      icon: (
        <IconUsers className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/community",
    },
    {
      title: t("Support"),
      icon: (
        <IconLifebuoy className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/support",
    },
    {
      title: isLoggedIn ? (userName || t("Account")) : t("Sign In"),
      icon: isLoggedIn ? (
        <IconUser className="h-full w-full text-slate-600 dark:text-slate-300" />
      ) : (
        <IconLogin className="h-full w-full text-slate-600 dark:text-slate-300" />
      ),
      href: "/auth",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-end justify-between gap-3">
        <ThemeSelector className="mb-1" />
        <div className="flex-1 flex justify-end">
          <FloatingDock items={links} />
        </div>
      </div>
    </div>
  );
}
