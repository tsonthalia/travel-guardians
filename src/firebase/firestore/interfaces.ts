export interface ScamData {
    title: string;
    description: string;
    city: string;
    state: string | null;
    country: string;
    continent: string | null;
    date: Date; // Change date type to Date object
    user: string;
    uid: string;
    upvotes: number;
    downvotes: number;
    netvotes: number;
}

export interface Scam extends ScamData {
    id: string
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