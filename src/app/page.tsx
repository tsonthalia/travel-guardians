'use client';
import {useEffect, useState} from "react";
import {Scam} from "@/firebase/firestore/interfaces";
import {getFeed} from "@/firebase/firestore/firestore";

export default function Feed() {
  const [feed, setFeed] = useState<Scam[]>([]);

  // get scam data using firebase function from firestore module
  useEffect(() => {
    if (!feed.length) {
      getFeed().then((scams) => {
        setFeed(scams);
      });
    }
  });

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <main className="flex-grow">
          <section className="py-12">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
                {feed.length == 0 ? "Loading..." : feed.map((scam) => (
                    <div key={scam.id} className="bg-gray-100 p-6 rounded-lg shadow-lg relative">
                      {/* Upvote/Downvote Section */}
                      <div className="absolute top-4 left-4 flex flex-col items-center">
                        <button className="text-gray-500 hover:text-indigo-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                          </svg>
                        </button>
                        <span className="text-gray-700 font-bold">{scam.netvotes}</span> {/* Example vote count */}
                        <button className="text-gray-500 hover:text-indigo-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>
                      </div>

                      {/* Post Content Section */}
                      <div className="ml-12">
                        <h4 className="text-xl font-bold text-indigo-600 mb-4">{scam.title}</h4>
                        <p className="text-gray-700 mb-4">
                            {scam.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Posted by <strong className="text-indigo-600">{scam.user}</strong></span>
                          <span className="mx-2">•</span>
                          <span>{scam.date.toDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{scam.city}, {scam.country}</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
  );
}