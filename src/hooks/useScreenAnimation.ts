import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useScreenAnimation(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 110,
        friction: 14,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateY, animStyle: { opacity, transform: [{ translateY }] } };
}

export function useStaggerAnimation(count: number, baseDelay = 80) {
  const anims = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(14),
    }))
  ).current;

  useEffect(() => {
    const animations = anims.flatMap((a, i) => [
      Animated.timing(a.opacity, {
        toValue: 1,
        duration: 240,
        delay: i * baseDelay,
        useNativeDriver: true,
      }),
      Animated.spring(a.translateY, {
        toValue: 0,
        tension: 120,
        friction: 14,
        delay: i * baseDelay,
        useNativeDriver: true,
      }),
    ]);
    Animated.parallel(animations).start();
  }, []);

  return anims.map(a => ({ opacity: a.opacity, transform: [{ translateY: a.translateY }] }));
}
