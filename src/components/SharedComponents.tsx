import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { T42, Fonts } from '../theme/theme';
import type { PartnerProvider } from '../models/types';

export function SectionHeader({ title }: { title: string }) {
  return <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginBottom: 4 }]}>{title}</Text>;
}

export function TagChip({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
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
    </TouchableOpacity>
  );
}

export function GoldButton({
  label, icon, onPress, disabled, loading,
}: {
  label: string; icon?: string; onPress: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85}>
      <LinearGradient
        colors={[T42.gold, T42.goldDeep]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.primaryBtn, disabled && { opacity: 0.4 }]}
      >
        {icon ? <Text style={{ marginRight: 6 }}>{icon}</Text> : null}
        <Text style={[Fonts.headline, { color: T42.onGold }]}>{loading ? 'Loading...' : label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function GhostButton({
  label, onPress, tint,
}: {
  label: string; onPress: () => void; tint?: string;
}) {
  const color = tint ?? T42.purple;
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.7}
      style={[styles.primaryBtn, { borderWidth: 1.5, borderColor: color + '99' }]}
    >
      <Text style={[Fonts.headline, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

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

export function PartnerBadge({ provider }: { provider: PartnerProvider }) {
  return (
    <View style={[styles.partnerBadge]}>
      <Ionicons name="link-outline" size={10} color={T42.purple} style={{ marginRight: 3 }} />
      <Text style={[Fonts.caption2, { color: T42.purple }]}>via {provider}</Text>
    </View>
  );
}

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

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

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

export function IconLabel({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name={icon} size={18} color={color ?? T42.textSecondary} />
      <Text style={[Fonts.subheadline, { color: color ?? T42.textPrimary }]}>{label}</Text>
    </View>
  );
}

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
