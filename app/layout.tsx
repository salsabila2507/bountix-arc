import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://taskops.xyz"),
  title: {
    default: "TaskOps | Internet work needs better coordination",
    template: "%s | TaskOps",
  },
  description:
    "TaskOps is the reputation layer for internet work. Create tasks, prove execution, and build public operator reputation.",
  openGraph: {
    title: "TaskOps",
    description: "Create tasks. Prove execution. Build reputation.",
    url: "https://taskops.xyz",
    siteName: "TaskOps",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskOps",
    description: "Create tasks. Prove execution. Build reputation.",
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
