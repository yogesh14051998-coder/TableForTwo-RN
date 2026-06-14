import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { T42 } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 15, friction: 5, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.timing(screenOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[s.root, { opacity: screenOpacity }]}>
      <Animated.Image
        source={require('../../../assets/logo.jpeg')}
        style={[s.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: width * 0.8, height: width * 0.65 },
});
