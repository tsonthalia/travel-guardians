'use client';
import { Inter } from "next/font/google";
import { AuthContextProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";

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
                    <Footer />
                </AuthContextProvider>
            </body>
        </html>
    );
}


