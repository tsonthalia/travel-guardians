'use client';
import React from 'react';
import Image from 'next/image';

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
            <main className="flex-grow">
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        <div className="max-w-2xl mx-auto mb-6">
                            <h1 className="text-3xl font-bold mb-4">About Travel Guardians</h1>
                            <Image
                                src="/scenery.jpeg"
                                alt="Beautiful scenery"
                                width={800}
                                height={400}
                                className="rounded-lg shadow-md mb-6"
                            />
                            <p className="text-lg text-gray-700 mb-6">
                                Travel Guardians is a community-driven platform that helps travelers stay informed and
                                safe. We believe that by sharing information about common tourist scams around the
                                world, we can help each other avoid unpleasant experiences and make travel more
                                enjoyable. Our mission is to provide travelers with up-to-date, reliable information so
                                they can explore the world with confidence.
                            </p>
                            <p className="text-lg text-gray-700 mb-6">
                                Our platform allows users to share their own experiences, upvote or downvote reported
                                scams, and keep track of potential risks in different destinations. We aim to create a
                                trusted community where travelers can learn from each other&apos;s experiences and feel
                                empowered to explore new places.
                            </p>
                            <p className="text-lg text-gray-700">
                                Whether you&apos;re planning your next adventure or currently on the road, Travel Guardians
                                is here to help you navigate safely and confidently. Join our community, share your
                                stories, and help make travel safer for everyone.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
