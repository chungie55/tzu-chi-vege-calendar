import "./globals.css";
import type { Metadata } from "next";

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
      <body>
        {children}
      </body>
    </html>
  );
}
