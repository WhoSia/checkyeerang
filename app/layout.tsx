import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import NavLinks from "./NavLinks";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "도서부 출석체크",
  description: "도서부 당번 출석과 보충, 결석을 기록하고 관리합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0e151d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col items-center px-4">
        <header className="flex w-full flex-col items-center gap-4 pt-6 pb-6">
          {/* 로고는 라이트 배경용 PNG라서 다크 모드에서는 흰 판 위에 올린다 */}
          <div className="rounded-2xl bg-white px-4 py-2 shadow-[var(--shadow)]">
            <Image src="/logo.png" alt="창원과학고등학교 도서관" width={1160} height={275} priority className="h-auto w-64 sm:w-80" />
          </div>
          <NavLinks />
        </header>
        <main className="flex w-full max-w-2xl flex-1 flex-col items-center pb-16">{children}</main>
      </body>
    </html>
  );
}
