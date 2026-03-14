import type { Metadata } from "next";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Healthcare Workforce Marketplace",
  description: "MVP platform for healthcare staffing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
