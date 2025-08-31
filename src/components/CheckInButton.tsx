"use client";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import type { User } from "firebase/auth";
import { useToast } from "./ToastProvider";

export default function CheckInButton({ user }: { user: User | null }) {
  const { addToast } = useToast();

  if (!user) return null;

  const handleCheckIn = async () => {
    try {
      const tz = process.env.NEXT_PUBLIC_TIMEZONE ?? "Asia/Singapore";
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const id = `${user.uid}_${today}`;
      const ref = doc(db, "checkins", id);

      await setDoc(ref, {
        uid: user.uid,
        date: today,
        timestamp: serverTimestamp(),
      });

      addToast("✅ Successfully checked in for " + today);
    } catch (err) {
      console.error("Check-in error:", err);
      addToast("⚠️ Already checked in or error occurred.");
    }
  };

  return <button onClick={handleCheckIn}>✅ Check In Today</button>;
}
