"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
	Upload,
	Trash2,
	RefreshCw,
	Image as ImageIcon,
	X,
	ArrowLeft,
	ArrowRight,
	GripVertical,
	Star,
	Plus,
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";
import type { UploadedVisual, ImageSignature } from "@/src/types/store";

export interface MultiProductImageUploaderProps {
	slug: string;
	visuals: UploadedVisual[];
	onVisualsChange: (visuals: UploadedVisual[]) => void;
	onPendingPreviewChange?: (hasPending: boolean) => void;
}

interface PendingFile {
	id: string;
	file: File;
	localPreviewUrl: string;
	progress: number;
	isUploading: boolean;
	error: string | null;
}

export function MultiProductImageUploader({
	slug,
	visuals,
	onVisualsChange,
	onPendingPreviewChange,
}: MultiProductImageUploaderProps): React.JSX.Element {
	const { toast } = useToast();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
	const [isUploadingAny, setIsUploadingAny] = useState<boolean>(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	// Notify parent if there are unuploaded pending previews
	useEffect(() => {
		onPendingPreviewChange?.(pendingFiles.length > 0);
	}, [pendingFiles, onPendingPreviewChange]);

	// Clean up object URLs on unmount
	useEffect(() => {
		return () => {
			pendingFiles.forEach((p) => URL.revokeObjectURL(p.localPreviewUrl));
		};
	}, [pendingFiles]);

	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	};

	const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const validFiles: PendingFile[] = [];

		for (const file of files) {
			if (!file.type.startsWith("image/")) {
				toast.error(`"${file.name}" is not a supported image format.`, "Invalid Format");
				continue;
			}
			if (file.size > 10 * 1024 * 1024) {
				toast.error(`"${file.name}" exceeds the 10 MB limit.`, "File Too Large");
				continue;
			}

			const objectUrl = URL.createObjectURL(file);
			validFiles.push({
				id: `pending-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
				file,
				localPreviewUrl: objectUrl,
				progress: 0,
				isUploading: false,
				error: null,
			});
		}

		if (validFiles.length > 0) {
			setPendingFiles((prev) => [...prev, ...validFiles]);
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDiscardPendingFile = (pendingId: string): void => {
		setPendingFiles((prev) => {
			const target = prev.find((p) => p.id === pendingId);
			if (target) {
				URL.revokeObjectURL(target.localPreviewUrl);
			}
			return prev.filter((p) => p.id !== pendingId);
		});
	};

	const handleDiscardAllPending = (): void => {
		pendingFiles.forEach((p) => URL.revokeObjectURL(p.localPreviewUrl));
		setPendingFiles([]);
	};

	// Direct signed upload straight to Cloudinary
	const uploadSingleFileDirectly = async (
		pending: PendingFile
	): Promise<UploadedVisual> => {
		// 1. Acquire upload signature from backend for this product slug
		const signRes = await fetch("/api/images/sign", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ slug }),
		});

		if (!signRes.ok) {
			const signErr = (await signRes.json().catch(() => ({}))) as { error?: string };
			throw new Error(signErr.error || "Failed to generate Cloudinary signature");
		}

		const signatureData = (await signRes.json()) as ImageSignature;

		// 2. Stream directly to Cloudinary with live progress
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const formData = new FormData();

			formData.append("file", pending.file);
			formData.append("api_key", signatureData.apiKey);
			formData.append("timestamp", signatureData.timestamp);
			formData.append("folder", signatureData.folder);
			formData.append("signature", signatureData.signature);

			xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
				if (event.lengthComputable && event.total > 0) {
					const percent = Math.min(95, Math.round((event.loaded / event.total) * 100));
					setPendingFiles((prev) =>
						prev.map((p) => (p.id === pending.id ? { ...p, progress: percent } : p))
					);
				}
			});

			xhr.addEventListener("load", () => {
				let parsed: { secure_url?: string; url?: string; public_id?: string; error?: { message?: string } } = {};
				try {
					parsed = JSON.parse(xhr.responseText) as typeof parsed;
				} catch {
					parsed = {};
				}

				const resultUrl = parsed.secure_url || parsed.url;

				if (xhr.status >= 200 && xhr.status < 300 && resultUrl && parsed.public_id) {
					setPendingFiles((prev) =>
						prev.map((p) => (p.id === pending.id ? { ...p, progress: 100 } : p))
					);
					resolve({
						id: `visual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
						url: resultUrl,
						publicId: parsed.public_id,
						fileName: pending.file.name,
						fileSize: pending.file.size,
					});
				} else {
					const errMsg =
						parsed.error?.message ||
						`Cloudinary direct upload failed with status ${xhr.status}`;
					reject(new Error(errMsg));
				}
			});

			xhr.addEventListener("error", () => {
				reject(new Error("Network error during direct Cloudinary upload"));
			});

			const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
			xhr.open("POST", uploadUrl);
			xhr.send(formData);
		});
	};

	const handleConfirmUploadAll = async (): Promise<void> => {
		if (pendingFiles.length === 0) return;

		setIsUploadingAny(true);
		const newlyUploaded: UploadedVisual[] = [];
		const failedIds: string[] = [];

		for (const pending of pendingFiles) {
			setPendingFiles((prev) =>
				prev.map((p) => (p.id === pending.id ? { ...p, isUploading: true, error: null } : p))
			);

			try {
				const uploadedVisual = await uploadSingleFileDirectly(pending);
				newlyUploaded.push(uploadedVisual);
				URL.revokeObjectURL(pending.localPreviewUrl);
			} catch (err: unknown) {
				const errorMsg = err instanceof Error ? err.message : "Upload failed";
				failedIds.push(pending.id);
				setPendingFiles((prev) =>
					prev.map((p) =>
						p.id === pending.id ? { ...p, isUploading: false, error: errorMsg } : p
					)
				);
			}
		}

		if (newlyUploaded.length > 0) {
			onVisualsChange([...visuals, ...newlyUploaded]);
			toast.success(
				`${newlyUploaded.length} formulation ${newlyUploaded.length === 1 ? "visual" : "visuals"} uploaded to Cloudinary.`,
				"Upload Successful"
			);
		}

		// Keep only failed files in pending list for retry
		setPendingFiles((prev) => prev.filter((p) => failedIds.includes(p.id)));
		setIsUploadingAny(false);
	};

	const handleRemoveUploadedVisual = async (visual: UploadedVisual): Promise<void> => {
		setDeletingId(visual.id);
		try {
			if (visual.publicId) {
				const res = await fetch("/api/images", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						publicId: visual.publicId,
						imageUrl: visual.url,
					}),
				});

				if (!res.ok) {
					const data = (await res.json().catch(() => ({}))) as { error?: string };
					throw new Error(data.error || "Failed to remove image from Cloudinary");
				}
			}

			const remaining = visuals.filter((v) => v.id !== visual.id);
			onVisualsChange(remaining);
			toast.info("Formulation visual deleted from storage.", "Asset Removed");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Deletion error";
			toast.error(msg, "Failed to Remove Visual");
		} finally {
			setDeletingId(null);
		}
	};

	const handleMoveVisual = (fromIndex: number, toIndex: number): void => {
		if (
			fromIndex < 0 ||
			fromIndex >= visuals.length ||
			toIndex < 0 ||
			toIndex >= visuals.length ||
			fromIndex === toIndex
		) {
			return;
		}

		const updated = [...visuals];
		const [moved] = updated.splice(fromIndex, 1);
		updated.splice(toIndex, 0, moved);
		onVisualsChange(updated);
	};

	return (
		<div className="space-y-4" data-testid="multi-image-uploader">
			<div className="flex items-center justify-between">
				<div>
					<label className="block text-xs font-semibold uppercase tracking-wider text-primary">
						Formulation Visuals ({visuals.length}) *
					</label>
					<p className="mt-0.5 text-[11px] text-on-surface-variant">
						Directly uploaded to Cloudinary • Drag or use arrows to rearrange • First image is the primary cover visual
					</p>
				</div>

				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="inline-flex items-center gap-1.5 rounded-full border border-border-delicate bg-surface-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-2xs hover:bg-surface-container-low transition-colors"
				>
					<Plus className="h-3.5 w-3.5 text-secondary-dark" />
					<span>Add Images</span>
				</button>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/jpeg,image/png,image/webp,image/avif"
				onChange={handleFilesSelected}
				className="hidden"
				data-testid="product-image-file-input"
			/>

			{/* STAGE 1: Pending Pre-Upload Local Previews with Progress */}
			{pendingFiles.length > 0 && (
				<div
					data-testid="image-local-preview-card"
					className="rounded-2xl border-2 border-secondary bg-surface p-4 shadow-sm space-y-3"
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary-fixed">
								<span>{pendingFiles.length} New Visuals Selected</span>
							</span>
							<span className="text-xs text-on-surface-variant">
								Preview before direct Cloudinary upload
							</span>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleDiscardAllPending}
								disabled={isUploadingAny}
								className="text-[11px] font-semibold text-on-surface-variant hover:text-error transition-colors"
							>
								Discard All
							</button>
							<button
								type="button"
								onClick={() => void handleConfirmUploadAll()}
								disabled={isUploadingAny}
								data-testid="confirm-upload-btn"
								className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-50"
							>
								{isUploadingAny ? (
									<RefreshCw className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Upload className="h-3.5 w-3.5" />
								)}
								<span>
									{isUploadingAny ? "Uploading..." : "Confirm & Upload All"}
								</span>
							</button>
						</div>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{pendingFiles.map((pending) => (
							<div
								key={pending.id}
								className="relative rounded-xl border border-border-delicate bg-surface-card p-2 space-y-1.5 overflow-hidden"
							>
								<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-container-low">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={pending.localPreviewUrl}
										alt={pending.file.name}
										className="h-full w-full object-cover"
									/>
									<button
										type="button"
										onClick={() => handleDiscardPendingFile(pending.id)}
										disabled={pending.isUploading}
										className="absolute top-1 right-1 rounded-full bg-primary/70 p-1 text-white hover:bg-error transition-colors"
										title="Discard visual"
									>
										<X className="h-3 w-3" />
									</button>
								</div>

								<div className="text-[10px] truncate font-medium text-primary" title={pending.file.name}>
									{pending.file.name}
								</div>
								<div className="text-[9px] text-on-surface-variant">
									{formatFileSize(pending.file.size)}
								</div>

								{/* Progress Bar */}
								{pending.isUploading && (
									<div className="space-y-1">
										<div className="flex justify-between text-[9px] font-semibold text-primary">
											<span>Uploading</span>
											<span>{pending.progress}%</span>
										</div>
										<div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
											<div
												className="h-full rounded-full bg-secondary transition-all duration-150"
												style={{ width: `${pending.progress}%` }}
											/>
										</div>
									</div>
								)}

								{pending.error && (
									<div className="text-[9px] text-error truncate" title={pending.error}>
										{pending.error}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* STAGE 2: Uploaded Visuals with Reordering & Cover Badge */}
			{visuals.length > 0 ? (
				<div className="space-y-3" data-testid="uploaded-image-card">
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
						{visuals.map((visual, index) => {
							const isCover = index === 0;

							return (
								<div
									key={visual.id}
									draggable
									onDragStart={() => setDraggedIndex(index)}
									onDragOver={(e) => e.preventDefault()}
									onDrop={() => {
										if (draggedIndex !== null && draggedIndex !== index) {
											handleMoveVisual(draggedIndex, index);
											setDraggedIndex(null);
										}
									}}
									className={`group relative rounded-2xl border bg-surface p-2.5 transition-all shadow-xs ${
										isCover
											? "border-secondary ring-2 ring-secondary/20"
											: "border-border-delicate hover:border-primary/40"
									}`}
								>
									{/* Thumbnail Visual */}
									<div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-container-low">
										<Image
											src={visual.url}
											alt={`Formulation visual ${index + 1}`}
											fill
											sizes="(max-width: 640px) 50vw, 25vw"
											className="object-cover"
										/>

										{/* Position / Cover Badge */}
										<div className="absolute top-2 left-2 flex items-center gap-1">
											{isCover ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary shadow-md backdrop-blur-xs">
													<Star className="h-2.5 w-2.5 fill-secondary text-secondary" />
													<span>Cover Visual</span>
												</span>
											) : (
												<span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-xs">
													#{index + 1}
												</span>
											)}
										</div>

										{/* Drag Handle Indicator */}
										<div
											title="Drag to reorder"
											className="absolute top-2 right-2 rounded-md bg-black/40 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
										>
											<GripVertical className="h-3 w-3" />
										</div>
									</div>

									{/* Controls Bar: Reorder & Delete */}
									<div className="mt-2.5 flex items-center justify-between gap-1 border-t border-border-delicate/60 pt-2 text-xs">
										{/* Reorder Buttons */}
										<div className="flex items-center gap-1">
											<button
												type="button"
												onClick={() => handleMoveVisual(index, index - 1)}
												disabled={index === 0}
												className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-delicate bg-surface-card text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
												title="Move visual left"
												aria-label={`Move visual ${index + 1} left`}
											>
												<ArrowLeft className="h-3.5 w-3.5" />
											</button>
											<button
												type="button"
												onClick={() => handleMoveVisual(index, index + 1)}
												disabled={index === visuals.length - 1}
												className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-delicate bg-surface-card text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
												title="Move visual right"
												aria-label={`Move visual ${index + 1} right`}
											>
												<ArrowRight className="h-3.5 w-3.5" />
											</button>
										</div>

										{/* Delete Button */}
										<button
											type="button"
											onClick={() => void handleRemoveUploadedVisual(visual)}
											disabled={deletingId === visual.id}
											data-testid="remove-uploaded-image-btn"
											className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-error/20 bg-error-container/40 text-error hover:bg-error hover:text-white transition-colors disabled:opacity-50"
											title="Remove & delete from Cloudinary"
											aria-label={`Remove visual ${index + 1}`}
										>
											{deletingId === visual.id ? (
												<RefreshCw className="h-3 w-3 animate-spin" />
											) : (
												<Trash2 className="h-3.5 w-3.5" />
											)}
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			) : (
				/* STAGE 3: Empty State Dropzone */
				<div
					onClick={() => fileInputRef.current?.click()}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							fileInputRef.current?.click();
						}
					}}
					data-testid="select-image-dropzone"
					className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-delicate bg-surface px-6 py-9 text-center transition-colors hover:border-secondary hover:bg-surface-container-low"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary">
						<ImageIcon className="h-6 w-6 text-secondary-dark" />
					</div>
					<p className="mt-3 text-xs font-semibold text-primary">
						Click to select formulation images from your device
					</p>
					<p className="mt-1 text-[11px] text-on-surface-variant">
						Select multiple files at once • JPG, PNG, WebP, AVIF up to 10 MB each • Direct fast upload to Cloudinary
					</p>
				</div>
			)}
		</div>
	);
}
