"use client";

import { useEffect, useState } from "react";

export default function Countdown() {
  const [daysLeft, setDaysLeft] = useState(0);

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

  return <p>⏳ Days left until 26 Dec: {daysLeft}</p>;
}
