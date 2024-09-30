'use client';
import {useEffect, useRef, useState} from "react";
import {Scam} from "@/firebase/firestore/interfaces";
import {downvotePressed, getFeed, upvotePressed} from "@/firebase/firestore/firestore";
import {useAuthContext} from "@/context/AuthContext";
import UpvoteDownvoteSelector from "@/components/UpvoteDownvote/UpvoteDownvoteSelector";

export default function Feed() {
  const [feed, setFeed] = useState<Scam[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]); // Autocomplete filtered locations
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null); // Selected city-country
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedScam, setSelectedScam] = useState<Scam | null>(null);

  const autocompleteRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setFilteredLocations([]); // Close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [autocompleteRef]);

  const getUniqueLocations = () => {
    const locations = feed.flatMap(scam => [`${scam.city}, ${scam.country}`, scam.country])
    return Array.from(new Set(locations)); // Return unique combinations
  };

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

  const handleOpenModal = (scam: Scam) => {
    setSelectedScam(scam); // Set the selected post
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedScam(null); // Clear the selected post
  };

  function getUpdatedFeed(scam_id: string, newScamNetvotes: number) {
    return feed.map((scam) => {
      if (scam.id === scam_id) {
        scam.netvotes = newScamNetvotes;
      }
      return scam;
    });
  }

  const filteredFeed = feed.filter(scam => {
    return scam.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scam.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.split(" ").some((word) => {
          return word != "" && (
              word.toLowerCase().includes(scam.city.toLowerCase()) ||
              word.toLowerCase().includes(scam.country.toLowerCase())
          );
        });
  });

  const handleUpdateSearchQuery = (query: string) => {
    setSearchQuery(query);
    setFilteredLocations(getUniqueLocations().filter((location) => location.toLowerCase().includes(query.toLowerCase())));
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location); // Set selected location
    setSearchQuery(location); // Fill input with the selected location
    setFilteredLocations([]); // Clear dropdown
  };

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <main className="flex-grow">
          <section className="py-12">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mx-auto mb-6 relative" ref={autocompleteRef}>
                <input
                    type="text"
                    className="w-full p-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search by city, country..."
                    value={searchQuery}
                    onChange={(e) => handleUpdateSearchQuery(e.target.value)} // Update location search query
                />
                {filteredLocations.length > 0 && (
                    <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto z-10">
                      {filteredLocations.map((location, index) => (
                          <li
                              key={index}
                              className="p-2 hover:bg-gray-200 cursor-pointer"
                              onClick={() => handleLocationSelect(location)}
                          >
                            {location}
                          </li>
                      ))}
                    </ul>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
                {filteredFeed.length == 0 ? "No scams found." : filteredFeed.sort((a, b) => b.netvotes - a.netvotes).map((scam) => (
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

                        <div className="mt-4 flex items-center text-gray-500" onClick={() => handleOpenModal(scam)}>
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"
                               xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h18v12H7l-4 4V3z"/>
                            {/* Comments Icon (adjust as needed) */}
                          </svg>
                          <span>{scam.comments.length} comments</span> {/* Replace with dynamic comment count */}
                        </div>
                      </div>
                    </div>
                ))}

                {/* Modal for displaying comments */}
                {isModalOpen && selectedScam && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                        <button
                            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
                            onClick={handleCloseModal}
                        >
                          &times; {/* Close button */}
                        </button>

                        <h3 className="text-xl font-bold text-indigo-600 mb-4">{selectedScam.title}</h3>
                        <p className="text-gray-700 mb-4">{selectedScam.description}</p>

                        {/* Comments Section */}
                        <div className="space-y-4">
                          {selectedScam.comments.length > 0 ? (
                              selectedScam.comments.map((comment, index) => (
                                  <div key={index} className="bg-gray-100 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700">{comment.text}</p>
                                    <span className="text-xs text-gray-500">— {comment.user}</span>
                                  </div>
                              ))
                          ) : (
                              <p className="text-sm text-gray-500">No comments yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
  );
}