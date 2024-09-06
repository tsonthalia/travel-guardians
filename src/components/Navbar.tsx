'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from "@/context/AuthContext"; // Assuming AuthContext provides the user and logout function
import { useRouter } from 'next/navigation';
import { logout } from "@/firebase/auth/auth";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const user = useAuthContext(); // Access user and logout from the auth context
    const router = useRouter();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        console.log(user);
        const {error} = await logout();
        if (error) {
            console.error(error);
            return;
        }

        router.push("/signin");
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-indigo-600">
                            Travel Guardians
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-4 items-center">
                        <Link href="/" className="text-gray-800 hover:text-indigo-600">
                            Home
                        </Link>
                        <Link href={"/about"} className="text-gray-800 hover:text-indigo-600">
                            About
                        </Link>
                        <Link href={"/contact"} className="text-gray-800 hover:text-indigo-600">
                            Contact
                        </Link>
                        {user?.user ? (
                            <div className="flex space-x-4 items-center">
                                <span className="text-gray-800">Hello, {user?.user.displayName || "User"}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href={"/signin"} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                                    Sign In
                                </Link>
                                <Link href={"/signup"} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="text-gray-800 hover:text-indigo-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white shadow-lg">
                    <div className="px-4 pt-2 pb-3 space-y-1">
                        <Link href="/" className="block text-gray-800 hover:text-indigo-600 py-2">
                            Home
                        </Link>
                        <Link href={"/about"} className="block text-gray-800 hover:text-indigo-600 py-2">
                            About
                        </Link>
                        <Link href={"/contact"} className="block text-gray-800 hover:text-indigo-600 py-2">
                            Contact
                        </Link>
                        {user?.user ? (
                            <div className="space-y-1">
                                <span className="block text-gray-800 py-2">Hello, {user?.user.displayName || "User"}</span>
                                <button
                                    onClick={handleLogout}
                                    className="block bg-red-600 text-white py-2 px-4 rounded-md w-full hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href={"/signin"} className="block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                                    Sign In
                                </Link>
                                <Link href={"/signup"} className="block bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
