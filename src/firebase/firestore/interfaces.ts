import { Timestamp } from 'firebase/firestore';

export interface ScamBase {
    title: string;
    description: string;
    // cities: string[];
    // states: (string | null)[];
    // countries: string[];
    // continents: (string | null)[];
    locations: ScamLocation[],
    date: Date; // Change date type to Date object
    user: string;
    uid: string;
    netvotes: number;
    comments: number,
}

export interface CommentBase {
    username: string;
    uid: string;
    comment: string;
    upvotes: string[],
    downvotes: string[],
    netvotes: number,
}

export interface FirebaseComment extends CommentBase {
    timestamp: Timestamp;
}

export interface Comment extends CommentBase {
    timestamp: Date;
    id: string;
}

export interface UserActivityComment extends Comment {
    scam: Scam;
    userVotedTimestamp: Date;
}

export interface ScamData extends ScamBase {
    upvotes: string[];
    downvotes: string[];
}

export interface Scam extends ScamBase {
    id: string;
    upvotes: number;
    downvotes: number;
}

export interface UserVotedScam extends Scam {
    userVotedTimestamp: Date;
}

export interface UserData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    upvotedScams: UserVoteDatum[];
    downvotedScams: UserVoteDatum[];
    createdPosts: string[];
    upvotedComments: UserCommentVoteDatum[];
    downvotedComments: UserCommentVoteDatum[];
    comments: string[];
    followedLocations: string[];
}

export enum LocationType {
    CITY = 'city',
    STATE = 'state',
    COUNTRY = 'country',
    CONTINENT = 'continent',
}

export interface LocationBase {
    type: LocationType;
    location_id: string;
}

export interface LocationEntry {
    type: LocationType.CITY;
    city: string;
    state: string | null;
    country: string;
    continent: string;
    city_id: string | null;
    state_id: string | null;
    country_id: string | null;
    continent_id: string | null;
}

export interface ScamLocation extends LocationBase {
    type: LocationType.CITY;
    city: string;
    state: string | null;
    country: string;
    continent: string;
}

export interface CityLocation extends LocationBase {
    type: LocationType.CITY;
    city: string;
    state: string | null;
    country: string;
    continent: string;
    state_id: string | null;
    country_id: string;
    continent_id: string;
    scams: string[] | null;
    image_url: string | null;
}

export interface StateLocation extends LocationBase {
    type: LocationType.STATE;
    state: string;
    country: string;
    continent: string;
    country_id: string;
    continent_id: string;
}

export interface CountryLocation extends LocationBase {
    type: LocationType.COUNTRY;
    country: string;
    continent: string;
    continent_id: string;
}

export interface ContinentLocation extends LocationBase {
    type: LocationType.CONTINENT;
    continent: string;
}

export interface UserVoteDatum {
    scam_id: string;
    timestamp: Timestamp;
}

export interface VoteDatum {
    user_id: string;
    timestamp: Timestamp;
}

export interface UserCommentVoteDatum extends UserVoteDatum {
    comment_id: string;
}

export interface Contact {
    name: string;
    email: string;
    message: string;
}