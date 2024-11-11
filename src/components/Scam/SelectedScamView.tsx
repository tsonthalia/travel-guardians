import {Comment, Scam, UserCommentVoteDatum} from "@/firebase/firestore/interfaces";
import React, {useEffect, useRef, useState} from "react";
import {addComment, deleteComment, downvoteCommentPressed, getComments, upvoteCommentPressed} from "@/firebase/firestore/firestore";
import {useAuthContext} from "@/context/AuthContext";
import CommentUpvoteDownvoteSelector from "@/components/UpvoteDownvote/CommentUpvoteDownvoteSelector";
import UpvoteDownvoteSelector from "@/components/UpvoteDownvote/UpvoteDownvoteSelector";
import {timeAgo} from "@/helper/date_helper";

interface SelectedScamViewProps {
    selectedScam: Scam;
    handleCloseModal: () => void;
    handleUpvoteScam: (e: any, scam_id: string) => void;
    handleDownvoteScam: (e: any, scam_id: string) => void;
    isUpvoted: boolean;
    isDownvoted: boolean;
}

export default function SelectedScamView({selectedScam, handleCloseModal, handleUpvoteScam, handleDownvoteScam, isUpvoted, isDownvoted}: SelectedScamViewProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");

    const user = useAuthContext();
    const [upvotedComments, setUpvotedComments] = useState<UserCommentVoteDatum[]>(
        user?.userData?.upvotedComments ?? []
    );
    const [downvotedComments, setDownvotedComments] = useState<UserCommentVoteDatum[]>(
        user?.userData?.downvotedComments ?? []
    );

    const modalRef = useRef<HTMLDivElement>(null); // Create a reference for the modal

    useEffect(() => {
        if (selectedScam.comments > 0) {
            getComments(selectedScam.id).then((returnedComments) => {
                setComments(returnedComments);
            });
        }
    }, [selectedScam])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleCloseModal(); // Close modal if click is outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef, handleCloseModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (newComment.trim()) {
            if (user?.user) {
                try {
                    const commentTimestamp = new Date();
                    const id = await addComment(
                        newComment,
                        selectedScam.id,
                        user?.user?.uid,
                        user?.user?.displayName || "Anonymous",
                        commentTimestamp
                    );  // Add the comment to the selected scam

                    setComments([...comments, {
                        comment: newComment,
                        username: user?.user?.displayName || "Anonymous",
                        uid: user?.user?.uid,
                        timestamp: commentTimestamp,
                        upvotes: [],
                        downvotes: [],
                        netvotes: 0,
                        id: id,
                    }]);
                } catch (error: any) {
                    console.log(error);
                }
            }
            setNewComment("");  // Clear the input field
        }
    };

    const handleDelete = async (commentId: string) => {
        console.log(`Deleting comment with ID: ${commentId}`);

        // TODO: complete delete code
        // if (!user?.user) {
        //     console.log("User not logged in");
        //     return;
        // }
        //
        // await deleteComment(selectedScam.id, commentId, user.user.uid);
        //
        // // Remove the comment from the UI
        // const updatedComments = comments.filter((comment) => comment.id !== commentId);
        // setComments(updatedComments);
    };

    const handleUpvoteComment = async (e: any, commentId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.user) {
            console.log("User not logged in");
            return;
        }

        const {
            newDownvotedComments,
            newUpvotedComments,
            newCommentNetvotes
        } = await upvoteCommentPressed(selectedScam.id, commentId, user.user.uid);
        setUpvotedComments(newUpvotedComments);
        setDownvotedComments(newDownvotedComments);

        const updatedComments = getUpdatedComments(commentId, newCommentNetvotes);
        setComments(updatedComments);
    }

    const handleDownvoteComment = async (e: any, commentId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.user) {
            console.log("User not logged in");
            return;
        }

        const {
            newDownvotedComments,
            newUpvotedComments,
            newCommentNetvotes
        } = await downvoteCommentPressed(selectedScam.id, commentId, user.user.uid);
        setUpvotedComments(newUpvotedComments);
        setDownvotedComments(newDownvotedComments);

        const updatedComments = getUpdatedComments(commentId, newCommentNetvotes);
        setComments(updatedComments);
    }

    const getUpdatedComments = (commentId: string, newCommentNetvotes: number) => {
        return comments.map((comment) => {
            if (comment.id === commentId) {
                comment.netvotes = newCommentNetvotes;
            }
            return comment;
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative" ref={modalRef}>
                <button
                    className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
                    onClick={handleCloseModal}
                >
                    &times; {/* Close button */}
                </button>

                <UpvoteDownvoteSelector
                    scam_id={selectedScam.id}
                    netvotes={selectedScam.netvotes}
                    isUpvoted={isUpvoted}
                    isDownvoted={isDownvoted}
                    handleUpvote={handleUpvoteScam}
                    handleDownvote={handleDownvoteScam}
                />

                <div className="ml-12">
                    <h3 className="text-xl font-bold text-indigo-600 mb-4">{selectedScam.title}</h3>
                    <p className="text-gray-700 mb-4">{selectedScam.description}</p>
                </div>

                {/* Textbox for adding a comment */}
                {(user?.user && user?.userData) ? (
                    <form onSubmit={handleSubmit} className="mb-4">
                <textarea
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                    rows={3}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                        <button
                            type="submit"
                            className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-500"
                        >
                            Submit Comment
                        </button>
                    </form>
                ) : (
                    <p className="text-sm text-gray-500 mb-4">Please log in to add a comment.</p>
                )}

                {/* Comments Section */}
                <div className="space-y-4">
                    {selectedScam.comments > 0 ? (
                        comments.map((comment, index) => (
                            <div
                                key={index}
                                className="flex items-start justify-between bg-white p-4 border border-gray-200 shadow-sm rounded-lg mb-4"
                            >
                                <CommentUpvoteDownvoteSelector
                                    commentId={comment.id}
                                    netvotes={comment.netvotes}
                                    isUpvoted={upvotedComments.some((commentVote) => commentVote.comment_id === comment.id)}
                                    isDownvoted={downvotedComments.some((commentVote) => commentVote.comment_id === comment.id)}
                                    handleUpvote={handleUpvoteComment}
                                    handleDownvote={handleDownvoteComment}
                                />

                                <div className="flex-grow">
                                    {/* Comment Text */}
                                    <p className="text-sm text-gray-900 font-medium mb-1">{comment.comment}</p>

                                    {/* Comment Meta (timestamp and username) */}
                                    <div className="text-xs text-gray-500">
                                        <span>{timeAgo(comment.timestamp)}</span>
                                        <span> &middot; by {comment.username}</span>
                                    </div>
                                </div>

                                {/* Improved Delete Button (Trashcan Icon) */}
                                {user?.user?.uid === comment.uid && (
                                    <div className="flex items-center ml-2">
                                        <button className="text-gray-500 hover:text-red-600 focus:outline-none"
                                                onClick={() => handleDelete(comment.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M9 3v1H4v2h16V4h-5V3H9zM5 7h14v13a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm3 3v8m4-8v8m4-8v8"/>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No comments yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}