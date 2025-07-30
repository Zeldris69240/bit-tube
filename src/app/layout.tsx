
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/client";
import { Analytics } from '@vercel/analytics/next';


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/"> 
      <html lang="en">
        <body
          className={inter.className}
        >
          <TRPCProvider>
            <Toaster />
            {children}
          </TRPCProvider>
          <Analytics />
          
        </body>
      </html>
    </ClerkProvider>
  );
}