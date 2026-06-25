import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { T42, Fonts } from '../theme/theme';
import type { PartnerProvider } from '../models/types';

// ── Press-scale wrapper ────────────────────────────────────────────────────

export function PressableScale({
  children,
  onPress,
  style,
  disabled,
  scale = 0.96,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  scale?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ── Section header ─────────────────────────────────────────────────────────

export function SectionHeader({ title }: { title: string }) {
  return <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginBottom: 4 }]}>{title}</Text>;
}

// ── Tag chip ───────────────────────────────────────────────────────────────

export function TagChip({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {selected ? (
          <LinearGradient
            colors={[T42.gold, T42.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.chip}
          >
            <Ionicons name="checkmark" size={14} color={T42.onGold} style={{ marginRight: 4 }} />
            <Text style={[Fonts.subheadline, { color: T42.onGold }]}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.chip, { backgroundColor: T42.surfaceRaised, borderWidth: 1, borderColor: T42.stroke }]}>
            <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>{label}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ── Gold button with spring press scale ────────────────────────────────────

export function GoldButton({
  label, icon, onPress, disabled, loading,
}: {
  label: string; icon?: string; onPress: () => void; disabled?: boolean; loading?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const onPressIn = () => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();
  };

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, isDisabled && { opacity: 0.45 }]}>
        <LinearGradient
          colors={[T42.gold, T42.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.primaryBtn}
        >
          {icon ? <Text style={{ marginRight: 6 }}>{icon}</Text> : null}
          <Text style={[Fonts.headline, { color: T42.onGold }]}>{loading ? 'Loading...' : label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ── Ghost button ───────────────────────────────────────────────────────────

export function GhostButton({
  label, onPress, tint,
}: {
  label: string; onPress: () => void; tint?: string;
}) {
  const color = tint ?? T42.purple;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.primaryBtn, { borderWidth: 1.5, borderColor: color + '99' }, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={[Fonts.headline, { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ── Card with optional press scale ─────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function AnimatedCard({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 280, friction: 10 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 280, friction: 10 }).start();

  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ── Countdown pill ─────────────────────────────────────────────────────────

export function CountdownPill({ label, urgent }: { label: string; urgent?: boolean }) {
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Ionicons name="timer-outline" size={14} color={urgent ? '#fff' : T42.onGold} />
      <Text style={[Fonts.caption2, { color: urgent ? '#fff' : T42.onGold, fontVariant: ['tabular-nums'] }]}>
        {label}
      </Text>
    </View>
  );
  if (urgent) {
    return <View style={[styles.pill, { backgroundColor: T42.danger }]}>{inner}</View>;
  }
  return (
    <LinearGradient colors={[T42.gold, T42.goldDeep]} style={styles.pill}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {inner}
    </LinearGradient>
  );
}

// ── Partner badge ──────────────────────────────────────────────────────────

export function PartnerBadge({ provider }: { provider: PartnerProvider }) {
  return (
    <View style={styles.partnerBadge}>
      <Ionicons name="link-outline" size={10} color={T42.purple} style={{ marginRight: 3 }} />
      <Text style={[Fonts.caption2, { color: T42.purple }]}>via {provider}</Text>
    </View>
  );
}

// ── Star rating ────────────────────────────────────────────────────────────

export function StarRating({ rating, onChange }: { rating: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Ionicons
            name={n <= rating ? 'star' : 'star-outline'}
            size={28}
            color={n <= rating ? T42.gold : T42.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Match avatar ───────────────────────────────────────────────────────────

export function MatchAvatar({ name, size = 64 }: { name: string; size?: number }) {
  return (
    <LinearGradient
      colors={[T42.purple, T42.purpleDeep]}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={{ fontSize: size * 0.42, color: '#fff', fontFamily: 'serif', fontWeight: '600' }}>
        {name[0]}
      </Text>
    </LinearGradient>
  );
}

// ── Icon label ─────────────────────────────────────────────────────────────

export function IconLabel({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name={icon} size={18} color={color ?? T42.textSecondary} />
      <Text style={[Fonts.subheadline, { color: color ?? T42.textPrimary }]}>{label}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 50,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
    backgroundColor: T42.purple + '26',
  },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: T42.surface,
    borderWidth: 1,
    borderColor: T42.stroke,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
