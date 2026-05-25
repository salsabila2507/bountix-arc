import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bountix.xyz"),
  title: {
    default: "Bountix | Internet work needs better coordination",
    template: "%s | Bountix",
  },
  description:
    "Bountix is the premium coordination layer for internet work. Post tasks, prove execution, and build public operator reputation.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Bountix",
    description: "Post tasks. Prove execution. Earn anywhere.",
    url: "https://bountix.xyz",
    siteName: "Bountix",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bountix",
    description: "Post tasks. Prove execution. Earn anywhere.",
    images: ["/logo.png"],
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
