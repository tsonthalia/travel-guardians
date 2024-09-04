'use client';
import React, {useEffect} from "react";
import signIn from "@/firebase/auth/signin";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import {useAuthContext} from "@/context/AuthContext";

export default function Page() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const router = useRouter();
    const user = useAuthContext();

    // Redirect to home if user is already signed in using useEffect
    useEffect(() => {
        if (user?.user) {
            router.push("/");
        }
    }, [router, user]);

    const handleForm = async (event: any) => {
        event.preventDefault();

        const {result, error} = await signIn(email, password);

        if (error) {
            return console.log(error);
        }

        // else successful
        console.log(result);
        return router.push("/");
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
                <form onSubmit={handleForm} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                            name="email"
                            id="email"
                            placeholder="example@mail.com"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                    Don&apos;t have an account?{' '}
                    <Link href={"/signup"} className="text-indigo-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}