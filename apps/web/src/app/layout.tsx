import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReeL Trip",
  description: "AI 기반 여행지 추천 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
