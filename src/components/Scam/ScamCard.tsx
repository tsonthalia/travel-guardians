// ScamCard.tsx
import {Scam, UserVoteDatum, VoteDatum} from "@/firebase/firestore/interfaces";
import UpvoteDownvoteSelector from "@/components/UpvoteDownvote/UpvoteDownvoteSelector";
import {timeAgo} from "@/helper/date_helper";
import React, {useState} from "react";

interface ScamCardProps {
    scam: Scam;
    upvotedScams: UserVoteDatum[];
    downvotedScams: UserVoteDatum[];
    handleUpvote: (e: any, scam_id: string) => Promise<void>;
    handleDownvote: (e: any, scam_id: string) => Promise<void>;
    handleOpenModal: (scam: Scam) => void;
    allowDelete: boolean;
}

export default function ScamCard(
    {
        scam,
        upvotedScams,
        downvotedScams,
        handleUpvote,
        handleDownvote,
        handleOpenModal,
        allowDelete = false,
    }: ScamCardProps) {
    return (
        <div
            key={scam.id}
            className="bg-gray-100 p-6 rounded-lg shadow-lg relative cursor-pointer hover:bg-gray-200"
            onClick={() => handleOpenModal(scam)}
        >
            {/* Upvote/Downvote Section */}
            <UpvoteDownvoteSelector
                scam_id={scam.id}
                netvotes={scam.netvotes}
                isUpvoted={upvotedScams.some((vote) => vote.scam_id === scam.id)}
                isDownvoted={downvotedScams.some((vote) => vote.scam_id === scam.id)}
                handleUpvote={handleUpvote}
                handleDownvote={handleDownvote}
            />

            {/* Post Content Section */}
            <div className="ml-12">
                <h4 className="text-xl font-bold text-indigo-600 mb-4">{scam.title}</h4>
                <p className="text-gray-700 mb-4">{scam.description}</p>

                {/* Metadata */}
                <div className="flex items-center text-sm text-gray-500">
          <span>
            Posted by <strong className="text-indigo-600">{scam.user}</strong>
          </span>
                    <span className="mx-2">•</span>
                    <span>{timeAgo(scam.date)}</span>
                    <span className="mx-2">•</span>
                    <span>
            {scam.locations[0].city}, {scam.locations[0].country}
          </span>
                </div>

                <div className="mt-4 flex items-center text-gray-500">
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M3 3h18v12H7l-4 4V3z"/>
                        {/* Comments Icon (adjust as needed) */}
                    </svg>

                    {/* Replace with dynamic comment count */}
                    <span>{scam.comments || 0} {scam.comments == 1 ? "comment" : "comments"}</span>
                </div>

                {allowDelete && (
                    <div className="absolute top-4 right-4">
                        <button className="text-gray-500 hover:text-red-600 focus:outline-none"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Add delete logic here
                                }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 3v1H4v2h16V4h-5V3H9zM5 7h14v13a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm3 3v8m4-8v8m4-8v8"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
