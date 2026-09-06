import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./memo.css";

export const metadata: Metadata = {
  title: "Tskaltubo Senior Living & Care Development",
  description:
    "Research framework for properties, business concepts and target markets.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
