import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "jc_admin_auth";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "julianas2026";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const authCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
	const isAuthenticated = authCookie === "authenticated";

	return NextResponse.json({ authenticated: isAuthenticated }, { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body = (await request.json().catch(() => ({}))) as { passkey?: string };
		const passkey = body.passkey?.trim();

		if (!passkey || passkey !== ADMIN_PASSWORD) {
			return NextResponse.json(
				{ error: "Incorrect administrative passkey" },
				{ status: 401 }
			);
		}

		const response = NextResponse.json(
			{ success: true, message: "Administrative access granted" },
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
		console.error("[POST /api/admin/auth] Auth error:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 500 }
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
