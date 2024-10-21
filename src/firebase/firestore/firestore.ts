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

import {Scam, ScamData, UserData, Comment, FirebaseComment} from './interfaces';
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
            upvotes: data?.upvotes.length ?? 0,
            downvotes: data?.downvotes.length ?? 0,
            netvotes: data?.netvotes ?? 0,
            comments: data?.comments ?? [],
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

    let isUpvoted: boolean;

    let newDownvotedScams = downvotedScams ?? [];
    let newUpvotedScams = upvotedScams ?? [];
    let newScamDownvotes: string[] = downvotes;
    let newScamUpvotes: string[] = upvotes;
    let newScamNetvotes: number = upvotes - downvotes;

    if (downvotedScams.includes(scam_id)) {
        newDownvotedScams = downvotedScams.filter((id: string) => id !== scam_id);
        newUpvotedScams = [...upvotedScams, scam_id];
        await updateDoc(userDocRef, {
            downvotedScams: newDownvotedScams,
            upvotedScams: newUpvotedScams,
        });

        newScamDownvotes = downvotes.filter((id: string) => id !== uid);
        newScamUpvotes = [...upvotes, uid]
        newScamNetvotes = upvotes.length - downvotes.length + 2;
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

        newScamUpvotes = upvotes.filter((id: string) => id !== uid);
        newScamNetvotes = upvotes.length - downvotes.length - 1;
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

        newScamUpvotes = [...upvotes, uid];
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

    if (upvotedScams.includes(scam_id)) {
        newUpvotedScams = upvotedScams.filter((id: string) => id !== scam_id);
        newDownvotedScams = [...downvotedScams, scam_id];
        await updateDoc(userDocRef, {
            upvotedScams: newUpvotedScams,
            downvotedScams: newDownvotedScams,
        });

        newScamUpvotes = upvotes.filter((id: string) => id !== uid);
        newScamDownvotes = [...downvotes, uid]
        newScamNetvotes = upvotes.length - downvotes.length - 2;
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

        newScamDownvotes = downvotes.filter((id: string) => id !== uid);
        newScamNetvotes = upvotes.length - downvotes.length + 1;
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

        newScamDownvotes = [...downvotes, uid];
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
    if (!userComments) {
        await updateDoc(doc(collection(db, 'users'), user_id), {
            comments: [commentDocRef.id],
        });
    } else {
        await updateDoc(doc(collection(db, 'users'), user_id), {
            comments: [...userComments, commentDocRef.id],
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

    let newDownvotedComments = downvotedComments ?? [];
    let newUpvotedComments = upvotedComments ?? [];
    let newCommentDownvotes: string[] = downvotes;
    let newCommentUpvotes: string[] = upvotes;
    let newCommentNetvotes: number = upvotes - downvotes;

    if (downvotedComments.includes(comment_id)) {
        newDownvotedComments = downvotedComments.filter((id: string) => id !== comment_id);
        newUpvotedComments = [...upvotedComments, comment_id];
        await updateDoc(userDocRef, {
            downvotedComments: newDownvotedComments,
            upvotedComments: newUpvotedComments,
        });

        newCommentDownvotes = downvotes.filter((id: string) => id !== uid);
        newCommentUpvotes = [...upvotes, uid]
        newCommentNetvotes = upvotes.length - downvotes.length + 2;
        await updateDoc(commentDocRef, {
            downvotes: newCommentDownvotes,
            upvotes: newCommentUpvotes,
            netvotes: newCommentNetvotes,
        });

        isUpvoted = true;
    } else if (upvotedComments.includes(comment_id)) { // user already upvoted this comment
        newUpvotedComments = upvotedComments.filter((id: string) => id !== comment_id);
        await updateDoc(userDocRef, {
            upvotedComments: newUpvotedComments,
        });

        newCommentUpvotes = upvotes.filter((id: string) => id !== uid);
        newCommentNetvotes = upvotes.length - downvotes.length - 1;
        await updateDoc(commentDocRef, {
            upvotes: newCommentUpvotes,
            netvotes: newCommentNetvotes,
        });

        isUpvoted = false;
    } else { // User has not voted on this comment
        newUpvotedComments = [...upvotedComments, comment_id];
        await updateDoc(userDocRef, {
            upvotedComments: newUpvotedComments,
        });

        newCommentUpvotes = [...upvotes, uid];
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

    let newDownvotedComments = downvotedComments ?? [];
    let newUpvotedComments = upvotedComments ?? [];
    let newCommentDownvotes: string[] = downvotes;
    let newCommentUpvotes: string[] = upvotes;
    let newCommentNetvotes: number = upvotes - downvotes;

    if (upvotedComments.includes(comment_id)) {
        newUpvotedComments = upvotedComments.filter((id: string) => id !== comment_id);
        newDownvotedComments = [...downvotedComments, comment_id];
        await updateDoc(userDocRef, {
            upvotedComments: newUpvotedComments,
            downvotedComments: newDownvotedComments,
        });

        newCommentUpvotes = upvotes.filter((id: string) => id !== uid);
        newCommentDownvotes = [...downvotes, uid]
        newCommentNetvotes = upvotes.length - downvotes.length - 2;
        await updateDoc(commentDocRef, {
            upvotes: newCommentUpvotes,
            downvotes: newCommentDownvotes,
            netvotes: newCommentNetvotes,
        });

        isDownvoted = true;
    } else if (downvotedComments.includes(comment_id)) { // user already downvoted this comment
        newDownvotedComments = downvotedComments.filter((id: string) => id !== comment_id);
        await updateDoc(userDocRef, {
            downvotedComments: newDownvotedComments,
        });

        newCommentDownvotes = downvotes.filter((id: string) => id !== uid);
        newCommentNetvotes = upvotes.length - downvotes.length + 1;
        await updateDoc(commentDocRef, {
            downvotes: newCommentDownvotes,
            netvotes: newCommentNetvotes,
        });

        isDownvoted = false;
    } else { // User has not voted on this comment
        newDownvotedComments = [...downvotedComments, comment_id];
        await updateDoc(userDocRef, {
            downvotedComments: newDownvotedComments,
        });

        newCommentDownvotes = [...downvotes, uid];
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

