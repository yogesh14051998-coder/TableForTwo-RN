import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { T42, Fonts } from '../theme/theme';
import type { PackageTier, PartnerProvider } from '../models/types';

// ── Section Header ──

export function SectionHeader({ title }: { title: string }) {
  return <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginBottom: 4 }]}>{title}</Text>;
}

// ── Tag Chip ──

export function TagChip({
  label, icon, selected, onPress,
}: {
  label: string; icon?: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {selected ? (
        <LinearGradient
          colors={[T42.gold, T42.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.chip}
        >
          {icon ? <Text style={{ marginRight: 4 }}>{icon}</Text> : null}
          <Text style={[Fonts.subheadline, { color: T42.onGold }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.chip, { backgroundColor: T42.surfaceRaised, borderWidth: 1, borderColor: T42.stroke }]}>
          {icon ? <Text style={{ marginRight: 4 }}>{icon}</Text> : null}
          <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Gold Primary Button ──

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

// ── Ghost Button ──

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

// ── Countdown Pill ──

export function CountdownPill({ label, urgent }: { label: string; urgent?: boolean }) {
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Text style={{ fontSize: 12 }}>⏱️</Text>
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

// ── Partner Badge ──

export function PartnerBadge({ provider }: { provider: PartnerProvider }) {
  return (
    <View style={[styles.partnerBadge]}>
      <Text style={[Fonts.caption2, { color: T42.purple }]}>via {provider}</Text>
    </View>
  );
}

// ── Tier Badge ──

export function TierBadge({ tier }: { tier: PackageTier }) {
  const ranges: Record<PackageTier, string> = {
    Entry: '$200+', Core: '$400 – $800', 'Premium Luxury': '$1,000+',
  };
  return (
    <View style={styles.tierBadge}>
      <Text style={[Fonts.caption2, { color: T42.gold }]}>👑 {tier} · {ranges[tier]}</Text>
    </View>
  );
}

// ── Star Rating ──

export function StarRating({ rating, onChange }: { rating: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Text style={{ fontSize: 24, color: n <= rating ? T42.gold : T42.textSecondary }}>
            {n <= rating ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Card wrapper ──

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

// ── Match Avatar ──

export function MatchAvatar({ name, size = 64 }: { name: string; size?: number }) {
  return (
    <LinearGradient
      colors={[T42.purple, T42.purpleDeep]}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={{ fontSize: size * 0.45, color: '#fff', fontFamily: 'serif', fontWeight: '600' }}>
        {name[0]}
      </Text>
    </LinearGradient>
  );
}

// ── Styles ──

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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
    backgroundColor: T42.purple + '26',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    backgroundColor: T42.gold + '1F',
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
