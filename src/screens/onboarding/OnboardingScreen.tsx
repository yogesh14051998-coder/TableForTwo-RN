import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { T42, Fonts } from '../../theme/theme';
import { TagChip, GoldButton, GhostButton, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import {
  ALL_GENDERS, SHORT_GENDERS, ALL_INTERESTS, INTEREST_LIMIT, ALL_HEIGHTS, ALL_INCOME_RANGES, ALL_JOB_TYPES,
  BACKGROUND_CHECK_FEE,
  type Gender, type InterestTag, type UserProfile, type HeightRange, type IncomeRange, type JobType,
} from '../../models/types';

const { width } = Dimensions.get('window');

type Step = 'welcome' | 'about' | 'lookingFor' | 'backgroundCheck';
const STEPS: Step[] = ['welcome', 'about', 'lookingFor', 'backgroundCheck'];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>('welcome');

  // About you
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>('Woman');
  const [height, setHeight] = useState<HeightRange>('5\'4"–5\'6"');
  const [income, setIncome] = useState<IncomeRange>('Prefer not to say');
  const [jobType, setJobType] = useState<JobType>('9 to 5');
  const [zipcode, setZipcode] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<InterestTag[]>([]);

  // Looking for
  const [lookingForGender, setLookingForGender] = useState<Gender[]>([]);
  const [ageMin, setAgeMin] = useState(25);
  const [ageMax, setAgeMax] = useState(45);
  const [minIncome, setMinIncome] = useState<IncomeRange>('Prefer not to say');
  const [maxDistance, setMaxDistance] = useState(25);
  const [minHeight, setMinHeight] = useState<HeightRange>('Prefer not to say');

  // Background check
  const [bgCheckPaid, setBgCheckPaid] = useState(false);

  const idx = STEPS.indexOf(step);

  const toggleGender = (g: Gender) => setLookingForGender(prev =>
    prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const toggleInterest = (tag: InterestTag) => setInterests(prev =>
    prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < INTEREST_LIMIT ? [...prev, tag] : prev);

  const canContinue = (() => {
    if (step === 'about') return firstName.trim().length > 0 && zipcode.trim().length >= 5 && interests.length >= 1;
    if (step === 'lookingFor') return lookingForGender.length > 0;
    if (step === 'backgroundCheck') return bgCheckPaid;
    return true;
  })();

  const advance = () => {
    if (step === 'backgroundCheck') {
      const user: UserProfile = {
        id: Math.random().toString(36).slice(2),
        firstName, age, gender, height,
        zipcode, city: '',
        profession: '',
        jobType,
        income,
        dressStyle: 'Smart casual',
        bio,
        photos: [],
        interests,
        lookingFor: {
          gender: lookingForGender,
          ageRange: [ageMin, ageMax],
          minIncome,
          jobTypes: [],
          maxDistance,
          minHeight: minHeight === 'Prefer not to say' ? undefined : minHeight,
        },
        backgroundCheck: 'clear',
        backgroundCheckNotes: 'Verified — no criminal record. Check completed via Checkr.',
      };
      completeOnboarding(user);
      return;
    }
    const next = STEPS[idx + 1];
    if (next) setStep(next);
  };

  const back = () => { if (idx > 0) setStep(STEPS[idx - 1]); };

  // WELCOME
  if (step === 'welcome') {
    return (
      <View style={s.root}>
        <ScrollView contentContainerStyle={s.welcomeContent}>
          <Image
            source={require('../../../assets/logo.jpeg')}
            style={s.welcomeLogo}
            resizeMode="contain"
          />
          <Text style={s.welcomeTagline}>Where real connections begin.</Text>
          <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center', marginTop: 16 }]}>
            No swiping.{'\n'}No endless messaging.{'\n'}Just great dates.
          </Text>
          <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 14, paddingHorizontal: 20, lineHeight: 22 }]}>
            Table for 2 matches you with 2–3 people who fit your exact preferences — then locks in the date.
          </Text>

          <View style={s.pillRow}>
            {['AI-curated matches', 'Background verified', 'Date in days, not weeks'].map(t => (
              <View key={t} style={s.pill}>
                <Ionicons name="checkmark-circle" size={14} color={T42.gold} />
                <Text style={[Fonts.caption, { color: T42.gold, marginLeft: 5 }]}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={{ width: '100%', gap: 12, marginTop: 32 }}>
            <GoldButton label="Create Your Profile" onPress={() => setStep('about')} />
            <GhostButton label="Log In" onPress={() => setStep('about')} />
          </View>

          <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginTop: 32, letterSpacing: 1 }]}>
            Inclusive · Intentional · Experience-Driven
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Progress */}
      <View style={s.progressTrack}>
        <LinearGradient colors={[T42.gold, T42.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[s.progressFill, { width: `${(idx / (STEPS.length - 1)) * 100}%` as any }]} />
      </View>
      <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginTop: 8 }]}>
        Step {idx} of {STEPS.length - 1}
      </Text>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── ABOUT YOU ── */}
        {step === 'about' && (
          <View>
            <Image source={require('../../../assets/logo.jpeg')} style={s.smallLogo} resizeMode="contain" />
            <Text style={[Fonts.displayMedium, { color: T42.textPrimary, marginTop: 12 }]}>Tell us about you</Text>
            <Text style={[Fonts.body, { color: T42.textSecondary, marginTop: 6 }]}>
              Your profile is shown to potential matches. Be honest — it improves your results.
            </Text>

            <Text style={s.label}>First name</Text>
            <TextInput value={firstName} onChangeText={setFirstName} placeholder="Your name"
              placeholderTextColor={T42.textSecondary + '80'} style={s.input} />

            <Text style={s.label}>I identify as</Text>
            <View style={s.chipGrid}>
              {SHORT_GENDERS.map(g => (
                <TagChip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
              ))}
            </View>

            <Text style={s.label}>My age</Text>
            <View style={s.ageRow}>
              <Text style={[Fonts.displaySmall, { color: T42.gold }]}>{age}</Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>years old</Text>
            </View>
            <Slider minimumValue={18} maximumValue={100} step={1} value={age}
              onValueChange={v => setAge(Math.round(v))}
              minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
              thumbTintColor={T42.gold} />

            <Text style={s.label}>My height</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                {ALL_HEIGHTS.map(h => (
                  <TagChip key={h} label={h} selected={height === h} onPress={() => setHeight(h)} />
                ))}
              </View>
            </ScrollView>

            <Text style={s.label}>Annual income</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                {ALL_INCOME_RANGES.map(r => (
                  <TagChip key={r} label={r} selected={income === r} onPress={() => setIncome(r)} />
                ))}
              </View>
            </ScrollView>

            <Text style={s.label}>Work style</Text>
            <View style={s.chipGrid}>
              {['9 to 5', 'Freelance', 'Business owner', 'Remote'].map(j => (
                <TagChip key={j} label={j} selected={jobType === j as JobType}
                  onPress={() => setJobType(j as JobType)} />
              ))}
            </View>

            <Text style={s.label}>My zip code</Text>
            <TextInput value={zipcode} onChangeText={setZipcode} placeholder="e.g. 33311"
              placeholderTextColor={T42.textSecondary + '80'} keyboardType="number-pad"
              maxLength={5} style={s.input} />

            <Text style={s.label}>A little about me</Text>
            <TextInput value={bio} onChangeText={setBio}
              placeholder="What makes you who you are? (optional)"
              placeholderTextColor={T42.textSecondary + '80'}
              multiline numberOfLines={3} style={[s.input, { height: 80, textAlignVertical: 'top' }]} />

            <Text style={[s.label, { marginTop: 24 }]}>
              Interests (pick up to {INTEREST_LIMIT})
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{interests.length} of {INTEREST_LIMIT} chosen</Text>
            <View style={s.chipGrid}>
              {ALL_INTERESTS.map(tag => (
                <TagChip key={tag} label={tag} selected={interests.includes(tag)}
                  onPress={() => toggleInterest(tag)} />
              ))}
            </View>
          </View>
        )}

        {/* ── LOOKING FOR ── */}
        {step === 'lookingFor' && (
          <View>
            <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>Who are you looking for?</Text>
            <Text style={[Fonts.body, { color: T42.textSecondary, marginTop: 6, lineHeight: 22 }]}>
              Be specific. Our AI only shows you profiles that match these preferences exactly — no wasted time.
            </Text>

            <Text style={s.label}>Interested in</Text>
            <View style={s.chipGrid}>
              {SHORT_GENDERS.filter(g => g !== 'Prefer not to say').map(g => (
                <TagChip key={g}
                  label={g === 'Man' ? 'Men' : g === 'Woman' ? 'Women' : g}
                  selected={lookingForGender.includes(g)}
                  onPress={() => toggleGender(g)} />
              ))}
            </View>

            <Text style={s.label}>Age range — {ageMin} to {ageMax}</Text>
            <View style={{ gap: 4 }}>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>Minimum age: {ageMin}</Text>
              <Slider minimumValue={18} maximumValue={Math.min(ageMax - 1, 99)} step={1} value={ageMin}
                onValueChange={v => setAgeMin(Math.round(v))}
                minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
                thumbTintColor={T42.gold} />
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>Maximum age: {ageMax}</Text>
              <Slider minimumValue={Math.max(ageMin + 1, 19)} maximumValue={100} step={1} value={ageMax}
                onValueChange={v => setAgeMax(Math.round(v))}
                minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
                thumbTintColor={T42.gold} />
            </View>

            <Text style={s.label}>Minimum height preference</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                {ALL_HEIGHTS.map(h => (
                  <TagChip key={h} label={h} selected={minHeight === h} onPress={() => setMinHeight(h)} />
                ))}
              </View>
            </ScrollView>

            <Text style={s.label}>Minimum income</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                {ALL_INCOME_RANGES.map(r => (
                  <TagChip key={r} label={r} selected={minIncome === r} onPress={() => setMinIncome(r)} />
                ))}
              </View>
            </ScrollView>

            <Text style={s.label}>Max travel distance — {maxDistance} miles</Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
              ±20% tolerance applied by the matching algorithm
            </Text>
            <Slider minimumValue={5} maximumValue={100} step={5} value={maxDistance}
              onValueChange={v => setMaxDistance(Math.round(v))}
              minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
              thumbTintColor={T42.gold} style={{ marginTop: 8 }} />

            <Card style={{ marginTop: 20, borderColor: T42.purple + '60' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <Ionicons name="sparkles" size={20} color={T42.purple} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[Fonts.headline, { color: T42.textPrimary }]}>How our matching works</Text>
                  <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 4, lineHeight: 18 }]}>
                    You will receive 2–3 curated profiles from people who meet your exact criteria. No browsing, no swiping — our AI does the work.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* ── BACKGROUND CHECK ── */}
        {step === 'backgroundCheck' && (
          <View style={s.center}>
            <Ionicons name="shield-checkmark" size={64} color={T42.gold} />
            <Text style={[Fonts.displayMedium, { color: T42.textPrimary, marginTop: 16, textAlign: 'center' }]}>
              Background Verification
            </Text>
            <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 }]}>
              Every member of Table for 2 completes a background check before their first date.
              Results are shown on your profile — not to gatekeep, but so matches know who they are meeting.
            </Text>

            <Card style={s.feeCard}>
              <Ionicons name="shield-checkmark-outline" size={32} color={T42.gold} />
              <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 8 }]}>One-time fee</Text>
              <Text style={[Fonts.displayMedium, { color: T42.gold, marginTop: 4 }]}>${BACKGROUND_CHECK_FEE}</Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 18 }]}>
                Verified by a licensed third-party provider (Checkr).{'\n'}
                Results typically within 24 hours.
              </Text>
            </Card>

            <Card style={{ marginTop: 16, width: '100%', borderColor: T42.purple + '40' }}>
              <Text style={[Fonts.headline, { color: T42.textPrimary, marginBottom: 10 }]}>What shows on your profile</Text>
              {[
                { icon: 'checkmark-circle-outline' as const, label: '"Background Verified" badge' },
                { icon: 'document-text-outline' as const, label: 'A brief plain-English summary visible to your matches' },
                { icon: 'lock-closed-outline' as const, label: 'No raw criminal records — your privacy is protected' },
              ].map(item => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <Ionicons name={item.icon} size={16} color={T42.gold} style={{ marginTop: 1 }} />
                  <Text style={[Fonts.caption, { color: T42.textSecondary, flex: 1, lineHeight: 18 }]}>{item.label}</Text>
                </View>
              ))}
            </Card>

            <View style={{ marginTop: 16, width: '100%' }}>
              {bgCheckPaid ? (
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={22} color={T42.success} />
                  <Text style={[Fonts.headline, { color: T42.success }]}>Verified — You're all set</Text>
                </View>
              ) : (
                <GoldButton label={`Pay $${BACKGROUND_CHECK_FEE} & Verify`} onPress={() => setBgCheckPaid(true)} />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        {idx > 1 && (
          <View style={{ width: 90 }}>
            <GhostButton label="Back" onPress={back} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <GoldButton
            label={step === 'backgroundCheck' ? 'Enter Table for 2' : 'Continue'}
            onPress={advance} disabled={!canContinue} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  welcomeContent: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    padding: 28, paddingTop: 80, paddingBottom: 50,
  },
  welcomeLogo: { width: width * 0.55, height: width * 0.45 },
  welcomeTagline: {
    color: T42.gold, fontSize: 17, fontFamily: 'serif',
    fontStyle: 'italic', marginTop: 16, letterSpacing: 0.5,
  },
  pillRow: { gap: 8, marginTop: 24, alignItems: 'flex-start', width: '100%' },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50,
    backgroundColor: T42.gold + '14', borderWidth: 1, borderColor: T42.gold + '30',
  },
  progressTrack: { height: 3, backgroundColor: T42.surfaceRaised, marginHorizontal: 24, marginTop: 56 },
  progressFill: { height: 3, borderRadius: 2 },
  content: { padding: 24, paddingBottom: 110 },
  center: { alignItems: 'center', paddingTop: 24 },
  smallLogo: { width: 56, height: 46 },
  label: { ...Fonts.subheadline, color: T42.textSecondary, marginTop: 22 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  ageRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 },
  input: {
    backgroundColor: T42.surfaceRaised, color: T42.textPrimary,
    padding: 14, borderRadius: 14, marginTop: 8, fontSize: 15,
  },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 34, paddingTop: 10 },
  feeCard: {
    marginTop: 24, padding: 20, borderRadius: 20, width: '100%',
    borderColor: T42.gold + '59', alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15,
  },
});
