import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { SectionHeader, TagChip, GoldButton, TierBadge, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { fetchCuratedBatch } from '../../services/services';
import { ALL_CATEGORIES, CATEGORY_META, tierForBudget, type ExperienceCategory } from '../../models/types';
import type { MainStackParams } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MainStackParams>;

const BUDGET_PRESETS: [number, number][] = [[100, 200], [200, 500], [500, 1000], [1000, 2500]];

function budgetLabel([lo, hi]: [number, number]) {
  return hi >= 2500 ? `$${lo.toLocaleString()}+` : `$${lo.toLocaleString()} – $${hi.toLocaleString()}`;
}

export default function ExperienceSelectionScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { state } = useApp();
  const preselect = route.params?.preselect as ExperienceCategory | undefined;

  const [category, setCategory] = useState<ExperienceCategory>(preselect ?? 'Fine Dining');
  const [budget, setBudget] = useState<[number, number]>([200, 500]);
  const [loading, setLoading] = useState(false);

  const tier = tierForBudget(budget[1]);

  const handleFind = async () => {
    setLoading(true);
    try {
      const batch = await fetchCuratedBatch(
        { category, budgetRange: budget, dateTime: new Date(Date.now() + 2 * 86_400_000) },
        state.currentUser,
      );
      nav.navigate('CuratedMatch', { batch });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>Date first. Swipe never.</Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 6 }]}>
          Pick the experience and we'll curate who joins you at the table.
        </Text>

        {/* Category Grid */}
        <SectionHeader title="Experience" />
        <View style={s.categoryGrid}>
          {ALL_CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat];
            const selected = category === cat;
            return (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)} activeOpacity={0.7}
                style={[s.categoryCard, {
                  backgroundColor: selected ? T42.surfaceRaised : T42.surface,
                  borderColor: selected ? T42.gold : T42.stroke,
                  borderWidth: selected ? 1.5 : 1,
                }]}>
                <View style={s.categoryIcon}>
                  <Text style={{ fontSize: 22 }}>{meta.icon}</Text>
                </View>
                <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 8 }]}>{cat}</Text>
                <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 4 }]}
                  numberOfLines={2}>{meta.tagline}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Budget */}
        <SectionHeader title="Budget for two" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {BUDGET_PRESETS.map(range => (
              <TagChip key={range.join('-')} label={budgetLabel(range)} icon="💰"
                selected={budget[0] === range[0] && budget[1] === range[1]}
                onPress={() => setBudget(range)} />
            ))}
          </View>
        </ScrollView>

        {/* Tier callout */}
        <Card style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 24 }}>👑</Text>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.headline, { color: T42.textPrimary }]}>{tier} package</Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                Curated venues in the {tierForBudget(budget[1]) === 'Entry' ? '$200+' :
                  tier === 'Core' ? '$400 – $800' : '$1,000+'} range
              </Text>
            </View>
            <TierBadge tier={tier} />
          </View>
        </Card>
      </ScrollView>

      <View style={s.cta}>
        <GoldButton icon="✨" label={loading ? 'Curating...' : 'Curate My 3 Matches'}
          onPress={handleFind} loading={loading} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 100, gap: 20 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  categoryCard: { width: '47%' as any, padding: 14, borderRadius: 18 },
  categoryIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: T42.surfaceRaised, alignItems: 'center', justifyContent: 'center',
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EB' },
});
