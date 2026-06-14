import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { T42, Fonts } from '../../theme/theme';
import {
  SectionHeader, Card, GoldButton, PartnerBadge,
} from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { confirmBooking } from '../../services/services';
import { addOns as sampleAddOns } from '../../data/sampleData';
import { DATE_DEPOSIT, type AddOn, type DateBooking, type MatchChatSession } from '../../models/types';

const ADDON_IONICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  flowers: 'flower-outline',
  dessert: 'ice-cream-outline',
  photography: 'camera-outline',
  transport: 'car-outline',
  gift: 'gift-outline',
};

export default function ReviewConfirmScreen() {
  const route = useRoute<any>();
  const { confirmBooking: appConfirm, payDeposit } = useApp();
  const session: MatchChatSession = route.params.session;

  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<DateBooking | null>(null);
  const [depositPaid, setDepositPaid] = useState(false);

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
        status: 'awaitingDeposit',
        yourDeposit: false,
        theirDeposit: false,
        venueRevealed: false,
        paymentSplit: 'pending',
      };
      const result = await confirmBooking(draft);
      setConfirmed(result);
      appConfirm(result);
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = () => {
    if (!confirmed) return;
    payDeposit(confirmed.id);
    setDepositPaid(true);
  };

  if (confirmed && depositPaid) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Ionicons name="checkmark-circle" size={76} color={T42.success} />
        <Text style={[Fonts.displayLarge, { color: T42.textPrimary, marginTop: 16, textAlign: 'center' }]}>
          It's a date.
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 12 }]}>
          {confirmed.experience.venueName} · {confirmed.scheduledFor.toLocaleDateString()}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Ionicons name="location-outline" size={14} color={T42.textSecondary} />
          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{confirmed.experience.address}</Text>
        </View>
        {confirmed.confirmationCode && (
          <View style={s.confirmBadge}>
            <Text style={[Fonts.caption2, { color: T42.purple }]}>Confirmation {confirmed.confirmationCode}</Text>
          </View>
        )}
      </View>
    );
  }

  if (confirmed) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Ionicons name="lock-closed" size={56} color={T42.gold} />
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 16, textAlign: 'center' }]}>
          Almost there!
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 12 }]}>
          Both you and {session.candidate.firstName} need to authorize a ${DATE_DEPOSIT} deposit to confirm the date and reveal the venue.
        </Text>
        <Card style={{ marginTop: 24, width: '100%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>Your deposit</Text>
            <Text style={[Fonts.headline, { color: T42.gold }]}>${DATE_DEPOSIT}</Text>
          </View>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 6 }]}>
            Fully refundable if your match doesn't confirm within 24 hours.
          </Text>
        </Card>
        <View style={{ width: '100%', marginTop: 16 }}>
          <GoldButton label={`Pay $${DATE_DEPOSIT} Deposit`} onPress={handlePayDeposit} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center' }]}>
          Review & Confirm{'\n'}Your Date
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 4 }]}>
          Here's what you're planning
        </Text>

        {/* Venue card */}
        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.venueIcon}>
              <Ionicons name="restaurant" size={24} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.headline, { color: T42.textPrimary, fontSize: 18 }]}>
                {session.experience.venueName}
              </Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                {session.experience.venueDetail} · ~${session.experience.estimatedCost}
              </Text>
            </View>
            <PartnerBadge provider={session.experience.provider} />
          </View>

          <View style={s.divider} />

          <DetailRow icon="calendar-outline" label={session.proposedTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} />
          <DetailRow icon="time-outline" label={session.proposedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <DetailRow icon="location-outline" label={session.experience.address || 'Location revealed after deposit'} />
          <DetailRow icon="people-outline" label={`You & ${session.candidate.firstName}`} />
        </Card>

        {/* Add-ons */}
        <SectionHeader title="Add-ons" />
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginBottom: 8 }]}>
          Make it even more special
        </Text>
        {sampleAddOns.map(addOn => {
          const sel = selectedAddOns.some(a => a.id === addOn.id);
          const icon = ADDON_IONICONS[addOn.kind] ?? 'gift-outline';
          return (
            <TouchableOpacity key={addOn.id} onPress={() => toggle(addOn)} activeOpacity={0.7}>
              <Card style={sel ? { borderColor: T42.gold + '99' } : undefined}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={s.addOnIcon}>
                    <Ionicons name={icon} size={22} color={T42.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600' }]}>{addOn.title}</Text>
                    <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{addOn.detail}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={[Fonts.subheadline, { color: T42.gold, fontWeight: '700' }]}>${addOn.price}</Text>
                    <Ionicons name={sel ? 'checkmark-circle' : 'ellipse-outline'} size={22}
                      color={sel ? T42.gold : T42.textSecondary} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={s.cta}>
        <GoldButton label={loading ? 'Confirming...' : 'Confirm Date'}
          onPress={handleConfirm} loading={loading} />
      </View>
    </View>
  );
}

function DetailRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <Ionicons name={icon} size={16} color={T42.textSecondary} />
      <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 100, gap: 10 },
  venueIcon: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
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
