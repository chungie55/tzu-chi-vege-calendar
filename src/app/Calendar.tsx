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

const BANNER_MAX_WIDTH = 800; // px

export default function Calendar() {
  const [user] = useAuthState(auth);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const totalDays = 108;
  const [daysLeft, setDaysLeft] = useState<number>(0);

  // Responsive: months per row
  const [monthsPerRow, setMonthsPerRow] = useState(2);

  useEffect(() => {
    function handleResize() {
      const width = Math.min(window.innerWidth, BANNER_MAX_WIDTH);
      // If width < 600px, show 1 month per row, else 2
      setMonthsPerRow(width < 600 ? 1 : 2);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Split months into rows
  const rows: Array<typeof months> = [];
  for (let i = 0; i < months.length; i += monthsPerRow) {
    rows.push(months.slice(i, i + monthsPerRow));
  }

  return (
    <div
      className="calendar-wrapper"
      style={{
        maxWidth: BANNER_MAX_WIDTH,
        margin: "0 auto",
      }}
    >
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

      {/* Dynamic month rows */}
      {rows.map((row, idx) => (
        <div
          className="months-row"
          key={idx}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {row.map((m) => (
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
      ))}
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
    <div className="month-grid" style={{ flex: 1, minWidth: 0 }}>
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
