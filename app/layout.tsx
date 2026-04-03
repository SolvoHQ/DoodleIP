import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "DoodleIP — 不露脸，也能让别人记住你",
  description: "给内容创作者的专属 IP 生成器。AI 帮你创造独一无二的涂鸦角色。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSansSC.variable} font-sans`}>{children}</body>
    </html>
  );
}
