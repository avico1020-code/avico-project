import type { Metadata } from "next";
import "./globals.css";
import ProfileButton from "@/components/ProfileButton";
import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
  title: "Hebrew RTL App",
  description: "Hebrew RTL Next.js Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        <Providers>
          <ProfileButton />
          {children}
        </Providers>
      </body>
    </html>
  );
}
