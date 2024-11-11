import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-800 py-6 flex justify-center">
            <div className="container mx-auto px-6 text-center text-gray-400">
                <p>&copy; 2024 Travel Guardians. All Rights Reserved.</p>
                <div className="mt-8 max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <h4 className="text-white text-lg mb-2">Account</h4>
                        <nav>
                            <Link href={"/signin"} className="text-gray-400 hover:text-white block mb-2">
                                Sign In
                            </Link>
                            <Link href={"/signup"} className="text-gray-400 hover:text-white block mb-2">
                                Sign Up
                            </Link>
                        </nav>
                    </div>
                    <div>
                        <h4 className="text-white text-lg mb-2">Get to Know Us</h4>
                        <nav>
                            <Link href={"/about"} className="text-gray-400 hover:text-white block mb-2">
                                About
                            </Link>
                            <Link href={"/contact"} className="text-gray-400 hover:text-white block mb-2">
                                Contact
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    )
}
