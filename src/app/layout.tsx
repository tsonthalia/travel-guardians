'use client';
import { Inter } from "next/font/google";
import { AuthContextProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar/Navbar";
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
                <div className="flex flex-col min-h-screen">
                    <Navbar/>
                    <main className="flex-grow flex flex-col">
                        {children}
                    </main>
                    <Footer/>
                </div>
            </AuthContextProvider>
            </body>
        </html>
);
}


