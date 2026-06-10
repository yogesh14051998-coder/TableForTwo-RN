import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { GoldButton, GhostButton, PartnerBadge } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { MatchCandidate, CuratedMatchBatch } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function CuratedMatchScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { startChat } = useApp();
  const batch: CuratedMatchBatch = route.params.batch;
  const [index, setIndex] = useState(0);

  const candidate = batch.candidates[index];
  if (!candidate) return null;

  const hasMore = index + 1 < batch.candidates.length;

  const handleInvite = () => {
    const session = startChat(candidate, batch);
    nav.navigate('Chat', { session });
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[Fonts.caption, { color: T42.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
          They already said yes to
        </Text>
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, textAlign: 'center', marginTop: 4 }]}>
          {batch.experience.title} · {batch.experience.venueName}
        </Text>
        <LinearGradient colors={[T42.gold, T42.goldDeep]} style={s.positionPill}>
          <Text style={[Fonts.caption2, { color: T42.onGold }]}>{index + 1} of {batch.candidates.length}</Text>
        </LinearGradient>
      </View>

      {/* Match Card */}
      <MatchCard candidate={candidate} />

      {/* Actions */}
      <GoldButton icon="💌" label="Invite to Date" onPress={handleInvite} />
      {hasMore ? (
        <GhostButton label="Next Match" onPress={() => setIndex(i => i + 1)} />
      ) : (
        <Text style={[Fonts.caption, { color: T42.purple, textAlign: 'center', paddingVertical: 12 }]}>
          That's your three — quality over quantity.
        </Text>
      )}

      <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center' }]}>
        Three curated matches. No endless swiping.
      </Text>
    </ScrollView>
  );
}

function MatchCard({ candidate }: { candidate: MatchCandidate }) {
  return (
    <View style={s.card}>
      {/* Photo area */}
      <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.photo}>
        <Text style={{ fontSize: 72, color: '#fff', fontFamily: 'serif', opacity: 0.9 }}>
          {candidate.firstName[0]}
        </Text>
        {/* Compatibility badge */}
        <View style={s.compatBadge}>
          <Text style={[Fonts.caption2, { color: '#fff' }]}>
            ✨ {Math.round(candidate.compatibilityScore * 100)}% aligned
          </Text>
        </View>
        {/* Name overlay */}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={s.nameOverlay}>
          <Text style={[Fonts.displayMedium, { color: '#fff' }]}>
            {candidate.firstName}, {candidate.age}
          </Text>
        </LinearGradient>
      </LinearGradient>

      {/* Details */}
      <View style={s.cardBody}>
        <Text style={[Fonts.subheadline, { color: T42.gold }]}>💼 {candidate.profession}</Text>
        <Text style={[Fonts.body, { color: T42.textPrimary, marginTop: 8 }]}>"{candidate.bio}"</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {candidate.sharedInterests.map(tag => (
              <View key={tag} style={s.interestChip}>
                <Text style={[Fonts.caption, { color: T42.purple }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  header: { alignItems: 'center', gap: 4 },
  positionPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, marginTop: 8 },
  card: {
    borderRadius: 26, overflow: 'hidden',
    borderWidth: 1, borderColor: T42.gold + '66',
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 24,
    elevation: 12,
  },
  photo: { height: 280, alignItems: 'center', justifyContent: 'center' },
  compatBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  nameOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 16, paddingTop: 40,
  },
  cardBody: { padding: 16, backgroundColor: T42.surface },
  interestChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50,
    backgroundColor: T42.purple + '26',
  },
});
