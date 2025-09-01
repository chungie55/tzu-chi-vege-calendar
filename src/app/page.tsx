"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebaseClient";
import Calendar from "./Calendar";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import Link from "next/link";

const UNIT_OPTIONS = [
  "妙音组",
  "妙手组",
  "戏剧组",
  "护经藏团队",
];

export default function Page() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch profile after login
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    const ref = doc(db, "profiles", user.uid);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setProfile(null);
        }
      })
      .finally(() => setProfileLoading(false));
    
    // Listen for live updates
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile(null);
      }
    });

    // Update last login timestamp
    setDoc(ref, { lastLogin: serverTimestamp() }, { merge: true });

    return () => unsub();
  }, [user]);

  // Handle profile form submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !unit) {
      setError("Please enter your name and select your unit.");
      return;
    }
    try {
      const ref = doc(db, "profiles", user!.uid);
      await setDoc(ref, {
        uid: user!.uid,
        email: user!.email,
        name,
        unit,
        isAdmin: false,
        joinedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }, { merge: true });
      setProfile({ uid: user!.uid, email: user!.email, name, unit, isAdmin: false });
    } catch (err: any) {
      setError("Failed to save profile.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "40vh",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "2rem",
            textAlign: "center",
            maxWidth: "350px",
            width: "100%",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem" }}>Welcome!</h2>
          <button
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
            className="gsi-material-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "6px",
              background: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              cursor: "pointer",
              fontSize: "1rem",
              margin: "0 auto",
            }}
          >
            <span
              className="gsi-material-button-icon"
              style={{ display: "flex", alignItems: "center" }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ width: 24, height: 24, display: "block" }}
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </span>
            <span className="gsi-material-button-contents">Sign in with Google</span>
          </button>
        </div>
      </div>
    );

  // Show profile form if profile doesn't exist
  if (profileLoading) return <p>Loading profile...</p>;
  if (user && !profile)
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "2rem auto",
          padding: "2rem",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Complete Your Profile</h2>
        <form onSubmit={handleProfileSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Name<br />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "0.25rem",
                }}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Unit<br />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "0.25rem",
                }}
                required
              >
                <option value="">Select your unit</option>
                {UNIT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
          </div>
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "6px",
              border: "none",
              background: "#4caf50",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Save Profile
          </button>
        </form>
      </div>
    );

  return (
    <div>
      <div style={{ textAlign: "right", margin: "1rem 0", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        {profile?.isAdmin && (
          <Link href="/Admin">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              style={{ marginLeft: "0.5rem" }}
            >
              Admin
            </button>
          </Link>
        )}
        <button
          onClick={() => signOut(auth)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          Logout
        </button>
      </div>
      <Calendar />
    </div>
  );
}
