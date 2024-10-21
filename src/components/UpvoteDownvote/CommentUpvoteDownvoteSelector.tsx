import React from "react";

interface CommentUpvoteDownvoteSelectorProps {
    commentId: string;
    netvotes: number;
    isUpvoted: boolean;
    isDownvoted: boolean;
    handleUpvote: (e: any, commentId: string) => void;
    handleDownvote: (e: any, commentId: string) => void;
}

export default function CommentUpvoteDownvoteSelector({ commentId, netvotes, isUpvoted, isDownvoted, handleUpvote, handleDownvote } : CommentUpvoteDownvoteSelectorProps) {
    return (
        <div className="flex flex-col items-center mr-4">
            {/* Upvote Icon */}
            <button className={isUpvoted ? "text-indigo-600 hover:text-gray-500" : "text-gray-500 hover:text-indigo-600"}
                    onClick={(e) => handleUpvote(e, commentId)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 15l7-7 7 7"/>
                </svg>
            </button>

            {/* Vote Count */}
            <span className="my-1 font-semibold text-gray-700 text-sm">{netvotes}</span>

            {/* Downvote Icon */}
            <button className={isDownvoted ? "text-indigo-600 hover:text-gray-500" : "text-gray-500 hover:text-indigo-600"}
                    onClick={(e) => handleDownvote(e, commentId)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
        </div>
    )
}