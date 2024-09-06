import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-800 py-6">
            <div className="container mx-auto px-6 text-center text-gray-400">
                <p>&copy; 2024 Travel Guardians. All Rights Reserved.</p>
                <nav className="mt-4">
                    <Link href={"/signin"} className="text-gray-400 hover:text-white mx-4">
                        Sign In
                    </Link>
                    <Link href={"/signup"} className="text-gray-400 hover:text-white mx-4">
                        Sign Up
                    </Link>
                </nav>
            </div>
        </footer>
    )
}