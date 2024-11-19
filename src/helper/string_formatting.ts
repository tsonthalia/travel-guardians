import {ScamLocation} from "@/firebase/firestore/interfaces";

export function timeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return years === 1 ? '1 year ago' : `${years} years ago`;
    }

    if (months > 0) {
        return months === 1 ? '1 month ago' : `${months} months ago`;
    }

    if (weeks > 0) {
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }

    if (days > 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    }

    if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }

    return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
}

export function getShortenedScamLocationsString(locations: ScamLocation[]): string {
    // Return a string of city, country for each location
    // If string is too long, return ellipsis after 2 locations

    if (locations.length === 0) {
        return '';
    } else if (locations.length === 1) {
        return `${locations[0].city}, ${locations[0].country}`;
    } else if (locations.length === 2) {
        return `${locations[0].city}, ${locations[0].country} and ${locations[1].city}, ${locations[1].country}`;
    } else {
        return `${locations[0].city}, ${locations[0].country} and  ${locations.length - 1} more`;
    }
}

export function getFullScamLocationsString(locations: ScamLocation[]): string {
    return locations.map(location => `${location.city}, ${location.country}`).join('; ');
}