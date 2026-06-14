import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { SectionHeader, Card, MatchAvatar, PartnerBadge } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { getRecommendations } from '../../services/services';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { Experience } from '../../models/types';
import { CATEGORY_META } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function ExperienceHubScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useApp();
  const recommended = getRecommendations(state.currentUser);
  const lastDate = state.pastBookings[0];

  const timeGreeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>
        {timeGreeting}, {state.currentUser.firstName}
      </Text>
      <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 4 }]}>
        What kind of memory will you make?
      </Text>

      {/* Quick action grid */}
      <View style={s.quickGrid}>
        <TouchableOpacity onPress={() => nav.navigate('ExperienceSelection')} style={s.quickCard} activeOpacity={0.8}>
          <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.quickGradient}>
            <Ionicons name="search" size={28} color="#fff" />
            <Text style={[Fonts.headline, { color: '#fff', marginTop: 8 }]}>Find Matches</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => nav.navigate('ExperienceSelection')} style={s.quickCard} activeOpacity={0.8}>
          <LinearGradient colors={[T42.gold, T42.goldDeep]} style={s.quickGradient}>
            <Ionicons name="compass" size={28} color={T42.onGold} />
            <Text style={[Fonts.headline, { color: T42.onGold, marginTop: 8 }]}>Experience</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={s.quickGrid}>
        <TouchableOpacity style={s.quickCard} activeOpacity={0.8}>
          <View style={[s.quickGradient, { backgroundColor: T42.surface, borderWidth: 1, borderColor: T42.stroke }]}>
            <Ionicons name="chatbubble-outline" size={28} color={T42.gold} />
            <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 8 }]}>Messages</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.quickCard} activeOpacity={0.8}>
          <View style={[s.quickGradient, { backgroundColor: T42.surface, borderWidth: 1, borderColor: T42.stroke }]}>
            <Ionicons name="calendar-outline" size={28} color={T42.gold} />
            <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 8 }]}>Bookings</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recommended */}
      <SectionHeader title="Recommended For You" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommended.map(exp => (
          <TouchableOpacity key={exp.id} onPress={() => nav.navigate('ExperienceSelection', { preselect: exp.category })}
            activeOpacity={0.8} style={{ marginRight: 14 }}>
            <ExperienceCard experience={exp} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Past dates */}
      {state.pastBookings.length > 0 && (
        <>
          <SectionHeader title="Past Dates" />
          {state.pastBookings.map(booking => (
            <TouchableOpacity key={booking.id}
              onPress={() => nav.navigate('Feedback', { booking })} activeOpacity={0.7}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MatchAvatar name={booking.companion.firstName} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
                      {booking.companion.firstName}
                    </Text>
                    <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                      {booking.experience.venueName} · {booking.scheduledFor.toLocaleDateString()}
                    </Text>
                    {booking.paymentSplit === 'full' && (
                      <Text style={[Fonts.caption, { color: T42.success, marginTop: 2 }]}>
                        Date went well
                      </Text>
                    )}
                  </View>
                  {booking.paymentSplit === 'full' && (
                    <TouchableOpacity style={s.inviteAgainBtn} activeOpacity={0.7}>
                      <Ionicons name="refresh" size={16} color={T42.gold} />
                      <Text style={[Fonts.caption2, { color: T42.gold }]}>Invite Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Plan another date */}
      <View style={{ marginTop: 8 }}>
        <TouchableOpacity onPress={() => nav.navigate('ExperienceSelection')} activeOpacity={0.8}>
          <LinearGradient colors={[T42.gold, T42.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.planBtn}>
            <Ionicons name="add-circle-outline" size={20} color={T42.onGold} />
            <Text style={[Fonts.headline, { color: T42.onGold, marginLeft: 8 }]}>Plan Another Date</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ExperienceCard({ experience }: { experience: Experience }) {
  const meta = CATEGORY_META[experience.category];
  const icon = experience.category === 'Dinner' ? 'restaurant-outline' as const
    : experience.category === 'Activity' ? 'compass-outline' as const
    : experience.category === 'Drinks' ? 'wine-outline' as const
    : 'sparkles-outline' as const;

  return (
    <View style={s.expCard}>
      <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.expCardImage}>
        <Ionicons name={icon} size={36} color="rgba(255,255,255,0.9)" />
      </LinearGradient>
      <View style={s.expCardBody}>
        <Text style={[Fonts.headline, { color: T42.textPrimary }]} numberOfLines={2}>
          {experience.title}
        </Text>
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 4 }]} numberOfLines={1}>
          {experience.venueName}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={[Fonts.caption, { color: T42.gold, fontWeight: '600' }]}>
            ~${experience.estimatedCost}
          </Text>
          <PartnerBadge provider={experience.provider} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  quickGrid: { flexDirection: 'row', gap: 12 },
  quickCard: { flex: 1 },
  quickGradient: { padding: 16, borderRadius: 18, height: 100, justifyContent: 'flex-end' },
  planBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 50,
  },
  inviteAgainBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 50,
    backgroundColor: T42.gold + '1A',
  },
  expCard: { width: 220, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: T42.stroke },
  expCardImage: { height: 100, alignItems: 'center', justifyContent: 'center' },
  expCardBody: { padding: 14, backgroundColor: T42.surface },
});
