import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { T42, Fonts } from '../../theme/theme';
import {
  SectionHeader, Card, GoldButton, TierBadge, PartnerBadge,
} from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { confirmBooking } from '../../services/services';
import { addOns as sampleAddOns } from '../../data/sampleData';
import { ADDON_ICONS, type AddOn, type DateBooking, type MatchChatSession } from '../../models/types';

export default function ReviewConfirmScreen() {
  const route = useRoute<any>();
  const { confirmBooking: appConfirm } = useApp();
  const session: MatchChatSession = route.params.session;

  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<DateBooking | null>(null);

  const experienceCost = session.experience.estimatedCost;
  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const total = experienceCost + addOnTotal;

  const toggle = (addOn: AddOn) => {
    setSelectedAddOns(prev =>
      prev.find(a => a.id === addOn.id)
        ? prev.filter(a => a.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const draft: DateBooking = {
        id: Math.random().toString(36).slice(2),
        experience: session.experience,
        companion: session.candidate,
        scheduledFor: session.proposedTime,
        selectedAddOns,
        status: 'draft',
      };
      const result = await confirmBooking(draft);
      setConfirmed(result);
      appConfirm(result);
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Text style={{ fontSize: 76 }}>✅</Text>
        <Text style={[Fonts.displayLarge, { color: T42.textPrimary, marginTop: 16 }]}>It's a date.</Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 12 }]}>
          {confirmed.experience.venueName} · {confirmed.scheduledFor.toLocaleDateString()}
        </Text>
        {confirmed.confirmationCode && (
          <View style={s.confirmBadge}>
            <Text style={[Fonts.caption2, { color: T42.purple }]}>Confirmation {confirmed.confirmationCode}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Date summary */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 24 }}>🍽️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
                {session.experience.venueName} — {session.experience.venueDetail}
              </Text>
              <Text style={[Fonts.subheadline, { color: T42.textSecondary }]}>{session.experience.title}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <DetailRow icon="📅" label={session.proposedTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} />
          <DetailRow icon="🕗" label={session.proposedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <DetailRow icon="📍" label={session.experience.address} />
          <DetailRow icon="👥" label={`You & ${session.candidate.firstName}`} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <TierBadge tier={session.experience.packageTier} />
            <PartnerBadge provider={session.experience.provider} />
          </View>
        </Card>

        {/* Add-ons marketplace */}
        <SectionHeader title="Make it unforgettable" />
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginBottom: 8 }]}>
          Optional touches, handled before either of you arrives.
        </Text>
        {sampleAddOns.map(addOn => {
          const sel = selectedAddOns.some(a => a.id === addOn.id);
          return (
            <TouchableOpacity key={addOn.id} onPress={() => toggle(addOn)} activeOpacity={0.7}>
              <Card style={sel ? { borderColor: T42.gold + '99' } : undefined}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={s.addOnIcon}>
                    <Text style={{ fontSize: 22 }}>{ADDON_ICONS[addOn.kind]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600' }]}>{addOn.title}</Text>
                    <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{addOn.detail}</Text>
                    <PartnerBadge provider={addOn.provider} />
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={[Fonts.subheadline, { color: T42.gold, fontWeight: '700' }]}>${addOn.price}</Text>
                    <Text style={{ fontSize: 22, color: sel ? T42.gold : T42.textSecondary }}>
                      {sel ? '✅' : '⭕'}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Totals */}
        <Card>
          <PriceRow label="Experience for two" amount={experienceCost} />
          {addOnTotal > 0 && <PriceRow label="Add-ons" amount={addOnTotal} />}
          <View style={s.divider} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>Total</Text>
            <Text style={[Fonts.displaySmall, { color: T42.gold }]}>${total}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={s.cta}>
        <GoldButton icon="✅" label={`Confirm & Book · $${total}`}
          onPress={handleConfirm} loading={loading} />
      </View>
    </View>
  );
}

function DetailRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>{label}</Text>
    </View>
  );
}

function PriceRow({ label, amount }: { label: string; amount: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={[Fonts.subheadline, { color: T42.textSecondary }]}>{label}</Text>
      <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>${amount}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  divider: { height: 1, backgroundColor: T42.stroke, marginVertical: 12 },
  addOnIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: T42.purple + '26', alignItems: 'center', justifyContent: 'center',
  },
  confirmBadge: {
    marginTop: 16, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 50, backgroundColor: T42.purple + '26',
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EB' },
});
