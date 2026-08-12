'use client';

/**
 * 디자인 시스템의 `PwaInstallBanner`에 실제 설치 동작을 연결한다.
 *
 * - 안드로이드(및 크롬 계열 데스크톱): `beforeinstallprompt`를 붙잡아 두었다가
 *   띠 클릭 시 네이티브 설치 프롬프트를 바로 띄운다. 이벤트가 온 경우에만
 *   배너를 보여 설치 가능함이 보장된다.
 * - iOS: 설치 프롬프트 API가 없으므로 띠 클릭 시 `BottomSheet` 가이드를 띄운다.
 * - 이미 설치된(standalone) 화면이거나 최근에 닫은 경우에는 렌더하지 않는다.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';

import { BottomSheet, PwaInstallBanner, PwaInstallIosGuide } from '@/components';

const DISMISS_STORAGE_KEY = 'pwa-install-banner-dismissed-at';
const DISMISS_FOR_DAYS = 7;

/** 크롬 계열 전용 이벤트라 lib.dom에 타입이 없다. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/**
 * 마운트 시점에 한 번 정해지는 노출 모드. SSR에서는 `server`로 아무것도
 * 그리지 않아 하이드레이션 불일치를 피한다.
 */
type InstallMode = 'server' | 'hidden' | 'ios' | 'await-prompt';

const emptySubscribe = () => () => {};

let cachedMode: InstallMode | null = null;

function detectInstallMode(): InstallMode {
  // 이미 앱으로 실행 중이면(안드로이드 standalone / iOS 홈 화면) 유도할 필요가 없다.
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (isStandalone) return 'hidden';

  const dismissedAt = Number(window.localStorage.getItem(DISMISS_STORAGE_KEY) ?? 0);
  if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_DAYS * 24 * 60 * 60 * 1000) {
    return 'hidden';
  }

  // iPadOS 13+는 데스크톱 Safari로 위장하므로 터치 지원 Mac도 iOS로 본다.
  const ua = window.navigator.userAgent;
  const isIos =
    /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  return isIos ? 'ios' : 'await-prompt';
}

function getInstallMode(): InstallMode {
  cachedMode ??= detectInstallMode();
  return cachedMode;
}

export function AppPwaInstallBanner() {
  const mode = useSyncExternalStore(emptySubscribe, getInstallMode, () => 'server' as const);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (mode !== 'await-prompt') return;
    const handleBeforeInstallPrompt = (event: Event) => {
      // 크롬의 기본 미니 인포바 대신 우리 띠배너로 설치를 유도한다.
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setDismissed(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [mode]);

  const platform =
    mode === 'ios' ? 'ios' : mode === 'await-prompt' && installPrompt ? 'android' : null;
  if (dismissed || !platform) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    setDismissed(true);
    setGuideOpen(false);
  };

  const install = async () => {
    if (platform === 'ios') {
      setGuideOpen(true);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    // 프롬프트는 1회용이라 결과와 무관하게 띠를 접는다. 거절이면 쿨다운을 남긴다.
    if (choice.outcome === 'dismissed') {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    }
    setInstallPrompt(null);
    setDismissed(true);
  };

  return (
    <>
      <PwaInstallBanner
        ctaLabel={platform === 'ios' ? '설치 방법' : '설치'}
        onInstall={install}
        onDismiss={dismiss}
      />
      {guideOpen && (
        <BottomSheet
          title="홈 화면에 추가하기"
          description="Safari에서 아래 순서대로 진행하면 앱처럼 설치돼요."
          className="z-[60]"
          onClose={() => setGuideOpen(false)}
        >
          <PwaInstallIosGuide />
        </BottomSheet>
      )}
    </>
  );
}
