"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebaseClient";
import Calendar from "./Calendar";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Page() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (!user)
    return (
      <button
        onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Sign in with Google
      </button>
    );

  return <Calendar user={user} />;
}
