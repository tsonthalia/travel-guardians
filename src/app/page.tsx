'use client';
import {useEffect, useRef, useState} from "react";
import {CityLocation, Scam, UserVoteDatum} from "@/firebase/firestore/interfaces";
import {downvotePressed, getFeed, upvotePressed, getPopularCities} from "@/firebase/firestore/firestore";
import {useAuthContext} from "@/context/AuthContext";
import ScamCard from "@/components/Scam/ScamCard";
import SelectedScamView from "@/components/Scam/SelectedScamView";
import SearchBar from "@/components/Input/SearchBar";
import Image from 'next/image';
import PopularLocationCard from "@/components/Location/PopularLocationCard";

export default function Feed() {
  const [feed, setFeed] = useState<Scam[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]); // Autocomplete filtered locations
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null); // Selected city-country
  const [popularLocations, setPopularLocations] = useState<CityLocation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedScam, setSelectedScam] = useState<Scam | null>(null);
  const [showAllLocations, setShowAllLocations] = useState<boolean>(false); // Toggle to show all popular locations

  const autocompleteRef = useRef<HTMLDivElement>(null);

  const user = useAuthContext();
  const [upvotedScams, setUpvotedScams] = useState<UserVoteDatum[]>(
      user?.userData?.upvotedScams ? user?.userData?.upvotedScams : []
  );
  const [downvotedScams, setDownvotedScams] = useState<UserVoteDatum[]>(
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

  useEffect( () => {
    getPopularCities().then((cities) => {
      setPopularLocations(cities);
    });
  })

  const getUniqueLocations = () => {
    const locations = feed.flatMap(scam =>
        scam.locations.flatMap((location, index) => [`${location.city}, ${location.country}`, location.country])
    )
    return Array.from(new Set(locations)); // Return unique combinations
  };

  const handleUpvote = async (e: any, scam_id: string) => {
    e.preventDefault();
    e.stopPropagation();

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
    e.stopPropagation();

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

  const getUpdatedFeed = (scam_id: string, newScamNetvotes: number) => {
    return feed.map((scam) => {
      if (scam.id === scam_id) {
        scam.netvotes = newScamNetvotes;
      }
      return scam;
    });
  }

  const filteredFeed = feed.filter(scam => {
    // Check if any of the cities or countries match the search query
    const matchesLocations = scam.locations.some(location => (
        location.city.toLowerCase().includes(searchQuery.toLowerCase()) || location.country.toLowerCase().includes(searchQuery.toLowerCase()) || location.continent.toLowerCase().includes(searchQuery.toLowerCase())
    ));

    // Check if the search query has words that match any cities or countries
    const matchesWords = searchQuery.split(" ").some(word => {
      return word !== "" && (
          scam.locations.some(location => (
              location.city.toLowerCase().includes(word.toLowerCase()) || location.country.toLowerCase().includes(word.toLowerCase()) || location.continent.toLowerCase().includes(word.toLowerCase())
          ))
      );
    });

    // console.log(scam.locations)

    return matchesLocations || matchesWords;
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

  const handlePopularLocationClick = async (location: string) => {
    setSearchQuery(location);
    setSelectedLocation(location);
  }

  const toggleShowAllLocations = () => {
    setShowAllLocations(!showAllLocations);
  }

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <main className="flex-grow">
          <section className="py-12">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mx-auto mb-6">
                <div className="grid grid-cols-4 gap-4 mb-4 justify-center">
                  {popularLocations.slice(0, showAllLocations ? popularLocations.length : 4).map((location, index) => (
                      <PopularLocationCard
                          key={index}
                          index={index}
                          location={location}
                          handlePopularLocationClick={handlePopularLocationClick}
                      />
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                      onClick={toggleShowAllLocations}
                      className="text-blue-500 hover:underline">
                    {showAllLocations ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              </div>

              <SearchBar
                  searchQuery={searchQuery}
                  filteredLocations={filteredLocations}
                  handleUpdateSearchQuery={handleUpdateSearchQuery}
                  handleLocationSelect={handleLocationSelect}
                  setFilteredLocations={setFilteredLocations}
              />

              <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
                {filteredFeed.length == 0 ? "No scams found." : filteredFeed.sort((a, b) => b.netvotes - a.netvotes).map((scam) => (
                    <ScamCard
                        key={scam.id}
                        scam={scam}
                        upvotedScams={upvotedScams}
                        downvotedScams={downvotedScams}
                        handleUpvote={handleUpvote}
                        handleDownvote={handleDownvote}
                        handleOpenModal={handleOpenModal}
                        allowDelete={user?.user?.uid === scam.id}
                    />
                ))}

                {/* Modal for displaying comments */}
                {isModalOpen && selectedScam && (
                    <SelectedScamView
                        selectedScam={selectedScam}
                        handleCloseModal={handleCloseModal}
                        handleUpvoteScam={handleUpvote}
                        handleDownvoteScam={handleDownvote}
                        isUpvoted={upvotedScams.some((scam) => scam.scam_id === selectedScam.id)}
                        isDownvoted={downvotedScams.some((scam) => scam.scam_id === selectedScam.id)}
                    />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
  );
}
