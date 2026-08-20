import type { Metadata, Viewport } from "next";
import "./globals.css";

import { appleStartupImages } from "@/lib/pwa-splash";
import { AppPwaInstallBanner } from "./_components/pwa-install-banner";

export const metadata: Metadata = {
  title: "구로 맛집 지도",
  description: "구로 이웃이 직접 다녀온 숨은 맛집을 사진과 지도로 만나보세요.",
  // iOS 홈 화면 설치(standalone) + 기기별 스플래시. 안드로이드 스플래시는
  // manifest.ts(배경색·512 아이콘)로 자동 생성된다.
  appleWebApp: {
    capable: true,
    title: "구로 맛집 지도",
    statusBarStyle: "default",
    startupImage: appleStartupImages,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  // 앱처럼 쓰이는 화면이라 핀치·더블탭 줌을 막는다(제품 결정).
  // iOS Safari 브라우저 탭에서는 무시될 수 있지만 홈 화면 설치(standalone)
  // 상태에서는 적용된다.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className="min-h-full flex flex-col">
        {/* 크롬은 beforeinstallprompt를 하이드레이션보다 먼저 쏠 수 있어, 리액트가
            뜨기 전에 이벤트를 붙잡아 두지 않으면 설치 배너가 영영 못 뜬다.
            next/script(beforeInteractive)는 런타임 청크 로드 후에야 인라인
            코드를 실행하므로, HTML 파싱 즉시 실행되는 원시 script를 쓴다.
            소비는 _components/pwa-install-banner.tsx가 한다. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaInstallPrompt=e;window.dispatchEvent(new Event('pwa:install-prompt-captured'));});`,
          }}
        />
        {children}
        <AppPwaInstallBanner />
      </body>
    </html>
  );
}
