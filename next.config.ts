import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
	async rewrites() {
		const backendUrl = process.env.BACKEND_API_URL;
		if (!backendUrl) {
			return [];
		}

		const sanitizedUrl = backendUrl.replace(/\/$/, "");
		return {
			beforeFiles: [
				{
					source: "/api/:path*",
					destination: `${sanitizedUrl}/api/:path*`,
				},
			],
			afterFiles: [],
			fallback: [],
		};
	},
};

export default nextConfig;
