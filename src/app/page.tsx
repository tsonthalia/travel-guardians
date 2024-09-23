'use client';
import {useEffect, useState} from "react";
import {Scam} from "@/firebase/firestore/interfaces";
import {downvotePressed, getFeed, upvotePressed} from "@/firebase/firestore/firestore";
import {useAuthContext} from "@/context/AuthContext";
import UpvoteDownvoteSelector from "@/components/UpvoteDownvote/UpvoteDownvoteSelector";

export default function Feed() {
  const [feed, setFeed] = useState<Scam[]>([]);
  const user = useAuthContext();
  const [upvotedScams, setUpvotedScams] = useState<string[]>(
      user?.userData?.upvotedScams ? user?.userData?.upvotedScams : []
  );
  const [downvotedScams, setDownvotedScams] = useState<string[]>(
      user?.userData?.downvotedScams ? user?.userData?.downvotedScams : []
  );

  // get scam data using firebase function from firestore module
  useEffect(() => {
    if (!feed.length) {
      getFeed().then((scams) => {
        setFeed(scams);
      });
    }
  });

  const handleUpvote = async (e: any, scam_id: string) => {
    e.preventDefault();

    if (!user?.user) {
      console.log("User not logged in");
      return;
    }

    const {newDownvotedScams, newUpvotedScams, newScamNetvotes} = await upvotePressed(scam_id, user.user.uid);
    setUpvotedScams(newUpvotedScams);
    setDownvotedScams(newDownvotedScams);

    const updatedFeed = getUpdatedFeed(scam_id, newScamNetvotes);
    setFeed(updatedFeed);
  }

  const handleDownvote = async (e: any, scam_id: string) => {
    e.preventDefault();

    if (!user?.user) {
      console.log("User not logged in");
      return;
    }

    const {newDownvotedScams, newUpvotedScams, newScamNetvotes} = await downvotePressed(scam_id, user.user.uid);
    setUpvotedScams(newUpvotedScams);
    setDownvotedScams(newDownvotedScams);

    // update feed object's netvotes
    const updatedFeed = getUpdatedFeed(scam_id, newScamNetvotes);
    setFeed(updatedFeed);
  }

  function getUpdatedFeed(scam_id: string, newScamNetvotes: number) {
    return feed.map((scam) => {
      if (scam.id === scam_id) {
        scam.netvotes = newScamNetvotes;
      }
      return scam;
    });
  }

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <main className="flex-grow">
          <section className="py-12">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
                {feed.length == 0 ? "Loading..." : feed.map((scam) => (
                    <div key={scam.id} className="bg-gray-100 p-6 rounded-lg shadow-lg relative">
                      {/* Upvote/Downvote Section */}
                      <UpvoteDownvoteSelector
                          scam_id={scam.id}
                          netvotes={scam.netvotes}
                          isUpvoted={upvotedScams.includes(scam.id)}
                          isDownvoted={downvotedScams.includes(scam.id)}
                          handleUpvote={handleUpvote}
                          handleDownvote={handleDownvote}
                      />

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