import React from "react";
import Link from "next/link";
import { MessageCircle, Sparkles, Clock, CheckCircle } from "lucide-react";

export function RoutineConsultation(): React.JSX.Element {
	return (
		<section className="relative overflow-hidden bg-primary py-20 text-white">
			{/* Subtle background glow */}
			<div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
			<div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-tertiary-light/10 blur-3xl" />

			<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl text-center space-y-6">
					<div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-primary-dark/60 px-4 py-1.5 backdrop-blur-md">
						<Sparkles className="h-3.5 w-3.5 text-secondary" />
						<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-fixed">
							Dermatological Skin Concierge
						</span>
					</div>

					<h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
						Tailored Botanical Rituals for Your Skin Barrier
					</h2>

					<p className="text-sm sm:text-base font-light leading-relaxed text-on-primary-container">
						Every melanin-rich skin barrier is unique. Our Lagos-based aesthetic formulation specialists provide complimentary one-on-one routine consultations via WhatsApp to prescribe the exact bioactive sequence for your hyperpigmentation, texture, and hydration goals.
					</p>

					{/* 3 Value Pillars */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
						<div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
							<Clock className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold uppercase tracking-wider text-white">
									Direct WhatsApp Chat
								</h4>
								<p className="mt-1 text-xs text-on-primary-container">
									Personalized advice within 15 minutes during salon hours.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
							<CheckCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold uppercase tracking-wider text-white">
									Formulation Matching
								</h4>
								<p className="mt-1 text-xs text-on-primary-container">
									Pair serums, SPF, and lipid creams to prevent barrier overload.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
							<Sparkles className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
							<div>
								<h4 className="text-xs font-semibold uppercase tracking-wider text-white">
									Doorstep Dispatch
								</h4>
								<p className="mt-1 text-xs text-on-primary-container">
									Agreed courier quote and priority delivery across Nigeria.
								</p>
							</div>
						</div>
					</div>

					<div className="pt-6 flex flex-wrap items-center justify-center gap-4">
						<a
							href="https://wa.me/2348000000000?text=Hello%20Juliana's%20Cosmetics%2C%20I%20would%20like%20a%20skincare%20routine%20consultation."
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-lg transition-all hover:bg-secondary-container active:scale-95"
						>
							<MessageCircle className="h-4 w-4" />
							<span>Start WhatsApp Consultation</span>
						</a>

						<Link
							href="/products"
							className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-white/10 hover:border-white/40 active:scale-95"
						>
							<span>Browse All Formulations</span>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
