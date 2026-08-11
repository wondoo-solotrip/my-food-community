/**
 * Demo data for the hi-fi handoff. Copy comes straight from design.pen — the
 * first restaurant carries the full detail-page story; the rest fill the same
 * layout so every card links somewhere real.
 */

export interface Restaurant {
  id: string;
  name: string;
  /** 카드 메타 라인 — 동네·골목 힌트. */
  area: string;
  /** 카드·목록 썸네일. */
  image: string;
  /** 상세 페이지 히어로 사진. */
  heroImage: string;
  /** 히어로 사진 카운터의 전체 장수 (예: 1/5). */
  photoCount: number;
  /** "왜 숨은 맛집인가요?" 본문. */
  story: string;
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: '골목 끝 화덕 생선구이',
    area: '주차장 뒤편 작은 문',
    image: '/images/grilled-fish.png',
    heroImage: '/images/grilled-fish-hero.png',
    photoCount: 5,
    story:
      '시장 뒷골목 안쪽이라 검색으로는 잘 안 보이지만, 점심시간마다 동네 가족 손님이 먼저 차는 곳이에요. 음식은 화덕에서 한 번 더 구워 비린내가 적고, 반찬은 아이가 먹기에도 자극적이지 않습니다.',
  },
  {
    id: '2',
    name: '시장 안쪽 손칼국수',
    area: '구로시장',
    image: '/images/kalguksu.png',
    heroImage: '/images/kalguksu.png',
    photoCount: 3,
    story:
      '구로시장 중앙 통로에서 한 번 꺾어 들어가야 보이는 집이에요. 매일 아침 반죽해 썰어 두는 면이 금방 동나서, 늦은 오후에는 국수가 없는 날도 있습니다.',
  },
  {
    id: '3',
    name: '밤길 와인 식탁',
    area: '고척동',
    image: '/images/wine-table.png',
    heroImage: '/images/wine-table.png',
    photoCount: 4,
    story:
      '주택가 골목 안 간판 없는 작은 식탁이에요. 여덟 자리뿐이라 조용히 이야기하기 좋고, 주인장이 그날 들어온 재료로 안주 두세 가지만 준비합니다.',
  },
  {
    id: '4',
    name: '철길 옆 돈가스',
    area: '오류동',
    image: '/images/tonkatsu.png',
    heroImage: '/images/tonkatsu.png',
    photoCount: 4,
    story:
      '기찻길 방음벽 바로 옆이라 지나치기 쉬운 자리지만, 두툼한 등심을 매일 아침 손질해 튀겨냅니다. 소스보다 소금을 먼저 권하는 집이에요.',
  },
  {
    id: '5',
    name: '비 오는 날 시흥 손칼국수',
    area: '시흥동',
    image: '/images/kalguksu-rainy.png',
    heroImage: '/images/kalguksu-rainy.png',
    photoCount: 3,
    story:
      '비 오는 날이면 동네 어르신들이 줄을 서는 집이에요. 멸치 육수를 하루 전날부터 우려내고, 겉절이는 주문이 들어올 때마다 무쳐 내옵니다.',
  },
  {
    id: '6',
    name: '광명 밤일마을 작은 카페',
    area: '광명 밤일마을',
    image: '/images/bamil-cafe.png',
    heroImage: '/images/bamil-cafe.png',
    photoCount: 4,
    story:
      '마을 안길 끝, 오래된 창고를 고친 카페예요. 팥빙수와 커피 두 가지가 전부지만 창밖으로 보이는 밤일마을 풍경 때문에 다시 찾게 됩니다.',
  },
];

export function getRestaurant(id: string): Restaurant | undefined {
  return RESTAURANTS.find((restaurant) => restaurant.id === id);
}

/** 메인 페이지 "오늘의 숨은 맛집" 그리드에 노출되는 4곳. */
export const HIDDEN_PICKS = RESTAURANTS.slice(0, 4);

export interface MyPost {
  restaurantId: string;
  title: string;
  /** 작성일 — 디자인 표기 그대로 (예: 2026. 07. 28). */
  date: string;
  image: string;
}

export const MY_POSTS: MyPost[] = [
  {
    restaurantId: '1',
    title: '골목 끝 화덕 생선구이',
    date: '2026. 07. 28',
    image: '/images/grilled-fish-thumb.png',
  },
  {
    restaurantId: '5',
    title: '비 오는 날 시흥 손칼국수',
    date: '2026. 07. 21',
    image: '/images/kalguksu-rainy.png',
  },
  {
    restaurantId: '6',
    title: '광명 밤일마을 작은 카페',
    date: '2026. 07. 14',
    image: '/images/bamil-cafe.png',
  },
];
