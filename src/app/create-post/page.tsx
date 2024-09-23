'use client';
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuthContext } from "@/context/AuthContext";
import { createPost } from "@/firebase/firestore/firestore"; // Assuming you have a function to create posts

export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState(''); // Add country state
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const user = useAuthContext();

    const handleForm = async (event: any) => {
        event.preventDefault();

        setErrorMessage('');

        if (!title || !description) {
            setErrorMessage("Both title and description are required.");
            return;
        }

        try {
            await createPost(
                title,
                description,
                city,
                country,
                new Date(),
                user?.user?.displayName || 'Anonymous',
                user?.user?.uid || '',
            );

            router.push("/");
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred while creating the post.");
        }
    };

    return (
        <div className="flex flex-col flex-grow pt-10 pb-10 justify-center items-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Create Post</h1>
                <form onSubmit={handleForm} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            type="text"
                            name="title"
                            id="title"
                            placeholder="Enter a title"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                        </label>
                        <input
                            onChange={(e) => setCity(e.target.value)}
                            required
                            type="text"
                            name="city"
                            id="city"
                            placeholder="Enter a city"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                        </label>
                        <input
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            type="text"
                            name="country"
                            id="country"
                            placeholder="Enter a country"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            name="description"
                            id="description"
                            rows={5}
                            placeholder="Describe the scam or event"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm text-center">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Create Post
                    </button>
                </form>
            </div>
        </div>
    );
}
