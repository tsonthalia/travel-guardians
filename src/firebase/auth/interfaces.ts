import { FirebaseError } from "firebase/app";
import {UserCredential} from "firebase/auth";

export interface LogoutResult {
    success: boolean;
    authError: FirebaseError | null;
}

export interface SignInResult {
    result: UserCredential | null;
    authError: FirebaseError | null;
}
