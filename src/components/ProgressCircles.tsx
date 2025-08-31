"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import type { User } from "firebase/auth";

const TOTAL = 108;

export default function ProgressCircles({ user }: { user: User }) {
  const [marked, setMarked] = useState<boolean[]>(Array(TOTAL).fill(false));
  const [loading, setLoading] = useState(true);

  // Load from Firestore
  useEffect(() => {
    async function load() {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const count = data.circlesMarked || 0;
        setMarked(Array(count).fill(true).concat(Array(TOTAL - count).fill(false)));
      }
      setLoading(false);
    }
    load();
  }, [user.uid]);

  // Handle toggle
  const toggleCircle = (index: number) => {
    const newMarked = [...marked];
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);
  };

  // Save to Firestore
  const saveProgress = async () => {
    const count = marked.filter(Boolean).length;
    await setDoc(doc(db, "users", user.uid), {
      circlesMarked: count,
    });
    alert("Progress saved!");
  };

  if (loading) return <p>Loading progress...</p>;

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold">
        Progress: {marked.filter(Boolean).length} / {TOTAL}
      </h2>
      <div className="grid grid-cols-12 gap-2">
        {marked.map((isMarked, idx) => (
          <div
            key={idx}
            onClick={() => toggleCircle(idx)}
            className={`w-6 h-6 rounded-full cursor-pointer transition-colors ${
              isMarked ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
      <button
        onClick={saveProgress}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Save Progress
      </button>
    </div>
  );
}

