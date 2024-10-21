interface UpvoteDownvoteProps {
    scam_id: string;
    netvotes: number;
    isUpvoted: boolean;
    isDownvoted: boolean;
    handleUpvote: (e: any, scam_id: string) => void;
    handleDownvote: (e: any, scam_id: string) => void;
}

export default function UpvoteDownvoteSelector({ scam_id, netvotes, isUpvoted, isDownvoted, handleUpvote, handleDownvote } : UpvoteDownvoteProps) {
    return (
        <div className="absolute top-4 left-4 flex flex-col items-center">
            <button
                className={isUpvoted ? "text-indigo-600 hover:text-gray-500" : "text-gray-500 hover:text-indigo-600"}
                onClick={(e) => handleUpvote(e, scam_id)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 15l7-7 7 7"/>
                </svg>
            </button>
            <span className="text-gray-700 font-bold">{netvotes}</span> {/* Example vote count */}
            <button
                className={isDownvoted ? "text-indigo-600 hover:text-gray-500" : "text-gray-500 hover:text-indigo-600"}
                onClick={(e) => handleDownvote(e, scam_id)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
        </div>
    )
}