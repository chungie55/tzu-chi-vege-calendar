"use client";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";

export default function ProgressBar({ user }: { user: User | null }) {
  const [progress, setProgress] = useState(0);
  const targetDays = 108;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      const q = query(collection(db, "checkins"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      setProgress(snapshot.size);
    };
    fetchProgress();
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <p>Progress: {progress} / {targetDays} days</p>
      <progress value={progress} max={targetDays}></progress>
    </div>
  );
}
