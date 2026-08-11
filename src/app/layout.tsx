import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "구로 맛집 지도",
  description: "구로 이웃이 직접 다녀온 숨은 맛집을 사진과 지도로 만나보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pretendard is applied through globals.css so stories match the app.
  // suppressHydrationWarning: 브라우저 확장(예: rhwp)이 React가 뜨기 전에
  // <html>에 data-* 속성을 주입해 생기는 하이드레이션 경고를 루트 요소에
  // 한해 무시한다. 자식 요소의 불일치는 여전히 경고된다.
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
