'use client';
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from 'next/navigation';
import {useAuthContext} from "@/context/AuthContext";
import {createPost, getLocations} from "@/firebase/firestore/firestore";
import {
    CityLocation,
    ContinentLocation,
    CountryLocation,
    LocationBase,
    LocationEntry,
    LocationType,
    StateLocation
} from "@/firebase/firestore/interfaces"; // Assuming you have a function to create posts

function isCityLocation(loc: LocationBase): loc is CityLocation {
    return 'city' in loc && typeof loc.city === 'string' && loc.type == LocationType.CITY;
}

function isStateLocation(loc: LocationBase): loc is StateLocation {
    return 'state' in loc && typeof loc.state === 'string' && loc.type == LocationType.STATE;
}

function isCountryLocation(loc: LocationBase): loc is CountryLocation {
    return 'country' in loc && typeof loc.country === 'string' && loc.type == LocationType.COUNTRY;
}

function isContinentLocation(loc: LocationBase): loc is ContinentLocation {
    return 'continent' in loc && typeof loc.continent === 'string' && loc.type == LocationType.CONTINENT;
}

export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [locations, setLocations] = useState<LocationEntry[]>([{
        type: LocationType.CITY,
        city: '',
        country: '',
        state: null,
        continent: '',
        city_id: null,
        state_id: null,
        country_id: null,
        continent_id: null,
    }]);
    const [existingLocations, setExistingLocations] = useState<LocationBase[]>([]);
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [filteredCityLocations, setFilteredCityLocations] = useState<{ [key: number]: CityLocation[] }>({});
    const [filteredStateLocations, setFilteredStateLocations] = useState<{ [key: number]: StateLocation[] }>({});
    const [filteredCountryLocations, setFilteredCountryLocations] = useState<{ [key: number]: CountryLocation[] }>({});
    const [filteredContinentLocations, setFilteredContinentLocations] = useState<{
        [key: number]: ContinentLocation[]
    }>({});

    const [cityAutocompleteVisible, setCityAutocompleteVisible] = useState<{ [key: number]: boolean }>({});
    const [stateAutocompleteVisible, setStateAutocompleteVisible] = useState<{ [key: number]: boolean }>({});
    const [countryAutocompleteVisible, setCountryAutocompleteVisible] = useState<{ [key: number]: boolean }>({});
    const [continentAutocompleteVisible, setContinentAutocompleteVisible] = useState<{ [key: number]: boolean }>({});

    const cityAutocompleteRefs = useRef<(HTMLDivElement | null)[]>([]);
    const stateAutocompleteRefs = useRef<(HTMLDivElement | null)[]>([]);
    const countryAutocompleteRefs = useRef<(HTMLDivElement | null)[]>([]);
    const continentAutocompleteRefs = useRef<(HTMLDivElement | null)[]>([]);

    const router = useRouter();
    const user = useAuthContext();

    useEffect(() => {
        if (!user?.user) {
            router.push("/login");
        }
    }, [user?.user, router]);

    useEffect(() => {
        getLocations().then((locations) => {
            setExistingLocations(locations);
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            cityAutocompleteRefs.current.forEach((ref, index) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setCityAutocompleteVisible(prev => ({...prev, [index]: false}));
                }
            });

            stateAutocompleteRefs.current.forEach((ref, index) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setStateAutocompleteVisible(prev => ({...prev, [index]: false}));
                }
            });

            countryAutocompleteRefs.current.forEach((ref, index) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setCountryAutocompleteVisible(prev => ({...prev, [index]: false}));
                }
            });

            continentAutocompleteRefs.current.forEach((ref, index) => {
                if (ref && !ref.contains(event.target as Node)) {
                    setContinentAutocompleteVisible(prev => ({...prev, [index]: false}));
                }
            });
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLocationChange = (index: number, field: string, value: string) => {
        let updatedLocations = [...locations];

        if (field === 'city') {
            updatedLocations[index].city = value;
            setFilteredCityLocations((prev) => ({
                ...prev,
                [index]: existingLocations
                    .filter((loc) => isCityLocation(loc))
                    .filter((loc) => loc.city.toLowerCase().includes(value.toLowerCase()))
                    .map((loc) => loc as CityLocation),
            }));
            setCityAutocompleteVisible(prev => ({...prev, [index]: true}));
            setStateAutocompleteVisible(prev => ({...prev, [index]: false}));
            setCountryAutocompleteVisible(prev => ({...prev, [index]: false}));
            setContinentAutocompleteVisible(prev => ({...prev, [index]: false}));
        } else if (field === 'state') {
            updatedLocations[index].state = value;
            setFilteredStateLocations((prev) => ({
                ...prev,
                [index]: existingLocations
                    .filter((loc) => isStateLocation(loc))
                    .filter((loc) => loc.state.toLowerCase().includes(value.toLowerCase()))
                    .map((loc) => loc as StateLocation)
            }));
            setCityAutocompleteVisible(prev => ({...prev, [index]: false}));
            setStateAutocompleteVisible(prev => ({...prev, [index]: true}));
            setCountryAutocompleteVisible(prev => ({...prev, [index]: false}));
            setContinentAutocompleteVisible(prev => ({...prev, [index]: false}));
        } else if (field === 'country') {
            updatedLocations[index].country = value;
            setFilteredCountryLocations((prev) => ({
                ...prev,
                [index]: existingLocations
                    .filter((loc) => isCountryLocation(loc))
                    .filter((loc) => loc.country.toLowerCase().includes(value.toLowerCase()))
                    .map((loc) => loc as CountryLocation)
            }));
            setCityAutocompleteVisible(prev => ({...prev, [index]: false}));
            setStateAutocompleteVisible(prev => ({...prev, [index]: false}));
            setCountryAutocompleteVisible(prev => ({...prev, [index]: true}));
            setContinentAutocompleteVisible(prev => ({...prev, [index]: false}));
        } else if (field === 'continent') {
            updatedLocations[index].continent = value;
            setFilteredContinentLocations((prev) => ({
                ...prev,
                [index]: existingLocations
                    .filter((loc) => isContinentLocation(loc))
                    .filter((loc) => loc.continent.toLowerCase().includes(value.toLowerCase()))
                    .map((loc) => loc as ContinentLocation)
            }));
            setCityAutocompleteVisible(prev => ({...prev, [index]: false}));
            setStateAutocompleteVisible(prev => ({...prev, [index]: false}));
            setCountryAutocompleteVisible(prev => ({...prev, [index]: false}));
            setContinentAutocompleteVisible(prev => ({...prev, [index]: true}));
        }

        setLocations(updatedLocations);
    };

    const handleCityLocationSelect = (index: number, selectedLocation: CityLocation) => {
        let updatedLocations = [...locations];
        if (selectedLocation) {
            updatedLocations[index] = {
                ...updatedLocations[index],
                city: selectedLocation.city,
                country: selectedLocation.country,
                state: selectedLocation.state,
                continent: selectedLocation.continent,
                city_id: selectedLocation.location_id,
            };
        }
        setLocations(updatedLocations);
        setCityAutocompleteVisible(prev => ({...prev, [index]: false}));
    };

    const handleStateLocationSelect = (index: number, selectedLocation: StateLocation) => {
        let updatedLocations = [...locations];
        if (selectedLocation) {
            updatedLocations[index] = {
                ...updatedLocations[index],
                state: selectedLocation.state,
                country: selectedLocation.country,
                continent: selectedLocation.continent,
                state_id: selectedLocation.location_id,
            };
        }
        setLocations(updatedLocations);
        setStateAutocompleteVisible(prev => ({...prev, [index]: false}));
    }

    const handleCountryLocationSelect = (index: number, selectedLocation: CountryLocation) => {
        let updatedLocations = [...locations];
        if (selectedLocation) {
            updatedLocations[index] = {
                ...updatedLocations[index],
                country: selectedLocation.country,
                continent: selectedLocation.continent,
                country_id: selectedLocation.location_id,
            };
        }
        setLocations(updatedLocations);
        setCountryAutocompleteVisible(prev => ({...prev, [index]: false}));
    }

    const handleContinentLocationSelect = (index: number, selectedLocation: ContinentLocation) => {
        let updatedLocations = [...locations];
        if (selectedLocation) {
            updatedLocations[index] = {
                ...updatedLocations[index],
                continent: selectedLocation.continent,
                continent_id: selectedLocation.location_id,
            };
        }
        setLocations(updatedLocations);
        setContinentAutocompleteVisible(prev => ({...prev, [index]: false}));
    }

    const addLocation = () => {
        setLocations([...locations, {
            type: LocationType.CITY,
            city: '',
            country: '',
            state: null,
            continent: '',
            city_id: null,
            state_id: null,
            country_id: null,
            continent_id: null,
        }]);

        cityAutocompleteRefs.current.push(null);
        stateAutocompleteRefs.current.push(null);
        countryAutocompleteRefs.current.push(null);
        continentAutocompleteRefs.current.push(null);
    };

    const removeLocation = (index: number) => {
        if (locations.length > 1) {
            const updatedLocations = locations.filter((_, i) => i !== index);
            setLocations(updatedLocations);

            setCityAutocompleteVisible(prev => {
                const newVisibility = {...prev};
                delete newVisibility[index];
                return newVisibility;
            });
            setFilteredCityLocations(prev => {
                const newFiltered = {...prev};
                delete newFiltered[index];
                return newFiltered;
            });

            setStateAutocompleteVisible(prev => {
                const newVisibility = {...prev};
                delete newVisibility[index];
                return newVisibility;
            })
            setFilteredStateLocations(prev => {
                const newFiltered = {...prev};
                delete newFiltered[index];
                return newFiltered;
            })

            setCountryAutocompleteVisible(prev => {
                const newVisibility = {...prev};
                delete newVisibility[index];
                return newVisibility;
            })
            setFilteredCountryLocations(prev => {
                const newFiltered = {...prev};
                delete newFiltered[index];
                return newFiltered;
            })

            setContinentAutocompleteVisible(prev => {
                const newVisibility = {...prev};
                delete newVisibility[index];
                return newVisibility;
            })
            setFilteredContinentLocations(prev => {
                const newFiltered = {...prev};
                delete newFiltered[index];
                return newFiltered;
            })
        }
    };

    const handleForm = async (event: any) => {
        event.preventDefault();

        setErrorMessage('');

        if (!title || !description) {
            setErrorMessage("Both title and description are required.");
            return;
        }

        for (let location of locations) {
            // verify that the set ids are still valid
            if (location?.city_id) {
                // find matching location in existing locations
                const existingLocation = existingLocations.find((loc) => loc.location_id === location.city_id);

                if (!existingLocation || !isCityLocation(existingLocation)) {
                    location.city_id = null;
                } else {
                    if (location.city.toLowerCase() == existingLocation.city.toLowerCase() && location.country.toLowerCase() == existingLocation.country.toLowerCase() && location.continent.toLowerCase() == existingLocation.continent.toLowerCase() && (location.state || '').toLowerCase() == (existingLocation.state || '').toLowerCase()) {
                        location.city = existingLocation.city;
                        location.state = existingLocation.state;
                        location.country = existingLocation.country;
                        location.continent = existingLocation.continent;
                    } else {
                        location.city_id = null;
                    }
                }
            }

            if (location?.state_id) {
                const existingLocation = existingLocations.find((loc) => loc.location_id === location.state_id);

                if (!existingLocation || !isStateLocation(existingLocation)) {
                    location.state_id = null;
                } else {
                    if ((location.state || '').toLowerCase() == (existingLocation.state || '').toLowerCase() && location.country.toLowerCase() == existingLocation.country.toLowerCase() && location.continent.toLowerCase() == existingLocation.continent.toLowerCase()) {
                        location.state = existingLocation.state;
                        location.country = existingLocation.country;
                        location.continent = existingLocation.continent;
                    } else {
                        location.state_id = null;
                    }
                }
            }

            if (location?.country_id) {
                const existingLocation = existingLocations.find((loc) => loc.location_id === location.country_id);

                if (!existingLocation || !isCountryLocation(existingLocation)) {
                    location.country_id = null;
                } else {
                    if (location.country.toLowerCase() == existingLocation.country.toLowerCase() && location.continent.toLowerCase() == existingLocation.continent.toLowerCase()) {
                        location.country = existingLocation.country;
                        location.continent = existingLocation.continent;
                    } else {
                        location.country_id = null;
                    }
                }
            }

            if (location?.continent_id) {
                const existingLocation = existingLocations.find((loc) => loc.location_id === location.continent_id);

                if (!existingLocation || !isContinentLocation(existingLocation)) {
                    location.continent_id = null;
                } else {
                    if (location.continent.toLowerCase() == existingLocation.continent.toLowerCase()) {
                        location.continent = existingLocation.continent;
                    } else {
                        location.continent_id = null;
                    }
                }
            }

            if (location.city_id == null) {
                // find if there is a matching city in the existing locations
                const existingLocation = existingLocations.find((loc) => isCityLocation(loc) && loc.city.toLowerCase() == location.city.toLowerCase() && loc.country.toLowerCase() == location.country.toLowerCase() && loc.continent.toLowerCase() == location.continent.toLowerCase() && (loc.state || '').toLowerCase() == (location.state || '').toLowerCase())
                if (existingLocation) {
                    location.city_id = existingLocation.location_id;
                }
            } else if (location.state_id == null) {
                const existingLocation = existingLocations.find((loc) => isStateLocation(loc) && (loc.state || '').toLowerCase() == (location.state || '').toLowerCase() && loc.country.toLowerCase() == location.country.toLowerCase() && loc.continent.toLowerCase() == location.continent.toLowerCase());
                if (existingLocation) {
                    location.state_id = existingLocation.location_id;
                }
            } else if (location.country_id == null) {
                const existingLocation = existingLocations.find((loc) => isCountryLocation(loc) && loc.country.toLowerCase() == location.country.toLowerCase() && loc.continent.toLowerCase() == location.continent.toLowerCase());
                if (existingLocation) {
                    location.country_id = existingLocation.location_id
                }
            } else if (location.continent_id == null) {
                const existingLocation = existingLocations.find((loc) => isContinentLocation(loc) && loc.continent.toLowerCase() == location.continent.toLowerCase());
                if (existingLocation) {
                    location.continent_id = existingLocation.location_id
                }
            }
        }

        try {
            await createPost(
                title,
                description,
                locations,
                new Date(),
                user?.user?.displayName || 'Anonymous',
                user?.user?.uid || '',
            );

            router.push("/");
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred while creating the post.");
        }
    };

    return (
        <div className="flex flex-col flex-grow pt-10 pb-10 justify-center items-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Create Post</h1>
                <form onSubmit={handleForm} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            type="text"
                            name="title"
                            id="title"
                            placeholder="Enter a title"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="locations" className="block text-sm font-medium text-gray-700">
                            Locations
                        </label>
                        {locations.map((location, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4 mt-4 relative">
                                {/*@ts-ignore*/}
                                <div ref={(el) => (cityAutocompleteRefs.current[index] = el as HTMLDivElement)}>
                                    <label htmlFor={`city-${index}`}
                                           className="block text-sm font-medium text-gray-700 mt-1">
                                        City*
                                    </label>
                                    <input
                                        onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                                        required
                                        type="text"
                                        name={`city-${index}`}
                                        id={`city-${index}`}
                                        placeholder="Enter a city"
                                        value={location.city}
                                        className="p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {cityAutocompleteVisible[index] && filteredCityLocations[index]?.length > 0 && (
                                        <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto z-10">
                                            {filteredCityLocations[index].map((location, idx) => (
                                                <li
                                                    key={idx}
                                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                                    onClick={() => handleCityLocationSelect(index, location)}
                                                >
                                                    {location.city}, {location?.state ? location?.state + ', ' : ''} {location.country}, {location.continent}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {/*@ts-ignore*/}
                                <div ref={(el) => (stateAutocompleteRefs.current[index] = el as HTMLDivElement)}>
                                    <label htmlFor={`state-${index}`}
                                           className="block text-sm font-medium text-gray-700 mt-1">
                                        State
                                    </label>
                                    <input
                                        onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                                        type="text"
                                        name={`state-${index}`}
                                        id={`state-${index}`}
                                        placeholder="Enter a state"
                                        value={location.state || ''}
                                        className="p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {stateAutocompleteVisible[index] && filteredStateLocations[index]?.length > 0 && (
                                        <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto z-10">
                                            {filteredStateLocations[index].map((location, idx) => (
                                                <li
                                                    key={idx}
                                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                                    onClick={() => handleStateLocationSelect(index, location)}
                                                >
                                                    {location.state}, {location.country}, {location.continent}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {/*@ts-ignore*/}
                                <div ref={(el) => (countryAutocompleteRefs.current[index] = el as HTMLDivElement)}>
                                    <label htmlFor={`country-${index}`}
                                           className="block text-sm font-medium text-gray-700 mt-1">
                                        Country*
                                    </label>
                                    <input
                                        onChange={(e) => handleLocationChange(index, 'country', e.target.value)}
                                        required
                                        type="text"
                                        name={`country-${index}`}
                                        id={`country-${index}`}
                                        placeholder="Enter a country"
                                        value={location.country}
                                        className="p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {countryAutocompleteVisible[index] && filteredCountryLocations[index]?.length > 0 && (
                                        <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto z-10">
                                            {filteredCountryLocations[index].map((location, idx) => (
                                                <li
                                                    key={idx}
                                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                                    onClick={() => handleCountryLocationSelect(index, location)}
                                                >
                                                    {location.country}, {location.continent}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {/*@ts-ignore*/}
                                <div ref={(el) => (continentAutocompleteRefs.current[index] = el as HTMLDivElement)}>
                                    <label htmlFor={`continent-${index}`}
                                           className="block text-sm font-medium text-gray-700 mt-1">
                                        Continent*
                                    </label>
                                    <input
                                        onChange={(e) => handleLocationChange(index, 'continent', e.target.value)}
                                        required
                                        type="text"
                                        name={`continent-${index}`}
                                        id={`continent-${index}`}
                                        placeholder="Enter a continent"
                                        value={location.continent}
                                        className="p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {continentAutocompleteVisible[index] && filteredContinentLocations[index]?.length > 0 && (
                                        <ul className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto z-10">
                                            {filteredContinentLocations[index].map((location, idx) => (
                                                <li
                                                    key={idx}
                                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                                    onClick={() => handleContinentLocationSelect(index, location)}
                                                >
                                                    {location.continent}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="col-span-2 text-right">
                                    {locations.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLocation(index)}
                                            className="text-red-600 hover:underline"
                                        >
                                            <span className="text-lg">−</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addLocation}
                            className="mt-4 text-indigo-600 hover:underline flex items-center"
                        >
                            <span className="text-lg mr-1">+</span> Add another location
                        </button>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            name="description"
                            id="description"
                            rows={5}
                            placeholder="Describe the scam or event"
                            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm text-center">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Create Post
                    </button>
                </form>
            </div>
        </div>
    );
}
