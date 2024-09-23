import React, { ReactNode, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import firebase_app from '@/firebase/config';

import { UserData } from '@/firebase/firestore/interfaces';
import { getUserData } from '@/firebase/firestore/firestore';

const auth = getAuth(firebase_app);

// Define a context interface to type the value provided by the AuthContext
interface AuthContextType {
    user: User | null;
    userData: UserData | null;
}

// Create a typed context with default value as null
export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext with type safety
export const useAuthContext = (): AuthContextType | undefined => useContext(AuthContext);

// Define props for AuthContextProvider, children should be ReactNode
interface AuthContextProviderProps {
    children: ReactNode;
}

// AuthContextProvider component with type definitions
export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const fetchedUserData = await getUserData(user?.uid);
                setUserData(fetchedUserData);
            } catch (e) {
                console.error(e);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};