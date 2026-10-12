import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/src/lib/backend";

export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "jc_admin_auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const authCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
	const isAuthenticated = authCookie === "authenticated";

	return NextResponse.json({ authenticated: isAuthenticated }, { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body = (await request.json().catch(() => ({}))) as { passkey?: string };
		const passkey = body.passkey?.trim() ?? "";

		const backendUrl = getBackendApiUrl();
		const res = await fetch(`${backendUrl}/api/admin/auth`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ passkey }),
			cache: "no-store",
		});

		const data = (await res.json().catch(() => ({}))) as {
			success?: boolean;
			message?: string;
			error?: string;
		};

		if (!res.ok || !data.success) {
			return NextResponse.json(
				{ error: data.error || "Incorrect administrative passkey" },
				{ status: res.status === 401 ? 401 : res.status || 401 }
			);
		}

		const response = NextResponse.json(
			{
				success: true,
				message: data.message || "Administrative access granted",
			},
			{ status: 200 }
		);

		response.cookies.set({
			name: ADMIN_COOKIE_NAME,
			value: "authenticated",
			httpOnly: true,
			path: "/",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			secure: process.env.NODE_ENV === "production",
		});

		return response;
	} catch (error: unknown) {
		const message =
			error instanceof Error
				? error.message
				: "Unable to reach backend authentication service";
		console.error("[POST /api/admin/auth] Backend auth error:", message);
		return NextResponse.json(
			{
				error: `Backend service unavailable: ${message}`,
			},
			{ status: 502 }
		);
	}
}

export async function DELETE(): Promise<NextResponse> {
	const response = NextResponse.json(
		{ success: true, message: "Signed out from administrative portal" },
		{ status: 200 }
	);

	response.cookies.delete(ADMIN_COOKIE_NAME);
	return response;
}
