import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { GoldButton, Card, GhostButton } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { DateCommitment } from '../../models/types';
import { DATE_COMMITMENT_HOLD } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

type Phase = 'preview' | 'your_hold_placed' | 'both_confirmed';

export default function CommitmentScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { placeYourHold, placeTheirHold } = useApp();
  const commitment: DateCommitment = route.params.commitment;

  const [phase, setPhase] = useState<Phase>('preview');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (phase === 'your_hold_placed') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulse.start();
      // Simulate partner placing their hold after 2.5s
      const timer = setTimeout(() => {
        pulse.stop();
        placeTheirHold();
        setPhase('both_confirmed');
      }, 2500);
      return () => { clearTimeout(timer); pulse.stop(); };
    }
  }, [phase]);

  const handlePlaceHold = () => {
    placeYourHold();
    setPhase('your_hold_placed');
  };

  const handleContinue = () => {
    nav.navigate('ReviewConfirm', { commitment });
  };

  if (phase === 'both_confirmed') {
    return (
      <View style={[s.root, s.centered]}>
        <LinearGradient colors={[T42.gold + '30', T42.background]} style={s.celebGradient} />
        <View style={s.celebRing}>
          <Ionicons name="heart" size={44} color={T42.gold} />
        </View>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center', marginTop: 20 }]}>
          It's a match!
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 22 }]}>
          Both holds placed. {commitment.candidate.firstName} confirmed too.{'\n'}
          Venue is now revealed — let's get you ready.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
          <HoldBadge name="You" placed />
          <HoldBadge name={commitment.candidate.firstName} placed />
        </View>
        <View style={{ width: '100%', paddingHorizontal: 24, marginTop: 36 }}>
          <GoldButton label="Finalize Logistics" onPress={handleContinue} />
        </View>
      </View>
    );
  }

  if (phase === 'your_hold_placed') {
    return (
      <View style={[s.root, s.centered]}>
        <Animated.View style={[s.waitingRing, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="time-outline" size={36} color={T42.gold} />
        </Animated.View>
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, textAlign: 'center', marginTop: 20 }]}>
          Your hold is placed
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }]}>
          Waiting for {commitment.candidate.firstName} to confirm their ${DATE_COMMITMENT_HOLD} hold…
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
          <HoldBadge name="You" placed />
          <HoldBadge name={commitment.candidate.firstName} placed={false} />
        </View>
        <Card style={{ marginTop: 28, marginHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Ionicons name="shield-checkmark-outline" size={16} color={T42.purple} style={{ marginTop: 2 }} />
            <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1, lineHeight: 18 }]}>
              If {commitment.candidate.firstName} bails without a valid reason, the $50 hold is forfeited to you. Your hold is fully refundable otherwise.
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  // Preview phase
  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Match summary */}
        <LinearGradient colors={[T42.surface, T42.background]} style={s.matchCard}>
          <View style={s.matchAvatar}>
            <Text style={s.matchAvatarText}>{commitment.candidate.firstName[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[Fonts.displaySmall, { color: T42.textPrimary }]}>
              {commitment.candidate.firstName}, {commitment.candidate.age}
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 3 }]}>
              {commitment.candidate.profession} · {commitment.candidate.height}
            </Text>
            <View style={s.compatBadge}>
              <Ionicons name="sparkles" size={11} color={T42.gold} />
              <Text style={[Fonts.caption2, { color: T42.gold, marginLeft: 3 }]}>
                {Math.round(commitment.candidate.compatibilityScore * 100)}% match
              </Text>
            </View>
          </View>
          {commitment.candidate.backgroundCheck === 'clear' && (
            <View style={s.bgBadge}>
              <Ionicons name="shield-checkmark" size={13} color={T42.success} />
              <Text style={[Fonts.caption2, { color: T42.success, marginLeft: 4 }]}>Verified</Text>
            </View>
          )}
        </LinearGradient>

        {/* Date intent summary */}
        <Card style={{ borderColor: T42.gold + '40' }}>
          <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600', marginBottom: 10 }]}>
            Your date plan
          </Text>
          <InfoRow icon="restaurant-outline" label={commitment.experience.venueName}
            sub={commitment.experience.venueDetail} />
          <InfoRow icon="calendar-outline"
            label={commitment.proposedTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            sub={commitment.proposedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <InfoRow icon="location-outline" label={`Zip ${commitment.intent.zipcode}`}
            sub={`~${commitment.candidate.distanceMiles} mi from you`} />
          <InfoRow icon="pricetag-outline" label={`~$${commitment.experience.estimatedCost} estimated`}
            sub="Handled & booked by Table for 2" />
        </Card>

        {/* Hold mechanic */}
        <Card style={{ borderColor: T42.purple + '40' }}>
          <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600', marginBottom: 12 }]}>
            How the ${DATE_COMMITMENT_HOLD} hold works
          </Text>
          {[
            { icon: 'card-outline' as const, text: `A $${DATE_COMMITMENT_HOLD} hold is placed on both credit cards — not charged unless someone bails` },
            { icon: 'checkmark-circle-outline' as const, text: 'Once both confirms, the venue details and add-ons are unlocked' },
            { icon: 'close-circle-outline' as const, text: 'If your match doesn\'t confirm within 24h, your hold is automatically released' },
            { icon: 'alert-circle-outline' as const, text: `If either party bails without reason, they forfeit their $${DATE_COMMITMENT_HOLD} to the other` },
          ].map(item => (
            <View key={item.text} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Ionicons name={item.icon} size={15} color={T42.purple} style={{ marginTop: 2 }} />
              <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1, lineHeight: 18 }]}>{item.text}</Text>
            </View>
          ))}
        </Card>

        {/* Hold status preview */}
        <View>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginBottom: 12, textAlign: 'center' }]}>
            Hold status
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
            <HoldBadge name="You" placed={false} large />
            <HoldBadge name={commitment.candidate.firstName} placed={false} large />
          </View>
        </View>

      </ScrollView>

      <View style={s.cta}>
        <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginBottom: 10 }]}>
          This places a ${DATE_COMMITMENT_HOLD} hold — not a charge. Refundable if they don't confirm.
        </Text>
        <GoldButton label={`Place $${DATE_COMMITMENT_HOLD} Hold & Commit`} onPress={handlePlaceHold} />
        <View style={{ marginTop: 10 }}>
          <GhostButton label="Go Back" onPress={() => nav.goBack()} />
        </View>
      </View>
    </View>
  );
}

function HoldBadge({ name, placed, large }: { name: string; placed: boolean; large?: boolean }) {
  return (
    <View style={[s.holdBadge, placed && s.holdBadgePlaced, large && s.holdBadgeLarge]}>
      <Ionicons
        name={placed ? 'checkmark-circle' : 'ellipse-outline'}
        size={large ? 22 : 18}
        color={placed ? T42.success : T42.textSecondary}
      />
      <Text style={[Fonts.caption2, { color: placed ? T42.success : T42.textSecondary, marginTop: 4 }]}>
        {name}
      </Text>
      <Text style={[Fonts.caption2, { color: placed ? T42.success : T42.textSecondary, fontSize: 10 }]}>
        {placed ? '$50 ✓' : 'Pending'}
      </Text>
    </View>
  );
}

function InfoRow({ icon, label, sub }: { icon: keyof typeof Ionicons.glyphMap; label: string; sub?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
      <Ionicons name={icon} size={15} color={T42.gold} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontSize: 14 }]}>{label}</Text>
        {sub && <Text style={[Fonts.caption2, { color: T42.textSecondary, marginTop: 2 }]}>{sub}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  content: { padding: 20, paddingBottom: 140, gap: 16 },
  celebGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 300,
  },
  celebRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, borderColor: T42.gold + '60',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: T42.gold + '14',
  },
  waitingRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, borderColor: T42.gold + '50',
    alignItems: 'center', justifyContent: 'center',
  },
  matchCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 20,
    borderWidth: 1, borderColor: T42.stroke,
  },
  matchAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: T42.purple,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  matchAvatarText: { fontSize: 26, color: '#fff', fontFamily: 'serif', fontWeight: '600' },
  compatBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 6, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 50, backgroundColor: T42.gold + '1F', alignSelf: 'flex-start',
  },
  bgBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.success + '14', alignSelf: 'flex-start',
    borderWidth: 1, borderColor: T42.success + '30',
  },
  holdBadge: {
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 16, backgroundColor: T42.surfaceRaised,
    borderWidth: 1, borderColor: T42.stroke, gap: 2,
  },
  holdBadgePlaced: {
    backgroundColor: T42.success + '14',
    borderColor: T42.success + '40',
  },
  holdBadgeLarge: { paddingVertical: 18, paddingHorizontal: 28 },
  cta: {
    paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10,
    backgroundColor: T42.background + 'EE',
  },
});
