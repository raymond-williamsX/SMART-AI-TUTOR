import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "highlight.js/styles/github-dark.css";
import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "EduAgent AI",
  description: "Production-grade AI tutoring SaaS shell for adaptive learning.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
<<<<<<< HEAD
      <body className={`${headingFont.variable} ${bodyFont.variable} h-full overflow-hidden bg-background font-body text-foreground antialiased`}>
=======
      <body className={`${headingFont.variable} ${bodyFont.variable} bg-background font-body text-foreground antialiased`}>
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
        <Providers initialSession={data.session}>{children}</Providers>
      </body>
    </html>
  );
}
