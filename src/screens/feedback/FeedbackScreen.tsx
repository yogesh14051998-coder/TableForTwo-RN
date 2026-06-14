import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { T42, Fonts } from '../../theme/theme';
import {
  Card, StarRating, GoldButton,
} from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { trackEvent } from '../../services/services';
import {
  ALL_YES_NO_MAYBE,
  type YesNoMaybe, type DateBooking,
} from '../../models/types';

export default function FeedbackScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const { state } = useApp();
  const booking: DateBooking = route.params.booking;

  const [dateRating, setDateRating] = useState(0);
  const [expRating, setExpRating] = useState(0);
  const [seeAgain, setSeeAgain] = useState<YesNoMaybe | null>(null);
  const [review, setReview] = useState('');

  const dateWentWell = booking.paymentSplit === 'full';
  const canSubmit = dateRating > 0 && expRating > 0 && seeAgain !== null;

  const submit = () => {
    trackEvent('post_date_feedback', state.consent, { see_again: seeAgain ?? '', review });
    nav.goBack();
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="sparkles" size={48} color={T42.gold} />
          <Text style={[Fonts.displayMedium, { color: T42.textPrimary, textAlign: 'center', marginTop: 8 }]}>
            How was your{'\n'}experience?
          </Text>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', marginTop: 6 }]}>
            Your feedback helps us create better matches and experiences.
          </Text>
        </View>

        {/* Date outcome indicator */}
        <Card style={{ borderColor: dateWentWell ? T42.success + '60' : T42.gold + '40' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={dateWentWell ? 'heart' : 'heart-dislike-outline'} size={24}
              color={dateWentWell ? T42.success : T42.textSecondary} />
            <View>
              <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
                {dateWentWell ? 'Date went well!' : 'Maybe next time'}
              </Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                {dateWentWell ? 'You covered the full bill' : 'Bill was split 50/50'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Rate the experience */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Ionicons name="compass-outline" size={18} color={T42.textSecondary} />
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>Rate the experience</Text>
          </View>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginBottom: 10 }]}>
            {booking.experience.title} · {booking.experience.venueName}
          </Text>
          <StarRating rating={expRating} onChange={setExpRating} />
        </Card>

        {/* Rate your date */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Ionicons name="person-outline" size={18} color={T42.textSecondary} />
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>Rate your date</Text>
          </View>
          <Text style={[Fonts.caption, { color: T42.textSecondary, marginBottom: 10 }]}>
            {booking.companion.firstName} · {booking.companion.profession}
          </Text>
          <StarRating rating={dateRating} onChange={setDateRating} />
        </Card>

        {/* Write a review */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Ionicons name="create-outline" size={18} color={T42.textSecondary} />
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>Write a review</Text>
          </View>
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Share your experience..."
            placeholderTextColor={T42.textSecondary + '80'}
            multiline
            numberOfLines={4}
            style={s.reviewInput}
          />
        </Card>

        {/* Your Last Date card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="calendar-outline" size={16} color={T42.textSecondary} />
            <Text style={[Fonts.caption, { color: T42.textSecondary }]}>Your Last Date</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <LinearGradient colors={[T42.purple, T42.purpleDeep]} style={s.avatar}>
              <Text style={{ fontSize: 20, color: '#fff', fontFamily: 'serif', fontWeight: '600' }}>
                {booking.companion.firstName[0]}
              </Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
                {booking.companion.firstName}
              </Text>
              <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
                {booking.experience.venueName} · {booking.scheduledFor.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Would you see them again? */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Ionicons name="refresh-outline" size={18} color={T42.textSecondary} />
            <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
              Would you see them again?
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {ALL_YES_NO_MAYBE.map(a => {
              const isSelected = seeAgain === a;
              const color = a === 'Yes' ? T42.success : a === 'No' ? T42.danger : T42.gold;
              const icon = a === 'Yes' ? 'checkmark-circle-outline' as const
                : a === 'No' ? 'close-circle-outline' as const
                : 'help-circle-outline' as const;
              return (
                <TouchableOpacity key={a} onPress={() => setSeeAgain(a)}
                  style={[s.answerBtn, { borderColor: isSelected ? color : T42.stroke, backgroundColor: isSelected ? color + '1A' : 'transparent' }]}
                  activeOpacity={0.7}>
                  <Ionicons name={icon} size={20} color={isSelected ? color : T42.textSecondary} />
                  <Text style={[Fonts.headline, { color: isSelected ? color : T42.textSecondary, marginTop: 4 }]}>{a}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      <View style={s.cta}>
        <GoldButton label="Submit Review" onPress={submit} disabled={!canSubmit} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewInput: {
    backgroundColor: T42.surfaceRaised, color: T42.textPrimary,
    padding: 14, borderRadius: 14, fontSize: 15,
    minHeight: 80, textAlignVertical: 'top',
  },
  answerBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, alignItems: 'center',
  },
  cta: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: T42.background + 'EB' },
});
