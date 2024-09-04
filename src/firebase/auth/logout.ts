import firebase_app from "../config";
import { getAuth, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";

// Initialize authentication
const auth = getAuth(firebase_app);

// Define the return type for the logout function
interface LogoutResult {
    success: boolean;
    error: FirebaseError | null;
}

// Define the logout function with proper typing
export default async function logout(): Promise<LogoutResult> {
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