import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { T42, Fonts } from '../../theme/theme';
import { TagChip, GoldButton, GhostButton } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import {
  ALL_GENDERS, ALL_INTERESTS, INTEREST_LIMIT,
  type Gender, type InterestTag, type UserProfile,
} from '../../models/types';

type Step = 'welcome' | 'identity' | 'preferences' | 'interests';
const STEPS: Step[] = ['welcome', 'identity', 'preferences', 'interests'];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>('welcome');

  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>('Woman');
  const [interestedIn, setInterestedIn] = useState<Gender[]>([]);
  const [minAge, setMinAge] = useState(25);
  const [maxAge, setMaxAge] = useState(38);
  const [city, setCity] = useState('Los Angeles, CA');
  const [profession, setProfession] = useState('');
  const [interests, setInterests] = useState<InterestTag[]>([]);

  const idx = STEPS.indexOf(step);
  const progress = (idx + 1) / STEPS.length;

  const canContinue = (() => {
    switch (step) {
      case 'welcome': return true;
      case 'identity': return firstName.trim().length > 0 && interestedIn.length > 0;
      case 'preferences': return city.trim().length > 0;
      case 'interests': return interests.length >= 1 && interests.length <= INTEREST_LIMIT;
    }
  })();

  const toggleInterestedIn = (g: Gender) => {
    setInterestedIn(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleInterest = (tag: InterestTag) => {
    setInterests(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < INTEREST_LIMIT ? [...prev, tag] : prev
    );
  };

  const advance = () => {
    const next = STEPS[idx + 1];
    if (next) { setStep(next); return; }
    const user: UserProfile = {
      id: Math.random().toString(36).slice(2),
      firstName, age, gender, interestedIn,
      preferredAgeRange: [minAge, maxAge],
      city, profession: profession || '—', bio: '', interests,
    };
    completeOnboarding(user);
  };

  const back = () => { if (idx > 0) setStep(STEPS[idx - 1]); };

  return (
    <View style={s.root}>
      <View style={s.progressTrack}>
        <LinearGradient colors={[T42.gold, T42.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[s.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {step === 'welcome' && (
          <View style={s.center}>
            <Text style={{ fontSize: 72 }}>🍽️</Text>
            <Text style={[Fonts.displayLarge, { color: T42.textPrimary, marginTop: 12 }]}>Table for 2</Text>
            <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 12 }]}>
              From match to memory.{'\n'}Pick the experience first — we'll curate who joins you.
            </Text>
          </View>
        )}

        {step === 'identity' && (
          <View style={s.section}>
            <Text style={[Fonts.displaySmall, { color: T42.textPrimary }]}>About you</Text>
            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>First name</Text>
            <TextInput value={firstName} onChangeText={setFirstName} placeholder="Your name"
              placeholderTextColor={T42.textSecondary + '80'} style={s.input} />

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Age — {age}</Text>
            <Slider minimumValue={18} maximumValue={80} step={1} value={age}
              onValueChange={v => setAge(Math.round(v))}
              minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
              thumbTintColor={T42.gold} style={{ marginTop: 4 }} />

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>I am</Text>
            <View style={s.chipRow}>
              {ALL_GENDERS.map(g => (
                <TagChip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
              ))}
            </View>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Interested in</Text>
            <View style={s.chipRow}>
              {ALL_GENDERS.map(g => (
                <TagChip key={g} label={g} selected={interestedIn.includes(g)}
                  onPress={() => toggleInterestedIn(g)} />
              ))}
            </View>
          </View>
        )}

        {step === 'preferences' && (
          <View style={s.section}>
            <Text style={[Fonts.displaySmall, { color: T42.textPrimary }]}>Preferences</Text>
            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Location</Text>
            <TextInput value={city} onChangeText={setCity} placeholder="City, State"
              placeholderTextColor={T42.textSecondary + '80'} style={s.input} />

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Profession (optional)</Text>
            <TextInput value={profession} onChangeText={setProfession} placeholder="What do you do?"
              placeholderTextColor={T42.textSecondary + '80'} style={s.input} />

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>
              Age range — {minAge} to {maxAge}
            </Text>
            <Slider minimumValue={18} maximumValue={60} step={1} value={minAge}
              onValueChange={v => setMinAge(Math.round(v))}
              minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
              thumbTintColor={T42.gold} style={{ marginTop: 4 }} />
            <Slider minimumValue={minAge} maximumValue={80} step={1} value={maxAge}
              onValueChange={v => setMaxAge(Math.round(v))}
              minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
              thumbTintColor={T42.gold} style={{ marginTop: 4 }} />
          </View>
        )}

        {step === 'interests' && (
          <View style={s.section}>
            <Text style={[Fonts.displaySmall, { color: T42.textPrimary }]}>Your interests</Text>
            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 4 }]}>
              Select up to {INTEREST_LIMIT} — {interests.length} of {INTEREST_LIMIT} chosen
            </Text>
            <View style={s.chipGrid}>
              {ALL_INTERESTS.map(tag => (
                <TagChip key={tag} label={tag} selected={interests.includes(tag)}
                  onPress={() => toggleInterest(tag)} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        {step !== 'welcome' && (
          <View style={{ width: 110 }}>
            <GhostButton label="Back" onPress={back} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <GoldButton
            label={step === 'interests' ? 'Take a Seat' : 'Continue'}
            onPress={advance} disabled={!canContinue} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  progressTrack: { height: 4, backgroundColor: T42.surfaceRaised, marginHorizontal: 24, marginTop: 60 },
  progressFill: { height: 4, borderRadius: 2 },
  content: { padding: 24, paddingBottom: 100 },
  center: { alignItems: 'center', paddingTop: 48 },
  section: {},
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  input: {
    backgroundColor: T42.surfaceRaised, color: T42.textPrimary,
    padding: 14, borderRadius: 14, marginTop: 8, fontSize: 15,
  },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 34, paddingTop: 8 },
});
