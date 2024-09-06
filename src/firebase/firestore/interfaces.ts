export interface Scam {
    id: string;
    title: string;
    description: string;
    city: string;
    state: string | null;
    country: string;
    continent: string | null;
    date: Date; // Change date type to Date object
    user: string;
    upvotes: number;
    downvotes: number;
    netvotes: number;
}