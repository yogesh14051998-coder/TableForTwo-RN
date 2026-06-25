import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { SectionHeader, Card, GoldButton, PartnerBadge } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { confirmBooking } from '../../services/services';
import { addOns as sampleAddOns } from '../../data/sampleData';
import { DATE_DEPOSIT, PARTNER_COMMISSION, type AddOn, type DateBooking, type DateCommitment } from '../../models/types';
import type { MainStackParams } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MainStackParams>;

const ADDON_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Gifting: 'flower-outline',
  Transportation: 'car-outline',
  Memories: 'camera-outline',
};

export default function ReviewConfirmScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { confirmBooking: appConfirm, payDeposit, settleCommitment } = useApp();
  const commitment: DateCommitment = route.params.commitment;

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

  const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const t42Revenue = selectedAddOns.reduce((sum, a) => sum + a.t42Margin, 0);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const draft: DateBooking = {
        id: Math.random().toString(36).slice(2),
        experience: commitment.experience,
        companion: commitment.candidate,
        scheduledFor: commitment.proposedTime,
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
    settleCommitment();
    setDepositPaid(true);
  };

  if (confirmed && depositPaid) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <LinearGradient colors={[T42.gold + '20', T42.background]} style={StyleSheet.absoluteFill} />
        <View style={s.celebIcon}>
          <Ionicons name="checkmark-circle" size={60} color={T42.success} />
        </View>
        <Text style={[Fonts.displayLarge, { color: T42.textPrimary, marginTop: 16, textAlign: 'center' }]}>
          It's a date.
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 10 }]}>
          {confirmed.experience.venueName} · {confirmed.scheduledFor.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
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
        {selectedAddOns.length > 0 && (
          <Card style={{ marginTop: 24, width: '100%' }}>
            <Text style={[Fonts.subheadline, { color: T42.textPrimary, marginBottom: 8 }]}>Add-ons booked</Text>
            {selectedAddOns.map(a => (
              <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{a.title}</Text>
                <Text style={[Fonts.caption, { color: T42.gold }]}>${a.price}</Text>
              </View>
            ))}
          </Card>
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
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 }]}>
          Both you and {commitment.candidate.firstName} need to authorize a ${DATE_DEPOSIT} deposit to confirm the date and reveal the venue.
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
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center' }]}>
          Your date is set
        </Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 4 }]}>
          Review logistics and optional add-ons
        </Text>

        {/* Venue card */}
        <Card style={{ borderColor: T42.gold + '40' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.venueIcon}>
              <Ionicons name="restaurant" size={22} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.headline, { color: T42.textPrimary, fontSize: 18 }]}>
                {commitment.experience.venueName}
              </Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                {commitment.experience.venueDetail} · ~${commitment.experience.estimatedCost}
              </Text>
            </View>
            <PartnerBadge provider={commitment.experience.provider} />
          </View>

          <View style={s.divider} />

          <DetailRow icon="calendar-outline"
            label={commitment.proposedTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} />
          <DetailRow icon="time-outline"
            label={commitment.proposedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <DetailRow icon="location-outline" label={commitment.experience.address} />
          <DetailRow icon="people-outline" label={`You & ${commitment.candidate.firstName}`} />

          <View style={[s.divider, { marginTop: 12 }]} />

          {/* T42 handles it */}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="sparkles" size={14} color={T42.gold} />
            <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1 }]}>
              Reservation booked via {commitment.experience.provider}. Table for 2 handles all logistics.
            </Text>
          </View>
        </Card>

        {/* Add-ons */}
        <SectionHeader title="Elevate the experience" />
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: -8 }]}>
          All add-ons are booked & dispatched by Table for 2
        </Text>

        {sampleAddOns.map(addOn => {
          const sel = selectedAddOns.some(a => a.id === addOn.id);
          const icon = ADDON_ICONS[addOn.kind] ?? 'gift-outline';
          return (
            <TouchableOpacity key={addOn.id} onPress={() => toggle(addOn)} activeOpacity={0.7}>
              <Card style={sel ? { borderColor: T42.gold + '99' } : undefined}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View style={s.addOnIcon}>
                    <Ionicons name={icon} size={20} color={T42.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600' }]}>
                      {addOn.title}
                    </Text>
                    <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 3, lineHeight: 17 }]}>
                      {addOn.detail}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <PartnerBadge provider={addOn.provider} />
                      <Text style={[Fonts.caption2, { color: T42.textSecondary }]}>
                        {`${Math.round(PARTNER_COMMISSION * 100)}% service fee included`}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={[Fonts.headline, { color: T42.gold, fontWeight: '700' }]}>
                      ${addOn.price}
                    </Text>
                    <Ionicons
                      name={sel ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={sel ? T42.gold : T42.textSecondary}
                    />
                  </View>
                </View>

                {sel && (
                  <View style={s.addOnMarginRow}>
                    <Ionicons name="trending-up-outline" size={12} color={T42.gold} />
                    <Text style={[Fonts.caption2, { color: T42.gold, marginLeft: 4 }]}>
                      T42 earns ${addOn.t42Margin.toFixed(2)} · Partner gets ${addOn.partnerCost.toFixed(2)}
                    </Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Order summary */}
        {selectedAddOns.length > 0 && (
          <Card style={{ borderColor: T42.gold + '40' }}>
            <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600', marginBottom: 12 }]}>
              Order summary
            </Text>
            {selectedAddOns.map(a => (
              <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{a.title}</Text>
                <Text style={[Fonts.caption, { color: T42.textPrimary }]}>${a.price}</Text>
              </View>
            ))}
            <View style={s.divider} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>Add-ons total</Text>
              <Text style={[Fonts.headline, { color: T42.gold }]}>${addOnTotal}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>T42 service revenue</Text>
              <Text style={[Fonts.caption, { color: T42.purple }]}>${t42Revenue.toFixed(2)}</Text>
            </View>
          </Card>
        )}

      </ScrollView>

      <View style={s.cta}>
        <GoldButton
          label={loading ? 'Locking in your date...' : 'Confirm & Book'}
          onPress={handleConfirm}
          loading={loading}
        />
      </View>
    </View>
  );
}

function DetailRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <Ionicons name={icon} size={15} color={T42.textSecondary} />
      <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontSize: 14 }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 110, gap: 14 },
  venueIcon: {
    width: 48, height: 48, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: T42.stroke, marginVertical: 12 },
  addOnIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: T42.purple + '26', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  addOnMarginRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: T42.gold + '30',
  },
  confirmBadge: {
    marginTop: 16, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 50, backgroundColor: T42.purple + '26',
  },
  celebIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: T42.success + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  cta: {
    paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10,
    backgroundColor: T42.background + 'EB',
  },
});
