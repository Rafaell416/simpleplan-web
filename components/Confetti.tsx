'use client';

import { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      // Dynamically import canvas-confetti
      // @ts-ignore - canvas-confetti types will be available after installation
      import('canvas-confetti').then((confettiModule) => {
        // Handle both default and named exports
        const confetti = confettiModule.default || confettiModule;
        
        // Basic confetti cannon according to canvas-confetti documentation
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }).catch((error) => {
        console.error('Failed to load canvas-confetti. Please install it: npm install canvas-confetti', error);
      });

      // Reset trigger flag after animation completes
      const timer = setTimeout(() => {
        hasTriggeredRef.current = false;
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (!trigger) {
      hasTriggeredRef.current = false;
    }
  }, [trigger]);

  return null;
}

