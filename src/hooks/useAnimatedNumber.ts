import { useState, useEffect, useRef, useCallback } from 'react';

export const useAnimatedNumber = (initialTarget: number, defaultDuration: number = 1500) => {
  const [displayValue, setDisplayValue] = useState(initialTarget);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevValueRef = useRef(initialTarget);
  const animFrameRef = useRef<number | null>(null);

  const startAnimation = useCallback((startVal: number, endVal: number, duration: number) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    setIsAnimating(true);
    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic formula for smooth decelerating count-up
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
        setIsAnimating(false);
        setIsRefreshing(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateNumber);
  }, []);

  const refreshFromOne = useCallback((newTarget: number, durationMs: number = 5000) => {
    setIsRefreshing(true);
    setDisplayValue(1);
    prevValueRef.current = 1;
    startAnimation(1, newTarget, durationMs);
  }, [startAnimation]);

  useEffect(() => {
    if (!isRefreshing && prevValueRef.current !== initialTarget) {
      startAnimation(prevValueRef.current, initialTarget, defaultDuration);
    }
  }, [initialTarget, isRefreshing, startAnimation, defaultDuration]);

  return { displayValue, isAnimating, isRefreshing, refreshFromOne };
};

