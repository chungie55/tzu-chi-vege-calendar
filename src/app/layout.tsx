import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Vegetarian Challenge",
  description: "108-day vegetarian challenge portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div
          style={{
            width: "100%",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <img
            src="/banner.jpg"
            alt="Vegetarian Challenge Banner"
            style={{
              maxWidth: "800px",
              width: "100%",
              height: "auto",
              display: "block",
              margin: "0 auto",
              borderRadius: "12px",
            }}
          />
        </div>
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 1rem",
          }}
        >
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
