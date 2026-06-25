import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { GoldButton, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { MatchCandidate, CuratedMatchBatch } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

const AVATAR_COLORS: [string, string][] = [
  ['#9B6CFF', '#5B2DB3'],
  ['#DCB85E', '#A8842F'],
  ['#3FBF8F', '#1A5E3B'],
];

export default function CuratedMatchScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { createCommitment } = useApp();
  const batch: CuratedMatchBatch = route.params.batch;
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleCommit = () => {
    const candidate = batch.candidates.find(c => c.id === selected);
    if (!candidate) return;
    setConfirming(true);
    setTimeout(() => {
      const commitment = createCommitment(candidate, batch.experience, batch.intent);
      nav.navigate('Commitment', { commitment });
    }, 800);
  };

  if (confirming) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <View style={s.confirmingRing}>
          <Ionicons name="heart" size={36} color={T42.gold} />
        </View>
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 20, textAlign: 'center' }]}>
          Preparing your commitment...
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 8 }]}>
          Both parties will be notified. A $50 hold will be placed on each card.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center' }]}>
          Your matches
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 6 }]}>
          {batch.candidates.length} people matched your criteria for this date
        </Text>

        {/* Intent context bar */}
        <View style={s.contextBar}>
          <Ionicons name="location-outline" size={14} color={T42.gold} />
          <Text style={[Fonts.caption, { color: T42.gold, marginLeft: 6 }]}>
            {batch.intent.intentType} · {batch.intent.zipcode} ·{' '}
            {batch.intent.scheduledFor.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Match cards */}
        {batch.candidates.map((candidate, i) => (
          <TouchableOpacity key={candidate.id} activeOpacity={0.85}
            onPress={() => setSelected(candidate.id === selected ? null : candidate.id)}>
            <MatchCard
              candidate={candidate}
              isSelected={selected === candidate.id}
              colors={AVATAR_COLORS[i % AVATAR_COLORS.length]}
            />
          </TouchableOpacity>
        ))}

        {/* AI note */}
        <Card style={{ borderColor: T42.purple + '40' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Ionicons name="sparkles" size={16} color={T42.purple} style={{ marginTop: 2 }} />
            <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1, lineHeight: 18 }]}>
              These profiles were selected by our AI because they meet your stated preferences — height, income, interests, and travel distance. No swiping required.
            </Text>
          </View>
        </Card>

        {/* Commitment explanation */}
        <Card style={{ borderColor: T42.gold + '40' }}>
          <Text style={[Fonts.headline, { color: T42.textPrimary, marginBottom: 10 }]}>How commitment works</Text>
          {[
            { icon: 'card-outline' as const, text: 'When you select a match, a $50 hold is placed on both credit cards' },
            { icon: 'shield-checkmark-outline' as const, text: 'If your match bails without reason, they lose the $50 — this keeps both sides accountable' },
            { icon: 'location-outline' as const, text: 'Venue is revealed only after both parties confirm' },
          ].map(item => (
            <View key={item.text} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
              <Ionicons name={item.icon} size={15} color={T42.gold} style={{ marginTop: 2 }} />
              <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1, lineHeight: 18 }]}>{item.text}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <View style={s.cta}>
        {selected && (
          <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginBottom: 10 }]}>
            Committing to {batch.candidates.find(c => c.id === selected)?.firstName} — $50 hold on both cards
          </Text>
        )}
        <GoldButton
          label="Commit to This Date"
          onPress={handleCommit} disabled={!selected} />
      </View>
    </View>
  );
}

function MatchCard({ candidate, isSelected, colors }: {
  candidate: MatchCandidate; isSelected: boolean; colors: [string, string];
}) {
  return (
    <Card style={[isSelected && { borderColor: T42.gold, borderWidth: 2 }]}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <LinearGradient colors={colors} style={s.avatar}>
          <Text style={s.avatarText}>{candidate.firstName[0]}</Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[Fonts.headline, { color: T42.textPrimary, fontSize: 19 }]}>
              {candidate.firstName}, {candidate.age}
            </Text>
            <View style={s.compatBadge}>
              <Ionicons name="sparkles" size={11} color={T42.gold} />
              <Text style={[Fonts.caption2, { color: T42.gold, marginLeft: 3 }]}>
                {Math.round(candidate.compatibilityScore * 100)}% match
              </Text>
            </View>
          </View>

          {/* Key stats row */}
          <View style={s.statsRow}>
            <StatPill icon="resize-outline" label={candidate.height} />
            <StatPill icon="cash-outline" label={candidate.income} />
            <StatPill icon="location-outline" label={`${candidate.distanceMiles} mi`} />
          </View>

          {/* Background check badge */}
          {candidate.backgroundCheck === 'clear' && (
            <View style={s.bgCheckBadge}>
              <Ionicons name="shield-checkmark" size={13} color={T42.success} />
              <Text style={[Fonts.caption2, { color: T42.success, marginLeft: 5 }]}>Background Verified</Text>
              {candidate.backgroundCheckNotes && (
                <Text style={[Fonts.caption2, { color: T42.textSecondary, marginLeft: 4 }]}>· {candidate.backgroundCheckNotes.split('.')[0]}</Text>
              )}
            </View>
          )}

          <Text style={[Fonts.body, { color: T42.textPrimary, marginTop: 8, fontStyle: 'italic', lineHeight: 20 }]} numberOfLines={2}>
            "{candidate.bio}"
          </Text>

          <View style={s.interestRow}>
            {candidate.sharedInterests.slice(0, 3).map(tag => (
              <View key={tag} style={s.interestChip}>
                <Text style={[Fonts.caption2, { color: T42.purple }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Ionicons name="briefcase-outline" size={13} color={T42.textSecondary} />
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{candidate.profession} · {candidate.jobType}</Text>
          </View>
        </View>
      </View>

      {isSelected && (
        <LinearGradient colors={[T42.gold, T42.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.selectedBanner}>
          <Ionicons name="checkmark-circle" size={15} color={T42.onGold} />
          <Text style={[Fonts.caption2, { color: T42.onGold, fontWeight: '700', marginLeft: 5 }]}>SELECTED — $50 HOLD WILL BE PLACED</Text>
        </LinearGradient>
      )}
    </Card>
  );
}

function StatPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={s.statPill}>
      <Ionicons name={icon} size={11} color={T42.textSecondary} />
      <Text style={[Fonts.caption2, { color: T42.textSecondary, marginLeft: 4 }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 130, gap: 14 },
  contextBar: {
    flexDirection: 'row', alignSelf: 'center', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 50, backgroundColor: T42.gold + '16',
    borderWidth: 1, borderColor: T42.gold + '30',
  },
  confirmingRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, borderColor: T42.gold + '50',
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 28, color: '#fff', fontFamily: 'serif', fontWeight: '600' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  statPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50,
    backgroundColor: T42.surfaceRaised,
  },
  bgCheckBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.success + '14', alignSelf: 'flex-start',
    borderWidth: 1, borderColor: T42.success + '30',
  },
  compatBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.gold + '1F',
  },
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  interestChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50,
    backgroundColor: T42.purple + '26',
  },
  selectedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, paddingVertical: 9, borderRadius: 50, gap: 2,
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EE' },
});
