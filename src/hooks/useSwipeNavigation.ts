import { useEffect, type RefObject } from 'react';

const SWIPE_THRESHOLD_PX = 60;
const SWIPE_MAX_VERTICAL_DRIFT_PX = 80;

interface SwipeHandlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * Recognizes a horizontal two-finger swipe on the given element for page
 * navigation. Deliberately ignores single-touch/pen input so it never
 * competes with drawing.
 */
export function useSwipeNavigation(ref: RefObject<HTMLElement | null>, { onSwipeLeft, onSwipeRight }: SwipeHandlers): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) {
        tracking = false;
        return;
      }
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dy) > SWIPE_MAX_VERTICAL_DRIFT_PX) return;
      if (dx > SWIPE_THRESHOLD_PX) {
        onSwipeRight();
      } else if (dx < -SWIPE_THRESHOLD_PX) {
        onSwipeLeft();
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
}
