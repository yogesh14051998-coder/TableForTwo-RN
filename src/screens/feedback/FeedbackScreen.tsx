import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { T42, Fonts } from '../../theme/theme';
import {
  SectionHeader, Card, TagChip, StarRating, GoldButton,
} from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { trackEvent } from '../../services/services';
import {
  ALL_VIBES, ALL_YES_NO_MAYBE,
  type VibeTag, type YesNoMaybe, type DateBooking,
} from '../../models/types';

export default function FeedbackScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const { state } = useApp();
  const booking: DateBooking = route.params.booking;

  const [dateRating, setDateRating] = useState(0);
  const [expRating, setExpRating] = useState(0);
  const [vibes, setVibes] = useState<VibeTag[]>([]);
  const [seeAgain, setSeeAgain] = useState<YesNoMaybe | null>(null);

  const canSubmit = dateRating > 0 && expRating > 0 && seeAgain !== null;

  const toggleVibe = (v: VibeTag) => {
    setVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const submit = () => {
    trackEvent('post_date_feedback', state.consent, { see_again: seeAgain ?? '' });
    nav.goBack();
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[Fonts.displayMedium, { color: T42.textPrimary }]}>How was it?</Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary }]}>
          Two quick ratings — they sharpen every future match.
        </Text>

        <Card>
          <Text style={[Fonts.headline, { color: T42.textPrimary }]}>Rate your date</Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginBottom: 8 }]}>
            {booking.companion.firstName} · {booking.companion.profession}
          </Text>
          <StarRating rating={dateRating} onChange={setDateRating} />
        </Card>

        <Card>
          <Text style={[Fonts.headline, { color: T42.textPrimary }]}>Rate the experience</Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginBottom: 8 }]}>
            {booking.experience.title} · {booking.experience.venueName}
          </Text>
          <StarRating rating={expRating} onChange={setExpRating} />
        </Card>

        <Card>
          <Text style={[Fonts.headline, { color: T42.textPrimary, marginBottom: 8 }]}>Vibes</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {ALL_VIBES.map(v => (
              <TagChip key={v} label={v} selected={vibes.includes(v)} onPress={() => toggleVibe(v)} />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={[Fonts.headline, { color: T42.textPrimary, marginBottom: 8 }]}>
            Would you see them again?
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {ALL_YES_NO_MAYBE.map(a => (
              <TagChip key={a} label={a} selected={seeAgain === a} onPress={() => setSeeAgain(a)} />
            ))}
          </View>
        </Card>
      </ScrollView>

      <View style={s.cta}>
        <GoldButton label="Submit Feedback" onPress={submit} disabled={!canSubmit} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EB' },
});
