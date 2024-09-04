'use client';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthContextProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthContextProvider>
                    <Navbar />
                    {children}
                </AuthContextProvider>
            </body>
        </html>
    );
}


