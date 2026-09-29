import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/src/context/CartContext";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { CartDrawer } from "@/src/components/cart/CartDrawer";
import "./globals.css";

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"],
	display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
	variable: "--font-jakarta",
	subsets: ["latin"],
	display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://julianas-cosmetic-frontend.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Juliana's Cosmetics | Luxury Clean Skincare Imported from Paris",
		template: "%s | Juliana's Cosmetics",
	},
	description:
		"Luxury clean skincare imported directly from Paris, formulated with premium French botanical extracts and dermatologically proven bio-actives. Delivered nationwide across Nigeria.",
	applicationName: "Juliana's Cosmetics",
	authors: [{ name: "Juliana's Cosmetics" }],
	generator: "Next.js",
	keywords: [
		"Juliana's Cosmetics",
		"Parisian Skincare",
		"French Cosmetics Nigeria",
		"Clean Beauty Nigeria",
		"Luxury Skincare Lagos",
		"Imported French Skincare",
		"NAFDAC Approved Cosmetics",
	],
	icons: {
		icon: [
			{ url: "/icon.png", type: "image/png" },
			{ url: "/favicon.ico", sizes: "any" },
		],
		apple: "/apple-icon.png",
		shortcut: "/icon.png",
	},
	manifest: "/manifest.json",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		siteName: "Juliana's Cosmetics",
		title: "Juliana's Cosmetics | Luxury Clean Skincare Imported from Paris",
		description:
			"Luxury clean skincare imported directly from Paris, formulated with premium French botanical extracts and dermatologically proven bio-actives. Delivered nationwide across Nigeria.",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Juliana's Cosmetics - Luxury Clean Skincare Imported from Paris",
				type: "image/jpeg",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Juliana's Cosmetics | Luxury Clean Skincare Imported from Paris",
		description:
			"Luxury clean skincare imported directly from Paris, formulated with premium French botanical extracts and dermatologically proven bio-actives. Delivered nationwide across Nigeria.",
		images: ["/og-image.jpg"],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#FAF9F6",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<html
			lang="en"
			className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col bg-surface font-body text-primary antialiased">
				<CartProvider>
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
					<CartDrawer />
				</CartProvider>
			</body>
		</html>
	);
}
