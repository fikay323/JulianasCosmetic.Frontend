import React from "react";
import Link from "next/link";
import {
	Package,
	ShoppingBag,
	ExternalLink,
	ArrowRight,
	TrendingUp,
	Clock,
	CheckCircle2,
} from "lucide-react";
import { readJsonFile } from "@/src/lib/storage";
import { formatNaira } from "@/src/lib/utils";
import defaultProducts from "@/src/data/products.json";
import type { Order, Product } from "@/src/types/store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
	const orders = await readJsonFile<Order[]>("src/data/orders.json", []);
	const products = await readJsonFile<Product[]>(
		"src/data/products.json",
		defaultProducts as Product[]
	);

	const awaitingAgreementCount = orders.filter(
		(o) => o.status === "Awaiting Delivery Agreement"
	).length;
	const awaitingPaymentCount = orders.filter(
		(o) => o.status === "Awaiting Payment"
	).length;
	const paidCount = orders.filter((o) => o.status === "Paid" || o.status === "Dispatched").length;
	const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.subtotal), 0);
	const inStockCount = products.filter(
		(p) => p.stockStatus === "In Stock" && p.inStock !== false
	).length;
	const outOfStockCount = products.length - inStockCount;

	return (
		<div className="min-h-screen bg-surface py-10 sm:py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-delicate pb-8">
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-dark">
								Apothecary Management Portal
							</span>
							<span className="rounded-full bg-secondary-fixed px-2.5 py-0.5 text-[10px] font-bold text-on-secondary-fixed">
								HQ Admin
							</span>
						</div>
						<h1 className="mt-2 font-serif text-3xl font-medium text-primary sm:text-4xl">
							Concierge Commerce Operations
						</h1>
						<p className="mt-1 text-xs text-on-surface-variant">
							Manage boutique orders, courier fee negotiations, and live catalog formulations.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Link
							href="/"
							className="inline-flex items-center gap-2 rounded-full border border-border-delicate bg-surface-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-surface-container-low"
						>
							<ExternalLink className="h-3.5 w-3.5" />
							<span>View Storefront</span>
						</Link>
					</div>
				</div>

				{/* Quick Stats Grid */}
				<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-2xl border border-border-delicate bg-surface-card p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
								Total Orders
							</span>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-primary">
								<ShoppingBag className="h-4 w-4" />
							</div>
						</div>
						<div className="mt-4 flex items-baseline gap-2">
							<span className="font-serif text-3xl font-bold text-primary">
								{orders.length}
							</span>
							<span className="text-xs text-on-surface-variant">logged</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
								Awaiting Delivery Fee
							</span>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed/50 text-secondary-dark">
								<Clock className="h-4 w-4" />
							</div>
						</div>
						<div className="mt-4 flex items-baseline gap-2">
							<span className="font-serif text-3xl font-bold text-secondary-dark">
								{awaitingAgreementCount}
							</span>
							<span className="text-xs text-on-surface-variant">pending quote</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
								Paid & Verified
							</span>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-tint text-primary">
								<CheckCircle2 className="h-4 w-4" />
							</div>
						</div>
						<div className="mt-4 flex items-baseline gap-2">
							<span className="font-serif text-3xl font-bold text-primary">
								{paidCount}
							</span>
							<span className="text-xs text-on-surface-variant">cleared</span>
						</div>
					</div>

					<div className="rounded-2xl border border-border-delicate bg-surface-card p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
								Est. Revenue
							</span>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-primary">
								<TrendingUp className="h-4 w-4" />
							</div>
						</div>
						<div className="mt-4 flex items-baseline gap-2">
							<span className="font-serif text-2xl font-bold text-primary">
								{formatNaira(totalRevenue)}
							</span>
						</div>
					</div>
				</div>

				{/* Primary Hub Portals */}
				<div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
					{/* Orders Portal Card */}
					<Link
						href="/admin/orders"
						className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border-delicate bg-surface-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-secondary-fixed-dim hover:shadow-card-hover"
					>
						<div>
							<div className="flex items-center justify-between">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-fixed/40 text-secondary-dark">
									<ShoppingBag className="h-6 w-6" />
								</div>
								<span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary">
									{orders.length} Orders
								</span>
							</div>

							<h2 className="mt-6 font-serif text-2xl font-medium text-primary group-hover:text-secondary-dark transition-colors">
								Orders & Concierge Logistics
							</h2>
							<p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
								Negotiate and record agreed doorstep delivery fees in Naira (₦), transition client orders from pending agreement to paid, and coordinate dispatch details.
							</p>

							<div className="mt-4 flex items-center gap-4 text-xs text-on-surface-variant">
								<span>• {awaitingAgreementCount} pending agreement</span>
								<span>• {awaitingPaymentCount} awaiting payment</span>
							</div>
						</div>

						<div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary group-hover:text-secondary-dark">
							<span>Open Orders Table</span>
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</div>
					</Link>

					{/* Products Portal Card */}
					<Link
						href="/admin/products"
						className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border-delicate bg-surface-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-secondary-fixed-dim hover:shadow-card-hover"
					>
						<div>
							<div className="flex items-center justify-between">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low text-primary">
									<Package className="h-6 w-6" />
								</div>
								<span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary">
									{products.length} Formulations
								</span>
							</div>

							<h2 className="mt-6 font-serif text-2xl font-medium text-primary group-hover:text-secondary-dark transition-colors">
								Catalog & Stock Management
							</h2>
							<p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
								Adjust retail formulation prices in Nigerian Naira (₦), toggle immediate stock availability (In Stock / Out of Stock), and view inventory health.
							</p>

							<div className="mt-4 flex items-center gap-4 text-xs text-on-surface-variant">
								<span>• {inStockCount} active in stock</span>
								<span>• {outOfStockCount} out of stock</span>
							</div>
						</div>

						<div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary group-hover:text-secondary-dark">
							<span>Open Catalog Manager</span>
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}
