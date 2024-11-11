import Image from "next/image";
import {CityLocation} from "@/firebase/firestore/interfaces";

interface PopularLocationCardProps {
    index: number;
    location: CityLocation;
    handlePopularLocationClick: (location: string) => void;
}

export default function PopularLocationCard({
                                                index,
                                                location,
                                                handlePopularLocationClick
                                            }: PopularLocationCardProps
) {
    return (
        <div
            className="cursor-pointer relative w-full h-48 overflow-hidden transform transition-transform duration-300 hover:scale-105"
            onClick={() => handlePopularLocationClick(location.city + ", " + location.country)}
        >
            <Image src={location.image_url ?? '/generic_city.jpeg'} alt={location.city} layout="fill"
                   objectFit="cover" className="rounded-lg shadow-md"/>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">{index + 1}</span>
            </div>
            <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent py-1 rounded-b-lg">
                <p className="text-white text-sm mb-1 font-bold text-center px-1">{location.city + ", " + location.country}</p>
            </div>
        </div>
    )
}
