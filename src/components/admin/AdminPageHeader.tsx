"use client";

import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	onClick?: (e: React.MouseEvent) => void;
	active?: boolean;
}

export interface AdminPageHeaderProps {
	breadcrumbs: BreadcrumbItem[];
	title: string;
	description?: string;
	actions?: React.ReactNode;
}

export function AdminPageHeader({
	breadcrumbs,
	title,
	description,
	actions,
}: AdminPageHeaderProps): React.JSX.Element {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-delicate pb-6">
			<div>
				<nav
					aria-label="Admin Breadcrumb"
					className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
				>
					{breadcrumbs.map((item, index) => {
						const isLast = index === breadcrumbs.length - 1;
						return (
							<React.Fragment key={index}>
								{index > 0 && <span>/</span>}
								{item.onClick ? (
									<button
										type="button"
										onClick={item.onClick}
										className={
											isLast
												? "text-secondary-dark"
												: "hover:text-primary transition-colors cursor-pointer"
										}
									>
										{item.label}
									</button>
								) : item.href ? (
									<Link
										href={item.href}
										className={
											isLast
												? "text-secondary-dark"
												: "hover:text-primary transition-colors"
										}
									>
										{item.label}
									</Link>
								) : (
									<span
										className={
											isLast || item.active ? "text-secondary-dark" : ""
										}
									>
										{item.label}
									</span>
								)}
							</React.Fragment>
						);
					})}
				</nav>

				<h1 className="mt-2 font-serif text-2xl sm:text-4xl font-medium text-primary">
					{title}
				</h1>
				{description && (
					<p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
						{description}
					</p>
				)}
			</div>

			{actions && (
				<div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
					{actions}
				</div>
			)}
		</div>
	);
}
