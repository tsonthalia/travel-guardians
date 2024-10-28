'use client';
import {Scam, Comment} from "@/firebase/firestore/interfaces";
import React, {useEffect, useState} from "react";
import { getUserActivity } from "@/firebase/firestore/firestore";
import {useAuthContext} from "@/context/AuthContext";

interface UserActivity {
    scam: Scam;
    comments: Comment[];
    isUpvoted: boolean;
    isDownvoted: boolean;
    upvotedComments: Comment[];
    downvotedComments: Comment[];
    isPostedByUser: boolean;
}

export default function MyActivity() {
    const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
    const [filteredActivity, setFilteredActivity] = useState<UserActivity[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const user = useAuthContext();

    useEffect(() => {
        if (user?.user) {
            const fetchUserActivity = async () => {
                // @ts-ignore
                const { postedScams, userComments, userUpvotedScams, userDownvotedScams , userUpvotedComments, userDownvotedComments} = await getUserActivity(user.user.uid);

                // Consolidate user activity data
                const activityMap: { [key: string]: UserActivity } = {};

                postedScams.forEach((postedScam) => {
                    if (!activityMap[postedScam.id]) {
                        activityMap[postedScam.id] = {
                            scam: postedScam,
                            comments: [],
                            isUpvoted: false,
                            isDownvoted: false,
                            upvotedComments: [],
                            downvotedComments: [],
                            isPostedByUser: true,
                        };
                    }
                });

                userComments.forEach((comment) => {
                    if (!activityMap[comment.scam.id]) {
                        activityMap[comment.scam.id] = {
                            scam: comment.scam,
                            comments: [],
                            isUpvoted: false,
                            isDownvoted: false,
                            upvotedComments: [],
                            downvotedComments: [],
                            isPostedByUser: false,
                        };
                    }
                    activityMap[comment.scam.id].comments.push(comment);
                });

                userUpvotedScams.forEach((upvotedScam) => {
                    if (!activityMap[upvotedScam.id]) {
                        activityMap[upvotedScam.id] = {
                            scam: upvotedScam,
                            comments: [],
                            isUpvoted: false,
                            isDownvoted: false,
                            upvotedComments: [],
                            downvotedComments: [],
                            isPostedByUser: false,
                        };
                    }
                    activityMap[upvotedScam.id].isUpvoted = true;
                });

                userDownvotedScams.forEach((downvotedScam) => {
                    if (!activityMap[downvotedScam.id]) {
                        activityMap[downvotedScam.id] = {
                            scam: downvotedScam,
                            comments: [],
                            isUpvoted: false,
                            isDownvoted: false,
                            upvotedComments: [],
                            downvotedComments: [],
                            isPostedByUser: false,
                        };
                    }
                    activityMap[downvotedScam.id].isDownvoted = true;
                });

                userUpvotedComments.forEach((upvotedComment) => {
                    if (!activityMap[upvotedComment.scam.id]) {
                        activityMap[upvotedComment.scam.id] = {
                            scam: upvotedComment.scam,
                            comments: [],
                            isUpvoted: false,
                            isDownvoted: false,
                            upvotedComments: [],
                            downvotedComments: [],
                            isPostedByUser: false,
                        };
                    }
                    activityMap[upvotedComment.scam.id].upvotedComments.push(upvotedComment);
                });

                userDownvotedComments.forEach((downvotedComment) => {
                    if (!activityMap[downvotedComment.scam.id]) {
                        activityMap[downvotedComment.scam.id] = {
                            scam: downvotedComment.scam,
                            comments: [],
                            isUpvoted: false,
                            isDownvoted: false,
                            upvotedComments: [],
                            downvotedComments: [],
                            isPostedByUser: false,
                        };
                    }
                    activityMap[downvotedComment.scam.id].downvotedComments.push(downvotedComment);
                });

                const allActivities = Object.values(activityMap);
                setUserActivity(allActivities);
                setFilteredActivity(allActivities);
            };

            fetchUserActivity();
        }
    }, [user]);

    useEffect(() => {
        switch (filter) {
            case 'posted':
                setFilteredActivity(userActivity.filter(activity => activity.isPostedByUser));
                break;
            case 'upvoted':
                setFilteredActivity(userActivity.filter(activity => activity.isUpvoted));
                break;
            case 'downvoted':
                setFilteredActivity(userActivity.filter(activity => activity.isDownvoted));
                break;
            case 'upvotedComments':
                setFilteredActivity(userActivity.filter(activity => activity.upvotedComments.length > 0));
                break;
            case 'downvotedComments':
                setFilteredActivity(userActivity.filter(activity => activity.downvotedComments.length > 0));
                break;
            default:
                setFilteredActivity(userActivity);
                break;
        }
    }, [filter, userActivity]);

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
    };

    const handleUpvote = async (e: any, scam_id: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Logic for handling upvote
    };

    const handleDownvote = async (e: any, scam_id: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Logic for handling downvote
    };

    const handleOpenModal = (scam: Scam) => {
        // Logic for handling modal open
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
            <main className="flex-grow">
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Activity</h2>
                        <div className="mb-4 text-center">
                            <button className={`px-4 py-2 mr-2 ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`} onClick={() => handleFilterChange('all')}>All</button>
                            <button className={`px-4 py-2 mr-2 ${filter === 'posted' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`} onClick={() => handleFilterChange('posted')}>Posted Scams</button>
                            <button className={`px-4 py-2 mr-2 ${filter === 'upvoted' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`} onClick={() => handleFilterChange('upvoted')}>Upvoted Scams</button>
                            <button className={`px-4 py-2 mr-2 ${filter === 'downvoted' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`} onClick={() => handleFilterChange('downvoted')}>Downvoted Scams</button>
                            <button className={`px-4 py-2 mr-2 ${filter === 'upvotedComments' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`} onClick={() => handleFilterChange('upvotedComments')}>Upvoted Comments</button>
                            <button className={`px-4 py-2 ${filter === 'downvotedComments' ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`} onClick={() => handleFilterChange('downvotedComments')}>Downvoted Comments</button>
                        </div>
                        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
                            {filteredActivity.length === 0 ? (
                                <p className="text-center">{
                                    filter === 'posted' ? "You haven't posted any scams yet." :
                                        filter === 'upvoted' ? "You haven't upvoted any scams yet." :
                                            filter === 'downvoted' ? "You haven't downvoted any scams yet." :
                                                filter === 'upvotedComments' ? "You haven't upvoted any comments yet." :
                                                    filter === 'downvotedComments' ? "You haven't downvoted any comments yet." :
                                                        "You haven't had any activity yet."
                                }</p>
                            ) : (
                                filteredActivity.map((activity) => (
                                    <div key={activity.scam.id} className="bg-gray-100 p-6 rounded-lg shadow-lg">
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => handleOpenModal(activity.scam)}
                                        >
                                            <h4 className="text-xl font-bold text-indigo-600 mb-4">
                                                {activity.scam.title}
                                            </h4>
                                            <p className="text-gray-700 mb-4">{activity.scam.description}</p>

                                            {/* Metadata */}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span>
                                                    Posted by <strong className="text-indigo-600">{activity.scam.user}</strong>
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span>{activity.scam.date.toDateString()}</span>
                                                <span className="mx-2">•</span>
                                                <span>
                                                    {activity.scam.locations[0].city}, {activity.scam.locations[0].country}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        {activity.comments.length > 0 && (
                                            <div className="mt-4 bg-white p-4 rounded-lg">
                                                <h5 className="text-lg font-bold mb-2">Your Comments</h5>
                                                {activity.comments.map((comment) => (
                                                    <div key={comment.id} className="border-b border-gray-200 pb-2 mb-2">
                                                        <p className="text-gray-700">{comment.comment}</p>
                                                        <span className="text-sm text-gray-500">
                                                            {comment.timestamp.toDateString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upvoted Comments Section */}
                                        {activity.upvotedComments.length > 0 && (
                                            <div className="mt-4 bg-white p-4 rounded-lg">
                                                <h5 className="text-lg font-bold mb-2">Upvoted Comments</h5>
                                                {activity.upvotedComments.map((comment) => (
                                                    <div key={comment.id} className="border-b border-gray-200 pb-2 mb-2">
                                                        <p className="text-gray-700">{comment.comment}</p>
                                                        <span className="text-sm text-gray-500">
                                                            {comment.timestamp.toDateString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Downvoted Comments Section */}
                                        {activity.downvotedComments.length > 0 && (
                                            <div className="mt-4 bg-white p-4 rounded-lg">
                                                <h5 className="text-lg font-bold mb-2">Downvoted Comments</h5>
                                                {activity.downvotedComments.map((comment) => (
                                                    <div key={comment.id} className="border-b border-gray-200 pb-2 mb-2">
                                                        <p className="text-gray-700">{comment.comment}</p>
                                                        <span className="text-sm text-gray-500">
                                                            {comment.timestamp.toDateString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upvote/Downvote Indicator */}
                                        <div className="mt-4 flex items-center text-gray-500">
                                            {activity.isUpvoted && (
                                                <div className="flex items-center mr-4">
                                                    <svg
                                                        className="w-5 h-5 text-green-500 mr-1"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M10 15v4a3 3 0 006 0v-4h4a1 1 0 00.78-1.63l-7-7a1 1 0 00-1.56 0l-7 7A1 1 0 005 15h5z"/>
                                                    </svg>
                                                    <span>Upvoted</span>
                                                </div>
                                            )}
                                            {activity.isDownvoted && (
                                                <div className="flex items-center">
                                                    <svg
                                                        className="w-5 h-5 text-red-500 mr-1"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M14 9V5a3 3 0 00-6 0v4H5a1 1 0 00-.78 1.63l7 7a1 1 0 001.56 0l7-7A1 1 0 0019 9h-5z"/>
                                                    </svg>
                                                    <span>Downvoted</span>
                                                </div>
                                            )}
                                            {activity.isPostedByUser && (
                                                <div className={`flex items-center ${activity.isUpvoted || activity.isDownvoted ? 'ml-4' : ''}`}>
                                                    <svg
                                                        className="w-5 h-5 text-blue-500 mr-1"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                                                    </svg>
                                                    <span>Posted by You</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
