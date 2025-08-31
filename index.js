// pages/index.js
import { useEffect, useState } from "react";
import { auth } from "../lib/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SignInButton from "../components/SignInButton";
import CheckInButton from "../components/CheckInButton";
import ProgressBar from "../components/ProgressBar";
import Countdown from "../components/Countdown";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  return (
    <main style={{padding: 24, fontFamily: "system-ui, sans-serif"}}>
      <h1>Vegetarian Check-In</h1>
      <Countdown />
      {user ? (
        <>
          <p>Signed in as {user.displayName || user.email}</p>
          <button onClick={() => signOut(auth)}>Sign out</button>
          <hr />
          <CheckInButton user={user} />
          <div style={{height: 12}} />
          <ProgressBar user={user} total={108} />
        </>
      ) : (
        <>
          <p>Please sign in to check in and see your progress.</p>
          <SignInButton />
        </>
      )}
    </main>
  );
}

