"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDay } from "date-fns";

const months = [
  { name: "September", year: 2025, month: 8 },
  { name: "October", year: 2025, month: 9 },
  { name: "November", year: 2025, month: 10 },
  { name: "December", year: 2025, month: 11 },
];

export default function Calendar() {
  const [user] = useAuthState(auth);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const totalDays = 108;

  const [daysLeft, setDaysLeft] = useState<number>(0);

  // Load user data
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const ref = doc(db, "checkins", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMarkedDates(snap.data().markedDates || []);
      }
    };
    fetchData();
  }, [user]);

  // Countdown (days only)
  useEffect(() => {
    const target = new Date("2025-12-26T00:00:00+08:00");
    const update = () => {
      const diff = target.getTime() - Date.now();
      setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    update();
    const timer = setInterval(update, 86400000); // update daily
    return () => clearInterval(timer);
  }, []);


  const toggleDate = async (date: string) => {
    if (!user) return;

    const updated = markedDates.includes(date)
      ? markedDates.filter((d) => d !== date)
      : [...markedDates, date];

    setMarkedDates(updated);
    await setDoc(doc(db, "checkins", user.uid), { markedDates: updated }, { merge: true });
  };

  if (!user) return <p>Please log in</p>;

  const progressPercent = Math.min((markedDates.length / totalDays) * 100, 100);

  return (
    <div className="calendar-wrapper">
      <h1>Vegetarian Calendar (Sept – Dec 2025)</h1>

      {/* Progress Bar */}
      <div className="progress-wrapper">
        <div className="progress-label">
          {markedDates.length} / {totalDays} days completed
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Countdown */}
      <div className="countdown">{daysLeft} days left until 26 Dec 2025</div>

      {/* First row: Sept | Oct | Nov */}
      <div className="months-row">
        {months.slice(0, 3).map((m) => (
          <MonthGrid
            key={m.name}
            month={m.month}
            year={m.year}
            name={m.name}
            markedDates={markedDates}
            onToggle={toggleDate}
          />
        ))}
      </div>

      {/* Second row: December aligned under Sept */}
      <div className="months-row second-row">
        <MonthGrid
          month={months[3].month}
          year={months[3].year}
          name={months[3].name}
          markedDates={markedDates}
          onToggle={toggleDate}
        />
        <div className="month-placeholder"></div>
        <div className="month-placeholder"></div>
      </div>
    </div>
  );
}

function MonthGrid({
  name,
  year,
  month,
  markedDates,
  onToggle,
}: {
  name: string;
  year: number;
  month: number;
  markedDates: string[];
  onToggle: (date: string) => void;
}) {
  const firstDay = new Date(year, month, 1);
  const blankDays = getDay(firstDay); // 0 = Sunday, 1 = Monday ...

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="month-grid">
      <h2>{name}</h2>
      <div className="weekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div>
        <div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="days-grid">
        {/* empty placeholders to align 1st day */}
        {Array.from({ length: blankDays }, (_, i) => (
          <div key={"blank-" + i}></div>
        ))}
        {days.map((day) => {
          const dateStr = `${year}-${month + 1}-${day}`;
          const isMarked = markedDates.includes(dateStr);

          return (
            <button
              key={dateStr}
              className={`day-circle ${isMarked ? "marked" : ""}`}
              onClick={() => onToggle(dateStr)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
