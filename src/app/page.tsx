"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebaseClient";
import Calendar from "./Calendar";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export default function Page() {
  const [user, loading] = useAuthState(auth);

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

  return (
    <div>
      <div style={{ textAlign: "right", margin: "1rem 0" }}>
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
