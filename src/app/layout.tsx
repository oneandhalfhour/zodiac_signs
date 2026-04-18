import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘의 띠별 운세",
  description: "당신의 생년월일과 띠로 알아보는 매일매일의 운세",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
