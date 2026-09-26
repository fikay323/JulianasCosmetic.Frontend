"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/src/context/CartContext";

export function Header(): React.JSX.Element {
	const { totalCount, openCart } = useCart();
	const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

	const navLinks = [
		{ label: "Home", href: "/" },
		{ label: "Catalog", href: "/products" },
		{ label: "Rituals", href: "/#rituals" },
		{ label: "Admin Portal", href: "/admin" },
	];

	return (
		<header className="sticky top-0 z-40 w-full transition-all">
			{/* Top Editorial Announcement Bar */}
			{/* <div className="bg-surface-container-high/80 border-b border-border-delicate backdrop-blur-md px-4 py-2 text-center text-[11px] font-medium tracking-widest text-primary uppercase transition-colors">
				<div className="mx-auto flex max-w-7xl items-center justify-center gap-2 sm:gap-4">
					<span className="hidden items-center gap-1.5 sm:inline-flex text-secondary-dark">
						<ShieldCheck className="h-3.5 w-3.5" />
						<span>NAFDAC Approved Formulations</span>
					</span>
					<span className="hidden text-border-delicate sm:inline">•</span>
					<span className="inline-flex items-center gap-1.5">
						<Sparkles className="h-3.5 w-3.5 text-secondary" />
						<span>Complimentary Concierge Delivery Consultation via WhatsApp</span>
					</span>
				</div>
			</div> */}

			{/* Main Navigation Bar */}
			<div className="border-b border-border-delicate bg-surface/90 backdrop-blur-xl">
				<div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					{/* Mobile Menu Button */}
					<div className="flex items-center lg:hidden">
						<button
							type="button"
							onClick={() => setMobileMenuOpen((prev) => !prev)}
							className="inline-flex items-center justify-center p-2 text-primary hover:text-secondary focus:outline-none"
							aria-label="Toggle Navigation Menu"
						>
							{mobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>

					{/* Brand Logo */}
					<div className="flex items-center">
						<Link
							href="/"
							className="group inline-flex items-center gap-3 transition-opacity hover:opacity-90"
						>
							<Image
								src="/logo.png"
								alt="Juliana's Cosmetics"
								width={160}
								height={48}
								priority
								className="h-10 w-auto object-contain sm:h-12"
								style={{ width: "auto" }}
							/>
						</Link>
					</div>

					{/* Desktop Navigation Links */}
					<nav className="hidden items-center space-x-8 lg:flex">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80 transition-colors hover:text-secondary"
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Cart Trigger Button */}
					<div className="flex items-center gap-3">
						<button
							type="button"
							data-testid="cart-trigger"
							onClick={openCart}
							className="relative inline-flex items-center justify-center rounded-full p-2.5 text-primary transition-transform hover:scale-105 hover:bg-surface-container-low active:scale-95"
							aria-label={`Shopping Bag with ${totalCount} items`}
						>
							<ShoppingBag className="h-5 w-5" />
							<span className="sr-only">Shopping Bag</span>
							{totalCount > 0 && (
								<span
									data-testid="cart-badge"
									className="badge absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface animate-in fade-in zoom-in-75"
								>
									{totalCount}
								</span>
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation Drawer */}
				{mobileMenuOpen && (
					<div className="border-t border-border-delicate bg-surface px-4 py-5 shadow-lg lg:hidden">
						<nav className="flex flex-col space-y-4">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className="text-sm font-medium tracking-wider text-primary hover:text-secondary"
								>
									{link.label}
								</Link>
							))}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
