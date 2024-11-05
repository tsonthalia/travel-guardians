'use client';
import React, { useEffect, useState } from 'react';

import { useAuthContext } from "@/context/AuthContext";
import { submitContact } from "@/firebase/firestore/firestore";
import { Contact } from "@/firebase/firestore/interfaces";

export default function Page() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const user = useAuthContext();

    useEffect(() => {
        if (user?.user) {
            setName(user.userData?.firstName + ' ' + user.userData?.lastName || '');
            setEmail(user.user.email || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Logic to handle form submission
        const contact: Contact = {
            name,
            email,
            message,
        }

        await submitContact(contact);
        setIsSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
            <main className="flex-grow">
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        <div className="max-w-2xl mx-auto mb-6">
                            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
                            <p className="text-lg text-gray-700 mb-6">
                                We value your feedback and are here to assist you. If you have any questions, suggestions, or need support, please fill out the form below, and we&apos;ll get back to you as soon as possible.
                            </p>
                            {isSubmitted ? (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
                                    Thank you! Your message has been submitted successfully.
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full p-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full p-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            className="w-full p-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            rows={5}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-500 text-white p-3 rounded-lg shadow-md hover:bg-indigo-600 transition duration-300"
                                    >
                                        Submit
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
