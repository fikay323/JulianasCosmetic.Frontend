"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import type { CartItem, Product } from "@/src/types/store";

const CART_STORAGE_KEY = "julianas_cosmetics_cart_v1";
const CART_UPDATE_EVENT = "julianas_cosmetics_cart_update";

function subscribe(callback: () => void): () => void {
	if (typeof window === "undefined") {
		return () => {
			/* noop on server */
		};
	}
	window.addEventListener("storage", callback);
	window.addEventListener(CART_UPDATE_EVENT, callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(CART_UPDATE_EVENT, callback);
	};
}

function getCartSnapshot(): string {
	if (typeof window === "undefined") {
		return "[]";
	}
	try {
		return window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]";
	} catch {
		return "[]";
	}
}

function getServerSnapshot(): string {
	return "[]";
}

function saveCartToStorage(items: CartItem[]): void {
	if (typeof window !== "undefined") {
		try {
			window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
			window.dispatchEvent(new Event(CART_UPDATE_EVENT));
		} catch (error: unknown) {
			console.warn("[CartContext] Failed to save cart to localStorage:", error);
		}
	}
}

export interface CartContextType {
	items: CartItem[];
	isOpen: boolean;
	subtotal: number;
	totalCount: number;
	addItem: (product: Product, quantity?: number) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	openCart: () => void;
	closeCart: () => void;
	toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }): React.JSX.Element {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	// Subscribe to external store (localStorage) using React's useSyncExternalStore
	const cartRaw = useSyncExternalStore(subscribe, getCartSnapshot, getServerSnapshot);

	const items = useMemo<CartItem[]>(() => {
		try {
			const parsed: unknown = JSON.parse(cartRaw);
			if (Array.isArray(parsed)) {
				return parsed as CartItem[];
			}
		} catch {
			/* fallback to empty array */
		}
		return [];
	}, [cartRaw]);

	const addItem = useCallback(
		(product: Product, quantity = 1): void => {
			if (quantity <= 0) {
				return;
			}

			const existingIndex = items.findIndex(
				(item) => item.product.id === product.id
			);

			let updated: CartItem[];
			if (existingIndex > -1) {
				updated = items.map((item, idx) =>
					idx === existingIndex
						? { ...item, quantity: item.quantity + quantity }
						: item
				);
			} else {
				updated = [...items, { product, quantity }];
			}

			saveCartToStorage(updated);
			setIsOpen(true);
		},
		[items]
	);

	const removeItem = useCallback(
		(productId: string): void => {
			const updated = items.filter((item) => item.product.id !== productId);
			saveCartToStorage(updated);
		},
		[items]
	);

	const updateQuantity = useCallback(
		(productId: string, quantity: number): void => {
			if (quantity <= 0) {
				removeItem(productId);
				return;
			}

			const updated = items.map((item) =>
				item.product.id === productId ? { ...item, quantity } : item
			);
			saveCartToStorage(updated);
		},
		[items, removeItem]
	);

	const clearCart = useCallback((): void => {
		saveCartToStorage([]);
	}, []);

	const openCart = useCallback((): void => {
		setIsOpen(true);
	}, []);

	const closeCart = useCallback((): void => {
		setIsOpen(false);
	}, []);

	const toggleCart = useCallback((): void => {
		setIsOpen((prev) => !prev);
	}, []);

	const subtotal = useMemo((): number => {
		return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
	}, [items]);

	const totalCount = useMemo((): number => {
		return items.reduce((sum, item) => sum + item.quantity, 0);
	}, [items]);

	const value = useMemo<CartContextType>(() => {
		return {
			items,
			isOpen,
			subtotal,
			totalCount,
			addItem,
			removeItem,
			updateQuantity,
			clearCart,
			openCart,
			closeCart,
			toggleCart,
		};
	}, [
		items,
		isOpen,
		subtotal,
		totalCount,
		addItem,
		removeItem,
		updateQuantity,
		clearCart,
		openCart,
		closeCart,
		toggleCart,
	]);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
