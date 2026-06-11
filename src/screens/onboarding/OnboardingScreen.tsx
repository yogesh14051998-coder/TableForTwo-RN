import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { T42, Fonts } from '../../theme/theme';
import { TagChip, GoldButton, GhostButton } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import {
  ALL_GENDERS, ALL_INTERESTS, INTEREST_LIMIT,
  ALL_INCOME_RANGES, ALL_JOB_TYPES, ALL_DRESS_STYLES,
  BACKGROUND_CHECK_FEE,
  type Gender, type InterestTag, type UserProfile,
  type IncomeRange, type JobType, type DressStyle,
} from '../../models/types';

type Step = 'welcome' | 'identity' | 'details' | 'lookingFor' | 'interests' | 'backgroundCheck';
const STEPS: Step[] = ['welcome', 'identity', 'details', 'lookingFor', 'interests', 'backgroundCheck'];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>('welcome');

  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>('Woman');
  const [zipcode, setZipcode] = useState('');
  const [profession, setProfession] = useState('');
  const [jobType, setJobType] = useState<JobType>('9 to 5');
  const [income, setIncome] = useState<IncomeRange>('Prefer not to say');
  const [dressStyle, setDressStyle] = useState<DressStyle>('Smart casual');
  const [bio, setBio] = useState('');

  const [lookingForGender, setLookingForGender] = useState<Gender[]>([]);
  const [minAge, setMinAge] = useState(25);
  const [maxAge, setMaxAge] = useState(38);
  const [minIncome, setMinIncome] = useState<IncomeRange>('Prefer not to say');
  const [lookingForJobTypes, setLookingForJobTypes] = useState<JobType[]>([]);
  const [maxDistance, setMaxDistance] = useState(25);

  const [interests, setInterests] = useState<InterestTag[]>([]);
  const [bgCheckAccepted, setBgCheckAccepted] = useState(false);

  const idx = STEPS.indexOf(step);
  const progress = (idx + 1) / STEPS.length;

  const canContinue = (() => {
    switch (step) {
      case 'welcome': return true;
      case 'identity': return firstName.trim().length > 0 && zipcode.trim().length >= 5;
      case 'details': return true;
      case 'lookingFor': return lookingForGender.length > 0;
      case 'interests': return interests.length >= 1 && interests.length <= INTEREST_LIMIT;
      case 'backgroundCheck': return bgCheckAccepted;
    }
  })();

  const toggleLookingForGender = (g: Gender) => {
    setLookingForGender(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleLookingForJob = (j: JobType) => {
    setLookingForJobTypes(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
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
      firstName, age, gender,
      zipcode, city: '',
      profession: profession || '—',
      jobType, income, dressStyle,
      bio, photos: [],
      interests,
      lookingFor: {
        gender: lookingForGender,
        ageRange: [minAge, maxAge],
        minIncome,
        jobTypes: lookingForJobTypes,
        maxDistance,
      },
      backgroundCheck: 'pending',
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

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Zip code</Text>
            <TextInput value={zipcode} onChangeText={setZipcode} placeholder="33311"
              placeholderTextColor={T42.textSecondary + '80'} keyboardType="number-pad"
              maxLength={5} style={s.input} />

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Profession</Text>
            <TextInput value={profession} onChangeText={setProfession} placeholder="What do you do?"
              placeholderTextColor={T42.textSecondary + '80'} style={s.input} />
          </View>
        )}

        {step === 'details' && (
          <View style={s.section}>
            <Text style={[Fonts.displaySmall, { color: T42.textPrimary }]}>A bit more about you</Text>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Job type</Text>
            <View style={s.chipGrid}>
              {ALL_JOB_TYPES.map(j => (
                <TagChip key={j} label={j} selected={jobType === j} onPress={() => setJobType(j)} />
              ))}
            </View>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Income range</Text>
            <View style={s.chipGrid}>
              {ALL_INCOME_RANGES.map(i => (
                <TagChip key={i} label={i} selected={income === i} onPress={() => setIncome(i)} />
              ))}
            </View>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Dress style</Text>
            <View style={s.chipGrid}>
              {ALL_DRESS_STYLES.map(d => (
                <TagChip key={d} label={d} selected={dressStyle === d} onPress={() => setDressStyle(d)} />
              ))}
            </View>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Bio (optional)</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Tell your date something interesting..."
              placeholderTextColor={T42.textSecondary + '80'} multiline style={[s.input, { height: 80 }]} />
          </View>
        )}

        {step === 'lookingFor' && (
          <View style={s.section}>
            <Text style={[Fonts.displaySmall, { color: T42.textPrimary }]}>What you're looking for</Text>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>Interested in</Text>
            <View style={s.chipRow}>
              {ALL_GENDERS.map(g => (
                <TagChip key={g} label={g} selected={lookingForGender.includes(g)}
                  onPress={() => toggleLookingForGender(g)} />
              ))}
            </View>

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

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>
              Minimum income
            </Text>
            <View style={s.chipGrid}>
              {ALL_INCOME_RANGES.map(i => (
                <TagChip key={i} label={i} selected={minIncome === i} onPress={() => setMinIncome(i)} />
              ))}
            </View>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>
              Preferred job types (optional)
            </Text>
            <View style={s.chipGrid}>
              {ALL_JOB_TYPES.map(j => (
                <TagChip key={j} label={j} selected={lookingForJobTypes.includes(j)}
                  onPress={() => toggleLookingForJob(j)} />
              ))}
            </View>

            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 16 }]}>
              Max distance — {maxDistance} miles
            </Text>
            <Slider minimumValue={5} maximumValue={100} step={5} value={maxDistance}
              onValueChange={v => setMaxDistance(Math.round(v))}
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

        {step === 'backgroundCheck' && (
          <View style={s.section}>
            <View style={s.center}>
              <Text style={{ fontSize: 56 }}>🛡️</Text>
              <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 12 }]}>
                Background Check
              </Text>
              <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 12 }]}>
                Everyone on Table for 2 passes a verified background check before their first date.
                This keeps our community safe and trustworthy.
              </Text>
              <View style={s.feeCard}>
                <Text style={[Fonts.headline, { color: T42.textPrimary }]}>One-time fee</Text>
                <Text style={[Fonts.displayMedium, { color: T42.gold, marginTop: 4 }]}>${BACKGROUND_CHECK_FEE}</Text>
                <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 8 }]}>
                  Verified by a licensed third-party provider. Results typically within 24 hours.
                </Text>
              </View>
              <View style={{ marginTop: 16, width: '100%' }}>
                <GoldButton
                  icon="🛡️"
                  label={bgCheckAccepted ? 'Authorized — Continue' : `Authorize $${BACKGROUND_CHECK_FEE} Check`}
                  onPress={() => setBgCheckAccepted(true)}
                  disabled={bgCheckAccepted}
                />
              </View>
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
            label={step === 'backgroundCheck' ? 'Take a Seat' : 'Continue'}
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
  feeCard: {
    marginTop: 24, padding: 20, borderRadius: 20, width: '100%',
    backgroundColor: T42.surface, borderWidth: 1, borderColor: T42.gold + '59',
    alignItems: 'center',
  },
});
