import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile, 
    onAuthStateChanged,
    GoogleAuthProvider, // NEW: Import GoogleAuthProvider
    signInWithPopup     // NEW: Import signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This onAuthStateChanged listener is perfect! It will automatically
        // pick up changes from any sign-in method (email/password or Google).
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // When a user signs in (or their state changes),
                // we check if their profile exists in Firestore.
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                let userData = {};
                if (userDoc.exists()) {
                    userData = userDoc.data();
                } else {
                    // If the user just signed up with Google and this is their first time,
                    // or if their data isn't in Firestore for some reason,
                    // we create a basic entry for them.
                    userData = {
                        uid: firebaseUser.uid,
                        fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0], // Use displayName from Google, or part of email
                        email: firebaseUser.email,
                        createdAt: new Date()
                        // You can add more default fields here if needed
                    };
                    await setDoc(userDocRef, userData, { merge: true }); // Use merge to avoid overwriting existing fields
                }
                setUser({ ...firebaseUser, ...userData });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const register = async (email, password, fullName) => {
        // Your existing register function is good!
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        const userDocRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            fullName,
            email,
            createdAt: new Date()
        });
        // The onAuthStateChanged listener above will handle setting the `user` state.
        return userCredential;
    };

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    // NEW: Function to handle Google Sign-In
    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            // signInWithPopup opens a new window for Google authentication.
            // When successful, onAuthStateChanged will detect the user and populate your state.
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google:", error.message);
            // You can add more specific error handling here based on error.code
            throw error; // Re-throw the error so UI components can catch it.
        }
    };

    // Update the value object to include the new signInWithGoogle function
    const value = { user, loading, register, login, logout, signInWithGoogle };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);