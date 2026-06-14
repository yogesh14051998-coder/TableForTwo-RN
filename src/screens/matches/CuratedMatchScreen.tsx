import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { GoldButton, GhostButton, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { MatchCandidate, CuratedMatchBatch } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

const AVATAR_COLORS: [string, string][] = [
  ['#9B6CFF', '#5B2DB3'],
  ['#DCB85E', '#A8842F'],
  ['#E5484D', '#8B2C2F'],
  ['#3FBF8F', '#1A5E3B'],
  ['#6B8AFF', '#2C3E6B'],
];

export default function CuratedMatchScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { startChat } = useApp();
  const batch: CuratedMatchBatch = route.params.batch;
  const [selected, setSelected] = useState<string | null>(null);
  const [waitingAcceptance, setWaitingAcceptance] = useState(false);

  const handleInvite = () => {
    setWaitingAcceptance(true);
    setTimeout(() => {
      const candidate = batch.candidates.find(c => c.id === selected);
      if (!candidate) return;
      const session = startChat(candidate, batch);
      nav.navigate('Chat', { session });
    }, 2000);
  };

  if (waitingAcceptance) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <View style={s.waitingRing}>
          <Ionicons name="heart" size={40} color={T42.gold} />
        </View>
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 20, textAlign: 'center' }]}>
          Waiting for acceptance...
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 8 }]}>
          Your match will be notified. Chat opens once they accept.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center' }]}>
          Your matches for this{'\n'}experience
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 6 }]}>
          We found {batch.candidates.length} people who love the same kind of date as you!
        </Text>

        <View style={s.contextBar}>
          <Ionicons name="sparkles" size={14} color={T42.gold} />
          <Text style={[Fonts.caption, { color: T42.gold, marginLeft: 4 }]}>
            {batch.experience.title}
          </Text>
        </View>

        {batch.candidates.map((candidate, i) => (
          <TouchableOpacity key={candidate.id} activeOpacity={0.8}
            onPress={() => setSelected(candidate.id)}>
            <MatchCard candidate={candidate} isSelected={selected === candidate.id}
              colors={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
          </TouchableOpacity>
        ))}

        <View style={s.noteRow}>
          <Ionicons name="information-circle-outline" size={16} color={T42.textSecondary} />
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginLeft: 6 }]}>
            You can only connect with 1 person for this experience.
          </Text>
        </View>
      </ScrollView>

      <View style={s.cta}>
        <GoldButton label="Invite to Date"
          onPress={handleInvite} disabled={!selected} />
        <TouchableOpacity style={{ alignItems: 'center', paddingTop: 10 }}>
          <Text style={[Fonts.subheadline, { color: T42.purple }]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MatchCard({ candidate, isSelected, colors }: {
  candidate: MatchCandidate; isSelected: boolean; colors: [string, string];
}) {
  return (
    <Card style={isSelected ? { borderColor: T42.gold, borderWidth: 1.5 } : undefined}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <LinearGradient colors={colors} style={s.avatar}>
          <Text style={s.avatarText}>{candidate.firstName[0]}</Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={[Fonts.headline, { color: T42.textPrimary, fontSize: 18 }]}>
            {candidate.firstName}, {candidate.age}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Ionicons name="briefcase-outline" size={13} color={T42.textSecondary} />
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{candidate.profession}</Text>
          </View>
          <Text style={[Fonts.body, { color: T42.textPrimary, marginTop: 6, fontStyle: 'italic' }]} numberOfLines={2}>
            "{candidate.bio}"
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {candidate.sharedInterests.slice(0, 3).map(tag => (
              <View key={tag} style={s.interestChip}>
                <Text style={[Fonts.caption2, { color: T42.purple }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={s.compatBadge}>
            <Ionicons name="sparkles" size={12} color={T42.gold} />
            <Text style={[Fonts.caption2, { color: T42.gold, marginLeft: 2 }]}>
              {Math.round(candidate.compatibilityScore * 100)}%
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 }}>
            <Ionicons name="location-outline" size={12} color={T42.textSecondary} />
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
              {candidate.distanceMiles}mi
            </Text>
          </View>
        </View>
      </View>

      {isSelected && (
        <View style={s.selectedBanner}>
          <Ionicons name="checkmark" size={14} color={T42.onGold} />
          <Text style={[Fonts.caption2, { color: T42.onGold, fontWeight: '700', marginLeft: 4 }]}>SELECTED</Text>
        </View>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 120, gap: 12 },
  contextBar: {
    flexDirection: 'row', alignSelf: 'center', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 50, backgroundColor: T42.gold + '1A', marginVertical: 4,
  },
  waitingRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: T42.gold + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  noteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, color: '#fff', fontFamily: 'serif', fontWeight: '600' },
  compatBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.gold + '1F',
  },
  interestChip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50,
    backgroundColor: T42.purple + '26',
  },
  selectedBanner: {
    flexDirection: 'row', marginTop: 10, alignSelf: 'center', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 50,
    backgroundColor: T42.gold,
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EB' },
});
