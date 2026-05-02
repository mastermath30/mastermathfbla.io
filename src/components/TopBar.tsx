// i18n-allow-hardcoded
"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSelector } from "./ThemeSelector";
import { MathLogo } from "./MathLogo";
import { useTranslations } from "./LanguageProvider";
import { authStateChangedEvent, getStoredAuthState } from "@/lib/auth";

export function TopBar() {
	const pathname = usePathname();
	const { t } = useTranslations();
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userName, setUserName] = useState("");
	const lastScrollY = useRef(0);

	useEffect(() => {
		const syncAuth = () => {
			const nextLoggedIn = getStoredAuthState();
			setIsLoggedIn(nextLoggedIn);

			if (!nextLoggedIn) {
				setUserName("");
				return;
			}

			const profileData = localStorage.getItem("mm_profile");
			if (!profileData) {
				setUserName("");
				return;
			}

			try {
				const profile = JSON.parse(profileData);
				if (profile.username) {
					setUserName(profile.username);
				} else if (profile.firstName) {
					setUserName(profile.firstName);
				} else {
					setUserName("");
				}
			} catch {
				setUserName("");
			}
		};

		const timer = window.setTimeout(syncAuth, 0);
		window.addEventListener("focus", syncAuth);
		window.addEventListener(authStateChangedEvent, syncAuth);

		return () => {
			window.clearTimeout(timer);
			window.removeEventListener("focus", syncAuth);
			window.removeEventListener(authStateChangedEvent, syncAuth);
		};
	}, [pathname]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setHasLoaded(true);
		}, 100);

		const controlNavbar = () => {
			if (typeof window !== "undefined") {
				const currentScrollY = window.scrollY;

				// Only hide/show after scrolling past 50px to avoid flickering at top
				if (currentScrollY > 50) {
					if (
						currentScrollY > lastScrollY.current &&
						currentScrollY - lastScrollY.current > 5
					) {
						// Scrolling down - hide navbar
						setIsVisible(false);
					} else if (lastScrollY.current - currentScrollY > 5) {
						// Scrolling up - show navbar
						setIsVisible(true);
					}
				} else {
					// Always show navbar when near top
					setIsVisible(true);
				}

				lastScrollY.current = currentScrollY;
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("scroll", controlNavbar, { passive: true });

			return () => {
				window.removeEventListener("scroll", controlNavbar);
				clearTimeout(timer);
			};
		}
		return () => clearTimeout(timer);
	}, []);

	const navigation = [
		{ name: t("Learn"), href: "/learn" },
		{ name: t("Schedule"), href: "/schedule" },
		{ name: t("Dashboard"), href: "/dashboard" },
		{ name: t("Community"), href: "/community" },
		{ name: t("Support"), href: "/support" },
		{ name: t("About"), href: "/about" },
	];

	return (
		<>
			<nav
				className={`topbar-root hidden md:block fixed top-4 md:top-8 left-0 right-0 mx-auto z-50 w-[min(calc(100vw-2rem),64rem)] transition-all duration-500 ${
					isVisible
						? "translate-y-0 opacity-100 pointer-events-auto"
						: "-translate-y-20 md:-translate-y-24 opacity-0 pointer-events-none"
				} ${hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
				style={{
					transition: hasLoaded
						? "all 0.5s ease-out"
						: "opacity 0.8s ease-out, transform 0.8s ease-out",
				}}
			>
				{/* Main Navigation */}
				<div className="w-full">
					<div className="bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-3 lg:px-5 xl:px-6 md:py-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
						<div className="flex items-center justify-center gap-6 lg:gap-7 xl:gap-8">
							{/* Logo */}
							<Link
								href="/"
								data-no-auto-translate="true"
								className="flex shrink-0 items-center gap-2 transition-colors duration-200 cursor-pointer"
							>
								<MathLogo className="w-8 h-8 md:w-10 md:h-10" />
								<span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white hidden lg:block whitespace-nowrap">
									Math
									<span className="gradient-text">Master</span>
								</span>
							</Link>

							{/* Desktop Navigation */}
							<div className="hidden lg:flex items-center justify-center gap-4 whitespace-nowrap">
								{navigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										className={`inline-flex items-center text-[13px] xl:text-sm font-medium leading-none transition-all duration-200 cursor-pointer ${
									pathname === item.href
											? "text-[var(--theme-primary)]"
											: "text-slate-700 dark:text-slate-300 hover:text-[var(--theme-primary)]"
										}`}
									>
										{item.name}
									</Link>
								))}
							</div>

							<div className="flex shrink-0 items-center justify-end gap-4">
								{/* Theme Selector */}
								<div className="hidden md:block">
									<ThemeSelector />
								</div>

								{/* Desktop Auth Button */}
								<div className="hidden md:block">
									<Link
										href="/auth"
									className={`relative font-medium px-5 xl:px-6 py-2 rounded-full inline-flex min-w-0 max-w-[11rem] items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 hover:shadow-sm cursor-pointer group lg:max-w-[14rem] text-white`}
									style={{
										background: pathname === "/auth"
											? "var(--theme-primary-dark)"
											: "var(--theme-primary)",
									}}
										title={isLoggedIn && userName ? userName : undefined}
									>
										{isLoggedIn ? (
											<>
												<User className="w-4 h-4" />
												<span className="min-w-0 truncate">{userName || t("Account")}</span>
											</>
										) : (
											<span>{t("Sign In")}</span>
										)}
									</Link>
								</div>

								{/* Mobile Menu Button */}
								<button
									onClick={() => setIsOpen(!isOpen)}
									className="lg:hidden -mr-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-900 transition-transform duration-200 hover:scale-110 dark:text-white"
								>
									<div className="relative w-6 h-6">
										<Menu
											size={24}
											className={`absolute inset-0 transition-all duration-300 ${
												isOpen
													? "opacity-0 rotate-180 scale-75"
													: "opacity-100 rotate-0 scale-100"
											}`}
										/>
										<X
											size={24}
											className={`absolute inset-0 transition-all duration-300 ${
												isOpen
													? "opacity-100 rotate-0 scale-100"
													: "opacity-0 -rotate-180 scale-75"
											}`}
										/>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="lg:hidden relative">
					{/* Backdrop overlay */}
					<div
						className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ${
							isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
						}`}
						onClick={() => setIsOpen(false)}
						style={{
							top: "0",
							left: "0",
							right: "0",
							bottom: "0",
							zIndex: -1,
						}}
					/>

					{/* Menu container */}
					<div
						className={`mt-2 w-[92vw] max-w-sm sm:max-w-md mx-auto transition-all duration-500 ease-out transform-gpu ${
							isOpen
								? "opacity-100 translate-y-0 scale-100"
								: "opacity-0 -translate-y-8 scale-95 pointer-events-none"
						}`}
					>
						<div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 shadow-2xl">
							<div className="flex flex-col space-y-1">
								{navigation.map((item, index) => (
									<Link
										key={item.name}
										href={item.href}
										className={`rounded-lg px-3 py-3 text-left transition-all duration-300 font-medium cursor-pointer transform hover:scale-[1.02] hover:translate-x-1 ${
											pathname === item.href
												? "text-[var(--theme-primary)] bg-[color-mix(in_srgb,var(--theme-primary)_10%,transparent)]"
												: "text-slate-700 dark:text-slate-300 hover:text-[var(--theme-primary)] hover:bg-[color-mix(in_srgb,var(--theme-primary)_5%,transparent)]"
										} ${isOpen ? "animate-mobile-menu-item" : ""}`}
										style={{
											animationDelay: isOpen
												? `${index * 80 + 100}ms`
												: "0ms",
										}}
										onClick={() => setIsOpen(false)}
									>
										{item.name}
									</Link>
								))}
								<div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
								
								{/* Theme Selector in mobile menu */}
								<div className={`px-3 py-2 ${isOpen ? "animate-mobile-menu-item" : ""}`}
									style={{
										animationDelay: isOpen
											? `${navigation.length * 80 + 100}ms`
											: "0ms",
									}}
								>
									<ThemeSelector />
								</div>
								
								<div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
								<Link
									href="/auth"
									className={`relative text-white font-medium px-6 py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group transform ${
										isOpen ? "animate-mobile-menu-item" : ""
									}`}
									style={{
										background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))",
										animationDelay: isOpen
											? `${(navigation.length + 1) * 80 + 150}ms`
											: "0ms",
									}}
									onClick={() => setIsOpen(false)}
								>
									{isLoggedIn ? (
										<>
											<User className="w-4 h-4" />
											<span>{userName || t("Account")}</span>
										</>
									) : (
										<span>{t("Sign In")}</span>
									)}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}
