import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/src/lib/backend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const incomingFormData = await request.formData();
		const file = incomingFormData.get("file");

		if (!file || !(file instanceof Blob)) {
			return NextResponse.json(
				{ error: "Please select an image file to upload." },
				{ status: 400 }
			);
		}

		const backendFormData = new FormData();
		backendFormData.append("file", file);

		const backendUrl = getBackendApiUrl();
		const res = await fetch(`${backendUrl}/api/images/upload`, {
			method: "POST",
			body: backendFormData,
			cache: "no-store",
		});

		const data = (await res.json().catch(() => ({}))) as {
			url?: string;
			publicId?: string;
			error?: string;
		};

		if (!res.ok || !data.url) {
			return NextResponse.json(
				{
					error:
						data.error ||
						`Image upload failed with status ${res.status}`,
				},
				{ status: res.status || 500 }
			);
		}

		return NextResponse.json(
			{
				url: data.url,
				publicId: data.publicId ?? "",
			},
			{ status: 200 }
		);
	} catch (error: unknown) {
		const message =
			error instanceof Error
				? error.message
				: "Failed to connect to backend image storage";
		console.error("[POST /api/images] Upload error:", message);
		return NextResponse.json(
			{ error: `Backend service unavailable: ${message}` },
			{ status: 502 }
		);
	}
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
	try {
		const body = (await request.json().catch(() => ({}))) as {
			publicId?: string;
			imageUrl?: string;
		};

		const publicId =
			body.publicId || request.nextUrl.searchParams.get("publicId") || "";
		const imageUrl =
			body.imageUrl || request.nextUrl.searchParams.get("imageUrl") || "";

		if (!publicId && !imageUrl) {
			return NextResponse.json(
				{ error: "publicId or imageUrl is required to delete an image." },
				{ status: 400 }
			);
		}

		const backendUrl = getBackendApiUrl();
		const res = await fetch(`${backendUrl}/api/images`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ publicId, imageUrl }),
			cache: "no-store",
		});

		const data = (await res.json().catch(() => ({}))) as {
			success?: boolean;
			deleted?: boolean;
			error?: string;
		};

		if (!res.ok) {
			return NextResponse.json(
				{
					error:
						data.error ||
						`Failed to delete image (status ${res.status})`,
				},
				{ status: res.status || 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				deleted: Boolean(data.deleted),
			},
			{ status: 200 }
		);
	} catch (error: unknown) {
		const message =
			error instanceof Error
				? error.message
				: "Failed to connect to backend image storage";
		console.error("[DELETE /api/images] Delete error:", message);
		return NextResponse.json(
			{ error: `Backend service unavailable: ${message}` },
			{ status: 502 }
		);
	}
}
