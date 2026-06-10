import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { SectionHeader, Card, MatchAvatar, GoldButton } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { ADDON_ICONS, type DateBooking } from '../../models/types';
import type { MainStackParams } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function BookingsScreen() {
  const nav = useNavigation<Nav>();
  const { state, startLiveDate } = useApp();

  const hasAny = state.upcomingBookings.length > 0 || state.pastBookings.length > 0;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {!hasAny && (
        <View style={{ alignItems: 'center', paddingTop: 80 }}>
          <Text style={{ fontSize: 52 }}>📅</Text>
          <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 12 }]}>
            Nothing on the calendar
          </Text>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            Confirmed dates appear here with every detail handled.
          </Text>
        </View>
      )}

      {state.upcomingBookings.length > 0 && (
        <>
          <SectionHeader title="Upcoming" />
          {state.upcomingBookings.map(b => (
            <BookingCard key={b.id} booking={b} onStartLive={() => {
              startLiveDate(b);
              nav.navigate('LiveDateSafety', { booking: b });
            }} />
          ))}
        </>
      )}

      {state.pastBookings.length > 0 && (
        <>
          <SectionHeader title="Past dates" />
          {state.pastBookings.map(b => (
            <TouchableOpacity key={b.id}
              onPress={() => nav.navigate('Feedback', { booking: b })} activeOpacity={0.7}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 24 }}>🍽️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600' }]}>
                      {b.companion.firstName} · {b.experience.venueName}
                    </Text>
                    <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                      {b.scheduledFor.toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[Fonts.caption, { color: T42.gold, fontWeight: '700' }]}>Rate</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function BookingCard({ booking, onStartLive }: { booking: DateBooking; onStartLive: () => void }) {
  const total = booking.experience.estimatedCost + booking.selectedAddOns.reduce((s, a) => s + a.price, 0);

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MatchAvatar name={booking.companion.firstName} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
            {booking.companion.firstName} · {booking.experience.venueName}
          </Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
            {booking.experience.venueDetail}
          </Text>
        </View>
        {booking.confirmationCode && (
          <Text style={[Fonts.caption2, { color: T42.purple }]}>{booking.confirmationCode}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
        <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
          📅 {booking.scheduledFor.toLocaleDateString()}
        </Text>
        <Text style={[Fonts.caption, { color: T42.textSecondary }]}>💳 ${total}</Text>
      </View>

      {booking.selectedAddOns.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {booking.selectedAddOns.map(a => (
            <View key={a.id} style={s.addOnChip}>
              <Text style={[Fonts.caption2, { color: T42.gold }]}>
                {ADDON_ICONS[a.kind]} {a.kind}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 14 }}>
        <GoldButton icon="🛡️" label="Start Live Date Mode" onPress={onStartLive} />
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
});
