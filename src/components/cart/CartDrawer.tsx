"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/src/context/CartContext";
import { formatNaira } from "@/src/lib/utils";

export function CartDrawer(): React.JSX.Element {
	const {
		isOpen,
		closeCart,
		items,
		subtotal,
		totalCount,
		updateQuantity,
		removeItem,
	} = useCart();

	const handleDecrement = (productId: string, currentQuantity: number): void => {
		if (currentQuantity > 1) {
			updateQuantity(productId, currentQuantity - 1);
		}
	};

	const handleIncrement = (productId: string, currentQuantity: number): void => {
		updateQuantity(productId, currentQuantity + 1);
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={(open: boolean) => {
			if (!open) {
				closeCart();
			}
		}}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" />
				<Dialog.Content
					data-testid="cart-drawer"
					className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col justify-between border-l border-border-delicate bg-surface-card shadow-2xl transition-transform duration-300 animate-in slide-in-from-right"
					aria-describedby="cart-drawer-description"
				>
					{/* Header */}
					<div className="flex items-center justify-between border-b border-border-delicate px-6 py-5">
						<div className="flex items-center gap-2">
							<Dialog.Title className="font-serif text-xl font-medium tracking-tight text-primary">
								Your Shopping Bag
							</Dialog.Title>
							<span className="rounded-full bg-surface-container-low px-2 py-0.5 text-xs font-semibold text-primary">
								{totalCount}
							</span>
						</div>
						<Dialog.Close asChild>
							<button
								type="button"
								onClick={closeCart}
								className="rounded-full p-2 text-primary/60 transition-colors hover:bg-surface-container-low hover:text-primary focus:outline-none"
								aria-label="Close cart drawer"
							>
								<X className="h-5 w-5" />
							</button>
						</Dialog.Close>
					</div>

					<p id="cart-drawer-description" className="sr-only">
						Curated luxury botanical formulations in your shopping bag.
					</p>

					{/* Drawer Content Body */}
					{items.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-primary/40">
								<ShoppingBag className="h-8 w-8" />
							</div>
							<h3 className="font-serif text-lg font-medium text-primary">
								Your bag is empty
							</h3>
							<p className="mt-2 max-w-xs text-sm text-on-surface-variant">
								Explore our dermatologist-formulated luxury clean skincare imported directly from Paris.
							</p>
							<Link
								href="/products"
								onClick={closeCart}
								className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-primary/90"
							>
								<span>Shop Formulations</span>
								<ArrowRight className="h-3.5 w-3.5" />
							</Link>
						</div>
					) : (
						<div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border-delicate">
							{items.map((item) => {
								const product = item.product;
								const imageSrc = product.images?.[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80";

								return (
									<div
										key={product.id}
										className="flex gap-4 py-5 first:pt-2 last:pb-2"
									>
										{/* Product Thumbnail */}
										<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border-delicate bg-surface-container-low">
											<Image
												src={imageSrc}
												alt={product.name}
												fill
												sizes="80px"
												className="object-cover"
											/>
										</div>

										{/* Details */}
										<div className="flex flex-1 flex-col justify-between">
											<div className="flex items-start justify-between gap-2">
												<div>
													<span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary-dark">
														{product.category}
													</span>
													<h4 className="font-serif text-sm font-medium text-primary line-clamp-1">
														{product.name}
													</h4>
													{item.selectedSize && (
														<span className="text-xs text-on-surface-variant">
															{item.selectedSize}
														</span>
													)}
												</div>

												{/* Trash / Remove Button */}
												<button
													type="button"
													data-testid="remove-item"
													onClick={() => removeItem(product.id)}
													className="p-1 text-primary/40 transition-colors hover:text-error focus:outline-none"
													aria-label={`Remove ${product.name} from bag`}
												>
													<Trash2 className="h-4 w-4" />
													<span className="sr-only">Remove</span>
												</button>
											</div>

											{/* Price & Quantity Stepper */}
											<div className="mt-3 flex items-center justify-between">
												<span className="text-sm font-semibold text-primary">
													{formatNaira(product.price)}
												</span>

												{/* Quantity Stepper */}
												<div className="flex items-center rounded-full border border-border-delicate bg-surface-container-low px-1 py-0.5">
													<button
														type="button"
														onClick={() => handleDecrement(product.id, item.quantity)}
														className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-primary transition-colors hover:bg-white ${
															item.quantity <= 1 ? "opacity-50 cursor-default" : ""
														}`}
														aria-label="Decrease quantity"
													>
														<Minus className="h-3 w-3" />
													</button>
													<span className="min-w-6 text-center text-xs font-semibold text-primary">
														{item.quantity}
													</span>
													<button
														type="button"
														onClick={() => handleIncrement(product.id, item.quantity)}
														className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-primary transition-colors hover:bg-white"
														aria-label="Increase quantity"
													>
														<Plus className="h-3 w-3" />
													</button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{/* Drawer Footer */}
					{items.length > 0 && (
						<div className="border-t border-border-delicate bg-surface p-6 shadow-sm">
							<div className="mb-4 space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-on-surface-variant">Items Subtotal</span>
									<span className="text-base font-bold text-primary">
										{formatNaira(subtotal)}
									</span>
								</div>
								<p className="text-[11px] leading-relaxed text-on-surface-variant">
									Doorstep delivery fee calculated and agreed via WhatsApp concierge.
								</p>
							</div>

							<Link
								href="/checkout"
								data-testid="checkout-button"
								onClick={closeCart}
								className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-primary/90 hover:shadow-md"
							>
								<span>Proceed to Checkout</span>
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
