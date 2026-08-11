'use client';

/**
 * App-level wiring around the design system's `TopNavigation`: turns the
 * `.pen` instances' leading back / trailing search·close slots into router
 * navigation. Purely composition — all visuals live in the component.
 */
import { useRouter } from 'next/navigation';

import { TopNavigation } from '@/components';

export interface AppTopNavProps {
  title: string;
  /** Destination of the leading back button. Omit to hide the slot. */
  backHref?: string;
  /** Trailing icon action (`search`, `close`, …). Omit to hide the slot. */
  trailing?: { icon: string; label: string; href: string };
}

export function AppTopNav({ title, backHref, trailing }: AppTopNavProps) {
  const router = useRouter();

  return (
    <TopNavigation
      title={title}
      leading={
        backHref
          ? { icon: 'arrow-left', label: '뒤로 가기', onClick: () => router.push(backHref) }
          : undefined
      }
      trailing={
        trailing
          ? { icon: trailing.icon, label: trailing.label, onClick: () => router.push(trailing.href) }
          : undefined
      }
    />
  );
}
