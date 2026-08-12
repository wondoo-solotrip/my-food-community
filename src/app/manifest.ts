import type { MetadataRoute } from 'next';

/**
 * 웹 앱 manifest. 안드로이드는 여기의 `name`·`background_color`·512px 아이콘으로
 * 설치 스플래시를 자동 생성한다(iOS 스플래시는 layout의 appleWebApp.startupImage).
 * 아이콘 파일은 scripts/generate-pwa-assets.mjs가 logo.svg에서 만든다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '구로 맛집 지도',
    short_name: '구로 맛집',
    description: '구로 이웃이 직접 다녀온 숨은 맛집을 사진과 지도로 만나보세요.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
