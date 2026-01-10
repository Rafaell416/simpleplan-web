'use client';

import { useEffect } from 'react';

export function PreventZoom() {
  useEffect(() => {
    // Prevent double-tap zoom on iOS Safari
    let lastTouchEnd = 0;
    let lastTouchTarget: EventTarget | null = null;
    
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      const timeSinceLastTouch = now - lastTouchEnd;
      
      // Only prevent if it's a double-tap on the same target within 300ms
      if (timeSinceLastTouch > 0 && timeSinceLastTouch < 300 && e.target === lastTouchTarget) {
        e.preventDefault();
        // Trigger a click event if it was a button or link
        if (e.target instanceof HTMLElement) {
          const clickable = e.target.closest('button, a, [role="button"]');
          if (clickable && clickable !== e.target) {
            (clickable as HTMLElement).click();
          }
        }
      }
      
      lastTouchEnd = now;
      lastTouchTarget = e.target;
    };

    // Prevent pinch zoom
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    document.addEventListener('touchstart', preventPinchZoom, { passive: false });

    // Ensure viewport meta tag is always set correctly
    const setViewport = () => {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    };

    // Set viewport on mount and when window resizes
    setViewport();
    window.addEventListener('resize', setViewport);
    window.addEventListener('orientationchange', setViewport);

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom);
      document.removeEventListener('touchstart', preventPinchZoom);
      window.removeEventListener('resize', setViewport);
      window.removeEventListener('orientationchange', setViewport);
    };
  }, []);

  return null;
}

