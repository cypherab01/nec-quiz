import MainHeader from "@/components/layouts/main-header";
import { QueryClientProviderWrapper } from "@/providers/query-client-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainFooter from "@/components/layouts/main-footer";
import { ThemeProvider } from "@/providers/theme-provider";
import { Wrapper } from "@/components/shared/wrapper";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEC Quiz",
  description:
    "NEC Quiz is a platform for students to practice for their exams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-dvh`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProviderWrapper>
            <MainHeader />
            <main className="flex-1">
              <Wrapper centered>{children}</Wrapper>
            </main>
            <MainFooter />
          </QueryClientProviderWrapper>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
