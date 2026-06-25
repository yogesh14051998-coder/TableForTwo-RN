import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { GoldButton, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { fetchCuratedBatch } from '../../services/services';
import { ALL_INTENT_TYPES, type DateIntentType, type DateIntent } from '../../models/types';
import type { MainStackParams } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MainStackParams>;

const INTENT_META: Record<DateIntentType, { icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; gradient: [string, string]; subtitle: string }> = {
  'Dinner':          { icon: 'restaurant',      gradient: ['#6B3A2A', '#2D1810'], subtitle: 'Restaurants & fine dining' },
  'Activity':        { icon: 'compass',         gradient: ['#1A5E3B', '#0D2E1D'], subtitle: 'Golf, water sports & more' },
  'Drinks':          { icon: 'wine',            gradient: ['#4A1942', '#1E0A1A'], subtitle: 'Wine bars & cocktail lounges' },
  'Open to anything':{ icon: 'sparkles',        gradient: ['#2C3E6B', '#141D35'], subtitle: 'Let the AI decide' },
};

const DAYS = ['Today', 'Tomorrow', 'In 2 days', 'In 3 days', 'In 4 days', 'In 5 days', 'In 6 days'];
const TIMES = ['6:00 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];

function daysFromNow(n: number) { return new Date(Date.now() + n * 86_400_000); }

function buildDate(dayIdx: number, timeStr: string): Date {
  const base = daysFromNow(dayIdx);
  const [rawHour, period] = timeStr.split(' ');
  const [h, m] = rawHour.split(':').map(Number);
  let hour = h;
  if (period === 'PM' && h !== 12) hour += 12;
  base.setHours(hour, m ?? 0, 0, 0);
  return base;
}

export default function DateIntentScreen() {
  const nav = useNavigation<Nav>();
  const { state, postDateIntent } = useApp();

  const [zipcode, setZipcode] = useState(state.currentUser.zipcode);
  const [dayIdx, setDayIdx] = useState(1);
  const [selectedTime, setSelectedTime] = useState('7:00 PM');
  const [intentType, setIntentType] = useState<DateIntentType>('Dinner');
  const [loading, setLoading] = useState(false);

  const canPost = zipcode.trim().length >= 5;

  const handleFind = async () => {
    if (!canPost) return;
    setLoading(true);
    try {
      const intent: DateIntent = {
        id: Math.random().toString(36).slice(2),
        zipcode: zipcode.trim(),
        scheduledFor: buildDate(dayIdx, selectedTime),
        intentType,
        status: 'open',
      };
      postDateIntent(intent);
      const batch = await fetchCuratedBatch(intentType, state.currentUser, intent);
      nav.navigate('CuratedMatch', { batch });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>Plan a date</Text>
        <Text style={[Fonts.body, { color: T42.textSecondary, marginTop: 4, lineHeight: 22 }]}>
          Tell us where you're going and when. We'll find 2–3 people who match your criteria for that night.
        </Text>

        {/* Where are you going */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionIconWrap}>
              <Ionicons name="location" size={18} color={T42.gold} />
            </View>
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>Where are you going?</Text>
          </View>
          <View style={s.zipcodeRow}>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.caption, { color: T42.textSecondary, marginBottom: 6 }]}>Destination zip code</Text>
              <TextInput
                value={zipcode} onChangeText={setZipcode}
                placeholder="e.g. 33487"
                placeholderTextColor={T42.textSecondary + '60'}
                keyboardType="number-pad" maxLength={5}
                style={s.zipcodeInput}
              />
            </View>
            <View style={s.distancePill}>
              <Ionicons name="navigate-circle-outline" size={14} color={T42.purple} />
              <Text style={[Fonts.caption2, { color: T42.purple, marginLeft: 4 }]}>
                within {state.currentUser.lookingFor.maxDistance} mi
              </Text>
            </View>
          </View>
        </View>

        {/* When */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionIconWrap}>
              <Ionicons name="calendar" size={18} color={T42.gold} />
            </View>
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>When?</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
              {DAYS.map((day, i) => {
                const sel = dayIdx === i;
                return (
                  <TouchableOpacity key={day} onPress={() => setDayIdx(i)} activeOpacity={0.7}>
                    {sel ? (
                      <LinearGradient colors={[T42.gold, T42.goldDeep]} style={s.dayChip}>
                        <Text style={[Fonts.subheadline, { color: T42.onGold }]}>{day}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[s.dayChip, { backgroundColor: T42.surfaceRaised, borderWidth: 1, borderColor: T42.stroke }]}>
                        <Text style={[Fonts.subheadline, { color: T42.textPrimary }]}>{day}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {TIMES.map(t => {
              const sel = selectedTime === t;
              return (
                <TouchableOpacity key={t} onPress={() => setSelectedTime(t)} activeOpacity={0.7}>
                  <View style={[s.timeChip, sel && { backgroundColor: T42.gold + '22', borderColor: T42.gold }]}>
                    <Ionicons name="time-outline" size={13} color={sel ? T42.gold : T42.textSecondary} />
                    <Text style={[Fonts.caption, { color: sel ? T42.gold : T42.textSecondary, marginLeft: 4, fontWeight: sel ? '600' : '400' }]}>{t}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* What kind of date */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionIconWrap}>
              <Ionicons name="heart" size={18} color={T42.gold} />
            </View>
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>What kind of date?</Text>
          </View>
          <View style={s.intentGrid}>
            {ALL_INTENT_TYPES.map(type => {
              const meta = INTENT_META[type];
              const sel = intentType === type;
              return (
                <TouchableOpacity key={type} onPress={() => setIntentType(type)} activeOpacity={0.8}
                  style={[s.intentCard, sel && { borderColor: T42.gold, borderWidth: 2 }]}>
                  <LinearGradient colors={meta.gradient} style={s.intentGradient}>
                    <Ionicons name={meta.icon} size={28} color="rgba(255,255,255,0.85)" />
                    <Text style={[Fonts.headline, { color: '#fff', marginTop: 8 }]}>{type}</Text>
                    <Text style={[Fonts.caption, { color: 'rgba(255,255,255,0.55)', marginTop: 2 }]}>{meta.subtitle}</Text>
                    {sel && (
                      <View style={s.intentCheck}>
                        <Ionicons name="checkmark-circle" size={20} color={T42.gold} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary preview */}
        <Card style={{ borderColor: T42.gold + '40', marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="sparkles" size={18} color={T42.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.subheadline, { color: T42.textPrimary, fontWeight: '600' }]}>Your date intent</Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 3, lineHeight: 18 }]}>
                {intentType} · {DAYS[dayIdx]} at {selectedTime} · Zip {zipcode || '—'}
              </Text>
            </View>
          </View>
        </Card>

        <View style={[s.howItWorks, { marginTop: 20 }]}>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginBottom: 10 }]}>What happens next</Text>
          {[
            { step: '1', text: 'We surface 2–3 profiles that match your criteria for this date' },
            { step: '2', text: 'You select one — both credit cards are held for $50 immediately' },
            { step: '3', text: 'Venue is revealed. Lyft, flowers, and reservations handled by us.' },
          ].map(item => (
            <View key={item.step} style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
              <View style={s.stepBubble}>
                <Text style={[Fonts.caption2, { color: T42.onGold }]}>{item.step}</Text>
              </View>
              <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1, lineHeight: 18 }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={s.cta}>
        <GoldButton
          label={loading ? 'Finding your matches...' : 'Find My Matches'}
          onPress={handleFind} loading={loading} disabled={!canPost} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 110, gap: 20 },
  section: {
    backgroundColor: T42.surface,
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: T42.stroke,
    gap: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: T42.gold + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  zipcodeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  zipcodeInput: {
    backgroundColor: T42.surfaceRaised, color: T42.textPrimary,
    padding: 14, borderRadius: 14, fontSize: 18,
    fontWeight: '600', letterSpacing: 2,
  },
  distancePill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 50, backgroundColor: T42.purple + '1A',
    borderWidth: 1, borderColor: T42.purple + '40',
  },
  dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50 },
  timeChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 50, borderWidth: 1, borderColor: T42.stroke,
    backgroundColor: T42.surfaceRaised,
  },
  intentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  intentCard: {
    width: '47%' as any, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  intentGradient: { padding: 14, height: 130, justifyContent: 'flex-end' },
  intentCheck: { position: 'absolute', top: 8, right: 8 },
  howItWorks: { gap: 4 },
  stepBubble: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: T42.gold, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EE' },
});
