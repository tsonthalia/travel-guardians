import {
    collection,
    doc,
    getDocs,
    getFirestore,
    connectFirestoreEmulator,
    addDoc,
    updateDoc,
    getDoc, setDoc, orderBy, Timestamp, deleteDoc,
} from 'firebase/firestore';
import firebase_app from '@/firebase/config';

import {
    Scam,
    ScamData,
    UserData,
    Comment,
    FirebaseComment,
    LocationEntry,
    CityLocation,
    LocationBase,
    LocationType,
    CountryLocation,
    ContinentLocation,
    StateLocation,
    ScamLocation,
    UserVoteDatum,
    VoteDatum, UserCommentVoteDatum, UserVotedScam, UserActivityComment
} from './interfaces';
import {FirebaseError} from "firebase/app";
import {query} from "@firebase/database";

// Initialize Firestore
const db = getFirestore(firebase_app)
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
            upvotedComments: [],
            downvotedComments: [],
            comments: [],
            followedLocations: [],
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
            locations: data.locations,
            date: data.date.toDate(),
            user: data.user,
            uid: data.uid,
            upvotes: data?.upvotes.length ?? 0,
            downvotes: data?.downvotes.length ?? 0,
            netvotes: data?.netvotes ?? 0,
            comments: data?.comments ?? [],
        });

        scams.push();
    });

    return scams;
}

export async function createPost(title: string, description: string, locations: LocationEntry[], date: Date, username: string, uid: string) {
    let formattedLocations: ScamLocation[] = [];
    for (const location of locations) {
        if (location.city_id) {
            formattedLocations.push({
                type: location.type,
                city: location.city,
                state: location?.state ?? null,
                country: location.country,
                continent: location.continent,
                location_id: location.city_id,
            });
        } else if (location.state_id) {
            // get state doc from locations
            const stateDoc = await getDoc(doc(collection(db, 'locations'), location.state_id));
            if (!stateDoc.exists()) {
                throw new Error('State does not exist');
            }

            const stateDocData = stateDoc.data() as StateLocation;
            const cityRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.CITY,
                city: location.city,
                state: stateDocData.state,
                state_id: location.state_id,
                country: stateDocData.country,
                country_id: stateDocData.country_id,
                continent: stateDocData.continent,
                continent_id: stateDocData.continent_id,
            });

            formattedLocations.push({
                type: location.type,
                city: location.city,
                state: location.state,
                country: location.country,
                continent: location.continent,
                location_id: cityRef.id,
            })
        } else if (location.country_id) {
            const countryDoc = await getDoc(doc(collection(db, 'locations'), location.country_id));
            if (!countryDoc.exists()) {
                throw new Error('Country does not exist');
            }

            const countryDocData = countryDoc.data() as CountryLocation;
            const stateRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.STATE,
                state: location.state,
                country: location.country,
                country_id: location.country_id,
                continent: countryDocData.continent,
                continent_id: countryDocData.continent_id,
            });

            const cityRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.CITY,
                city: location.city,
                state: location.state,
                state_id: stateRef.id,
                country: location.country,
                country_id: location.country_id,
                continent: countryDocData.continent,
                continent_id: countryDocData.continent_id,
            });

            formattedLocations.push({
                type: location.type,
                city: location.city,
                state: location.state,
                country: location.country,
                continent: countryDocData.continent,
                location_id: cityRef.id,
            })
        } else if (location.continent_id) {
            const continentDoc = await getDoc(doc(collection(db, 'locations'), location.continent_id));
            if (!continentDoc.exists()) {
                throw new Error('Continent does not exist');
            }

            const countryRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.COUNTRY,
                country: location.country,
                continent: location.continent,
                continent_id: location.continent_id,
            });

            const stateRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.STATE,
                state: location.state,
                country: location.country,
                country_id: countryRef.id,
                continent: location.continent,
                continent_id: location.continent_id,
            });

            const cityRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.CITY,
                city: location.city,
                state: location.state,
                state_id: stateRef.id,
                country: location.country,
                country_id: countryRef.id,
                continent: location.continent,
                continent_id: location.continent_id,
            });

            formattedLocations.push({
                type: location.type,
                city: location.city,
                state: location.state,
                country: location.country,
                continent: location.continent,
                location_id: cityRef.id,
            })
        } else {
            const continentRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.CONTINENT,
                continent: location.continent,
            });

            const countryRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.COUNTRY,
                country: location.country,
                continent: location.continent,
                continent_id: continentRef.id,
            });

            let stateRef;

            if (location.state === null) {
                stateRef = null;
            } else {
                stateRef = await addDoc(collection(db, 'locations'), {
                    type: LocationType.STATE,
                    state: location.state,
                    country: location.country,
                    country_id: countryRef.id,
                    continent: location.continent,
                    continent_id: continentRef.id,
                });
            }

            const cityRef = await addDoc(collection(db, 'locations'), {
                type: LocationType.CITY,
                city: location.city,
                state: location.state ?? null,
                state_id: stateRef?.id ?? null,
                country: location.country,
                country_id: countryRef.id,
                continent: location.continent,
                continent_id: continentRef.id,
            });

            formattedLocations.push({
                type: location.type,
                city: location.city,
                state: location.state,
                country: location.country,
                continent: location.continent,
                location_id: cityRef.id,
            })
        }
    }

    // add new post to feed collection
    const newScam: ScamData = {
        title: title,
        description: description,
        locations: formattedLocations,
        date: date,
        user: username,
        uid: uid,
        upvotes: [],
        downvotes: [],
        comments: 0,
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

export async function getMyPosts(user_id: string) {
    const userDocRef = doc(collection(db, 'users'), user_id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User account does not exist');
    }

    const { createdPosts } = userDoc.data();

    if (!createdPosts) {
        return [];
    }

    const scamsCollectionRef = collection(db, 'scams');
    const myPosts: Scam[] = [];
    for (const postId of createdPosts) {
        const postDocRef = doc(scamsCollectionRef, postId);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
            const data = postDoc.data();
            myPosts.push({
                id: postDoc.id,
                title: data.title,
                description: data.description,
                locations: data.locations,
                date: data.date.toDate(),
                user: data.user,
                uid: data.uid,
                upvotes: data?.upvotes.length ?? 0,
                downvotes: data?.downvotes.length ?? 0,
                netvotes: data?.netvotes ?? 0,
                comments: data?.comments ?? [],
            });
        }
    }

    return myPosts;
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
    const timestamp = new Date();

    const { scamDocRef, upvotes, downvotes } = await getScamVoteData(scam_id);
    const userDocRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const { upvotedScams, downvotedScams } = userDoc.data();

    let isUpvoted: boolean;

    let newDownvotedScams: UserVoteDatum[] = downvotedScams ?? [];
    let newUpvotedScams: UserVoteDatum[] = upvotedScams ?? [];
    let newScamDownvotes: VoteDatum[] = downvotes;
    let newScamUpvotes: VoteDatum[] = upvotes;
    let newScamNetvotes: number = upvotes - downvotes;

    if (downvotedScams.some((vote_datum: UserVoteDatum) => vote_datum.scam_id === scam_id)) {
        newDownvotedScams = downvotedScams.filter((vote_datum: UserVoteDatum) => vote_datum.scam_id !== scam_id);
        const newUserVoteDatum: UserVoteDatum = {scam_id: scam_id, timestamp: Timestamp.fromDate(timestamp)};
        newUpvotedScams = [...upvotedScams, newUserVoteDatum];

        await updateDoc(userDocRef, {
            downvotedScams: newDownvotedScams,
            upvotedScams: newUpvotedScams,
        });

        newScamDownvotes = downvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        const newScamVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newScamUpvotes = [...upvotes, newScamVoteDatum]
        newScamNetvotes = upvotes.length - downvotes.length + 2;
        await updateDoc(scamDocRef, {
            downvotes: newScamDownvotes,
            upvotes: newScamUpvotes,
            netvotes: newScamNetvotes,
        });

        isUpvoted = true;
    } else if (upvotedScams.some((vote_datum: UserVoteDatum) => vote_datum.scam_id === scam_id)) { // user already upvoted this scam
        newUpvotedScams = upvotedScams.filter((vote_datum: UserVoteDatum) => vote_datum.scam_id !== scam_id);
        await updateDoc(userDocRef, {
            upvotedScams: newUpvotedScams,
        });

        newScamUpvotes = upvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        newScamNetvotes = upvotes.length - downvotes.length - 1;
        await updateDoc(scamDocRef, {
            upvotes: newScamUpvotes,
            netvotes: newScamNetvotes,
        });

        isUpvoted = false;
    } else { // User has not voted on this scam
        const newUserVoteDatum: UserVoteDatum = {scam_id: scam_id, timestamp: Timestamp.fromDate(timestamp)};
        newUpvotedScams = [...upvotedScams, newUserVoteDatum];
        await updateDoc(userDocRef, {
            upvotedScams: newUpvotedScams,
        });

        const newScamVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newScamUpvotes = [...upvotes, newScamVoteDatum];
        newScamNetvotes = upvotes.length - downvotes.length + 1;
        await updateDoc(scamDocRef, {
            upvotes: newScamUpvotes,
            netvotes: newScamNetvotes,
        });

        isUpvoted = true;
    }

    return {isUpvoted, newDownvotedScams, newUpvotedScams, newScamDownvotes, newScamUpvotes, newScamNetvotes};
}

export async function downvotePressed(scam_id: string, uid: string) {
    const timestamp = new Date();

    const { scamDocRef, upvotes, downvotes } = await getScamVoteData(scam_id);
    const userDocRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const { upvotedScams, downvotedScams } = userDoc.data();

    let isDownvoted = false;

    let newDownvotedScams = downvotedScams ?? [];
    let newUpvotedScams = upvotedScams ?? [];
    let newScamDownvotes: string[] = downvotes;
    let newScamUpvotes: string[] = upvotes;
    let newScamNetvotes = upvotes - downvotes;

    if (upvotedScams.some((vote_datum: UserVoteDatum) => vote_datum.scam_id === scam_id)) {
        newUpvotedScams = upvotedScams.filter((vote_datum: UserVoteDatum) => vote_datum.scam_id !== scam_id);
        const newUserVoteDatum: UserVoteDatum = {scam_id: scam_id, timestamp: Timestamp.fromDate(timestamp)};
        newDownvotedScams = [...downvotedScams, newUserVoteDatum];
        await updateDoc(userDocRef, {
            upvotedScams: newUpvotedScams,
            downvotedScams: newDownvotedScams,
        });

        newScamUpvotes = upvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        const newScamVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newScamDownvotes = [...downvotes, newScamVoteDatum]
        newScamNetvotes = upvotes.length - downvotes.length - 2;
        await updateDoc(scamDocRef, {
            upvotes: newScamUpvotes,
            downvotes: newScamDownvotes,
            netvotes: newScamNetvotes,
        });

        isDownvoted = true;
    } else if (downvotedScams.some((vote_datum: UserVoteDatum) => vote_datum.scam_id === scam_id)) { // user already downvoted this scam
        newDownvotedScams = downvotedScams.filter((vote_datum: UserVoteDatum) => vote_datum.scam_id !== scam_id);
        await updateDoc(userDocRef, {
            downvotedScams: newDownvotedScams,
        });

        newScamDownvotes = downvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        newScamNetvotes = upvotes.length - downvotes.length + 1;
        await updateDoc(scamDocRef, {
            downvotes: newScamDownvotes,
            netvotes: newScamNetvotes,
        });

        isDownvoted = false;
    } else { // User has not voted on this scam
        const newUserVoteDatum: UserVoteDatum = {scam_id: scam_id, timestamp: Timestamp.fromDate(timestamp)};
        newDownvotedScams = [...downvotedScams, newUserVoteDatum];
        await updateDoc(userDocRef, {
            downvotedScams: newDownvotedScams,
        });

        const newScamVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newScamDownvotes = [...downvotes, newScamVoteDatum];
        newScamNetvotes = upvotes.length - downvotes.length - 1;
        await updateDoc(scamDocRef, {
            downvotes: newScamDownvotes,
            netvotes: newScamNetvotes,
        });

        isDownvoted = true;
    }

    return {isDownvoted, newDownvotedScams, newUpvotedScams, newScamDownvotes, newScamUpvotes, newScamNetvotes};
}

export async function addComment(comment: string, scam_id: string, user_id: string, username: string, commentTimestamp: Date) {
    const scamDocRef = doc(collection(db, 'scams'), scam_id);
    const scamDoc = await getDoc(scamDocRef);
    const userDoc = await getDoc(doc(collection(db, 'users'), user_id));

    if (!scamDoc.exists()) {
        throw new Error('Document does not exist');
    }

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const { comments } = scamDoc.data();
    if (!comments) {
        await updateDoc(scamDocRef, {
            comments: 1,
        });
    } else {
        await updateDoc(scamDocRef, {
            comments: comments + 1,
        });
    }

    const commentsCollectionRef = collection(scamDocRef, 'comments');
    const newComment: FirebaseComment = {
        comment: comment,
        uid: user_id,
        username: username,
        timestamp: Timestamp.fromDate(commentTimestamp),
        upvotes: [],
        downvotes: [],
        netvotes: 0,
    };

    const commentDocRef = await addDoc(commentsCollectionRef, newComment);

    const { comments: userComments } = userDoc.data();
    const newCommentUser = {
        scam_id: scam_id,
        comment_id: commentDocRef.id,
        timestamp: Timestamp.fromDate(commentTimestamp),
    }

    if (!userComments) {
        await updateDoc(doc(collection(db, 'users'), user_id), {
            comments: [newCommentUser],
        });
    } else {
        await updateDoc(doc(collection(db, 'users'), user_id), {
            comments: [...userComments, newCommentUser],
        });
    }

    return commentDocRef.id;
}

export async function getComments(scam_id: string) {
    const commentsCollectionRef = collection(db, 'scams', scam_id, 'comments');
    // @ts-ignore
    const commentsQuery = query(commentsCollectionRef, orderBy('timestamp', 'asc'));
    // @ts-ignore
    const querySnapshot = await getDocs(commentsQuery);

    const comments: Comment[] = [];


    querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseComment;
        comments.push({
            comment: data.comment,
            uid: data.uid,
            username: data.username,
            timestamp: data.timestamp.toDate(),
            upvotes: data?.upvotes ?? [],
            downvotes: data?.downvotes ?? [],
            netvotes: data?.netvotes ?? 0,
            id: doc.id,
        });
    });
    return comments;
}

export async function deleteComment(scam_id: string, comment_id: string, uid: string) {
    const commentDocRef = doc(collection(db, 'scams', scam_id, 'comments'), comment_id);
    const commentDoc = await getDoc(commentDocRef);
    const userDocRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userDocRef);

    if (!commentDoc.exists()) {
        throw new Error('Comment does not exist');
    }

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const { comments } = userDoc.data();

    // update user data with comment id removed
    await updateDoc(userDocRef, {
        comments: comments.filter((id: string) => id !== comment_id),
    });

    const { upvotes, downvotes } = commentDoc.data();
    const commentInteractedUsers = [...upvotes, ...downvotes];

    for (const interactedUserId of commentInteractedUsers) {
        const interactedUserDocRef = doc(collection(db, 'users'), interactedUserId)
        const interactedUserDoc = await getDoc(interactedUserDocRef);

        if (!interactedUserDoc.exists()) {
            continue;
        }

        const { upvotedComments } = interactedUserDoc.data();
        await updateDoc(interactedUserDocRef, {
            upvotedComments: upvotedComments.filter((id: string) => id !== comment_id),
        });
    }

    await deleteDoc(commentDocRef);
}

export async function upvoteCommentPressed(scam_id: string, comment_id: string, uid: string) {
    const timestamp = new Date();

    const commentDocRef = doc(collection(db, 'scams', scam_id, 'comments'), comment_id);
    const commentDoc = await getDoc(commentDocRef);
    const userDocRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userDocRef);

    if (!commentDoc.exists()) {
        throw new Error('Comment does not exist');
    }

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const {upvotes, downvotes} = commentDoc.data();
    const {upvotedComments, downvotedComments} = userDoc.data();

    let isUpvoted: boolean;

    let newDownvotedComments: UserCommentVoteDatum[] = downvotedComments ?? [];
    let newUpvotedComments: UserCommentVoteDatum[] = upvotedComments ?? [];
    let newCommentDownvotes: VoteDatum[] = downvotes;
    let newCommentUpvotes: VoteDatum[] = upvotes;
    let newCommentNetvotes: number = upvotes - downvotes;

    if (downvotedComments.some((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id === comment_id)) {
        newDownvotedComments = downvotedComments.filter((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id !== comment_id);
        const newUserVoteDatum: UserCommentVoteDatum = {
            scam_id: scam_id,
            comment_id: comment_id,
            timestamp: Timestamp.fromDate(timestamp)
        };

        newUpvotedComments = [...upvotedComments, newUserVoteDatum];
        await updateDoc(userDocRef, {
            downvotedComments: newDownvotedComments,
            upvotedComments: newUpvotedComments,
        });

        newCommentDownvotes = downvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        const newCommentVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newCommentUpvotes = [...upvotes, newCommentVoteDatum]
        newCommentNetvotes = upvotes.length - downvotes.length + 2;
        await updateDoc(commentDocRef, {
            downvotes: newCommentDownvotes,
            upvotes: newCommentUpvotes,
            netvotes: newCommentNetvotes,
        });

        isUpvoted = true;
    } else if (upvotedComments.some((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id === comment_id)) { // user already upvoted this comment
        newUpvotedComments = upvotedComments.filter((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id !== comment_id);
        await updateDoc(userDocRef, {
            upvotedComments: newUpvotedComments,
        });

        newCommentUpvotes = upvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        newCommentNetvotes = upvotes.length - downvotes.length - 1;
        await updateDoc(commentDocRef, {
            upvotes: newCommentUpvotes,
            netvotes: newCommentNetvotes,
        });

        isUpvoted = false;
    } else { // User has not voted on this comment
        const newUserVoteDatum: UserCommentVoteDatum = {
            scam_id: scam_id,
            comment_id: comment_id,
            timestamp: Timestamp.fromDate(timestamp)
        };
        newUpvotedComments = [...upvotedComments, newUserVoteDatum];
        await updateDoc(userDocRef, {
            upvotedComments: newUpvotedComments,
        });

        const newCommentVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newCommentUpvotes = [...upvotes, newCommentVoteDatum];
        newCommentNetvotes = upvotes.length - downvotes.length + 1;
        await updateDoc(commentDocRef, {
            upvotes: newCommentUpvotes,
            netvotes: newCommentNetvotes,
        });

        isUpvoted = true;
    }

    return {
        isUpvoted,
        newDownvotedComments,
        newUpvotedComments,
        newCommentDownvotes,
        newCommentUpvotes,
        newCommentNetvotes
    };
}

export async function downvoteCommentPressed(scam_id: string, comment_id: string, uid: string) {
    const timestamp = new Date();

    const commentDocRef = doc(collection(db, 'scams', scam_id, 'comments'), comment_id);
    const commentDoc = await getDoc(commentDocRef);
    const userDocRef = doc(collection(db, 'users'), uid);
    const userDoc = await getDoc(userDocRef);

    if (!commentDoc.exists()) {
        throw new Error('Comment does not exist');
    }

    if (!userDoc.exists()) {
        throw new Error('User does not exist');
    }

    const {upvotes, downvotes} = commentDoc.data();
    const {upvotedComments, downvotedComments} = userDoc.data();

    let isDownvoted: boolean;

    let newDownvotedComments: UserCommentVoteDatum[] = downvotedComments ?? [];
    let newUpvotedComments: UserCommentVoteDatum[] = upvotedComments ?? [];
    let newCommentDownvotes: VoteDatum[] = downvotes;
    let newCommentUpvotes: VoteDatum[] = upvotes;
    let newCommentNetvotes: number = upvotes - downvotes;

    if (upvotedComments.some((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id === comment_id)) {
        newUpvotedComments = upvotedComments.filter((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id !== comment_id);
        const newUserVoteDatum: UserCommentVoteDatum = {
            scam_id: scam_id,
            comment_id: comment_id,
            timestamp: Timestamp.fromDate(timestamp)
        };
        newDownvotedComments = [...downvotedComments, newUserVoteDatum];
        await updateDoc(userDocRef, {
            upvotedComments: newUpvotedComments,
            downvotedComments: newDownvotedComments,
        });

        newCommentUpvotes = upvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        const newCommentVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newCommentDownvotes = [...downvotes, newCommentVoteDatum]
        newCommentNetvotes = upvotes.length - downvotes.length - 2;
        await updateDoc(commentDocRef, {
            upvotes: newCommentUpvotes,
            downvotes: newCommentDownvotes,
            netvotes: newCommentNetvotes,
        });

        isDownvoted = true;
    } else if (downvotedComments.some((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id === comment_id)) { // user already downvoted this comment
        newDownvotedComments = downvotedComments.filter((vote_datum: UserCommentVoteDatum) => vote_datum.comment_id !== comment_id);
        await updateDoc(userDocRef, {
            downvotedComments: newDownvotedComments,
        });

        newCommentDownvotes = downvotes.filter((vote_datum: VoteDatum) => vote_datum.user_id !== uid);
        newCommentNetvotes = upvotes.length - downvotes.length + 1;
        await updateDoc(commentDocRef, {
            downvotes: newCommentDownvotes,
            netvotes: newCommentNetvotes,
        });

        isDownvoted = false;
    } else { // User has not voted on this comment
        const newUserVoteDatum: UserCommentVoteDatum = {
            scam_id: scam_id,
            comment_id: comment_id,
            timestamp: Timestamp.fromDate(timestamp)
        };
        newDownvotedComments = [...downvotedComments, newUserVoteDatum];
        await updateDoc(userDocRef, {
            downvotedComments: newDownvotedComments,
        });

        const newCommentVoteDatum: VoteDatum = {user_id: uid, timestamp: Timestamp.fromDate(timestamp)};
        newCommentDownvotes = [...downvotes, newCommentVoteDatum];
        newCommentNetvotes = upvotes.length - downvotes.length - 1;
        await updateDoc(commentDocRef, {
            downvotes: newCommentDownvotes,
            netvotes: newCommentNetvotes,
        });

        isDownvoted = true;
    }

    return {
        isDownvoted,
        newDownvotedComments,
        newUpvotedComments,
        newCommentDownvotes,
        newCommentUpvotes,
        newCommentNetvotes
    };
}

export async function getLocations() {
    const locationsCollectionRef = collection(db, 'locations');
    const querySnapshot = await getDocs(locationsCollectionRef);

    const locations: LocationBase[] = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type == LocationType.CITY) {
            locations.push(
                {
                    location_id: doc.id,
                    type: LocationType.CITY,
                    city: data.city,
                    state: data.state,
                    state_id: data.state_id,
                    country: data.country,
                    country_id: data.country_id,
                    continent: data.continent,
                    continent_id: data.continent_id,
                } as CityLocation
            )
        } else if (data.type == LocationType.STATE) {
            locations.push(
                {
                    location_id: doc.id,
                    type: LocationType.STATE,
                    state: data.state,
                    country: data.country,
                    country_id: data.country_id,
                    continent: data.continent,
                    continent_id: data.continent_id,
                } as StateLocation
            )
        } else if (data.type == LocationType.COUNTRY) {
            locations.push(
                {
                    location_id: doc.id,
                    type: LocationType.COUNTRY,
                    country: data.country,
                    continent: data.continent,
                    continent_id: data.continent_id,
                } as CountryLocation
            )
        } else if (data.type == LocationType.CONTINENT) {
            locations.push(
                {
                    location_id: doc.id,
                    type: LocationType.CONTINENT,
                    continent: data.continent,
                } as ContinentLocation
            )
        }
    });

    return locations;
}

export async function getUserActivity(user_id: string) {
    const userDocRef = doc(collection(db, 'users'), user_id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User account does not exist');
    }

    const { createdPosts, comments, upvotedScams, downvotedScams, upvotedComments, downvotedComments } = userDoc.data();

    const scamsCollectionRef = collection(db, 'scams');
    const postedScams: Scam[] = [];
    for (const postId of createdPosts) {
        const postDocRef = doc(scamsCollectionRef, postId);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
            const data = postDoc.data();
            postedScams.push({
                id: postDoc.id,
                title: data.title,
                description: data.description,
                locations: data.locations,
                date: data.date.toDate(),
                user: data.user,
                uid: data.uid,
                upvotes: data?.upvotes.length ?? 0,
                downvotes: data?.downvotes.length ?? 0,
                netvotes: data?.netvotes ?? 0,
                comments: data?.comments ?? [],
            });
        }
    }

    const userComments: UserActivityComment[] = [];
    for (const comment of comments) {
        const scamDocRef = doc(collection(db, 'scams'), comment.scam_id);
        const scamDoc = await getDoc(scamDocRef);

        if (!scamDoc.exists()) {
            continue;
        }

        const scamData = scamDoc.data();
        const scam = {
            id: scamDoc.id,
            title: scamData.title,
            description: scamData.description,
            locations: scamData.locations,
            date: scamData.date.toDate(),
            user: scamData.user,
            uid: scamData.uid,
            upvotes: scamData?.upvotes.length ?? 0,
            downvotes: scamData?.downvotes.length ?? 0,
            netvotes: scamData?.netvotes ?? 0,
            comments: scamData?.comments ?? [],
        }

        const commentDocRef = doc(collection(db, 'scams', comment.scam_id, 'comments'), comment.comment_id);
        const commentDoc = await getDoc(commentDocRef);

        if (commentDoc.exists()) {
            const data = commentDoc.data() as FirebaseComment;
            userComments.push({
                comment: data.comment,
                uid: data.uid,
                username: data.username,
                timestamp: data.timestamp.toDate(),
                upvotes: data?.upvotes ?? [],
                downvotes: data?.downvotes ?? [],
                netvotes: data?.netvotes ?? 0,
                id: comment.comment_id,
                userVotedTimestamp: comment.timestamp.toDate(),
                scam: scam,
            });
        }
    }

    const userUpvotedScams: UserVotedScam[] = [];
    for (const vote_datum of upvotedScams) {
        const scamDocRef = doc(collection(db, 'scams'), vote_datum.scam_id);
        const scamDoc = await getDoc(scamDocRef);

        if (scamDoc.exists()) {
            const data = scamDoc.data();
            userUpvotedScams.push({
                id: scamDoc.id,
                title: data.title,
                description: data.description,
                locations: data.locations,
                date: data.date.toDate(),
                user: data.user,
                uid: data.uid,
                upvotes: data?.upvotes.length ?? 0,
                downvotes: data?.downvotes.length ?? 0,
                netvotes: data?.netvotes ?? 0,
                comments: data?.comments ?? [],
                userVotedTimestamp: vote_datum.timestamp.toDate(),
            });
        }
    }

    const userDownvotedScams: UserVotedScam[] = [];
    for (const vote_datum of downvotedScams) {
        const scamDocRef = doc(collection(db, 'scams'), vote_datum.scam_id);
        const scamDoc = await getDoc(scamDocRef);

        if (scamDoc.exists()) {
            const data = scamDoc.data();
            userDownvotedScams.push({
                id: scamDoc.id,
                title: data.title,
                description: data.description,
                locations: data.locations,
                date: data.date.toDate(),
                user: data.user,
                uid: data.uid,
                upvotes: data?.upvotes.length ?? 0,
                downvotes: data?.downvotes.length ?? 0,
                netvotes: data?.netvotes ?? 0,
                comments: data?.comments ?? [],
                userVotedTimestamp: vote_datum.timestamp.toDate(),
            });
        }
    }

    const userUpvotedComments: UserActivityComment[] = [];
    for (const vote_datum of upvotedComments) {
        const scamDocRef = doc(collection(db, 'scams'), vote_datum.scam_id);
        const scamDoc = await getDoc(scamDocRef);

        if (!scamDoc.exists()) {
            continue;
        }

        const scamData = scamDoc.data();
        const scam = {
            id: scamDoc.id,
            title: scamData.title,
            description: scamData.description,
            locations: scamData.locations,
            date: scamData.date.toDate(),
            user: scamData.user,
            uid: scamData.uid,
            upvotes: scamData?.upvotes.length ?? 0,
            downvotes: scamData?.downvotes.length ?? 0,
            netvotes: scamData?.netvotes ?? 0,
            comments: scamData?.comments ?? [],
        }

        const commentDocRef = doc(collection(db, 'scams', vote_datum.scam_id, 'comments'), vote_datum.comment_id);
        const commentDoc = await getDoc(commentDocRef);

        if (commentDoc.exists()) {
            const data = commentDoc.data() as FirebaseComment;
            userUpvotedComments.push({
                comment: data.comment,
                uid: data.uid,
                username: data.username,
                timestamp: data.timestamp.toDate(),
                upvotes: data?.upvotes ?? [],
                downvotes: data?.downvotes ?? [],
                netvotes: data?.netvotes ?? 0,
                id: commentDoc.id,
                userVotedTimestamp: vote_datum.timestamp.toDate(),
                scam: scam,
            });
        }
    }

    const userDownvotedComments: UserActivityComment[] = [];
    for (const vote_datum of downvotedComments) {
        const scamDocRef = doc(collection(db, 'scams'), vote_datum.scam_id);
        const scamDoc = await getDoc(scamDocRef);

        if (!scamDoc.exists()) {
            continue;
        }

        const scamData = scamDoc.data();
        const scam = {
            id: scamDoc.id,
            title: scamData.title,
            description: scamData.description,
            locations: scamData.locations,
            date: scamData.date.toDate(),
            user: scamData.user,
            uid: scamData.uid,
            upvotes: scamData?.upvotes.length ?? 0,
            downvotes: scamData?.downvotes.length ?? 0,
            netvotes: scamData?.netvotes ?? 0,
            comments: scamData?.comments ?? [],
        }

        const commentDocRef = doc(collection(db, 'scams', vote_datum.scam_id, 'comments'), vote_datum.comment_id);
        const commentDoc = await getDoc(commentDocRef);

        if (commentDoc.exists()) {
            const data = commentDoc.data() as FirebaseComment;
            userDownvotedComments.push({
                comment: data.comment,
                uid: data.uid,
                username: data.username,
                timestamp: data.timestamp.toDate(),
                upvotes: data?.upvotes ?? [],
                downvotes: data?.downvotes ?? [],
                netvotes: data?.netvotes ?? 0,
                id: commentDoc.id,
                userVotedTimestamp: vote_datum.timestamp.toDate(),
                scam: scam,
            });
        }
    }

    return { postedScams, userComments, userUpvotedScams, userDownvotedScams, userUpvotedComments, userDownvotedComments };
}
