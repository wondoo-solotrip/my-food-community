import type { Metadata } from 'next';

import { RestaurantEditView } from './restaurant-edit-view';

export const metadata: Metadata = { title: '맛집 수정 | 구로 맛집 지도' };

interface RestaurantEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantEditPage({ params }: RestaurantEditPageProps) {
  const { id } = await params;
  return <RestaurantEditView id={id} />;
}
