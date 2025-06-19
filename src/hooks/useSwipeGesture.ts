import { useRef } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventDefaultTouchmove?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    preventDefaultTouchmove = true,
    onSwipeStart,
    onSwipeEnd
  } = options;

  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const isMouseDown = useRef<boolean>(false);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isSwiping.current = false;
    onSwipeStart?.();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX.current || !startY.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = startX.current - currentX;
    const diffY = startY.current - currentY;

    // Check if this is more of a horizontal swipe than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      isSwiping.current = true;
      if (preventDefaultTouchmove) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX.current || !isSwiping.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = startX.current - touchEndX;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swiped left
        onSwipeLeft?.();
      } else {
        // Swiped right
        onSwipeRight?.();
      }
    }

    // Reset
    startX.current = 0;
    startY.current = 0;
    isSwiping.current = false;
    onSwipeEnd?.();
  };

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isMouseDown.current = true;
    isSwiping.current = false;
    onSwipeStart?.();
    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !startX.current || !startY.current) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const diffX = startX.current - currentX;
    const diffY = startY.current - currentY;

    // Check if this is more of a horizontal swipe than vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      isSwiping.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !startX.current || !isSwiping.current) {
      isMouseDown.current = false;
      return;
    }

    const mouseEndX = e.clientX;
    const diffX = startX.current - mouseEndX;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swiped left
        onSwipeLeft?.();
      } else {
        // Swiped right
        onSwipeRight?.();
      }
    }

    // Reset
    startX.current = 0;
    startY.current = 0;
    isSwiping.current = false;
    isMouseDown.current = false;
    onSwipeEnd?.();
  };

  const handleMouseLeave = () => {
    // Reset when mouse leaves the element
    startX.current = 0;
    startY.current = 0;
    isSwiping.current = false;
    isMouseDown.current = false;
  };

  const swipeHandlers = {
    // Touch events for mobile
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    // Mouse events for desktop testing
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    // Prevent context menu on long press/click
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

  return swipeHandlers;
} 