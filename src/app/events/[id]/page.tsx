import type { Metadata } from 'next';

import { EventDetailView } from './event-detail-view';

export const metadata: Metadata = { title: '모임 상세 | 구로 맛집 지도' };

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  return <EventDetailView id={id} />;
}
