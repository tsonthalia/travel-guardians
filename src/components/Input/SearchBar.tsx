import {useEffect, useRef} from "react";

interface SearchBarProps {
    searchQuery: string;
    filteredLocations: string[];
    handleUpdateSearchQuery: (searchQuery: string) => void;
    handleLocationSelect: (location: string) => void;
    setFilteredLocations: (locations: string[]) => void;
}

export default function SearchBar({
                                      searchQuery,
                                      handleUpdateSearchQuery,
                                      filteredLocations,
                                      handleLocationSelect,
                                      setFilteredLocations
                                  }: SearchBarProps) {
    const autocompleteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
                setFilteredLocations([]); // Close dropdown by clearing filtered locations
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setFilteredLocations]);

    const handleXButtonPressed = (e: any) => {
        handleUpdateSearchQuery('');
        setFilteredLocations([]);
    }

    return (
        <div className="max-w-2xl mx-auto mb-6 relative" ref={autocompleteRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full p-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search by city, country..."
                    value={searchQuery}
                    onChange={(e) => handleUpdateSearchQuery(e.target.value)} // Update location search query
                />
                {searchQuery && (
                    <button
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={handleXButtonPressed}
                    >
                        &#10005;
                    </button>
                )}
            </div>
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
    );
}
