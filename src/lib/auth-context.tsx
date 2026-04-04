"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

interface DbUser {
  role: "parent" | "caregiver" | "admin" | "moderator" | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  role: "parent" | "caregiver" | "admin" | "moderator" | null;
  dbUser: DbUser | null;
  setRole: (role: "parent" | "caregiver" | "admin" | "moderator" | null) => void;
  setDbUser: (user: DbUser | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  role: null,
  dbUser: null,
  setRole: () => {},
  setDbUser: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"parent" | "caregiver" | "admin" | "moderator" | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  // Sync session cookie whenever auth state changes
  const syncSession = useCallback(async (fbUser: User | null) => {
    if (fbUser) {
      const idToken = await fbUser.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    } else {
      await fetch("/api/auth/session", { method: "DELETE" });
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
        });
        setFirebaseUser(fbUser);
        await syncSession(fbUser);

        // Fetch role + emailVerified from our DB
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            setRole(data.role || null);
            setDbUser({ role: data.role || null, emailVerified: data.emailVerified ?? false });
          }
        } catch {
          // User might not be synced yet
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
        setRole(null);
        await syncSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncSession]);

  const handleSignOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setRole(null);
    setDbUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        role,
        dbUser,
        setRole,
        setDbUser,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
