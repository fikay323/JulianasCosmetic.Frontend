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

export const metadata: Metadata = {
	title: "Juliana's Cosmetics | Luxury Clean Skincare & African Botanicals",
	description:
		"Luxury clean botanical skincare formulated with cold-pressed African oils and dermatologically proven bio-actives for melanin-rich skin. NAFDAC approved.",
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
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
