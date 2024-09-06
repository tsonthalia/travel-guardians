import firebase_app from "../config";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signOut, updateProfile,
    UserCredential
} from "firebase/auth";
import { SignInResult, LogoutResult } from "./interfaces";
import { FirebaseError } from "firebase/app";
// Initialize authentication
const auth = getAuth(firebase_app);

// Define the signIn function with proper typing
export async function signIn(email: string, password: string): Promise<SignInResult> {
    let result: UserCredential | null = null;
    let error: FirebaseError | null = null;

    try {
        result = await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
        if (e instanceof FirebaseError) {
            error = e;
        } else {
            error = new FirebaseError('unknown/error', 'An unknown error occurred.');
        }
    }

    return { result, error };
}

// Define the signUp function with proper typing
export async function signUp(email: string, password: string, displayName: string): Promise<SignInResult> {
    let result: UserCredential | null = null;
    let error: FirebaseError | null = null;

    try {
        result = await createUserWithEmailAndPassword(auth, email, password);

        // Set the display name for the user after signup
        if (result && result.user) {
            await updateProfile(result.user, {
                displayName: displayName,
            });
        }
    } catch (e) {
        if (e instanceof FirebaseError) {
            error = e;
        } else {
            error = new FirebaseError('unknown/error', 'An unknown error occurred.');
        }
    }

    return { result, error };
}

// Define the logout function with proper typing
export async function logout(): Promise<LogoutResult> {
    let success = false;
    let error: FirebaseError | null = null;

    try {
        await signOut(auth);
        success = true;
    } catch (e) {
        if (e instanceof FirebaseError) {
            error = e;
        } else {
            error = new FirebaseError('unknown/error', 'An unknown error occurred during logout.');
        }
    }

    return { success, error };
}