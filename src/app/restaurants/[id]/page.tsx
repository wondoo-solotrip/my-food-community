import type { Metadata } from 'next';

import { RestaurantDetailView } from './restaurant-detail-view';

export const metadata: Metadata = { title: '맛집 상세 | 구로 맛집 지도' };

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;
  return <RestaurantDetailView id={id} />;
}
