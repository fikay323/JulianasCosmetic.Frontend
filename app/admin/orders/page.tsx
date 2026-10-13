"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
	ShoppingBag,
	ArrowLeft,
	RefreshCw,
	MessageSquare,
	Check,
	Truck,
	Clock,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import { formatNaira, sanitizePhoneNumber } from "@/src/lib/utils";
import { useToast } from "@/src/context/ToastContext";
import type { Order, OrderStatus } from "@/src/types/store";

export default function AdminOrdersPage(): React.JSX.Element {
	const { toast } = useToast();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [feeInputs, setFeeInputs] = useState<Record<string, string>>({});
	const [savingFeeId, setSavingFeeId] = useState<string | null>(null);
	const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

	const loadOrders = useCallback(async (): Promise<void> => {
		try {
			const res = await fetch("/api/orders", {
				cache: "no-store",
			});
			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(errData.error || `HTTP ${res.status}: Failed to load orders from backend`);
			}
			const data = (await res.json()) as Order[];
			setOrders(data);

			// Prepopulate delivery fee inputs
			const initialFees: Record<string, string> = {};
			data.forEach((ord) => {
				if (ord.agreedDeliveryFee !== null && ord.agreedDeliveryFee !== undefined) {
					initialFees[ord.id] = String(ord.agreedDeliveryFee);
				}
			});
			setFeeInputs(initialFees);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Error fetching orders from backend";
			setError(msg);
			toast.error(msg, "Backend Orders Error");
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		let isMounted = true;
		fetch("/api/orders", { cache: "no-store" })
			.then(async (res) => {
				if (!res.ok) {
					const errData = (await res.json().catch(() => ({}))) as { error?: string };
					throw new Error(errData.error || `HTTP ${res.status}: Failed to load orders from backend`);
				}
				return res.json();
			})
			.then((data: unknown) => {
				if (isMounted && Array.isArray(data)) {
					const ordersData = data as Order[];
					setOrders(ordersData);
					const initialFees: Record<string, string> = {};
					ordersData.forEach((ord) => {
						if (ord.agreedDeliveryFee !== null && ord.agreedDeliveryFee !== undefined) {
							initialFees[ord.id] = String(ord.agreedDeliveryFee);
						}
					});
					setFeeInputs(initialFees);
					setLoading(false);
				}
			})
			.catch((err: unknown) => {
				if (isMounted) {
					const msg = err instanceof Error ? err.message : "Error fetching orders from backend";
					setError(msg);
					toast.error(msg, "Backend Orders Error");
					setLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [toast]);

	const handleRefresh = (): void => {
		setLoading(true);
		setError(null);
		void loadOrders();
	};

	const handleFeeInputChange = (orderId: string, value: string): void => {
		setFeeInputs((prev) => ({
			...prev,
			[orderId]: value,
		}));
	};

	const handleSaveDeliveryFee = async (orderId: string): Promise<void> => {
		const rawValue = feeInputs[orderId];
		const fee = rawValue ? Number(rawValue) : 0;

		setSavingFeeId(orderId);
		try {
			const res = await fetch(`/api/orders/${orderId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					agreedDeliveryFee: fee,
					status: "Awaiting Payment" as OrderStatus,
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to record delivery fee");
			}

			const updatedOrder = (await res.json()) as Order;
			setOrders((prev) =>
				prev.map((ord) => (ord.id === orderId ? updatedOrder : ord))
			);
		} catch (err: unknown) {
			console.error("[handleSaveDeliveryFee] Error:", err);
			setError(err instanceof Error ? err.message : "Error saving delivery fee");
		} finally {
			setSavingFeeId(null);
		}
	};

	const handleMarkAsPaid = async (orderId: string): Promise<void> => {
		setMarkingPaidId(orderId);
		try {
			const res = await fetch(`/api/orders/${orderId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					status: "Paid" as OrderStatus,
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to transition status to Paid");
			}

			const updatedOrder = (await res.json()) as Order;
			setOrders((prev) =>
				prev.map((ord) => (ord.id === orderId ? updatedOrder : ord))
			);
		} catch (err: unknown) {
			console.error("[handleMarkAsPaid] Error:", err);
			setError(err instanceof Error ? err.message : "Error marking order as paid");
		} finally {
			setMarkingPaidId(null);
		}
	};

	const getStatusChip = (status: OrderStatus): React.JSX.Element => {
		switch (status) {
			case "Awaiting Delivery Agreement":
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-xs font-semibold text-on-secondary-fixed shadow-xs">
						<Clock className="h-3 w-3 text-secondary-dark" />
						<span>Awaiting Delivery Agreement</span>
					</span>
				);
			case "Awaiting Payment":
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant shadow-xs">
						<Truck className="h-3 w-3 text-on-surface-variant" />
						<span>Awaiting Payment</span>
					</span>
				);
			case "Paid":
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full bg-blush-tint px-3 py-1 text-xs font-bold text-primary shadow-xs">
						<CheckCircle2 className="h-3.5 w-3.5 text-secondary-dark" />
						<span>Paid</span>
					</span>
				);
			case "Dispatched":
				return (
					<span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface shadow-xs">
						<Truck className="h-3 w-3 text-primary" />
						<span>Dispatched</span>
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface">
						{status}
					</span>
				);
		}
	};

	return (
		<div className="min-h-screen bg-surface py-8 sm:py-14">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Navigation & Breadcrumbs */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-delicate pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
							<Link href="/admin" className="hover:text-primary transition-colors">
								Admin Portal
							</Link>
							<span>/</span>
							<span className="text-secondary-dark">Orders Management</span>
						</div>
						<h1 className="mt-2 font-serif text-2xl font-medium text-primary sm:text-4xl">
							Concierge Orders Registry
						</h1>
						<p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
							Review customer concierge requests, agree delivery fees in ₦, and progress orders to Paid & Dispatched.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
						<button
							type="button"
							onClick={handleRefresh}
							disabled={loading}
							className="inline-flex items-center gap-2 rounded-full border border-border-delicate bg-surface-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-surface-container-low disabled:opacity-50"
						>
							<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
							<span>Refresh</span>
						</button>
						<Link
							href="/admin"
							className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary/90"
						>
							<ArrowLeft className="h-3.5 w-3.5" />
							<span>Admin Hub</span>
						</Link>
					</div>
				</div>

				{/* Error State */}
				{error && (
					<div className="mt-6 flex items-center gap-2 rounded-xl border border-error/30 bg-error-container p-4 text-xs font-medium text-on-error-container">
						<AlertCircle className="h-4 w-4" />
						<span>{error}</span>
					</div>
				)}

				{/* Main Content / Table */}
				<div className="mt-6 sm:mt-8 overflow-hidden rounded-2xl border border-border-delicate bg-surface-card shadow-sm">
					{loading && orders.length === 0 ? (
						<div className="p-12 text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							<p className="font-serif text-base text-primary">Loading Concierge Orders...</p>
							<p className="mt-1 text-xs text-on-surface-variant">Syncing with persistent orders store</p>
						</div>
					) : orders.length === 0 ? (
						<div className="p-12 text-center">
							<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-low text-primary/40">
								<ShoppingBag className="h-7 w-7" />
							</div>
							<h3 className="font-serif text-lg font-medium text-primary">No Orders Recorded Yet</h3>
							<p className="mt-1 text-xs text-on-surface-variant">
								Orders placed by customers through the concierge checkout will appear here.
							</p>
						</div>
					) : (
						<div className="lg:overflow-x-auto">
							<table
								data-testid="orders-table"
								className="block lg:table w-full text-left border-collapse"
							>
								<thead className="hidden lg:table-header-group border-b border-border-delicate bg-surface-container-low/40 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
									<tr className="lg:table-row">
										<th className="px-5 py-4 whitespace-nowrap">Order Ref</th>
										<th className="px-5 py-4 whitespace-nowrap">Customer & Phone</th>
										<th className="px-5 py-4 whitespace-nowrap">Destination</th>
										<th className="px-5 py-4 whitespace-nowrap">Items</th>
										<th className="px-5 py-4 whitespace-nowrap">Subtotal</th>
										<th className="px-5 py-4 whitespace-nowrap">Delivery Fee (₦)</th>
										<th className="px-5 py-4 whitespace-nowrap">Total</th>
										<th className="px-5 py-4 whitespace-nowrap">Status</th>
										<th className="px-5 py-4 text-right whitespace-nowrap">Actions</th>
									</tr>
								</thead>
								<tbody className="block lg:table-row-group divide-y divide-border-delicate text-xs text-primary">
									{orders.map((order) => {
										const currentFeeInput =
											feeInputs[order.id] ??
											(order.agreedDeliveryFee !== null && order.agreedDeliveryFee !== undefined
												? String(order.agreedDeliveryFee)
												: "");
										const isPaid = order.status === "Paid" || order.status === "Dispatched";
										const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

										return (
											<tr
												key={order.id}
												data-testid="order-row"
												className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 sm:p-5 lg:table-row lg:p-0 hover:bg-surface-container-low/30 transition-colors"
											>
												{/* 1. Order Ref */}
												<td className="col-start-1 row-start-1 self-center lg:table-cell lg:px-5 lg:py-4 font-mono font-bold text-primary">
													#{order.orderNumber}
													<span className="block text-[10px] font-sans text-on-surface-variant font-normal">
														{new Date(order.createdAt).toLocaleDateString()}
													</span>
												</td>

												{/* 2. Customer & Phone */}
												<td className="col-start-1 row-start-2 lg:table-cell lg:px-5 lg:py-4">
													<span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant lg:hidden">
														Client
													</span>
													<div className="font-semibold text-primary">
														{order.customer.fullName}
													</div>
													<div className="text-[11px] text-on-surface-variant">
														{order.customer.phone}
													</div>
													<a
														href={`https://wa.me/${sanitizePhoneNumber(order.customer.phone)}`}
														target="_blank"
														rel="noopener noreferrer"
														className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#128C7E] hover:underline"
													>
														<MessageSquare className="h-3 w-3" />
														<span>Chat on WhatsApp</span>
													</a>
												</td>

												{/* 3. Destination */}
												<td className="col-start-2 row-start-2 lg:table-cell lg:px-5 lg:py-4">
													<span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant lg:hidden">
														Destination
													</span>
													<div className="font-medium text-primary">
														{order.customer.cityLga}, {order.customer.state}
													</div>
													<div className="text-[10px] text-on-surface-variant line-clamp-2 lg:line-clamp-1 lg:max-w-[180px]" title={order.customer.address}>
														{order.customer.address}
													</div>
													{order.customer.courierNotes && (
														<span className="mt-0.5 block text-[10px] italic text-secondary-dark line-clamp-1">
															Note: {order.customer.courierNotes}
														</span>
													)}
												</td>

												{/* 4. Items Count & Names */}
												<td className="col-span-2 row-start-3 rounded-xl bg-surface-container-low/40 px-3 py-2 lg:table-cell lg:rounded-none lg:bg-transparent lg:px-5 lg:py-4">
													<span className="font-semibold text-primary">
														{totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
													</span>
													<div className="text-[11px] lg:text-[10px] text-on-surface-variant lg:line-clamp-1 lg:max-w-[150px]">
														{order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
													</div>
												</td>

												{/* 5. Subtotal */}
												<td className="col-start-1 row-start-4 lg:table-cell lg:px-5 lg:py-4 font-medium text-primary">
													<span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant lg:hidden">
														Subtotal
													</span>
													{formatNaira(order.subtotal)}
												</td>

												{/* 6. Agreed Delivery Fee Input */}
												<td className="col-span-2 row-start-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-delicate/60 bg-surface-container-low/30 px-3 py-2.5 lg:table-cell lg:rounded-none lg:border-0 lg:bg-transparent lg:px-5 lg:py-4">
													<span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant lg:hidden">
														Delivery Fee (₦)
													</span>
													<div>
														<div className="flex items-center gap-1.5">
															<input
																type="number"
																name="deliveryFee"
																placeholder="Fee in ₦"
																value={currentFeeInput}
																onChange={(e) => handleFeeInputChange(order.id, e.target.value)}
																className="w-24 rounded-lg border border-border-delicate bg-surface-card px-2.5 py-1.5 text-xs text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
															/>
															<button
																type="button"
																onClick={() => void handleSaveDeliveryFee(order.id)}
																disabled={savingFeeId === order.id}
																className="inline-flex items-center gap-1 rounded-lg border border-border-delicate bg-surface-container-low px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container hover:text-primary active:scale-95 disabled:opacity-50"
																aria-label="Save delivery fee"
															>
																<Check className="h-3 w-3" />
																<span>{savingFeeId === order.id ? "..." : "Save"}</span>
															</button>
														</div>
														{order.agreedDeliveryFee !== null && order.agreedDeliveryFee !== undefined && (
															<span className="mt-1 block text-[10px] text-secondary-dark font-medium">
																Agreed: {formatNaira(order.agreedDeliveryFee)}
															</span>
														)}
													</div>
												</td>

												{/* 7. Total */}
												<td className="col-start-2 row-start-4 text-right lg:text-left lg:table-cell lg:px-5 lg:py-4 font-bold text-primary">
													<span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant lg:hidden">
														Order Total
													</span>
													{formatNaira(order.total || order.subtotal)}
												</td>

												{/* 8. Status Chip */}
												<td className="col-start-2 row-start-1 self-center justify-self-end whitespace-nowrap lg:table-cell lg:px-5 lg:py-4">
													{getStatusChip(order.status)}
												</td>

												{/* 9. Actions */}
												<td className="col-span-2 row-start-6 border-t border-border-delicate/60 pt-3 text-right whitespace-nowrap lg:table-cell lg:border-0 lg:px-5 lg:py-4">
													{!isPaid ? (
														<button
															type="button"
															onClick={() => void handleMarkAsPaid(order.id)}
															disabled={markingPaidId === order.id}
															className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 lg:px-3 lg:py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95 shadow-xs"
														>
															<CheckCircle2 className="h-3.5 w-3.5 text-secondary-dim" />
															<span>
																{markingPaidId === order.id ? "Updating..." : "Mark as Paid"}
															</span>
														</button>
													) : (
														<span className="text-[11px] font-semibold text-secondary-dark">
															Payment Verified
														</span>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
