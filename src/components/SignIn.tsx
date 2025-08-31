"use client";

import { auth } from "../lib/firebaseClient";
import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";

export default function SignIn({ user }: { user: User | null }) {
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <>
          <p>👋 Welcome, {user.displayName}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={signIn}>Sign in with Google</button>
      )}
    </div>
  );
}
