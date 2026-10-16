import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/src/lib/backend";
import type { ImageSignature } from "@/src/types/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body = (await request.json().catch(() => ({}))) as { slug?: string };
		const backendUrl = getBackendApiUrl();

		const res = await fetch(`${backendUrl}/api/images/sign`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ slug: body.slug }),
			cache: "no-store",
		});

		const data = (await res.json().catch(() => ({}))) as ImageSignature & { error?: string };

		if (!res.ok || !data.signature) {
			return NextResponse.json(
				{
					error:
						data.error ||
						`Failed to acquire upload signature from backend (HTTP ${res.status})`,
				},
				{ status: res.status || 500 }
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Failed to acquire upload signature";
		console.error("[POST /api/images/sign] Error:", message);
		return NextResponse.json(
			{ error: `Backend signature service unreachable: ${message}` },
			{ status: 502 }
		);
	}
}
