import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { GoldButton, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { MatchCandidate, CuratedMatchBatch } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function CuratedMatchScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { startChat } = useApp();
  const batch: CuratedMatchBatch = route.params.batch;
  const [selected, setSelected] = useState<string | null>(null);

  const handleInvite = () => {
    const candidate = batch.candidates.find(c => c.id === selected);
    if (!candidate) return;
    const session = startChat(candidate, batch);
    nav.navigate('Chat', { session });
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <Text style={[Fonts.caption, { color: T42.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
            They already said yes to
          </Text>
          <Text style={[Fonts.displaySmall, { color: T42.textPrimary, textAlign: 'center', marginTop: 4 }]}>
            {batch.experience.title}
          </Text>
          <Text style={[Fonts.caption, { color: T42.purple, marginTop: 4 }]}>
            Three curated matches. No endless swiping.
          </Text>
        </View>

        {/* All 3 match cards — tap to select */}
        {batch.candidates.map(candidate => (
          <TouchableOpacity key={candidate.id} activeOpacity={0.8}
            onPress={() => setSelected(candidate.id)}>
            <MatchCard candidate={candidate} isSelected={selected === candidate.id} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.cta}>
        <GoldButton icon="💌" label="Invite to Date"
          onPress={handleInvite} disabled={!selected} />
      </View>
    </View>
  );
}

function MatchCard({ candidate, isSelected }: { candidate: MatchCandidate; isSelected: boolean }) {
  return (
    <Card style={isSelected ? { borderColor: T42.gold, borderWidth: 1.5 } : undefined}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        {/* Avatar */}
        <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.avatar}>
          <Text style={{ fontSize: 28, color: '#fff', fontFamily: 'serif', fontWeight: '600' }}>
            {candidate.firstName[0]}
          </Text>
        </LinearGradient>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
              {candidate.firstName}, {candidate.age}
            </Text>
            <View style={s.compatBadge}>
              <Text style={[Fonts.caption2, { color: T42.gold }]}>
                ✨ {Math.round(candidate.compatibilityScore * 100)}%
              </Text>
            </View>
          </View>

          <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 2 }]}>
            💼 {candidate.profession} · {candidate.jobType}
          </Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 2 }]}>
            💰 {candidate.income} · 👗 {candidate.dressStyle}
          </Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 2 }]}>
            📍 {candidate.distanceMiles} mi away
          </Text>

          <Text style={[Fonts.body, { color: T42.textPrimary, marginTop: 6, fontStyle: 'italic' }]} numberOfLines={2}>
            "{candidate.bio}"
          </Text>

          {/* Shared interests */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {candidate.sharedInterests.map(tag => (
                <View key={tag} style={s.interestChip}>
                  <Text style={[Fonts.caption2, { color: T42.purple }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {isSelected && (
        <View style={s.selectedBanner}>
          <Text style={[Fonts.caption2, { color: T42.onGold, fontWeight: '700' }]}>SELECTED</Text>
        </View>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 100, gap: 14 },
  header: { alignItems: 'center', gap: 4 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  compatBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.gold + '1F',
  },
  interestChip: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.purple + '26',
  },
  selectedBanner: {
    marginTop: 10, alignSelf: 'center',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 50,
    backgroundColor: T42.gold,
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EB' },
});
