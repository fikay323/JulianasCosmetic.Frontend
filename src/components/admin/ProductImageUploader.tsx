"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Upload,
	CheckCircle2,
	Trash2,
	RefreshCw,
	Image as ImageIcon,
	Eye,
	X,
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

export interface ProductImageUploaderProps {
	currentImageUrl: string;
	currentPublicId?: string;
	initialSavedImageUrl?: string;
	onImageUploaded: (url: string, publicId: string) => void;
	onImageRemoved: () => void;
	onPendingPreviewChange?: (hasPendingPreview: boolean) => void;
}

interface UploadResponsePayload {
	url?: string;
	publicId?: string;
	error?: string;
}

export function ProductImageUploader({
	currentImageUrl,
	currentPublicId,
	initialSavedImageUrl,
	onImageUploaded,
	onImageRemoved,
	onPendingPreviewChange,
}: ProductImageUploaderProps): React.JSX.Element {
	const { toast } = useToast();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	useEffect(() => {
		onPendingPreviewChange?.(Boolean(selectedFile && localPreviewUrl));
	}, [selectedFile, localPreviewUrl, onPendingPreviewChange]);

	useEffect(() => {
		return () => {
			if (localPreviewUrl) {
				URL.revokeObjectURL(localPreviewUrl);
			}
		};
	}, [localPreviewUrl]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select a valid image file (JPG, PNG, WebP, or AVIF).", "Invalid File Format");
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			toast.error("Image file size must be under 10 MB.", "File Too Large");
			return;
		}

		if (localPreviewUrl) {
			URL.revokeObjectURL(localPreviewUrl);
		}

		const objectUrl = URL.createObjectURL(file);
		setSelectedFile(file);
		setLocalPreviewUrl(objectUrl);
		setUploadProgress(0);
	};

	const handleDiscardPreview = (): void => {
		if (localPreviewUrl) {
			URL.revokeObjectURL(localPreviewUrl);
		}
		setSelectedFile(null);
		setLocalPreviewUrl(null);
		setUploadProgress(0);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const uploadWithProgress = (file: File): Promise<UploadResponsePayload> => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const formData = new FormData();
			formData.append("file", file);

			xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
				if (event.lengthComputable && event.total > 0) {
					const percent = Math.min(95, Math.round((event.loaded / event.total) * 100));
					setUploadProgress(percent);
				}
			});

			xhr.addEventListener("load", () => {
				let parsed: UploadResponsePayload = {};
				try {
					parsed = JSON.parse(xhr.responseText) as UploadResponsePayload;
				} catch {
					parsed = {};
				}

				if (xhr.status >= 200 && xhr.status < 300 && parsed.url) {
					setUploadProgress(100);
					resolve(parsed);
				} else {
					reject(
						new Error(
							parsed.error || `Image upload failed with status ${xhr.status}`
						)
					);
				}
			});

			xhr.addEventListener("error", () => {
				reject(new Error("Network error while uploading image to backend"));
			});

			xhr.open("POST", "/api/images");
			xhr.send(formData);
		});
	};

	const handleConfirmUpload = async (): Promise<void> => {
		if (!selectedFile) return;

		setIsUploading(true);
		setUploadProgress(10);
		try {
			const data = await uploadWithProgress(selectedFile);

			if (!data.url) {
				throw new Error(data.error || "Failed to upload image to Cloudinary");
			}

			// If replacing a session-uploaded image (not the original saved product image, which is deleted on product save), delete it immediately
			const isSessionUploadedImage =
				Boolean(currentPublicId) ||
				(Boolean(currentImageUrl) &&
					currentImageUrl !== initialSavedImageUrl &&
					currentImageUrl.includes("cloudinary"));

			if (isSessionUploadedImage) {
				await fetch("/api/images", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						publicId: currentPublicId,
						imageUrl: currentImageUrl,
					}),
				}).catch(() => {});
			}

			handleDiscardPreview();
			onImageUploaded(data.url, data.publicId || "");
			toast.success("Product image confirmed and uploaded.", "Upload Complete");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to upload product image";
			toast.error(msg, "Image Upload Error");
			setUploadProgress(0);
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveUploadedImage = async (): Promise<void> => {
		if (!currentImageUrl && !currentPublicId) return;

		setIsDeleting(true);
		try {
			// If this image was uploaded in the current session (or is not yet saved to the product), delete it from Cloudinary immediately
			const shouldDeleteImmediately =
				Boolean(currentPublicId) ||
				!initialSavedImageUrl ||
				currentImageUrl !== initialSavedImageUrl;

			if (shouldDeleteImmediately) {
				const res = await fetch("/api/images", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						publicId: currentPublicId,
						imageUrl: currentImageUrl,
					}),
				});

				const data = (await res.json().catch(() => ({}))) as {
					success?: boolean;
					error?: string;
				};

				if (!res.ok) {
					throw new Error(data.error || "Failed to delete uploaded image from storage");
				}
			}

			onImageRemoved();
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			toast.info("Image removed. Select and confirm a new image to upload.", "Image Removed");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to remove image";
			toast.error(msg, "Image Deletion Error");
		} finally {
			setIsDeleting(false);
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	};

	return (
		<div className="space-y-2.5" data-testid="product-image-uploader">
			<label className="block font-semibold uppercase tracking-wider text-primary">
				Product Image (Upload &amp; Preview) *
			</label>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
				onChange={handleFileSelect}
				className="hidden"
				data-testid="product-image-file-input"
			/>

			{/* STATE 1: Local Preview Before Uploading */}
			{selectedFile && localPreviewUrl ? (
				<div
					data-testid="image-local-preview-card"
					className="rounded-2xl border-2 border-secondary bg-surface p-4 shadow-sm"
				>
					<div className="flex flex-col sm:flex-row sm:items-center gap-4">
						<div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-border-delicate bg-surface-container-low">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={localPreviewUrl}
								alt="Selected preview before upload"
								className="h-full w-full object-cover"
								data-testid="image-local-preview"
							/>
						</div>

						<div className="flex-1 space-y-2">
							<div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary-fixed">
								<Eye className="h-3 w-3" />
								<span>Preview — Confirm Before Uploading</span>
							</div>
							<p className="font-medium text-primary text-xs truncate max-w-xs">
								{selectedFile.name} ({formatFileSize(selectedFile.size)})
							</p>
							<p className="text-[11px] text-on-surface-variant leading-relaxed">
								Review the image preview above. Click <strong>Confirm &amp; Upload</strong> to complete the upload, or discard to pick a different file.
							</p>

							{/* Upload Progress Bar */}
							{isUploading && (
								<div className="space-y-1.5 pt-1" data-testid="upload-progress-container">
									<div className="flex items-center justify-between text-[11px] font-semibold text-primary">
										<span>Uploading...</span>
										<span data-testid="upload-progress-percent">{uploadProgress}%</span>
									</div>
									<div
										role="progressbar"
										aria-valuenow={uploadProgress}
										aria-valuemin={0}
										aria-valuemax={100}
										data-testid="upload-progress-bar"
										className="h-2 w-full overflow-hidden rounded-full bg-surface-container"
									>
										<div
											className="h-full rounded-full bg-secondary transition-all duration-200 ease-out"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								</div>
							)}

							<div className="flex flex-wrap items-center gap-2.5 pt-1">
								<button
									type="button"
									onClick={() => void handleConfirmUpload()}
									disabled={isUploading}
									data-testid="confirm-upload-btn"
									className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-50"
								>
									{isUploading ? (
										<RefreshCw className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Upload className="h-3.5 w-3.5" />
									)}
									<span>
										{isUploading
											? `Uploading (${uploadProgress}%)...`
											: "Confirm & Upload"}
									</span>
								</button>

								<button
									type="button"
									onClick={handleDiscardPreview}
									disabled={isUploading}
									data-testid="discard-preview-btn"
									className="inline-flex items-center gap-1 rounded-full border border-border-delicate bg-surface-card px-3.5 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
								>
									<X className="h-3.5 w-3.5" />
									<span>Choose Another</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			) : currentImageUrl ? (
				/* STATE 2: Uploaded / Active Product Image with Change or Remove & Delete options */
				<div
					data-testid="uploaded-image-card"
					className="rounded-2xl border border-border-delicate bg-surface p-4"
				>
					<div className="flex flex-col sm:flex-row sm:items-center gap-4">
						<div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-border-delicate bg-surface-container-low">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={currentImageUrl}
								alt="Uploaded formulation visual"
								className="h-full w-full object-cover"
								data-testid="uploaded-image-preview"
							/>
						</div>

						<div className="flex-1 space-y-2">
							<div className="inline-flex items-center gap-1.5 rounded-full bg-success-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-success-container">
								<CheckCircle2 className="h-3 w-3 text-success" />
								<span>Uploaded &amp; Active</span>
							</div>
							<p className="text-[11px] text-on-surface-variant leading-relaxed">
								This image is currently active on the boutique storefront. Removing or replacing it will immediately update your presentation.
							</p>

							<div className="flex flex-wrap items-center gap-2.5 pt-1">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									disabled={isDeleting}
									data-testid="change-uploaded-image-btn"
									className="inline-flex items-center gap-1.5 rounded-full border border-border-delicate bg-surface-card px-4 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low transition-colors disabled:opacity-50"
								>
									<Upload className="h-3.5 w-3.5" />
									<span>Change Image</span>
								</button>

								<button
									type="button"
									onClick={() => void handleRemoveUploadedImage()}
									disabled={isDeleting}
									data-testid="remove-uploaded-image-btn"
									className="inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error-container/50 px-4 py-2 text-xs font-semibold text-error hover:bg-error-container transition-colors disabled:opacity-50"
								>
									{isDeleting ? (
										<RefreshCw className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Trash2 className="h-3.5 w-3.5" />
									)}
									<span>
										{isDeleting ? "Deleting Image..." : "Remove & Delete Image"}
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			) : (
				/* STATE 3: Empty Picker — Select File to Preview */
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
					className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-delicate bg-surface px-6 py-7 text-center transition-colors hover:border-secondary hover:bg-surface-container-low"
				>
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-primary">
						<ImageIcon className="h-5 w-5 text-secondary-dark" />
					</div>
					<p className="mt-2.5 text-xs font-semibold text-primary">
						Click to select a product image from your device
					</p>
					<p className="mt-1 text-[11px] text-on-surface-variant">
						You will see a live preview to confirm before uploading • JPG, PNG, WebP, AVIF (max 10 MB)
					</p>
				</div>
			)}
		</div>
	);
}
