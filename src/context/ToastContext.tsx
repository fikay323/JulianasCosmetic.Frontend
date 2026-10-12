"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "error" | "success" | "info" | "warning";

export interface ToastMessage {
	id: string;
	title?: string;
	message: string;
	type: ToastType;
	duration?: number;
}

export interface ToastContextType {
	toasts: ToastMessage[];
	showToast: (toast: Omit<ToastMessage, "id">) => string;
	dismissToast: (id: string) => void;
	toast: {
		error: (message: string, title?: string, duration?: number) => string;
		success: (message: string, title?: string, duration?: number) => string;
		info: (message: string, title?: string, duration?: number) => string;
		warning: (message: string, title?: string, duration?: number) => string;
	};
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }): React.JSX.Element {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const dismissToast = useCallback((id: string): void => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const showToast = useCallback(
		({
			message,
			type = "info",
			title,
			duration = 5000,
		}: Omit<ToastMessage, "id">): string => {
			const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
			const newToast: ToastMessage = {
				id,
				message,
				type,
				title,
				duration,
			};

			setToasts((prev) => [...prev, newToast]);

			if (duration > 0) {
				setTimeout(() => {
					dismissToast(id);
				}, duration);
			}

			return id;
		},
		[dismissToast]
	);

	const toastHelpers = useMemo(
		() => ({
			error: (message: string, title = "Data Fetch Error", duration = 6000): string =>
				showToast({ message, title, type: "error", duration }),
			success: (message: string, title = "Success", duration = 4000): string =>
				showToast({ message, title, type: "success", duration }),
			info: (message: string, title = "Information", duration = 4000): string =>
				showToast({ message, title, type: "info", duration }),
			warning: (message: string, title = "Warning", duration = 5000): string =>
				showToast({ message, title, type: "warning", duration }),
		}),
		[showToast]
	);

	const contextValue = useMemo<ToastContextType>(
		() => ({
			toasts,
			showToast,
			dismissToast,
			toast: toastHelpers,
		}),
		[toasts, showToast, dismissToast, toastHelpers]
	);

	return (
		<ToastContext.Provider value={contextValue}>
			{children}

			{/* Global Floating Toast Viewport */}
			<div
				aria-live="polite"
				aria-atomic="true"
				className="pointer-events-none fixed top-5 right-5 z-[99999] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
			>
				{toasts.map((item) => {
					const isError = item.type === "error";
					const isSuccess = item.type === "success";
					const isWarning = item.type === "warning";

					return (
						<div
							key={item.id}
							role="alert"
							className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
								isError
									? "border-error/40 bg-[#281316] text-[#FFE8EA]"
									: isSuccess
									? "border-secondary-fixed/50 bg-[#162419] text-[#E8F8EB]"
									: isWarning
									? "border-amber-500/40 bg-[#2A2210] text-[#FFF6E5]"
									: "border-border-delicate bg-surface-card text-primary"
							}`}
						>
							<div className="mt-0.5 flex-shrink-0">
								{isError && <AlertCircle className="h-5 w-5 text-[#FF6E7F]" />}
								{isSuccess && <CheckCircle2 className="h-5 w-5 text-secondary-dark" />}
								{isWarning && <AlertTriangle className="h-5 w-5 text-amber-400" />}
								{!isError && !isSuccess && !isWarning && (
									<Info className="h-5 w-5 text-primary" />
								)}
							</div>

							<div className="flex-1 min-w-0">
								{item.title && (
									<h4 className="font-serif text-xs font-bold tracking-wide uppercase">
										{item.title}
									</h4>
								)}
								<p className="mt-0.5 text-xs font-medium leading-relaxed opacity-95 break-words">
									{item.message}
								</p>
							</div>

							<button
								type="button"
								onClick={() => dismissToast(item.id)}
								aria-label="Dismiss notification"
								className="flex-shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					);
				})}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastContextType {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}
