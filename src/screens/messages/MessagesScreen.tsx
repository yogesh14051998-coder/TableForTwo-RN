import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { Card, MatchAvatar } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import { DATE_COMMITMENT_HOLD } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function MessagesScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useApp();
  const commitment = state.activeCommitment;

  if (!commitment) {
    return (
      <View style={[s.root, s.centered]}>
        <Ionicons name="heart-circle-outline" size={56} color={T42.textSecondary} />
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 12, textAlign: 'center' }]}>
          No active commitment
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 8, lineHeight: 22 }]}>
          Post a date intent to get matched. Once you select someone, your commitment appears here.
        </Text>
        <TouchableOpacity
          style={s.ctaButton}
          onPress={() => nav.navigate('DateIntent')}
          activeOpacity={0.8}
        >
          <Text style={[Fonts.headline, { color: T42.onGold }]}>Plan a Date</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bothHeld = commitment.yourHold && commitment.theirHold;
  const msLeft = commitment.expiresAt.getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(msLeft / 3_600_000));

  return (
    <View style={s.root}>
      <View style={s.content}>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginBottom: 14 }]}>
          Active commitment
        </Text>

        <TouchableOpacity
          onPress={() => nav.navigate('Commitment', { commitment })}
          activeOpacity={0.85}
        >
          <Card style={{ borderColor: bothHeld ? T42.success + '50' : T42.gold + '40' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <MatchAvatar name={commitment.candidate.firstName} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={[Fonts.headline, { color: T42.textPrimary, fontSize: 19 }]}>
                  {commitment.candidate.firstName}, {commitment.candidate.age}
                </Text>
                <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 2 }]}>
                  {commitment.candidate.profession} · {commitment.intent.intentType}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={T42.textSecondary} />
            </View>

            {/* Hold status */}
            <View style={s.holdRow}>
              <HoldStatus label="Your hold" placed={commitment.yourHold} />
              <View style={s.holdDivider} />
              <HoldStatus label={`${commitment.candidate.firstName}'s hold`} placed={commitment.theirHold} />
            </View>

            {/* Status line */}
            <View style={[s.statusLine, { backgroundColor: bothHeld ? T42.success + '1A' : T42.gold + '1A' }]}>
              <Ionicons
                name={bothHeld ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={bothHeld ? T42.success : T42.gold}
              />
              <Text style={[Fonts.caption, { color: bothHeld ? T42.success : T42.gold, marginLeft: 6 }]}>
                {bothHeld
                  ? 'Both holds confirmed — venue revealed'
                  : `Waiting on confirmation · ${hoursLeft}h left`}
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Date detail */}
        <Card style={{ marginTop: 14 }}>
          <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600', marginBottom: 12 }]}>
            Date details
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
            <Ionicons name="restaurant-outline" size={15} color={T42.gold} style={{ marginTop: 2 }} />
            <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1 }]}>
              {commitment.experience.venueName} · {commitment.experience.venueDetail}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
            <Ionicons name="calendar-outline" size={15} color={T42.gold} style={{ marginTop: 2 }} />
            <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1 }]}>
              {commitment.proposedTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              {' at '}
              {commitment.proposedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Ionicons name="card-outline" size={15} color={T42.gold} style={{ marginTop: 2 }} />
            <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1 }]}>
              ${DATE_COMMITMENT_HOLD} hold per person · {bothHeld ? 'Both confirmed' : 'Pending confirmation'}
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
}

function HoldStatus({ label, placed }: { label: string; placed: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 4, flex: 1 }}>
      <Ionicons
        name={placed ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={placed ? T42.success : T42.textSecondary}
      />
      <Text style={[Fonts.caption2, { color: placed ? T42.success : T42.textSecondary }]}>{label}</Text>
      <Text style={[Fonts.caption2, { color: placed ? T42.success : T42.textSecondary, fontSize: 10 }]}>
        {placed ? '$50 placed' : 'Pending'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  content: { padding: 20 },
  ctaButton: {
    marginTop: 24, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 50, backgroundColor: T42.gold,
  },
  holdRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: T42.stroke,
  },
  holdDivider: { width: 1, height: 40, backgroundColor: T42.stroke },
  statusLine: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 50,
    marginTop: 8,
  },
});
