"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ShieldCheck,
	CheckCircle2,
	MessageSquare,
	ArrowLeft,
	ShoppingBag,
	Truck,
	Lock,
} from "lucide-react";
import { useCart } from "@/src/context/CartContext";
import { formatNaira } from "@/src/lib/utils";
import type { CustomerInfo, Order } from "@/src/types/store";

const NIGERIAN_STATES = [
	"Abia",
	"Adamawa",
	"Akwa Ibom",
	"Anambra",
	"Bauchi",
	"Bayelsa",
	"Benue",
	"Borno",
	"Cross River",
	"Delta",
	"Ebonyi",
	"Edo",
	"Ekiti",
	"Enugu",
	"FCT - Abuja",
	"Gombe",
	"Imo",
	"Jigawa",
	"Kaduna",
	"Kano",
	"Katsina",
	"Kebbi",
	"Kogi",
	"Kwara",
	"Lagos",
	"Nasarawa",
	"Niger",
	"Ogun",
	"Ondo",
	"Osun",
	"Oyo",
	"Plateau",
	"Rivers",
	"Sokoto",
	"Taraba",
	"Yobe",
	"Zamfara",
];

export default function CheckoutPage(): React.JSX.Element {
	const { items, subtotal, clearCart } = useCart();

	const [formData, setFormData] = useState<CustomerInfo>({
		fullName: "",
		phone: "",
		state: "",
		cityLga: "",
		address: "",
		courierNotes: "",
	});

	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	): void => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setErrorMessage(null);

		if (items.length === 0 && !completedOrder) {
			setErrorMessage("Your shopping bag is empty. Please add items before checking out.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					customer: formData,
					items,
				}),
			});

			if (!response.ok) {
				const errorData = (await response.json().catch(() => ({}))) as { error?: string };
				throw new Error(errorData.error || "Failed to submit order");
			}

			const createdOrder = (await response.json()) as Order;
			clearCart();
			setCompletedOrder(createdOrder);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "An unexpected error occurred.";
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// -------------------------------------------------------------------------
	// ORDER CONFIRMATION VIEW
	// -------------------------------------------------------------------------
	if (completedOrder) {
		return (
			<div className="min-h-screen bg-surface py-12 sm:py-20">
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<div className="overflow-hidden rounded-2xl border border-border-delicate bg-surface-card p-8 sm:p-12 shadow-card">
						<div className="text-center">
							<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blush-tint text-primary">
								<CheckCircle2 className="h-8 w-8 text-secondary-dark" />
							</div>

							<span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-dark">
								Order Received & Logged
							</span>
							<h1 className="mt-2 font-serif text-3xl font-medium text-primary sm:text-4xl">
								Order #{completedOrder.orderNumber}
							</h1>
							<p className="mt-3 text-sm text-on-surface-variant max-w-lg mx-auto">
								Thank you, {completedOrder.customer.fullName}. Your formulation request has been reserved. Complete dispatch agreement with your dedicated concierge specialist via WhatsApp below.
							</p>
						</div>

						{/* Details Box */}
						<div className="mt-8 rounded-xl border border-border-delicate bg-surface-container-low/50 p-6 space-y-4">
							<div className="flex items-center justify-between border-b border-border-delicate pb-3">
								<span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
									Status
								</span>
								<span className="rounded-full bg-secondary-fixed px-3 py-1 text-xs font-bold text-on-secondary-fixed">
									{completedOrder.status}
								</span>
							</div>

							<div className="flex items-center justify-between border-b border-border-delicate pb-3 text-sm">
								<span className="text-on-surface-variant">Items Subtotal</span>
								<span className="font-semibold text-primary">
									{formatNaira(completedOrder.subtotal)}
								</span>
							</div>

							<div className="flex items-center justify-between border-b border-border-delicate pb-3 text-sm">
								<span className="text-on-surface-variant">Doorstep Delivery</span>
								<span className="text-xs font-medium text-secondary-dark">
									To be agreed via WhatsApp
								</span>
							</div>

							<div className="text-xs text-on-surface-variant space-y-1 pt-1">
								<p>
									<strong className="text-primary">Delivery Address:</strong>{" "}
									{completedOrder.customer.address}, {completedOrder.customer.cityLga},{" "}
									{completedOrder.customer.state}
								</p>
								<p>
									<strong className="text-primary">Phone:</strong> {completedOrder.customer.phone}
								</p>
								{completedOrder.customer.courierNotes && (
									<p>
										<strong className="text-primary">Courier Notes:</strong>{" "}
										{completedOrder.customer.courierNotes}
									</p>
								)}
							</div>
						</div>

						{/* WhatsApp Concierge Action CTA */}
						<div className="mt-8 flex flex-col items-center gap-4">
							<a
								href={completedOrder.whatsappMessageUrl}
								data-testid="whatsapp-dispatch-link"
								target="_blank"
								rel="noopener noreferrer"
								className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-center text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#20ba5a] hover:shadow-xl active:scale-98"
							>
								<MessageSquare className="h-5 w-5" />
								<span>Open WhatsApp Concierge Dispatch</span>
							</a>

							<Link
								href="/products"
								className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-primary"
							>
								Continue Exploring Formulations
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// -------------------------------------------------------------------------
	// EMPTY BAG VIEW
	// -------------------------------------------------------------------------
	if (items.length === 0) {
		return (
			<div className="min-h-screen bg-surface py-16 sm:py-24">
				<div className="mx-auto max-w-lg px-4 text-center">
					<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-low text-primary/40">
						<ShoppingBag className="h-10 w-10" />
					</div>
					<h1 className="font-serif text-2xl font-medium text-primary sm:text-3xl">
						Your Shopping Bag is Empty
					</h1>
					<p className="mt-3 text-sm text-on-surface-variant">
						You need at least one luxury botanical formulation in your bag to initiate the WhatsApp Concierge checkout.
					</p>
					<div className="mt-8">
						<Link
							href="/products"
							className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-primary/90"
						>
							<ArrowLeft className="h-4 w-4" />
							<span>Discover Formulations</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// -------------------------------------------------------------------------
	// CHECKOUT FORM & SUMMARY
	// -------------------------------------------------------------------------
	return (
		<div className="min-h-screen bg-surface py-10 sm:py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Return Link */}
				<div className="mb-8">
					<Link
						href="/products"
						className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						<span>Back to Catalog</span>
					</Link>
				</div>

				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
					{/* Left Column: Nigerian Customer Concierge Form */}
					<div className="lg:col-span-7">
						<div className="border-b border-border-delicate pb-6">
							<span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-dark">
								Personalized Concierge Delivery
							</span>
							<h1 className="mt-1 font-serif text-3xl font-normal text-primary sm:text-4xl">
								Nigerian Delivery & Dispatch
							</h1>
							<p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
								Please provide your legal recipient details for doorstep dispatch across Nigeria. Final courier rates will be verified directly via WhatsApp.
							</p>
						</div>

						{errorMessage && (
							<div className="mt-6 rounded-xl border border-error/30 bg-error-container p-4 text-xs font-medium text-on-error-container">
								{errorMessage}
							</div>
						)}

						<form onSubmit={handleSubmitOrder} className="mt-8 space-y-6">
							{/* Full Legal Name */}
							<div>
								<label
									htmlFor="fullName"
									className="block text-xs font-semibold uppercase tracking-wider text-primary"
								>
									Full Legal Name <span className="text-secondary-dark">*</span>
								</label>
								<input
									type="text"
									id="fullName"
									name="fullName"
									required
									value={formData.fullName}
									onChange={handleInputChange}
									placeholder="e.g. Folashade Adeleke"
									className="mt-2 block w-full rounded-xl border border-border-delicate bg-surface-card px-4 py-3.5 text-sm text-primary placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>

							{/* Nigerian Phone Number */}
							<div>
								<div className="flex items-center justify-between">
									<label
										htmlFor="phone"
										className="block text-xs font-semibold uppercase tracking-wider text-primary"
									>
										Nigerian Mobile / WhatsApp Phone <span className="text-secondary-dark">*</span>
									</label>
									<span className="text-[11px] text-on-surface-variant">
										+234 or 080... format
									</span>
								</div>
								<div className="relative mt-2">
									<input
										type="tel"
										id="phone"
										name="phone"
										required
										pattern="^(?:(?:\+?234\s?)|0)[789][0-9](?:[\s-]?\d){8}$"
										title="Please enter a valid Nigerian phone number (e.g. 08023456789 or +2348023456789)"
										value={formData.phone}
										onChange={handleInputChange}
										placeholder="08023456789 or +234 802 345 6789"
										className="block w-full rounded-xl border border-border-delicate bg-surface-card px-4 py-3.5 text-sm text-primary placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									/>
								</div>
							</div>

							{/* State and City / LGA */}
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
								{/* State / Territory Selector */}
								<div>
									<label
										htmlFor="state"
										className="block text-xs font-semibold uppercase tracking-wider text-primary"
									>
										State / Territory <span className="text-secondary-dark">*</span>
									</label>
									<select
										id="state"
										name="state"
										required
										value={formData.state}
										onChange={handleInputChange}
										className="mt-2 block w-full rounded-xl border border-border-delicate bg-surface-card px-4 py-3.5 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									>
										<option value="">Select State / Territory</option>
										{NIGERIAN_STATES.map((st) => (
											<option key={st} value={st}>
												{st}
											</option>
										))}
									</select>
								</div>

								{/* City / LGA */}
								<div>
									<label
										htmlFor="cityLga"
										className="block text-xs font-semibold uppercase tracking-wider text-primary"
									>
										City / LGA <span className="text-secondary-dark">*</span>
									</label>
									<input
										type="text"
										id="cityLga"
										name="cityLga"
										required
										value={formData.cityLga}
										onChange={handleInputChange}
										placeholder="e.g. Ikeja or Victoria Island"
										className="mt-2 block w-full rounded-xl border border-border-delicate bg-surface-card px-4 py-3.5 text-sm text-primary placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									/>
								</div>
							</div>

							{/* Street Address */}
							<div>
								<label
									htmlFor="streetAddress"
									className="block text-xs font-semibold uppercase tracking-wider text-primary"
								>
									Street Address & Apartment / Suite <span className="text-secondary-dark">*</span>
								</label>
								<textarea
									id="streetAddress"
									name="address"
									required
									rows={3}
									value={formData.address}
									onChange={handleInputChange}
									placeholder="e.g. 14 Adekunle Fajuyi Way, GRA Ikeja"
									className="mt-2 block w-full rounded-xl border border-border-delicate bg-surface-card px-4 py-3 text-sm text-primary placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>

							{/* Courier Notes */}
							<div>
								<label
									htmlFor="courierNotes"
									className="block text-xs font-semibold uppercase tracking-wider text-primary"
								>
									Landmark & Gate Security Notes <span className="text-on-surface-variant font-normal">(Optional)</span>
								</label>
								<textarea
									id="courierNotes"
									name="courierNotes"
									rows={2}
									value={formData.courierNotes}
									onChange={handleInputChange}
									placeholder="e.g. Estate gate code or deliver to security reception"
									className="mt-2 block w-full rounded-xl border border-border-delicate bg-surface-card px-4 py-3 text-sm text-primary placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>

							{/* Submit Button */}
							<div className="pt-4">
								<button
									type="submit"
									disabled={isSubmitting}
									className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-outline active:scale-98"
								>
									<MessageSquare className="h-4 w-4" />
									<span>
										{isSubmitting ? "Processing Order..." : "Complete Order on WhatsApp"}
									</span>
								</button>
							</div>

							<div className="flex items-center justify-center gap-4 text-[11px] text-on-surface-variant pt-2">
								<span className="flex items-center gap-1">
									<Lock className="h-3 w-3" />
									<span>256-Bit Encrypted Concierge</span>
								</span>
								<span>•</span>
								<span className="flex items-center gap-1">
									<ShieldCheck className="h-3.5 w-3.5 text-secondary-dark" />
									<span>NAFDAC Verified Storefront</span>
								</span>
							</div>
						</form>
					</div>

					{/* Right Column: Order Summary */}
					<div className="lg:col-span-5">
						<div className="sticky top-28 rounded-2xl border border-border-delicate bg-surface-card p-6 sm:p-8 shadow-card">
							<h2 className="font-serif text-xl font-medium text-primary">
								Curated Bag Summary
							</h2>

							{/* Item List */}
							<div className="mt-6 divide-y divide-border-delicate max-h-80 overflow-y-auto pr-1">
								{items.map((item) => (
									<div key={item.product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
										<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border-delicate bg-surface-container-low">
											<Image
												src={
													item.product.images?.[0] ||
													"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
												}
												alt={item.product.name}
												fill
												sizes="64px"
												className="object-cover"
											/>
										</div>

										<div className="flex flex-1 flex-col justify-between">
											<div>
												<h3 className="font-serif text-sm font-medium text-primary line-clamp-1">
													{item.product.name}
												</h3>
												<p className="text-xs text-on-surface-variant">
													Qty: {item.quantity}
												</p>
											</div>
											<span className="text-xs font-bold text-primary">
												{formatNaira(item.product.price * item.quantity)}
											</span>
										</div>
									</div>
								))}
							</div>

							{/* Financial Breakdown */}
							<div className="mt-6 border-t border-border-delicate pt-5 space-y-3.5">
								<div className="flex items-center justify-between text-sm">
									<span className="text-on-surface-variant">Items Subtotal</span>
									<span className="font-bold text-primary">
										{formatNaira(subtotal)}
									</span>
								</div>

								{/* Explicit Strict Delivery Notice */}
								<div className="rounded-xl border border-secondary-fixed-dim bg-secondary-fixed/30 p-3.5">
									<div className="flex items-start gap-2.5">
										<Truck className="h-4 w-4 text-secondary-dark flex-shrink-0 mt-0.5" />
										<div>
											<p className="text-xs font-semibold text-on-secondary-fixed">
												Delivery Fee: To be calculated & agreed via WhatsApp
											</p>
											<p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
												Courier rates vary based on exact destination (Lagos, Abuja, or regional interstate). No automated fees are charged now.
											</p>
										</div>
									</div>
								</div>

								<div className="flex items-center justify-between border-t border-border-delicate pt-4">
									<span className="font-serif text-base font-medium text-primary">
										Total Payable at Checkout
									</span>
									<span className="font-serif text-lg font-bold text-primary">
										{formatNaira(subtotal)}*
									</span>
								</div>
								<p className="text-[10px] text-on-surface-variant text-right">
									*Excluding delivery quote agreed via WhatsApp.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
