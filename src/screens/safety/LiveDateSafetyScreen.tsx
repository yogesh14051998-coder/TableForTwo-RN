import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { T42, Fonts } from '../../theme/theme';
import { Card, GhostButton, GoldButton } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { startLocationShare, stopLocationShare, sendCheckInReminder, triggerSOS } from '../../services/services';
import type { DateBooking, PaymentSplit } from '../../models/types';

const CHECK_IN_WINDOW = 30 * 60 * 1000;
const PAYMENT_PROMPT_DELAY = 45 * 60 * 1000;

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
  const [timerStarted, setTimerStarted] = useState(false);
  const [leavingNotified, setLeavingNotified] = useState(false);

  const [dateStartTime] = useState(Date.now());
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<PaymentSplit>(booking.paymentSplit);

  useEffect(() => {
    if (!timerStarted) return;
    const iv = setInterval(() => {
      const r = checkInEnd - Date.now();
      setRemaining(Math.max(0, r));
      if (r <= 0 && !missed) {
        setMissed(true);
        sendCheckInReminder();
      }

      const elapsed = Date.now() - dateStartTime;
      if (elapsed >= PAYMENT_PROMPT_DELAY && !showPaymentPrompt && paymentChoice === 'pending') {
        setShowPaymentPrompt(true);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [checkInEnd, missed, dateStartTime, showPaymentPrompt, paymentChoice, timerStarted]);

  const toggleLocation = (on: boolean) => {
    setSharingLocation(on);
    if (on && trustedContact) startLocationShare(trustedContact);
    else stopLocationShare();
  };

  const confirmSafe = () => {
    setMissed(false);
    setCheckInEnd(Date.now() + CHECK_IN_WINDOW);
  };

  const handleNotifyLeaving = () => {
    setLeavingNotified(true);
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

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const timerLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="shield-checkmark" size={48} color={T42.gold} />
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary, marginTop: 10, textAlign: 'center' }]}>
          Your Safety, Our Priority
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 6 }]}>
          We've got you. Enjoy your date at {booking.experience.venueName}.
        </Text>
      </View>

      {/* Leaving notification */}
      {!leavingNotified ? (
        <Card style={{ borderColor: T42.purple + '60', borderWidth: 1 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Ionicons name="car-outline" size={32} color={T42.purple} />
            <Text style={[Fonts.headline, { color: T42.textPrimary, textAlign: 'center' }]}>
              Heading out?
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center' }]}>
              Let {booking.companion.firstName} know you're on the way.
            </Text>
            <GoldButton label="I'm Leaving Now" onPress={handleNotifyLeaving} />
          </View>
        </Card>
      ) : (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="checkmark-circle" size={22} color={T42.success} />
            <Text style={[Fonts.subheadline, { color: T42.success }]}>
              {booking.companion.firstName} has been notified you're on the way
            </Text>
          </View>
        </Card>
      )}

      {/* Venue context with map placeholder */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={s.mapPlaceholder}>
            <Ionicons name="map" size={28} color={T42.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
              {booking.experience.venueName}
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 2 }]}>
              With {booking.companion.firstName} · {booking.experience.address}
            </Text>
          </View>
        </View>
        <View style={s.mapView}>
          <Ionicons name="navigate-outline" size={40} color={T42.gold + '60'} />
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 6 }]}>Live map tracking active</Text>
        </View>
      </Card>

      {/* Mid-date payment prompt */}
      {showPaymentPrompt && paymentChoice === 'pending' && (
        <Card style={{ borderColor: T42.gold, borderWidth: 1.5 }}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="card-outline" size={36} color={T42.gold} />
            <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 8, textAlign: 'center' }]}>
              How would you like to handle the bill?
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginTop: 4 }]}>
              Paying full means the date went well!
            </Text>
            <View style={{ width: '100%', gap: 10, marginTop: 16 }}>
              <GoldButton label="I'll cover the full bill" onPress={() => handlePaymentChoice('full')} />
              <GhostButton label="Split it 50/50" tint={T42.gold}
                onPress={() => handlePaymentChoice('split')} />
            </View>
          </View>
        </Card>
      )}

      {paymentChoice !== 'pending' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="card" size={22} color={paymentChoice === 'full' ? T42.success : T42.gold} />
            <View>
              <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>
                {paymentChoice === 'full' ? 'You\'re covering the full bill' : 'Splitting 50/50'}
              </Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                {paymentChoice === 'full' ? 'Great date!' : ''}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Action buttons row */}
      <View style={s.actionRow}>
        <TouchableOpacity style={s.actionBtn} onPress={confirmSafe} activeOpacity={0.7}>
          <Ionicons name="checkmark-circle-outline" size={28} color={T42.success} />
          <Text style={[Fonts.caption2, { color: T42.success, marginTop: 4 }]}>I'm OK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={() => setTimerStarted(true)} activeOpacity={0.7}>
          <Ionicons name="timer-outline" size={28} color={T42.gold} />
          <Text style={[Fonts.caption2, { color: T42.gold, marginTop: 4 }]}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={handleSOS} activeOpacity={0.7}>
          <Ionicons name="alert-circle" size={28} color={T42.danger} />
          <Text style={[Fonts.caption2, { color: T42.danger, marginTop: 4 }]}>SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={() => toggleLocation(!sharingLocation)} activeOpacity={0.7}>
          <Ionicons name={sharingLocation ? 'location' : 'location-outline'} size={28}
            color={sharingLocation ? T42.purple : T42.textSecondary} />
          <Text style={[Fonts.caption2, { color: sharingLocation ? T42.purple : T42.textSecondary, marginTop: 4 }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {sharingLocation && trustedContact && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Ionicons name="radio-outline" size={14} color={T42.success} />
          <Text style={[Fonts.caption, { color: T42.success }]}>
            Sharing live location with {trustedContact.name}
          </Text>
        </View>
      )}

      {/* Check-in Timer */}
      <Card style={s.timerCard}>
        <Ionicons name="timer-outline" size={24} color={T42.textSecondary} />
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 4 }]}>Check-in Timer</Text>
        <Text style={[Fonts.displayLarge, { color: T42.textPrimary, marginTop: 8, fontSize: 48, fontVariant: ['tabular-nums'] }]}>
          {timerLabel}
        </Text>
        <View style={{ marginTop: 16, width: '100%' }}>
          {!timerStarted ? (
            <GoldButton label="Start Timer" onPress={() => setTimerStarted(true)} />
          ) : missed ? (
            <GoldButton label="I'm Safe — Reset" onPress={confirmSafe} />
          ) : (
            <GhostButton label="I'm Safe — Reset Timer" tint={T42.success} onPress={confirmSafe} />
          )}
        </View>
        {missed && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 }}>
            <Ionicons name="warning" size={14} color={T42.danger} />
            <Text style={[Fonts.caption, { color: T42.danger }]}>
              Missed check-in — we've nudged your trusted contact.
            </Text>
          </View>
        )}
      </Card>

      {/* Emergency SOS */}
      <View style={s.sosSection}>
        <TouchableOpacity onPress={handleSOS} activeOpacity={0.8}>
          <View style={s.sosButton}>
            <Ionicons name="alert-circle" size={32} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff', marginTop: 4 }}>SOS</Text>
          </View>
        </TouchableOpacity>
        <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginTop: 10 }]}>
          {sosTriggered
            ? 'Help is on the way. Stay where staff can see you.'
            : 'Tap for immediate help.'}
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <GhostButton label="End Date & Leave Safe Mode" onPress={() => {
          if (paymentChoice === 'pending') {
            setPaymentSplit(booking.id, 'split');
          }
          completeLiveDate();
          nav.goBack();
        }} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 16 },
  header: { alignItems: 'center' },
  mapPlaceholder: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: T42.gold + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  mapView: {
    height: 120, marginTop: 12, borderRadius: 14,
    backgroundColor: T42.surfaceRaised,
    alignItems: 'center', justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionBtn: { alignItems: 'center', padding: 10 },
  timerCard: { alignItems: 'center', padding: 24 },
  sosSection: { alignItems: 'center', paddingVertical: 8 },
  sosButton: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: T42.danger, alignItems: 'center', justifyContent: 'center',
    shadowColor: T42.danger, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 22,
    elevation: 12,
  },
});
