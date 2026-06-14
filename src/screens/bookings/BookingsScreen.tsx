import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { SectionHeader, Card, MatchAvatar, GoldButton, GhostButton } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { DATE_DEPOSIT, type DateBooking } from '../../models/types';
import type { MainStackParams } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function BookingsScreen() {
  const nav = useNavigation<Nav>();
  const { state, startLiveDate, payDeposit } = useApp();

  const hasAny = state.upcomingBookings.length > 0 || state.pastBookings.length > 0;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {!hasAny && (
        <View style={{ alignItems: 'center', paddingTop: 80 }}>
          <Ionicons name="calendar-outline" size={56} color={T42.textSecondary} />
          <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 12 }]}>
            No upcoming dates
          </Text>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            Your future scheduled dates will appear here with every detail handled.
          </Text>
        </View>
      )}

      {state.upcomingBookings.length > 0 && (
        <>
          <SectionHeader title="Upcoming Dates" />
          {state.upcomingBookings.map(b => (
            <BookingCard key={b.id} booking={b}
              onPayDeposit={() => payDeposit(b.id)}
              onStartLive={() => {
                startLiveDate(b);
                nav.navigate('LiveDateSafety', { booking: b });
              }} />
          ))}
        </>
      )}

      {state.pastBookings.length > 0 && (
        <>
          <SectionHeader title="Past Dates" />
          {state.pastBookings.map(b => (
            <TouchableOpacity key={b.id}
              onPress={() => nav.navigate('Feedback', { booking: b })} activeOpacity={0.7}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="restaurant-outline" size={24} color={T42.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600' }]}>
                      {b.companion.firstName} · {b.experience.venueName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="calendar-outline" size={12} color={T42.textSecondary} />
                      <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                        {b.scheduledFor.toLocaleDateString()}
                        {b.paymentSplit !== 'pending' && ` · ${b.paymentSplit === 'full' ? 'Date went well' : 'Split 50/50'}`}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="star-outline" size={16} color={T42.gold} />
                    <Text style={[Fonts.caption, { color: T42.gold, fontWeight: '700' }]}>Rate</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function BookingCard({ booking, onStartLive, onPayDeposit }: {
  booking: DateBooking; onStartLive: () => void; onPayDeposit: () => void;
}) {
  const awaitingDeposit = !booking.venueRevealed;

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MatchAvatar name={booking.companion.firstName} size={48} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
              {booking.companion.firstName}
            </Text>
            {awaitingDeposit && <Ionicons name="lock-closed" size={14} color={T42.textSecondary} />}
          </View>
          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
            {awaitingDeposit ? 'Venue hidden' : booking.experience.venueName} · {booking.experience.title}
          </Text>
        </View>
        {booking.confirmationCode && (
          <Text style={[Fonts.caption2, { color: T42.purple }]}>{booking.confirmationCode}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar-outline" size={14} color={T42.textSecondary} />
          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
            {booking.scheduledFor.toLocaleDateString()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="card-outline" size={14} color={T42.textSecondary} />
          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
            ~${booking.experience.estimatedCost}
          </Text>
        </View>
      </View>

      {awaitingDeposit && (
        <View style={s.depositRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="lock-closed-outline" size={14} color={T42.gold} />
            <Text style={[Fonts.caption, { color: T42.gold }]}>
              ${DATE_DEPOSIT} deposit needed from both parties
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <View style={[s.depositDot, booking.yourDeposit && s.depositDotPaid]}>
              <Text style={[Fonts.caption2, { color: booking.yourDeposit ? T42.onGold : T42.textSecondary }]}>
                You {booking.yourDeposit ? '✓' : '...'}
              </Text>
            </View>
            <View style={[s.depositDot, booking.theirDeposit && s.depositDotPaid]}>
              <Text style={[Fonts.caption2, { color: booking.theirDeposit ? T42.onGold : T42.textSecondary }]}>
                {booking.companion.firstName} {booking.theirDeposit ? '✓' : '...'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {booking.selectedAddOns.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {booking.selectedAddOns.map(a => (
            <View key={a.id} style={s.addOnChip}>
              <Text style={[Fonts.caption2, { color: T42.gold }]}>{a.kind}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 14 }}>
        {awaitingDeposit && !booking.yourDeposit ? (
          <GoldButton label={`Pay $${DATE_DEPOSIT} Deposit`} onPress={onPayDeposit} />
        ) : booking.venueRevealed ? (
          <GoldButton label="Start Live Date Mode" onPress={onStartLive} />
        ) : (
          <GhostButton label="Waiting for match's deposit..." onPress={() => {}} tint={T42.textSecondary} />
        )}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  addOnChip: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.gold + '1F',
  },
  depositRow: { marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: T42.gold + '0F' },
  depositDot: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50,
    backgroundColor: T42.surfaceRaised,
  },
  depositDotPaid: { backgroundColor: T42.gold },
});
