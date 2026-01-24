"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSelector } from "./ThemeSelector";
import { MathLogo } from "./MathLogo";

const navigation = [
	{ name: "About", href: "/about" },
	{ name: "Schedule", href: "/schedule" },
	{ name: "Dashboard", href: "/dashboard" },
	{ name: "Resources", href: "/resources" },
	{ name: "Community", href: "/community" },
	{ name: "Support", href: "/support" },
];

export function TopBar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const lastScrollY = useRef(0);

	useEffect(() => {
		// Check if user is logged in
		const session = localStorage.getItem("mm_session");
		const loggedInFlag = localStorage.getItem("isLoggedIn");
		setIsLoggedIn(!!session || loggedInFlag === "true");
	}, [pathname]); // Re-check on route change

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

	return (
		<>
			<nav
				className={`hidden md:block fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
					isVisible
						? "translate-y-0 opacity-100"
						: "-translate-y-20 md:-translate-y-24 opacity-0"
				} ${hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
				style={{
					transition: hasLoaded
						? "all 0.5s ease-out"
						: "opacity 0.8s ease-out, transform 0.8s ease-out",
				}}
			>
				{/* Main Navigation */}
				<div className="w-[90vw] max-w-xs md:max-w-5xl mx-auto">
					<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-full px-4 py-3 md:px-6 md:py-2 shadow-lg">
						<div className="flex items-center justify-between gap-4">
							{/* Logo */}
							<Link
								href="/"
								className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer"
							>
								<MathLogo className="w-8 h-8 md:w-10 md:h-10" />
								<span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
									Math
									<span className="gradient-text">Master</span>
								</span>
							</Link>

							{/* Desktop Navigation */}
							<div className="hidden lg:flex items-center space-x-6">
								{navigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										className={`text-sm font-medium transition-all duration-200 cursor-pointer ${
											pathname === item.href
												? "text-violet-600 dark:text-violet-400"
												: "text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:scale-105"
										}`}
									>
										{item.name}
									</Link>
								))}
							</div>

							{/* Theme Selector */}
							<div className="hidden md:block ml-2">
								<ThemeSelector />
							</div>

							{/* Desktop Auth Button */}
							<div className="hidden md:block">
								<Link
									href="/auth"
									className={`relative font-medium px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group ${
										pathname === "/auth"
											? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
											: "bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:shadow-violet-500/30"
									}`}
									style={{
										background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))"
									}}
								>
									{isLoggedIn ? (
										<>
											<User className="w-4 h-4" />
											<span>Account</span>
										</>
									) : (
										<span>Sign In</span>
									)}
								</Link>
							</div>

							{/* Mobile Menu Button */}
							<button
								onClick={() => setIsOpen(!isOpen)}
								className="lg:hidden text-slate-900 dark:text-white hover:scale-110 transition-transform duration-200 cursor-pointer"
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
						className={`mt-2 w-[90vw] max-w-xs mx-auto transition-all duration-500 ease-out transform-gpu ${
							isOpen
								? "opacity-100 translate-y-0 scale-100"
								: "opacity-0 -translate-y-8 scale-95 pointer-events-none"
						}`}
					>
						<div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-4 shadow-2xl">
							<div className="flex flex-col space-y-1">
								{navigation.map((item, index) => (
									<Link
										key={item.name}
										href={item.href}
										className={`rounded-lg px-3 py-3 text-left transition-all duration-300 font-medium cursor-pointer transform hover:scale-[1.02] hover:translate-x-1 ${
											pathname === item.href
												? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
												: "text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
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
								<Link
									href="/auth"
									className={`relative text-white font-medium px-6 py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group transform ${
										isOpen ? "animate-mobile-menu-item" : ""
									}`}
									style={{
										background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))",
										animationDelay: isOpen
											? `${navigation.length * 80 + 150}ms`
											: "0ms",
									}}
									onClick={() => setIsOpen(false)}
								>
									{isLoggedIn ? (
										<>
											<User className="w-4 h-4" />
											<span>Account</span>
										</>
									) : (
										<span>Sign In</span>
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
