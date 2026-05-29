import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bountix.xyz"),
  title: {
    default: "Bountix | Global Tasks. Real-World Help.",
    template: "%s | Bountix",
  },
  description:
    "Bountix is a global task marketplace where anyone can post tasks, request real-world help, and join the waitlist for early access.",
  keywords: [
    "Bountix",
    "global task marketplace",
    "task rewards",
    "USDC",
    "Base",
    "online tasks",
    "local help",
    "creator marketplace",
  ],
  icons: {
    icon: "/bountix-comic/bountix_assets_ready/bountix-app-icon.png",
    apple: "/bountix-comic/bountix_assets_ready/bountix-app-icon.png",
  },
  openGraph: {
    title: "Bountix | Global Tasks. Real-World Help.",
    description:
      "Post tasks, complete gigs, and earn rewards. Bountix is building a global task marketplace for online tasks, local help, and real-world requests.",
    url: "https://www.bountix.xyz",
    siteName: "Bountix",
    type: "website",
    images: ["/bountix-comic/hero-logo-latest.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bountix | Global Tasks. Real-World Help.",
    description:
      "Ask people to do almost anything, from anywhere. Join the Bountix waitlist.",
    images: ["/bountix-comic/hero-logo-latest.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
