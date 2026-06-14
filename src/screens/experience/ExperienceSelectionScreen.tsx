import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { GoldButton, Card, IconLabel } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { fetchCuratedBatch } from '../../services/services';
import { ALL_CATEGORIES, CATEGORY_META, type ExperienceCategory } from '../../models/types';
import type { MainStackParams } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MainStackParams>;

const CATEGORY_ICONS: Record<ExperienceCategory, keyof typeof Ionicons.glyphMap> = {
  Dinner: 'restaurant',
  Activity: 'compass',
  Drinks: 'wine',
  Custom: 'sparkles',
};

const CATEGORY_GRADIENTS: Record<ExperienceCategory, [string, string]> = {
  Dinner: ['#6B3A2A', '#2D1810'],
  Activity: ['#1A5E3B', '#0D2E1D'],
  Drinks: ['#4A1942', '#1E0A1A'],
  Custom: ['#2C3E6B', '#141D35'],
};

const CATEGORY_SUBTITLES: Record<ExperienceCategory, string> = {
  Dinner: 'Curated restaurants',
  Activity: 'Trips, Fun, Memories',
  Drinks: 'Cocktail bars & lounges',
  Custom: 'Create your own',
};

export default function ExperienceSelectionScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { state } = useApp();
  const preselect = route.params?.preselect as ExperienceCategory | undefined;

  const [category, setCategory] = useState<ExperienceCategory>(preselect ?? 'Dinner');
  const [loading, setLoading] = useState(false);

  const handleFind = async () => {
    setLoading(true);
    try {
      const batch = await fetchCuratedBatch(category, state.currentUser);
      nav.navigate('CuratedMatch', { batch });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>
          What would you like{'\n'}to do?
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 6 }]}>
          Choose an experience. We'll find people who love the same kind of date as you.
        </Text>

        {/* 2x2 Category Grid */}
        <View style={s.categoryGrid}>
          {ALL_CATEGORIES.map(cat => {
            const selected = category === cat;
            const gradient = CATEGORY_GRADIENTS[cat];
            return (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)} activeOpacity={0.7}
                style={[s.categoryCard, selected && s.categorySelected]}>
                <LinearGradient colors={gradient} style={s.categoryGradient}>
                  <Ionicons name={CATEGORY_ICONS[cat]} size={36} color="rgba(255,255,255,0.85)" />
                  <Text style={[Fonts.headline, { color: '#fff', marginTop: 10 }]}>{cat}</Text>
                  <Text style={[Fonts.caption, { color: 'rgba(255,255,255,0.6)', marginTop: 2 }]}>
                    {CATEGORY_SUBTITLES[cat]}
                  </Text>
                  {selected && (
                    <View style={s.selectedDot}>
                      <Ionicons name="checkmark-circle" size={20} color={T42.gold} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Budget Range */}
        <Card style={{ marginTop: 16 }}>
          <IconLabel icon="wallet-outline" label="Budget Range" color={T42.textSecondary} />
          <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 4 }]}>$200 — $800</Text>
        </Card>

        {/* Date & Time */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <IconLabel icon="calendar-outline" label="Date & Time" color={T42.textSecondary} />
              <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 4 }]}>
                {new Date(Date.now() + 5 * 86400000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} — 7:00 PM
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={T42.textSecondary} />
          </View>
        </Card>

        {/* Location */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.locationIcon}>
              <Ionicons name="location" size={22} color={T42.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>Location</Text>
              <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 2 }]}>
                {state.currentUser.city || `Zip ${state.currentUser.zipcode}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={T42.textSecondary} />
          </View>
        </Card>
      </ScrollView>

      <View style={s.cta}>
        <GoldButton label={loading ? 'Finding matches...' : 'Find My Matches'}
          onPress={handleFind} loading={loading} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 100, gap: 10 },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16,
  },
  categoryCard: {
    width: '47%' as any, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  categorySelected: { borderColor: T42.gold },
  categoryGradient: {
    padding: 16, height: 140,
    justifyContent: 'flex-end',
  },
  selectedDot: { position: 'absolute', top: 10, right: 10 },
  locationIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: T42.gold + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EB' },
});
