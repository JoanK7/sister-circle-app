import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                setUser(userDoc.exists() ? { ...firebaseUser, ...userDoc.data() } : firebaseUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const register = async (email, password, fullName, role = 'mentee') => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        const userDocRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            fullName,
            email,
            role,
            createdAt: new Date()
        });
        return userCredential;
    };

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        // Check if user document exists, if not create one
        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                uid: result.user.uid,
                fullName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                role: 'mentee',
                createdAt: new Date()
            });
        }
        
        return result;
    };
    
    const logout = () => signOut(auth);

    const value = { user, loading, register, login, logout, signInWithGoogle };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);