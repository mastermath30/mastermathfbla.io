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

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("mm_session");
    const loggedInFlag = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(!!session || loggedInFlag === "true");
  }, []);

  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    {
      title: "About",
      icon: (
        <IconInfoCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/about",
    },
    {
      title: "Schedule",
      icon: (
        <IconCalendar className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/schedule",
    },
    {
      title: "Dashboard",
      icon: (
        <IconChartBar className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/dashboard",
    },
    {
      title: "Resources",
      icon: (
        <IconBook className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/resources",
    },
    {
      title: "Community",
      icon: (
        <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/community",
    },
    {
      title: "Support",
      icon: (
        <IconLifebuoy className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/support",
    },
    {
      title: isLoggedIn ? "Account" : "Sign In",
      icon: isLoggedIn ? (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ) : (
        <IconLogin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/auth",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-end justify-between pb-8 px-4">
      <div className="mb-2 ml-2">
        <ThemeSelector />
      </div>
      <FloatingDock items={links} />
    </div>
  );
}
