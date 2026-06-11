import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { T42, Fonts } from '../../theme/theme';
import { Card, GhostButton, GoldButton } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { startLocationShare, stopLocationShare, sendCheckInReminder, triggerSOS } from '../../services/services';
import type { DateBooking, PaymentSplit } from '../../models/types';

const CHECK_IN_WINDOW = 30 * 60 * 1000; // 30 minutes
const PAYMENT_PROMPT_DELAY = 45 * 60 * 1000; // 45 minutes into date

export default function LiveDateSafetyScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const { state, completeLiveDate, setPaymentSplit } = useApp();
  const booking: DateBooking = route.params.booking;
  const trustedContact = state.currentUser.trustedContact;

  const [sharingLocation, setSharingLocation] = useState(false);
  const [checkInEnd, setCheckInEnd] = useState(Date.now() + CHECK_IN_WINDOW);
  const [remaining, setRemaining] = useState(CHECK_IN_WINDOW);
  const [missed, setMissed] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  const [dateStartTime] = useState(Date.now());
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<PaymentSplit>(booking.paymentSplit);

  useEffect(() => {
    const iv = setInterval(() => {
      const r = checkInEnd - Date.now();
      setRemaining(Math.max(0, r));
      if (r <= 0 && !missed) {
        setMissed(true);
        sendCheckInReminder();
      }

      // Show payment prompt at 45 minutes
      const elapsed = Date.now() - dateStartTime;
      if (elapsed >= PAYMENT_PROMPT_DELAY && !showPaymentPrompt && paymentChoice === 'pending') {
        setShowPaymentPrompt(true);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [checkInEnd, missed, dateStartTime, showPaymentPrompt, paymentChoice]);

  const toggleLocation = (on: boolean) => {
    setSharingLocation(on);
    if (on && trustedContact) startLocationShare(trustedContact);
    else stopLocationShare();
  };

  const confirmSafe = () => {
    setMissed(false);
    setCheckInEnd(Date.now() + CHECK_IN_WINDOW);
  };

  const handlePaymentChoice = (choice: 'full' | 'split') => {
    setPaymentChoice(choice);
    setShowPaymentPrompt(false);
    setPaymentSplit(booking.id, choice);
  };

  const handleSOS = () => {
    Alert.alert(
      'Contact emergency services?',
      "We'll dial 911 and text your trusted contact the venue address.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call 911${trustedContact ? ` & alert ${trustedContact.name}` : ''}`,
          style: 'destructive',
          onPress: () => { setSosTriggered(true); triggerSOS(booking); },
        },
      ],
    );
  };

  const progress = Math.max(0, remaining / CHECK_IN_WINDOW);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const timerLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <LinearGradient colors={[T42.gold, T42.goldDeep]} style={s.modeBadge}>
          <Text style={[Fonts.caption2, { color: T42.onGold }]}>🛡️ Live Date Mode</Text>
        </LinearGradient>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary, marginTop: 8 }]}>
          {booking.experience.venueName}
        </Text>
        <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center' }]}>
          With {booking.companion.firstName} · {booking.experience.address}
        </Text>
        <Text style={[Fonts.caption, { color: T42.purple, marginTop: 4 }]}>
          Enjoy the evening — we've got your back.
        </Text>
      </View>

      {/* Mid-date payment prompt */}
      {showPaymentPrompt && paymentChoice === 'pending' && (
        <Card style={{ borderColor: T42.gold, borderWidth: 1.5 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32 }}>💳</Text>
            <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 8, textAlign: 'center' }]}>
              How would you like to handle the bill?
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginTop: 6 }]}>
              Would you like to pay for the full dinner or split it half and half?
            </Text>
            <View style={{ width: '100%', gap: 10, marginTop: 16 }}>
              <GoldButton icon="💰" label="I'll cover the full bill"
                onPress={() => handlePaymentChoice('full')} />
              <GhostButton label="Split it 50/50" tint={T42.gold}
                onPress={() => handlePaymentChoice('split')} />
            </View>
            <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 10 }]}>
              Defaults to split if no response.
            </Text>
          </View>
        </Card>
      )}

      {paymentChoice !== 'pending' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>💳</Text>
            <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>
              {paymentChoice === 'full' ? 'You\'re covering the full bill' : 'Splitting 50/50'}
            </Text>
          </View>
        </Card>
      )}

      {/* Check-in ring */}
      <Card style={s.timerCard}>
        <View style={s.ring}>
          <View style={s.ringBg} />
          <View style={[s.ringProgress, {
            borderColor: progress < 0.15 ? T42.danger : T42.gold,
          }]} />
          <View style={s.ringCenter}>
            <Text style={[Fonts.displayLarge, { color: T42.textPrimary, fontVariant: ['tabular-nums'] }]}>
              {timerLabel}
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>until check-in</Text>
          </View>
        </View>

        {missed && (
          <Text style={[Fonts.caption, { color: T42.danger, textAlign: 'center', fontWeight: '600', marginTop: 12 }]}>
            Missed check-in — we've nudged your trusted contact.
          </Text>
        )}

        <View style={{ marginTop: 14 }}>
          <GhostButton label="I'm Safe — Reset Timer" tint={T42.success} onPress={confirmSafe} />
        </View>
      </Card>

      {/* Location sharing */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[Fonts.headline, { color: T42.textPrimary }]}>📍 Share My Location</Text>
          <Switch value={sharingLocation} onValueChange={toggleLocation}
            trackColor={{ true: T42.purple, false: T42.surfaceRaised }}
            thumbColor="#fff" />
        </View>
        {trustedContact ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <Text style={{ fontSize: 18 }}>👤</Text>
            <View>
              <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>{trustedContact.name}</Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                {sharingLocation ? 'Seeing your live location now' : 'Will see your live location when enabled'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 8 }]}>
            Add a trusted contact in your Profile to enable live sharing.
          </Text>
        )}
      </Card>

      {/* SOS */}
      <View style={s.sosSection}>
        <TouchableOpacity onPress={handleSOS} activeOpacity={0.8}>
          <View style={s.sosButton}>
            <Text style={{ fontSize: 30, fontWeight: '900', color: '#fff' }}>SOS</Text>
            <Text style={[Fonts.caption2, { color: '#fff', letterSpacing: 2 }]}>EMERGENCY</Text>
          </View>
        </TouchableOpacity>
        <Text style={[Fonts.caption, {
          color: sosTriggered ? T42.danger : T42.textSecondary,
          textAlign: 'center', marginTop: 12,
        }]}>
          {sosTriggered
            ? 'Help is on the way. Stay where staff can see you.'
            : 'One tap connects you to emergency services.'}
        </Text>
      </View>

      <GhostButton label="End Date & Leave Safe Mode" onPress={() => {
        if (paymentChoice === 'pending') {
          setPaymentSplit(booking.id, 'split');
        }
        completeLiveDate();
        nav.goBack();
      }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { alignItems: 'center' },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
  timerCard: { alignItems: 'center', padding: 22 },
  ring: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center' },
  ringBg: {
    position: 'absolute', width: 190, height: 190, borderRadius: 95,
    borderWidth: 12, borderColor: T42.surfaceRaised,
  },
  ringProgress: {
    position: 'absolute', width: 190, height: 190, borderRadius: 95,
    borderWidth: 12, borderTopColor: 'transparent', borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  ringCenter: { alignItems: 'center' },
  sosSection: { alignItems: 'center', paddingVertical: 8 },
  sosButton: {
    width: 132, height: 132, borderRadius: 66,
    backgroundColor: T42.danger, alignItems: 'center', justifyContent: 'center',
    shadowColor: T42.danger, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 22,
    elevation: 12,
  },
});
