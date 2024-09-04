import firebase_app from "../config";
import {createUserWithEmailAndPassword, getAuth, updateProfile, UserCredential} from "firebase/auth";
import { FirebaseError } from "firebase/app";

// Initialize authentication
const auth = getAuth(firebase_app);

// Define the return type for the signUp function
interface SignUpResult {
    result: UserCredential | null;
    error: FirebaseError | null;
}

// Define the signUp function with proper typing
export default async function signUp(email: string, password: string, displayName: string): Promise<SignUpResult> {
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
