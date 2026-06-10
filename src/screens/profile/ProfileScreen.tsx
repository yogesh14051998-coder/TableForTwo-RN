import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { T42, Fonts } from '../../theme/theme';
import { SectionHeader, Card, GoldButton, MatchAvatar } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { PAID_TIERS, TIER_INFO, type SubscriptionTier } from '../../models/types';

export default function ProfileScreen() {
  const { state, setSubscription, setConsent } = useApp();
  const user = state.currentUser;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Profile card */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <MatchAvatar name={user.firstName} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={[Fonts.displaySmall, { color: T42.textPrimary }]}>
              {user.firstName}, {user.age}
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
              {user.profession} · {user.city}
            </Text>
            <Text style={[Fonts.caption, { color: T42.gold, fontWeight: '600' }]}>
              Member tier: {state.subscription}
            </Text>
          </View>
        </View>
      </Card>

      {/* Membership tiers */}
      <SectionHeader title="Membership" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {PAID_TIERS.map(tier => (
            <TierCard key={tier} tier={tier} isCurrent={state.subscription === tier}
              onChoose={() => setSubscription(tier)} />
          ))}
        </View>
      </ScrollView>

      {/* Privacy */}
      <SectionHeader title="Privacy & data" />
      <Card>
        <View style={s.toggleRow}>
          <Text style={[Fonts.body, { color: T42.textPrimary, flex: 1 }]}>Share anonymized usage data</Text>
          <Switch value={state.consent.shareAnonymizedUsage}
            onValueChange={v => setConsent({ ...state.consent, shareAnonymizedUsage: v })}
            trackColor={{ true: T42.purple, false: T42.surfaceRaised }} thumbColor="#fff" />
        </View>
        <View style={[s.toggleRow, { marginTop: 14 }]}>
          <Text style={[Fonts.body, { color: T42.textPrimary, flex: 1 }]}>Personalized recommendations</Text>
          <Switch value={state.consent.personalizedRecommendations}
            onValueChange={v => setConsent({ ...state.consent, personalizedRecommendations: v })}
            trackColor={{ true: T42.purple, false: T42.surfaceRaised }} thumbColor="#fff" />
        </View>
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 12 }]}>
          Data is anonymized, consent-based, and only used to improve match quality. Withdraw any time.
        </Text>
      </Card>

      {/* Safety */}
      <SectionHeader title="Safety" />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 22 }}>👤</Text>
          <View style={{ flex: 1 }}>
            <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600' }]}>
              Trusted contact
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
              {user.trustedContact?.name ?? 'Not set — add one to enable Live Date Mode sharing'}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

function TierCard({
  tier, isCurrent, onChoose,
}: {
  tier: SubscriptionTier; isCurrent: boolean; onChoose: () => void;
}) {
  const info = TIER_INFO[tier];
  return (
    <View style={[s.tierCard, isCurrent && { borderColor: T42.gold, borderWidth: 1.5 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 18 }}>👑</Text>
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, fontSize: 20 }]}>{tier}</Text>
      </View>
      <Text style={[Fonts.headline, { color: T42.gold, marginTop: 8 }]}>${info.price}/mo</Text>
      <View style={{ gap: 6, marginTop: 10, flex: 1 }}>
        {info.perks.map(p => (
          <Text key={p} style={[Fonts.caption, { color: T42.textSecondary }]}>✓ {p}</Text>
        ))}
      </View>
      <View style={{ marginTop: 12 }}>
        <GoldButton label={isCurrent ? 'Current Plan' : `Choose ${tier}`}
          onPress={onChoose} disabled={isCurrent} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  tierCard: {
    width: 230, padding: 16, borderRadius: 20,
    backgroundColor: T42.surface, borderWidth: 1, borderColor: T42.stroke,
  },
});
