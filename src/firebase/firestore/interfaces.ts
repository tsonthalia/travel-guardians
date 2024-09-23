export interface ScamBase {
    title: string;
    description: string;
    city: string;
    state: string | null;
    country: string;
    continent: string | null;
    date: Date; // Change date type to Date object
    user: string;
    uid: string;
    netvotes: number;
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

export interface UserData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    upvotedScams: string[];
    downvotedScams: string[];
    createdPosts: string[];
}