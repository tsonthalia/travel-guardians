import {
    collection,
    doc,
    getDocs,
    getFirestore,
    connectFirestoreEmulator,
    addDoc,
    updateDoc,
    getDoc, setDoc, initializeFirestore
} from 'firebase/firestore';
import firebase_app from '@/firebase/config';

import { Scam, ScamData, UserData } from './interfaces';
import {FirebaseError} from "firebase/app";

// Initialize Firestore
const db = initializeFirestore(firebase_app, {experimentalForceLongPolling: true})
const env = process.env.NODE_ENV;
// if (env === 'development') {
//     connectFirestoreEmulator(db, '127.0.0.1', 8080);
// }

export async function getUserData(uid: string) {
    const usersCollectionRef = collection(db, 'users');
    const userDocRef = doc(usersCollectionRef, uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User account does not exist');
    }

    return userDoc.data() as UserData;
}

export async function createUserDocument(uid: string, username: string, firstName: string, lastName: string, email: string) {
    let dbError: FirebaseError | null = null;

    try {
        const usersCollectionRef = collection(db, 'users');
        const newUserData: UserData = {
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName,
            upvotedScams: [],
            downvotedScams: [],
            createdPosts: [],
        }

        await setDoc(doc(usersCollectionRef, uid), newUserData);
    } catch (e) {
        if (e instanceof FirebaseError) {
            dbError = e;
        } else {
            dbError = new FirebaseError('unknown/error', 'An unknown error occurred.');
        }
    }

    return dbError;
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
            uid: data.uid,
            upvotes: data?.upvotes ?? 0,
            downvotes: data?.downvotes ?? 0,
            netvotes: data?.netvotes ?? 0,
        });

        scams.push();
    });

    return scams;
}

export async function createPost(title: string, description: string, city: string, country: string, date: Date, username: string, uid: string) {
    // add new post to feed collection
    const newScam: ScamData = {
        title: title,
        description: description,
        city: city,
        state: null,
        country: country,
        continent: null,
        date: date,
        user: username,
        uid: uid,
        upvotes: 0,
        downvotes: 0,
        netvotes: 0,
    };

    const scamsCollectionRef = collection(db, 'scams');
    const scamDocRef = await addDoc(scamsCollectionRef, newScam);

    const usersCollectionRef = collection(db, 'users');
    const userDocRef = doc(usersCollectionRef, uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User account does not exist');
    }

    const { createdPosts } = userDoc.data();
    await updateDoc(userDocRef, {
        createdPosts: [...createdPosts, scamDocRef.id],
    });
}

async function getScamVoteData(scam_id: string) {
    const scamsCollectionRef = collection(db, 'scams');
    const scamDocRef = doc(scamsCollectionRef, scam_id);
    const scamDoc = await getDoc(scamDocRef);

    if (!scamDoc.exists()) {
        throw new Error('Document does not exist');
    }

    const { upvotes, downvotes } = scamDoc.data();
    return { scamDocRef, upvotes, downvotes };
}

export async function upvotePressed(scam_id: string, uid: string) {
    const { scamDocRef, upvotes, downvotes } = await getScamVoteData(scam_id);
    const userDocRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const { upvotedScams, downvotedScams } = userDoc.data();

    let isUpvoted = false;

    let newDownvotedScams = downvotedScams;
    let newUpvotedScams = upvotedScams;
    let newScamDownvotes = downvotes;
    let newScamUpvotes = upvotes;
    let newScamNetvotes = upvotes - downvotes;

    if (downvotedScams.includes(scam_id)) {
        newDownvotedScams = downvotedScams.filter((id: string) => id !== scam_id);
        newUpvotedScams = [...upvotedScams, scam_id];
        await updateDoc(userDocRef, {
            downvotedScams: newDownvotedScams,
            upvotedScams: newUpvotedScams,
        });

        newScamDownvotes = downvotes - 1;
        newScamUpvotes = upvotes + 1;
        newScamNetvotes = upvotes - downvotes + 2;
        await updateDoc(scamDocRef, {
            downvotes: newScamDownvotes,
            upvotes: newScamUpvotes,
            netvotes: newScamNetvotes,
        });

        isUpvoted = true;
    } else if (upvotedScams.includes(scam_id)) { // user already upvoted this scam
        newUpvotedScams = upvotedScams.filter((id: string) => id !== scam_id);
        await updateDoc(userDocRef, {
            upvotedScams: newUpvotedScams,
        });

        newScamUpvotes = upvotes - 1;
        newScamNetvotes = upvotes - downvotes - 1;
        await updateDoc(scamDocRef, {
            upvotes: newScamUpvotes,
            netvotes: newScamNetvotes,
        });

        isUpvoted = false;
    } else { // User has not voted on this scam
        newUpvotedScams = [...upvotedScams, scam_id];
        await updateDoc(userDocRef, {
            upvotedScams: newUpvotedScams,
        });

        newScamUpvotes = upvotes + 1;
        newScamNetvotes = upvotes - downvotes + 1;
        await updateDoc(scamDocRef, {
            upvotes: newScamUpvotes,
            netvotes: newScamNetvotes,
        });

        isUpvoted = true;
    }

    return {isUpvoted, newDownvotedScams, newUpvotedScams, newScamDownvotes, newScamUpvotes, newScamNetvotes};
}

export async function downvotePressed(scam_id: string, uid: string) {
    const { scamDocRef, upvotes, downvotes } = await getScamVoteData(scam_id);
    const userDocRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const { upvotedScams, downvotedScams } = userDoc.data();

    let isDownvoted = false;

    let newDownvotedScams = downvotedScams;
    let newUpvotedScams = upvotedScams;
    let newScamDownvotes = downvotes;
    let newScamUpvotes = upvotes;
    let newScamNetvotes = upvotes - downvotes;

    if (upvotedScams.includes(scam_id)) {
        newUpvotedScams = upvotedScams.filter((id: string) => id !== scam_id);
        newDownvotedScams = [...downvotedScams, scam_id];
        await updateDoc(userDocRef, {
            upvotedScams: newUpvotedScams,
            downvotedScams: newDownvotedScams,
        });

        newScamUpvotes = upvotes - 1;
        newScamDownvotes = downvotes + 1;
        newScamNetvotes = upvotes - downvotes - 2;
        await updateDoc(scamDocRef, {
            upvotes: newScamUpvotes,
            downvotes: newScamDownvotes,
            netvotes: newScamNetvotes,
        });

        isDownvoted = true;
    } else if (downvotedScams.includes(scam_id)) { // user already downvoted this scam
        newDownvotedScams = downvotedScams.filter((id: string) => id !== scam_id);
        await updateDoc(userDocRef, {
            downvotedScams: newDownvotedScams,
        });

        newScamDownvotes = downvotes - 1;
        newScamNetvotes = upvotes - downvotes + 1;
        await updateDoc(scamDocRef, {
            downvotes: newScamDownvotes,
            netvotes: newScamNetvotes,
        });

        isDownvoted = false;
    } else { // User has not voted on this scam
        newDownvotedScams = [...downvotedScams, scam_id];
        await updateDoc(userDocRef, {
            downvotedScams: newDownvotedScams,
        });

        newScamDownvotes = downvotes + 1;
        newScamNetvotes = upvotes - downvotes - 1;
        await updateDoc(scamDocRef, {
            downvotes: newScamDownvotes,
            netvotes: newScamNetvotes,
        });

        isDownvoted = true;
    }

    return {isDownvoted, newDownvotedScams, newUpvotedScams, newScamDownvotes, newScamUpvotes, newScamNetvotes};
}

