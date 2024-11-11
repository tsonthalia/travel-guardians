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
        setTimeout(() => {
            setIsHovered(false);
        }, 500);
    };

    const accountInfo = {
        name: displayName,
        email: email,
    };

    return (
        <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button
                className="block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
                Account
            </button>

            {/* Account Info - Visible on hover */}
            {isHovered && (
                <div
                    className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4"
                >
                    <h4 className="font-bold text-gray-900">{accountInfo.name}</h4>
                    <p className="text-gray-600">{accountInfo.email}</p>

                    {/* My Activity Button */}
                    <button
                        className="block w-full mt-2 text-blue-600 hover:text-blue-800 text-sm font-bold"
                        onClick={() => router.push('/my-activity')}
                    >
                        My Activity
                    </button>

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
