import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { SectionHeader, Card, MatchAvatar, GhostButton, PartnerBadge } from '../../components/SharedComponents';
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

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Greeting */}
      <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>
        Good evening, {state.currentUser.firstName}
      </Text>
      <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 4 }]}>
        {state.currentUser.zipcode} · {state.currentUser.city || 'Your area'}
      </Text>

      {/* Plan another date CTA */}
      <TouchableOpacity onPress={() => nav.navigate('ExperienceSelection')} activeOpacity={0.8}>
        <Card style={s.planCard}>
          <Text style={{ fontSize: 24 }}>✨</Text>
          <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 8 }]}>Plan another date</Text>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 6 }]}>
            Choose an experience near your zipcode and meet someone who already said yes to the same evening.
          </Text>
          <Text style={{ alignSelf: 'flex-end', fontSize: 28, marginTop: 8 }}>➡️</Text>
        </Card>
      </TouchableOpacity>

      {/* Recommended */}
      <SectionHeader title="Recommended for you" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {recommended.map(exp => (
          <TouchableOpacity key={exp.id} onPress={() => nav.navigate('ExperienceSelection', { preselect: exp.category })}
            activeOpacity={0.8} style={{ marginRight: 14 }}>
            <ExperienceCard experience={exp} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Last date */}
      {lastDate && (
        <>
          <SectionHeader title="Your last date" />
          <Card style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MatchAvatar name={lastDate.companion.firstName} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
                  {lastDate.companion.firstName} · {lastDate.experience.venueName}
                </Text>
                <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                  {lastDate.scheduledFor.toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <GhostButton label="Rate your date" tint={T42.gold}
                onPress={() => nav.navigate('Feedback', { booking: lastDate })} />
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

function ExperienceCard({ experience }: { experience: Experience }) {
  const meta = CATEGORY_META[experience.category];
  return (
    <View style={s.expCard}>
      <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.expCardImage}>
        <Text style={{ fontSize: 40 }}>{meta.icon}</Text>
      </LinearGradient>
      <View style={s.expCardBody}>
        <Text style={[Fonts.headline, { color: T42.textPrimary }]} numberOfLines={2}>
          {experience.title}
        </Text>
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 4 }]} numberOfLines={1}>
          {experience.venueName} — {experience.venueDetail}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={[Fonts.caption, { color: T42.gold, fontWeight: '600' }]}>
            ~${experience.estimatedCost} for two
          </Text>
          <PartnerBadge provider={experience.provider} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 40, gap: 24 },
  planCard: { borderColor: T42.gold + '59', borderWidth: 1 },
  expCard: { width: 250, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: T42.stroke },
  expCardImage: { height: 110, alignItems: 'center', justifyContent: 'center' },
  expCardBody: { padding: 14, backgroundColor: T42.surface },
});
