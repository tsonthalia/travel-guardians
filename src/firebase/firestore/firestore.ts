import {collection, getDocs, getFirestore, connectFirestoreEmulator} from 'firebase/firestore';
import firebase_app from '@/firebase/config';

import { Scam } from './interfaces';

// Initialize Firestore
const db = getFirestore(firebase_app);
const env = process.env.NODE_ENV;
if (env === 'development') {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export async function getFeed() {
    const scams: Scam[] = [];
    const scamsCollectionRef = collection(db, 'scams');
    const querySnapshot = await getDocs(scamsCollectionRef);

    querySnapshot.forEach((doc) => {
        const data = doc.data();

        scams.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            state: data?.state ?? null,
            country: data.country,
            continent: data?.continent ?? null,
            date: data.date.toDate(),
            user: data.user,
            upvotes: data?.upvotes ?? 0,
            downvotes: data?.downvotes ?? 0,
            netvotes: data?.netvotes ?? 0,
        });

        scams.push();
    });

    return scams;
}