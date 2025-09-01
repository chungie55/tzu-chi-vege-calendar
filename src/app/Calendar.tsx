"use client";
import { useState, useEffect } from "react";
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

  // Flip animation state
  const [flipped, setFlipped] = useState(false);
  const [prevDaysLeft, setPrevDaysLeft] = useState(daysLeft);

  useEffect(() => {
    function handleResize() {
      const width = Math.min(window.innerWidth, BANNER_MAX_WIDTH);
      setMonthsPerRow(width < 600 ? 1 : 2);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (daysLeft !== prevDaysLeft) {
      setFlipped(true);
      setTimeout(() => {
        setFlipped(false);
        setPrevDaysLeft(daysLeft);
      }, 600);
    }
  }, [daysLeft, prevDaysLeft]);

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
      {/* Dharma Assembly Info Box */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          background: "transparent",
          padding: "1rem",
          marginBottom: "1.5rem",
          fontSize: "1rem",
          lineHeight: "1.7",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <strong>📍 法會前 Before the Dharma Assembly</strong>
          <br />
          發願：我願齋戒 108 天，以清淨身心，迎接《無量義經》經藏演繹。<br />
          <span style={{ color: "#555" }}>
            I vow to observe 108 days of fasting and self-discipline, purifying body and mind in preparation for the Dharma Assembly of the Infinite Meanings Sutra.
          </span>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <strong>📍 法會中 During the Dharma Assembly</strong>
          <br />
          每日自我檢視表 Daily Self-Check<br />
          請每日勾選，提醒自己持守齋戒，清淨心念。<br />
          <span style={{ color: "#555" }}>
            Check daily to reflect on your practice of fasting and maintaining purity.
          </span>
        </div>
        <div>
          <strong>📍 法會後 After the Dharma Assembly</strong>
          <br />
          迴向 Dedication of Merits<br />
          願以此持戒清淨之力，廣度有情，社會祥和，天下無災。<br />
          <span style={{ color: "#555" }}>
            May the merits of this pure practice spread to all beings, bringing harmony to society and freedom from calamities throughout the world.
          </span>
        </div>
      </div>

      {/* Progress Bar Box */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          background: "transparent",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="progress-label">
            {markedDates.length} / {totalDays} days completed
          </div>
        </div>
      </div>

      {/* Countdown Flip Card Box */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          background: "transparent",
          padding: "1rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        <div className={`flip-card${flipped ? " flipped" : ""}`}>
          <div className="flip-card-inner">
            <div className="flip-card-front">{prevDaysLeft}</div>
            <div className="flip-card-back">{daysLeft}</div>
          </div>
        </div>
        <div className="flip-label">Days left until 26 Dec 2025</div>
      </div>

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
