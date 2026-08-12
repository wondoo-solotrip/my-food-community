/**
 * PWA 에셋 생성 스크립트.
 *
 * 루트의 `logo.svg`(1024×1024, 흰 배경 사각형 포함)를 원본으로:
 *  - `src/app/icon.svg`        — 투명 배경 파비콘(SVG). 마크 중심으로 viewBox를 좁힌다.
 *  - `src/app/favicon.ico`     — 투명 배경 파비콘(16/32/48 PNG를 담은 ICO).
 *  - `src/app/apple-icon.png`  — iOS 홈 화면 아이콘(180×180, 흰 배경).
 *  - `public/icons/…`          — manifest용 아이콘(192/512, any는 투명·maskable은 흰 배경).
 *  - `public/splash/…`         — iOS 스플래시(기기별 해상도, 흰 배경 중앙 로고).
 *  - `src/lib/pwa-splash.ts`   — layout 메타데이터가 쓰는 apple-touch-startup-image 목록.
 *
 * 실행: node scripts/generate-pwa-assets.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');

/** 스플래시·maskable 아이콘의 바탕색. manifest `background_color`와 맞춘다. */
const SPLASH_BG = '#ffffff';

/** 원본 캔버스에 깔린 흰 배경 사각형. 투명 변형을 만들 때 제거한다. */
const WHITE_BG_PATH = '<path fill="white" d="M0 0L1024 0L1024 1024L0 1024L0 0Z"/>';

/**
 * iOS 기기별 스플래시 목록(세로 기준).
 * w/h는 이미지 픽셀, dw/dh/r은 media query의 CSS 포인트와 배율.
 */
const SPLASH_DEVICES = [
  { w: 750, h: 1334, dw: 375, dh: 667, r: 2 }, // iPhone 8 / SE 2·3
  { w: 828, h: 1792, dw: 414, dh: 896, r: 2 }, // iPhone XR / 11
  { w: 1125, h: 2436, dw: 375, dh: 812, r: 3 }, // iPhone X / XS / 11 Pro / 12·13 mini
  { w: 1170, h: 2532, dw: 390, dh: 844, r: 3 }, // iPhone 12 / 13 / 14
  { w: 1179, h: 2556, dw: 393, dh: 852, r: 3 }, // iPhone 14 Pro / 15 / 16
  { w: 1206, h: 2622, dw: 402, dh: 874, r: 3 }, // iPhone 16 Pro
  { w: 1242, h: 2688, dw: 414, dh: 896, r: 3 }, // iPhone XS Max / 11 Pro Max
  { w: 1284, h: 2778, dw: 428, dh: 926, r: 3 }, // iPhone 12·13 Pro Max / 14 Plus
  { w: 1290, h: 2796, dw: 430, dh: 932, r: 3 }, // iPhone 14 Pro Max / 15 Plus·Pro Max / 16 Plus
  { w: 1320, h: 2868, dw: 440, dh: 956, r: 3 }, // iPhone 16 Pro Max
  { w: 1488, h: 2266, dw: 744, dh: 1133, r: 2 }, // iPad mini 6
  { w: 1536, h: 2048, dw: 768, dh: 1024, r: 2 }, // iPad 9.7"
  { w: 1620, h: 2160, dw: 810, dh: 1080, r: 2 }, // iPad 10.2"
  { w: 1640, h: 2360, dw: 820, dh: 1180, r: 2 }, // iPad Air 10.9"
  { w: 1668, h: 2388, dw: 834, dh: 1194, r: 2 }, // iPad Pro 11"
  { w: 2048, h: 2732, dw: 1024, dh: 1366, r: 2 }, // iPad Pro 12.9"
];

/** 16바이트 디렉터리 엔트리 + PNG 데이터로 구성된 ICO 컨테이너를 만든다. */
function pngsToIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, buf } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
}

async function main() {
  const rawSvg = await readFile(path.join(ROOT, 'logo.svg'), 'utf8');

  // C2PA 메타데이터 블롭은 렌더링에 불필요하고 용량만 크다.
  const cleanSvg = rawSvg.replace(/<metadata>[\s\S]*?<\/metadata>/, '');

  const transparentSvg = cleanSvg.replace(WHITE_BG_PATH, '');
  if (transparentSvg === cleanSvg) {
    throw new Error('logo.svg에서 흰 배경 패스를 찾지 못했다. WHITE_BG_PATH를 갱신할 것.');
  }

  // 투명 변형을 렌더한 뒤 trim으로 마크의 바운딩 박스를 구한다.
  const full = sharp(Buffer.from(transparentSvg)).png();
  const { info: trimInfo } = await full
    .clone()
    .trim()
    .toBuffer({ resolveWithObject: true });
  const markLeft = -trimInfo.trimOffsetLeft;
  const markTop = -trimInfo.trimOffsetTop;
  const markW = trimInfo.width;
  const markH = trimInfo.height;

  // 마크를 중심으로 한 정사각형(여백 10%). 파비콘·아이콘·스플래시가 공유하는 프레임.
  const side = Math.min(1024, Math.ceil(Math.max(markW, markH) * 1.1));
  const cx = markLeft + markW / 2;
  const cy = markTop + markH / 2;
  const sq = {
    left: Math.max(0, Math.min(1024 - side, Math.round(cx - side / 2))),
    top: Math.max(0, Math.min(1024 - side, Math.round(cy - side / 2))),
    width: side,
    height: side,
  };

  // 마크 정사각형 렌더(투명 배경). 이후 모든 래스터 출력의 원본.
  const markSquare = await full.clone().extract(sq).toBuffer();

  const markAt = (size) =>
    sharp(markSquare).resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

  /** 흰 배경 canvas×canvas 위에 마크를 logoRatio 크기로 중앙 배치한다. */
  const onWhite = async (canvasW, canvasH, logoRatio) => {
    const logoSize = Math.round(Math.min(canvasW, canvasH) * logoRatio);
    const logo = await markAt(logoSize).png().toBuffer();
    return sharp({
      create: { width: canvasW, height: canvasH, channels: 3, background: SPLASH_BG },
    })
      .composite([{ input: logo, gravity: 'centre' }])
      .png();
  };

  // 1) SVG 파비콘 — viewBox를 마크 정사각형으로 좁혀 작은 크기에서도 읽히게 한다.
  const iconSvg = transparentSvg
    .replace(/width="1024" height="1024" viewBox="0 0 1024 1024"/, `viewBox="${sq.left} ${sq.top} ${side} ${side}"`);
  if (iconSvg === transparentSvg) throw new Error('logo.svg의 viewBox 치환에 실패했다.');
  await writeFile(path.join(ROOT, 'src/app/icon.svg'), iconSvg);

  // 2) ICO 파비콘 — 투명 배경 PNG 16/32/48.
  const icoPngs = [];
  for (const size of [16, 32, 48]) {
    icoPngs.push({ size, buf: await markAt(size).png().toBuffer() });
  }
  await writeFile(path.join(ROOT, 'src/app/favicon.ico'), pngsToIco(icoPngs));

  // 3) iOS 홈 화면 아이콘 — 투명이면 iOS가 검정으로 채우므로 흰 배경을 깐다.
  await (await onWhite(180, 180, 0.78)).toFile(path.join(ROOT, 'src/app/apple-icon.png'));

  // 4) manifest 아이콘.
  const iconsDir = path.join(ROOT, 'public/icons');
  await mkdir(iconsDir, { recursive: true });
  for (const size of [192, 512]) {
    await markAt(size).png().toFile(path.join(iconsDir, `icon-${size}.png`));
    // maskable은 가장자리가 잘려도 되도록 안전 영역(중앙 80%) 안에 마크를 둔다.
    await (await onWhite(size, size, 0.66)).toFile(path.join(iconsDir, `icon-maskable-${size}.png`));
  }

  // 5) iOS 스플래시 + 메타데이터 목록.
  const splashDir = path.join(ROOT, 'public/splash');
  await mkdir(splashDir, { recursive: true });
  const startupImages = [];
  for (const { w, h, dw, dh, r } of SPLASH_DEVICES) {
    const file = `apple-splash-${w}x${h}.png`;
    await (await onWhite(w, h, 0.3)).toFile(path.join(splashDir, file));
    startupImages.push({
      url: `/splash/${file}`,
      media: `(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`,
    });
  }

  const ts = `/**
 * iOS 스플래시(apple-touch-startup-image) 목록.
 *
 * scripts/generate-pwa-assets.mjs가 생성한다 — 직접 수정하지 말 것.
 * 기기 목록을 바꾸려면 스크립트의 SPLASH_DEVICES를 고치고 다시 실행한다.
 */
export const appleStartupImages = ${JSON.stringify(startupImages, null, 2)};
`;
  await writeFile(path.join(ROOT, 'src/lib/pwa-splash.ts'), ts);

  console.log(`mark bbox: ${markW}×${markH} @ (${markLeft}, ${markTop}) → square ${side}px @ (${sq.left}, ${sq.top})`);
  console.log(`generated: icon.svg, favicon.ico, apple-icon.png, ${2 * 2} manifest icons, ${SPLASH_DEVICES.length} splash images`);
}

await main();
