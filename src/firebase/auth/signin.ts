import firebase_app from "../config";
import { signInWithEmailAndPassword, getAuth, UserCredential } from "firebase/auth";
import { FirebaseError } from "firebase/app";

// Initialize authentication
const auth = getAuth(firebase_app);

// Define the return type for the signIn function
interface SignInResult {
    result: UserCredential | null;
    error: FirebaseError | null;
}

// Define the signIn function with proper typing
export default async function signIn(email: string, password: string): Promise<SignInResult> {
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
