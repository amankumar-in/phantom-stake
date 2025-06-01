// Timestamp: 1719522000
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { Header } from "@/components/Header"; // Header is now in MainLayoutWrapper
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phantom Stake - Decentralized Staking Platform",
  description: "Join the future of decentralized finance with up to 1% daily returns through our innovative staking programs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}