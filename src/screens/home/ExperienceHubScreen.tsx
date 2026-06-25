import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { Card, MatchAvatar } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { DateCommitment, DateBooking } from '../../models/types';
import { DATE_COMMITMENT_HOLD } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function ExperienceHubScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useApp();

  const timeGreeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const hasActiveCommitment = !!state.activeCommitment;
  const upcomingDate = state.upcomingBookings.find(b => b.status === 'confirmed');

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Greeting */}
      <View>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>
          {timeGreeting},{'\n'}{state.currentUser.firstName}
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, marginTop: 6 }]}>
          {hasActiveCommitment
            ? 'You have an active date commitment.'
            : 'No swiping. No messaging. Just great dates.'}
        </Text>
      </View>

      {/* Active commitment widget */}
      {state.activeCommitment && (
        <CommitmentWidget
          commitment={state.activeCommitment}
          onContinue={() => nav.navigate('Commitment', { commitment: state.activeCommitment! })}
        />
      )}

      {/* Upcoming confirmed date */}
      {upcomingDate && !hasActiveCommitment && (
        <UpcomingDateCard booking={upcomingDate} />
      )}

      {/* Primary hero CTA */}
      <TouchableOpacity
        onPress={() => nav.navigate('DateIntent')}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={[T42.gold, T42.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.heroCta}
        >
          <View style={s.heroCtaInner}>
            <View>
              <Text style={[Fonts.displaySmall, { color: T42.onGold }]}>Plan a date</Text>
              <Text style={[Fonts.caption, { color: T42.onGold + 'CC', marginTop: 3 }]}>
                Tell us when & where. We'll find your match.
              </Text>
            </View>
            <View style={s.heroCtaArrow}>
              <Ionicons name="arrow-forward" size={22} color={T42.onGold} />
            </View>
          </View>

          <View style={s.heroPills}>
            {['No swiping', 'AI curated', '$50 hold accountability'].map(pill => (
              <View key={pill} style={s.heroPill}>
                <Text style={[Fonts.caption2, { color: T42.onGold + 'CC' }]}>{pill}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* How it works */}
      <View style={s.howItWorks}>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginBottom: 14 }]}>How it works</Text>
        {[
          { icon: 'location-outline' as const, title: 'Post your intent', body: 'Tell us your zip code, date, and vibe. No destination needed.' },
          { icon: 'sparkles' as const, title: 'AI picks 2–3 matches', body: 'We surface people who meet your height, income, and interest criteria.' },
          { icon: 'card-outline' as const, title: '$50 hold on both cards', body: 'Mutual accountability. No ghosting, no wasted evenings.' },
          { icon: 'compass-outline' as const, title: 'We handle everything', body: 'Lyft, OpenTable, flowers — all booked. You just show up.' },
        ].map((step, i) => (
          <View key={step.title} style={s.howStep}>
            <View style={s.howStepNum}>
              <Text style={[Fonts.caption2, { color: T42.onGold, fontWeight: '700' }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>{step.title}</Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 3, lineHeight: 17 }]}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Past dates */}
      {state.pastBookings.length > 0 && (
        <View style={{ gap: 10 }}>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary }]}>Past dates</Text>
          {state.pastBookings.slice(0, 3).map(booking => (
            <TouchableOpacity key={booking.id}
              onPress={() => nav.navigate('Feedback', { booking })} activeOpacity={0.7}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MatchAvatar name={booking.companion.firstName} size={46} />
                  <View style={{ flex: 1 }}>
                    <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
                      {booking.companion.firstName}
                    </Text>
                    <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 2 }]}>
                      {booking.experience.venueName} · {booking.scheduledFor.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  {booking.paymentSplit === 'full' && (
                    <View style={s.dateDoneChip}>
                      <Ionicons name="heart" size={11} color={T42.success} />
                      <Text style={[Fonts.caption2, { color: T42.success, marginLeft: 4 }]}>Went well</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

function CommitmentWidget({ commitment, onContinue }: { commitment: DateCommitment; onContinue: () => void }) {
  const bothHeld = commitment.yourHold && commitment.theirHold;
  const msLeft = commitment.expiresAt.getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(msLeft / 3_600_000));

  return (
    <TouchableOpacity onPress={onContinue} activeOpacity={0.85}>
      <LinearGradient
        colors={bothHeld ? [T42.success + '22', T42.background] : [T42.gold + '1A', T42.background]}
        style={s.commitmentWidget}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons
              name={bothHeld ? 'heart' : 'time-outline'}
              size={18}
              color={bothHeld ? T42.success : T42.gold}
            />
            <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>
              {bothHeld ? 'Date confirmed!' : 'Commitment pending'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={T42.textSecondary} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <MatchAvatar name={commitment.candidate.firstName} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={[Fonts.caption, { color: T42.textPrimary }]}>
              {commitment.candidate.firstName} · {commitment.intent.intentType}
            </Text>
            <Text style={[Fonts.caption2, { color: T42.textSecondary, marginTop: 2 }]}>
              {commitment.proposedTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              {' · '}
              {bothHeld ? 'Venue revealed' : `${hoursLeft}h left to confirm`}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <HoldDot placed={commitment.yourHold} label="You" />
            <HoldDot placed={commitment.theirHold} label={commitment.candidate.firstName} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function HoldDot({ placed, label }: { placed: boolean; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={[s.holdDot, placed && s.holdDotPlaced]} />
      <Text style={[Fonts.caption2, { color: T42.textSecondary, fontSize: 10 }]}>{label}</Text>
    </View>
  );
}

function UpcomingDateCard({ booking }: { booking: DateBooking }) {
  return (
    <Card style={{ borderColor: T42.gold + '40' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Ionicons name="calendar" size={15} color={T42.gold} />
        <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>Upcoming date</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MatchAvatar name={booking.companion.firstName} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={[Fonts.headline, { color: T42.textPrimary }]}>{booking.companion.firstName}</Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 2 }]}>
            {booking.experience.venueName}
          </Text>
          <Text style={[Fonts.caption2, { color: T42.gold, marginTop: 3 }]}>
            {booking.scheduledFor.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={s.confirmedBadge}>
          <Ionicons name="checkmark-circle" size={13} color={T42.success} />
          <Text style={[Fonts.caption2, { color: T42.success, marginLeft: 4 }]}>Confirmed</Text>
        </View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 48, gap: 20 },

  heroCta: { borderRadius: 22, padding: 20, gap: 14 },
  heroCtaInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCtaArrow: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heroPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  howItWorks: {
    gap: 12,
    backgroundColor: T42.surface,
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: T42.stroke,
  },
  howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  howStepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: T42.gold, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },

  commitmentWidget: {
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: T42.gold + '30',
  },

  holdDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: T42.textSecondary + '60',
  },
  holdDotPlaced: { backgroundColor: T42.success },

  dateDoneChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 50, backgroundColor: T42.success + '14',
    borderWidth: 1, borderColor: T42.success + '30',
  },
  confirmedBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.success + '14', borderWidth: 1, borderColor: T42.success + '30',
    alignSelf: 'flex-start',
  },
});
