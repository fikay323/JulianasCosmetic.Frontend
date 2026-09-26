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
import type { Order, OrderStatus } from "@/src/types/store";

export default function AdminOrdersPage(): React.JSX.Element {
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
				throw new Error("Failed to load orders");
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
			const msg = err instanceof Error ? err.message : "Error fetching orders";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		let isMounted = true;
		fetch("/api/orders", { cache: "no-store" })
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load orders");
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
					const msg = err instanceof Error ? err.message : "Error fetching orders";
					setError(msg);
					setLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

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
		<div className="min-h-screen bg-surface py-10 sm:py-14">
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
						<h1 className="mt-2 font-serif text-3xl font-medium text-primary sm:text-4xl">
							Concierge Orders Registry
						</h1>
						<p className="mt-1 text-xs text-on-surface-variant">
							Review customer concierge requests, agree delivery fees in ₦, and progress orders to Paid & Dispatched.
						</p>
					</div>

					<div className="flex items-center gap-3">
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
				<div className="mt-8 overflow-hidden rounded-2xl border border-border-delicate bg-surface-card shadow-sm">
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
						<div className="overflow-x-auto">
							<table data-testid="orders-table" className="w-full text-left border-collapse">
								<thead>
									<tr className="border-b border-border-delicate bg-surface-container-low/40 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
										<th className="px-5 py-4">Order Ref</th>
										<th className="px-5 py-4">Customer & Phone</th>
										<th className="px-5 py-4">Destination</th>
										<th className="px-5 py-4">Items</th>
										<th className="px-5 py-4">Subtotal</th>
										<th className="px-5 py-4">Delivery Fee (₦)</th>
										<th className="px-5 py-4">Total</th>
										<th className="px-5 py-4">Status</th>
										<th className="px-5 py-4 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border-delicate text-xs text-primary">
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
												className="hover:bg-surface-container-low/30 transition-colors"
											>
												{/* Order Ref */}
												<td className="px-5 py-4 font-mono font-bold text-primary">
													#{order.orderNumber}
													<span className="block text-[10px] font-sans text-on-surface-variant font-normal">
														{new Date(order.createdAt).toLocaleDateString()}
													</span>
												</td>

												{/* Customer & Phone */}
												<td className="px-5 py-4">
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

												{/* Destination */}
												<td className="px-5 py-4">
													<div className="font-medium text-primary">
														{order.customer.cityLga}, {order.customer.state}
													</div>
													<div className="text-[10px] text-on-surface-variant line-clamp-1 max-w-[180px]" title={order.customer.address}>
														{order.customer.address}
													</div>
													{order.customer.courierNotes && (
														<span className="mt-0.5 block text-[10px] italic text-secondary-dark line-clamp-1">
															Note: {order.customer.courierNotes}
														</span>
													)}
												</td>

												{/* Items Count & Names */}
												<td className="px-5 py-4">
													<span className="font-semibold text-primary">
														{totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
													</span>
													<div className="text-[10px] text-on-surface-variant line-clamp-1 max-w-[150px]">
														{order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
													</div>
												</td>

												{/* Subtotal */}
												<td className="px-5 py-4 font-medium text-primary">
													{formatNaira(order.subtotal)}
												</td>

												{/* Agreed Delivery Fee Input */}
												<td className="px-5 py-4">
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
												</td>

												{/* Total */}
												<td className="px-5 py-4 font-bold text-primary">
													{formatNaira(order.total || order.subtotal)}
												</td>

												{/* Status Chip */}
												<td className="px-5 py-4 whitespace-nowrap">
													{getStatusChip(order.status)}
												</td>

												{/* Actions */}
												<td className="px-5 py-4 text-right whitespace-nowrap">
													{!isPaid ? (
														<button
															type="button"
															onClick={() => void handleMarkAsPaid(order.id)}
															disabled={markingPaidId === order.id}
															className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95 shadow-xs"
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
