import { FirebaseError } from "firebase/app";
import {UserCredential} from "firebase/auth";

export interface LogoutResult {
    success: boolean;
    error: FirebaseError | null;
}

export interface SignInResult {
    result: UserCredential | null;
    error: FirebaseError | null;
}