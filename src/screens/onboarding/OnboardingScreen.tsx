import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { T42, Fonts } from '../../theme/theme';
import { TagChip, GoldButton, GhostButton, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import {
  ALL_GENDERS, ALL_INTERESTS, INTEREST_LIMIT,
  BACKGROUND_CHECK_FEE, PAID_TIERS, TIER_INFO,
  type Gender, type InterestTag, type UserProfile, type SubscriptionTier,
} from '../../models/types';

const { width } = Dimensions.get('window');

type Step = 'welcome' | 'personalize' | 'backgroundCheck' | 'choosePlan';
const STEPS: Step[] = ['welcome', 'personalize', 'backgroundCheck', 'choosePlan'];

export default function OnboardingScreen() {
  const { completeOnboarding, setSubscription } = useApp();
  const [step, setStep] = useState<Step>('welcome');

  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>('Woman');
  const [zipcode, setZipcode] = useState('');
  const [lookingForGender, setLookingForGender] = useState<Gender[]>([]);
  const [ageRange, setAgeRange] = useState(30);
  const [interests, setInterests] = useState<InterestTag[]>([]);
  const [bgCheckPaid, setBgCheckPaid] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);

  const idx = STEPS.indexOf(step);

  const toggleLookingForGender = (g: Gender) => {
    setLookingForGender(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleInterest = (tag: InterestTag) => {
    setInterests(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < INTEREST_LIMIT ? [...prev, tag] : prev
    );
  };

  const canContinue = (() => {
    switch (step) {
      case 'welcome': return true;
      case 'personalize': return firstName.trim().length > 0 && zipcode.trim().length >= 5 && lookingForGender.length > 0 && interests.length >= 1;
      case 'backgroundCheck': return bgCheckPaid;
      case 'choosePlan': return selectedPlan !== null;
    }
  })();

  const advance = () => {
    if (step === 'choosePlan' && selectedPlan) {
      const user: UserProfile = {
        id: Math.random().toString(36).slice(2),
        firstName, age, gender,
        zipcode, city: '',
        profession: '',
        jobType: '9 to 5',
        income: 'Prefer not to say',
        dressStyle: 'Smart casual',
        bio: '', photos: [],
        interests,
        lookingFor: {
          gender: lookingForGender,
          ageRange: [Math.max(18, ageRange - 5), ageRange + 5],
          minIncome: 'Prefer not to say',
          jobTypes: [],
          maxDistance: 25,
        },
        backgroundCheck: 'clear',
      };
      setSubscription(selectedPlan);
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
          <Text style={s.welcomeTagline}>From match to memory.</Text>
          <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center', marginTop: 16 }]}>
            Better Dates.{'\n'}Deeper Connections.
          </Text>
          <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 20 }]}>
            Experience-based dating designed for real-life connections.
          </Text>

          <View style={{ width: '100%', gap: 12, marginTop: 32 }}>
            <GoldButton label="Get Started" onPress={() => setStep('personalize')} />
            <GhostButton label="Log In" onPress={() => setStep('personalize')} />
          </View>

          <View style={s.welcomeFooter}>
            <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', letterSpacing: 1 }]}>
              Intentional. Inclusive. Experience-Driven.
            </Text>
          </View>
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
          style={[s.progressFill, { width: `${((idx) / (STEPS.length - 1)) * 100}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* PERSONALIZE */}
        {step === 'personalize' && (
          <View>
            <Image source={require('../../../assets/logo.jpeg')} style={s.smallLogo} resizeMode="contain" />
            <Text style={[Fonts.displayMedium, { color: T42.textPrimary, marginTop: 12 }]}>
              Let's personalize{'\n'}your experience
            </Text>
            <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginTop: 8 }]}>
              This helps us create better matches and date ideas for you.
            </Text>

            <Text style={s.fieldLabel}>First name</Text>
            <TextInput value={firstName} onChangeText={setFirstName} placeholder="Your name"
              placeholderTextColor={T42.textSecondary + '80'} style={s.input} />

            <Text style={s.fieldLabel}>I am</Text>
            <View style={s.chipRow}>
              {ALL_GENDERS.map(g => (
                <TagChip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
              ))}
            </View>

            <Text style={s.fieldLabel}>Interested in</Text>
            <View style={s.chipRow}>
              {ALL_GENDERS.map(g => (
                <TagChip key={g} label={g === 'Man' ? 'Men' : g === 'Woman' ? 'Women' : g}
                  selected={lookingForGender.includes(g)}
                  onPress={() => toggleLookingForGender(g)} />
              ))}
            </View>

            <Text style={s.fieldLabel}>Age Range — {Math.max(18, ageRange - 5)} to {ageRange + 5}</Text>
            <Slider minimumValue={23} maximumValue={65} step={1} value={ageRange}
              onValueChange={v => setAgeRange(Math.round(v))}
              minimumTrackTintColor={T42.gold} maximumTrackTintColor={T42.surfaceRaised}
              thumbTintColor={T42.gold} style={{ marginTop: 4 }} />

            <Text style={s.fieldLabel}>Location</Text>
            <TextInput value={zipcode} onChangeText={setZipcode} placeholder="Zip code (e.g. 33311)"
              placeholderTextColor={T42.textSecondary + '80'} keyboardType="number-pad"
              maxLength={5} style={s.input} />

            <Text style={[s.fieldLabel, { marginTop: 24 }]}>
              What are you into? (Select up to {INTEREST_LIMIT})
            </Text>
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
              {interests.length} of {INTEREST_LIMIT} chosen
            </Text>
            <View style={s.chipGrid}>
              {ALL_INTERESTS.map(tag => (
                <TagChip key={tag} label={tag} selected={interests.includes(tag)}
                  onPress={() => toggleInterest(tag)} />
              ))}
            </View>
          </View>
        )}

        {/* BACKGROUND CHECK */}
        {step === 'backgroundCheck' && (
          <View style={s.center}>
            <Ionicons name="shield-checkmark" size={64} color={T42.gold} />
            <Text style={[Fonts.displayMedium, { color: T42.textPrimary, marginTop: 16, textAlign: 'center' }]}>
              Background Verification
            </Text>
            <Text style={[Fonts.body, { color: T42.textSecondary, textAlign: 'center', marginTop: 12 }]}>
              Everyone on Table for 2 passes a verified background check before their first date.
              This keeps our community safe and trustworthy.
            </Text>
            <Card style={s.feeCard}>
              <Ionicons name="shield-checkmark-outline" size={32} color={T42.gold} />
              <Text style={[Fonts.headline, { color: T42.textPrimary, marginTop: 8 }]}>One-time fee</Text>
              <Text style={[Fonts.displayMedium, { color: T42.gold, marginTop: 4 }]}>${BACKGROUND_CHECK_FEE}</Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 8, textAlign: 'center' }]}>
                Verified by a licensed third-party provider.{'\n'}Results typically within 24 hours.
              </Text>
            </Card>
            <View style={{ marginTop: 16, width: '100%' }}>
              {bgCheckPaid ? (
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={22} color={T42.success} />
                  <Text style={[Fonts.headline, { color: T42.success }]}>Verified — You're all set</Text>
                </View>
              ) : (
                <GoldButton
                  label={`Pay $${BACKGROUND_CHECK_FEE} & Verify`}
                  onPress={() => setBgCheckPaid(true)}
                />
              )}
            </View>
          </View>
        )}

        {/* CHOOSE PLAN */}
        {step === 'choosePlan' && (
          <View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="diamond" size={48} color={T42.gold} />
              <Text style={[Fonts.displayMedium, { color: T42.textPrimary, marginTop: 12, textAlign: 'center' }]}>
                Choose Your Plan
              </Text>
              <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 8 }]}>
                Select a membership to unlock curated matches and premium experiences.
              </Text>
            </View>

            <View style={{ gap: 14, marginTop: 24 }}>
              {PAID_TIERS.map(tier => {
                const info = TIER_INFO[tier];
                const isSelected = selectedPlan === tier;
                const tierIcon = tier === 'Silver' ? 'medal-outline' as const
                  : tier === 'Gold' ? 'trophy-outline' as const
                  : 'diamond-outline' as const;
                const tierColor = tier === 'Silver' ? '#C0C0C0'
                  : tier === 'Gold' ? T42.gold
                  : '#B9F2FF';

                return (
                  <TouchableOpacity key={tier} onPress={() => setSelectedPlan(tier)} activeOpacity={0.8}>
                    <Card style={[
                      isSelected && { borderColor: tierColor, borderWidth: 2 },
                      tier === 'Gold' && !isSelected && { borderColor: T42.gold + '40' },
                    ]}>
                      {tier === 'Gold' && (
                        <View style={s.popularBadge}>
                          <Text style={[Fonts.caption2, { color: T42.onGold }]}>MOST POPULAR</Text>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={[s.tierIconWrap, { backgroundColor: tierColor + '1A' }]}>
                          <Ionicons name={tierIcon} size={28} color={tierColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[Fonts.headline, { color: T42.textPrimary, fontSize: 18 }]}>{tier}</Text>
                          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                            {info.matchesPerBatch} matches per batch
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[Fonts.displaySmall, { color: tierColor }]}>${info.price}</Text>
                          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>/month</Text>
                        </View>
                      </View>
                      <View style={{ gap: 6, marginTop: 14 }}>
                        {info.perks.map(p => (
                          <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="checkmark-circle" size={16} color={tierColor} />
                            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>{p}</Text>
                          </View>
                        ))}
                      </View>
                      {isSelected && (
                        <View style={[s.selectedIndicator, { backgroundColor: tierColor }]}>
                          <Ionicons name="checkmark" size={16} color={T42.onGold} />
                          <Text style={[Fonts.caption2, { color: T42.onGold, fontWeight: '700' }]}>SELECTED</Text>
                        </View>
                      )}
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        {step !== 'welcome' && (
          <View style={{ width: 100 }}>
            <GhostButton label="Back" onPress={back} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <GoldButton
            label={step === 'choosePlan' ? 'Start Dating' : 'Continue'}
            onPress={advance} disabled={!canContinue} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  welcomeContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 30, paddingTop: 80, paddingBottom: 40,
  },
  welcomeLogo: { width: width * 0.55, height: width * 0.45 },
  welcomeTagline: {
    color: T42.gold, fontSize: 18, fontFamily: 'serif',
    fontStyle: 'italic', marginTop: 16, letterSpacing: 1,
  },
  welcomeFooter: { alignItems: 'center', marginTop: 40 },
  smallLogo: { width: 60, height: 50 },
  progressTrack: { height: 3, backgroundColor: T42.surfaceRaised, marginHorizontal: 24, marginTop: 60 },
  progressFill: { height: 3, borderRadius: 2 },
  content: { padding: 24, paddingBottom: 100 },
  center: { alignItems: 'center', paddingTop: 32 },
  fieldLabel: { ...Fonts.subheadline, color: T42.textSecondary, marginTop: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  input: {
    backgroundColor: T42.surfaceRaised, color: T42.textPrimary,
    padding: 14, borderRadius: 14, marginTop: 8, fontSize: 15,
  },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 34, paddingTop: 8 },
  feeCard: {
    marginTop: 24, padding: 20, borderRadius: 20, width: '100%',
    borderColor: T42.gold + '59', alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15,
  },
  tierIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  popularBadge: {
    position: 'absolute', top: -1, right: 16,
    backgroundColor: T42.gold, paddingHorizontal: 10, paddingVertical: 3,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  selectedIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 14, paddingVertical: 8, borderRadius: 50,
  },
});
