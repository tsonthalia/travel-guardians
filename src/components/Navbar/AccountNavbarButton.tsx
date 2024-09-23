import { useState } from 'react';
import {logout} from "@/firebase/auth/auth";
import {useRouter} from "next/navigation";

interface AccountButtonProps {
    displayName: string | null;
    email: string | null;
    handleLogout: () => void
}

export default function AccountButton({ displayName, email, handleLogout }: AccountButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const accountInfo = {
        name: displayName,
        email: email,
    };

    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
                Account
            </button>

            {/* Account Info - Visible on hover */}
            {isHovered && (
                <div
                    className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <h4 className="font-bold text-gray-900">{accountInfo.name}</h4>
                    <p className="text-gray-600">{accountInfo.email}</p>

                    {/* Logout Button */}
                    <button
                        className="block w-full mt-4 text-red-600 hover:text-red-800 text-sm font-bold"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
