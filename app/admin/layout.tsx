"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Lock,
	KeyRound,
	ArrowRight,
	LogOut,
	Package,
	ShoppingBag,
	LayoutDashboard,
	ExternalLink,
	AlertCircle,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	const pathname = usePathname();
	const { toast } = useToast();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isChecking, setIsChecking] = useState<boolean>(true);
	const [passkey, setPasskey] = useState<string>("");
	const [authError, setAuthError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [draftNotice, setDraftNotice] = useState<{ name: string } | null>(null);

	useEffect(() => {
		const checkAuth = async (): Promise<void> => {
			try {
				const localToken =
					typeof window !== "undefined" ? localStorage.getItem("jc_admin_auth") : null;
				if (localToken === "authenticated") {
					setIsAuthenticated(true);
					return;
				}

				const res = await fetch("/api/admin/auth");
				const data = (await res.json()) as { authenticated?: boolean };
				if (data.authenticated) {
					setIsAuthenticated(true);
					if (typeof window !== "undefined") {
						localStorage.setItem("jc_admin_auth", "authenticated");
					}
				}
			} catch {
				// Ignore network error during initial auth check
			} finally {
				setIsChecking(false);
			}
		};

		void checkAuth();
	}, []);

	const handleLogin = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		if (!passkey.trim()) {
			setAuthError("Please enter your admin passkey.");
			return;
		}

		setIsSubmitting(true);
		setAuthError(null);

		try {
			const res = await fetch("/api/admin/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passkey }),
			});

			const data = (await res.json()) as { success?: boolean; error?: string };

			if (!res.ok || !data.success) {
				const errMsg = data.error || "Incorrect administrative passkey";
				setAuthError(errMsg);
				if (res.status >= 500) {
					toast.error(errMsg, "Backend Auth Unavailable");
				}
				return;
			}

			setIsAuthenticated(true);
			if (typeof window !== "undefined") {
				localStorage.setItem("jc_admin_auth", "authenticated");
			}
			setPasskey("");
		} catch {
			const errMsg = "Failed to verify credentials with backend. Please try again.";
			setAuthError(errMsg);
			toast.error(errMsg, "Backend Connection Error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSignOut = async (): Promise<void> => {
		try {
			await fetch("/api/admin/auth", { method: "DELETE" });
		} catch { }
		if (typeof window !== "undefined") {
			localStorage.removeItem("jc_admin_auth");
		}
		setIsAuthenticated(false);
	};

	useEffect(() => {
		queueMicrotask(() => {
			if (typeof window === "undefined" || pathname === "/admin/products/new") {
				setDraftNotice(null);
				return;
			}

			try {
				const raw = localStorage.getItem("jc_admin_product_draft");
				if (raw) {
					const parsed = JSON.parse(raw) as {
						name?: string;
						price?: string;
						description?: string;
						visuals?: unknown[];
						form?: { name?: string; visuals?: unknown[] };
					};
					const draftName = parsed?.name?.trim() || parsed?.form?.name?.trim();
					const hasVisuals =
						(Array.isArray(parsed?.visuals) && parsed.visuals.length > 0) ||
						(Array.isArray(parsed?.form?.visuals) && parsed.form.visuals.length > 0);
					const hasContent = Boolean(
						draftName ||
						hasVisuals ||
						parsed?.price?.trim() ||
						parsed?.description?.trim()
					);
					if (hasContent) {
						setDraftNotice({
							name: draftName || "Untitled Formulation",
						});
						return;
					}
				}
			} catch {
				// Ignore corrupted JSON
			}
			setDraftNotice(null);
		});
	}, [pathname]);

	const handleDiscardDraft = (): void => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("jc_admin_product_draft");
		}
		setDraftNotice(null);
		toast.info("Unfinished formulation draft discarded from storage.");
	};

	if (isChecking) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-surface">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	// Unauthenticated Lock Screen
	if (!isAuthenticated) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
				<div className="w-full max-w-md rounded-2xl border border-border-delicate bg-surface-card p-8 sm:p-10 shadow-card">
					<div className="text-center">
						<div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border border-border-delicate bg-surface-container-low p-2">
							<Image
								src="/logo.png"
								alt="Juliana's Cosmetics"
								fill
								sizes="64px"
								className="object-contain p-1"
							/>
						</div>
						<div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-secondary-fixed">
							<Lock className="h-3 w-3" />
							<span>Restricted Access</span>
						</div>
						<h1 className="mt-3 font-serif text-2xl font-medium text-primary sm:text-3xl">
							Atelier Operations Portal
						</h1>
						<p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
							Administrative access is protected. Enter the authorized master passkey to manage formulations, inventory, and concierge orders.
						</p>
					</div>

					<form onSubmit={handleLogin} className="mt-8 space-y-4">
						<div>
							<label
								htmlFor="admin-passkey"
								className="block text-xs font-semibold uppercase tracking-wider text-primary"
							>
								Admin Passkey
							</label>
							<div className="relative mt-2">
								<KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
								<input
									id="admin-passkey"
									type="password"
									placeholder="••••••••••••"
									value={passkey}
									onChange={(e) => setPasskey(e.target.value)}
									className="w-full rounded-xl border border-border-delicate bg-surface py-3 pl-10 pr-4 text-sm text-primary placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									autoFocus
								/>
							</div>
						</div>

						{authError && (
							<div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container p-3 text-xs text-on-error-container">
								<AlertCircle className="h-4 w-4 flex-shrink-0" />
								<span>{authError}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50"
						>
							<span>{isSubmitting ? "Verifying..." : "Unlock Operations"}</span>
							<ArrowRight className="h-4 w-4" />
						</button>
					</form>

					<div className="mt-8 border-t border-border-delicate pt-4 text-center">
						<Link
							href="/"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
						>
							<span>Return to Public Storefront</span>
							<ExternalLink className="h-3 w-3" />
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Authenticated Admin Shell
	return (
		<div className="min-h-screen bg-surface">
			{/* Admin Header Bar */}
			<header className="sticky top-20 z-30 border-b border-border-delicate bg-surface-card/95 backdrop-blur-md">
				<div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-2.5 sm:px-6 md:flex-row md:items-center md:justify-between md:py-3 lg:px-8">
					{/* Top Row on Mobile / Left Identity on Desktop */}
					<div className="flex items-center justify-between md:justify-start md:gap-6">
						<Link href="/admin" className="flex items-center gap-2.5">
							<div className="relative h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 overflow-hidden rounded-full border border-border-delicate bg-white p-0.5">
								<Image
									src="/logo.png"
									alt="Juliana's Cosmetics"
									fill
									sizes="32px"
									className="object-contain"
								/>
							</div>
							<div className="flex items-center gap-2">
								<span className="font-serif text-xs sm:text-sm font-semibold text-primary">
									Atelier Portal
								</span>
							</div>
						</Link>

						{/* Mobile Quick Actions (Store & Sign Out) */}
						<div className="flex items-center gap-2 md:hidden">
							<Link
								href="/"
								className="inline-flex items-center gap-1 rounded-full border border-border-delicate bg-surface px-2.5 py-1 text-[11px] font-medium text-on-surface-variant transition-colors hover:text-primary"
							>
								<span>Store</span>
								<ExternalLink className="h-3 w-3" />
							</Link>

							<button
								type="button"
								onClick={handleSignOut}
								title="Lock & Sign Out"
								className="inline-flex items-center gap-1 rounded-full border border-border-delicate bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:border-error/30 hover:bg-error-container hover:text-error"
							>
								<LogOut className="h-3 w-3" />
								<span>Sign Out</span>
							</button>
						</div>
					</div>

					{/* Admin Navigation Pills (Segmented full-width bar on mobile, inline pill group on desktop) */}
					<nav
						aria-label="Admin Navigation"
						className="flex items-center gap-1 rounded-xl border border-border-delicate/70 bg-surface-container-low/70 p-1 md:gap-1.5 md:rounded-full md:p-1"
					>
						<Link
							href="/admin"
							className={`inline-flex flex-1 md:flex-initial items-center justify-center gap-1.5 whitespace-nowrap rounded-lg md:rounded-full px-2.5 py-2 md:px-4 md:py-1.5 text-[11px] sm:text-xs font-semibold transition-all ${pathname === "/admin"
									? "bg-primary text-white shadow-xs"
									: "text-on-surface-variant hover:bg-surface-card hover:text-primary"
								}`}
						>
							<LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />
							<span>Dashboard</span>
						</Link>

						<Link
							href="/admin/orders"
							className={`inline-flex flex-1 md:flex-initial items-center justify-center gap-1.5 whitespace-nowrap rounded-lg md:rounded-full px-2.5 py-2 md:px-4 md:py-1.5 text-[11px] sm:text-xs font-semibold transition-all ${pathname === "/admin/orders"
									? "bg-primary text-white shadow-xs"
									: "text-on-surface-variant hover:bg-surface-card hover:text-primary"
								}`}
						>
							<ShoppingBag className="h-3.5 w-3.5 flex-shrink-0" />
							<span>Orders</span>
						</Link>

						<Link
							href="/admin/products"
							className={`inline-flex flex-1 md:flex-initial items-center justify-center gap-1.5 whitespace-nowrap rounded-lg md:rounded-full px-2.5 py-2 md:px-4 md:py-1.5 text-[11px] sm:text-xs font-semibold transition-all ${pathname === "/admin/products"
									? "bg-primary text-white shadow-xs"
									: "text-on-surface-variant hover:bg-surface-card hover:text-primary"
								}`}
						>
							<Package className="h-3.5 w-3.5 flex-shrink-0" />
							<span>Catalog & Stock</span>
						</Link>
					</nav>

					{/* Desktop Right Actions */}
					<div className="hidden md:flex items-center gap-2.5">
						<Link
							href="/"
							target="_blank"
							className="inline-flex items-center gap-1.5 rounded-full border border-border-delicate bg-surface px-3.5 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
						>
							<span>Live Store</span>
							<ExternalLink className="h-3 w-3" />
						</Link>

						<button
							type="button"
							onClick={handleSignOut}
							title="Lock & Sign Out"
							className="inline-flex items-center gap-1.5 rounded-full border border-border-delicate bg-surface-container-low px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-error/30 hover:bg-error-container hover:text-error"
						>
							<LogOut className="h-3.5 w-3.5" />
							<span>Sign Out</span>
						</button>
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<main>{children}</main>

			{/* Floating Resume Formulation Draft Alert Toast */}
			{draftNotice && pathname !== "/admin/products/new" && (
				<aside
					data-testid="unfinished-draft-toast"
					aria-label="Unfinished formulation draft notification"
					className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] rounded-2xl border border-secondary-fixed/60 bg-surface-card p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300"
				>
					<div className="flex items-start gap-3">
						<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-secondary-dark">
							<Sparkles className="h-5 w-5" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-2">
								<h4 className="font-serif text-sm font-semibold text-primary truncate">
									Unfinished Formulation Waiting
								</h4>
								<button
									type="button"
									onClick={() => setDraftNotice(null)}
									className="text-on-surface-variant hover:text-primary p-0.5 rounded-full"
									title="Dismiss notice"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
							<p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
								You have an uncommitted product draft{" "}
								<span className="font-semibold text-primary">
									&ldquo;{draftNotice.name}&rdquo;
								</span>{" "}
								stored in browser memory.
							</p>
							<div className="mt-3.5 flex flex-wrap items-center gap-2">
								<Link
									href="/admin/products/new"
									data-testid="resume-draft-button"
									className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
								>
									<span>Resume Formulation</span>
									<ArrowRight className="h-3.5 w-3.5" />
								</Link>
								<button
									type="button"
									onClick={handleDiscardDraft}
									data-testid="discard-draft-button"
									className="inline-flex items-center gap-1.5 rounded-full border border-border-delicate bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:border-error/40 hover:bg-error-container hover:text-error transition-all"
								>
									<Trash2 className="h-3 w-3" />
									<span>Discard</span>
								</button>
							</div>
						</div>
					</div>
				</aside>
			)}
		</div>
	);
}
