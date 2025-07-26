
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebaseConfig"

// Type for the context value
type AuthContextType = {
    user: User | null;
    loading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        })
        return () => unsubscribe();
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
