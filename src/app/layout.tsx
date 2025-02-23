import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "语境 Flow",
  description: "通过真实场景学习英语",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
