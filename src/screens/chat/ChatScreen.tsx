import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { CountdownPill, GoldButton, PartnerBadge, Card } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import { CATEGORY_META, type MatchChatSession, type ChatMessage } from '../../models/types';
import type { MainStackParams } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<MainStackParams>;

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dinner: 'restaurant',
  Activity: 'compass',
  Drinks: 'wine',
  Custom: 'sparkles',
};

export default function ChatScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { updateChat } = useApp();

  const [session, setSession] = useState<MatchChatSession>(route.params.session);
  const [draft, setDraft] = useState('');
  const [remaining, setRemaining] = useState(session.expiresAt.getTime() - Date.now());
  const [datePlanPromptShown, setDatePlanPromptShown] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const urgent = remaining < 5 * 60 * 1000;
  const totalWindow = 30 * 60 * 1000;
  const elapsed = totalWindow - remaining;
  const shouldPromptDatePlan = elapsed >= 25 * 60 * 1000 && !datePlanPromptShown;

  useEffect(() => {
    const iv = setInterval(() => {
      const r = session.expiresAt.getTime() - Date.now();
      setRemaining(r);
      if (r <= 0 && session.state === 'countdown') {
        setSession(prev => {
          const updated = { ...prev, state: 'expired' as const };
          updateChat(updated);
          return updated;
        });
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [session.expiresAt, session.state]);

  useEffect(() => {
    if (shouldPromptDatePlan) {
      setDatePlanPromptShown(true);
    }
  }, [shouldPromptDatePlan]);

  const send = () => {
    const text = draft.trim();
    if (!text || session.state !== 'countdown') return;
    const msg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      isFromCurrentUser: true,
      text,
      sentAt: new Date(),
    };
    const updated = { ...session, messages: [...session.messages, msg] };
    setSession(updated);
    updateChat(updated);
    setDraft('');

    setTimeout(() => {
      if (updated.state !== 'countdown') return;
      const reply: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        isFromCurrentUser: false,
        text: 'Sounds perfect — lock it in before our timer runs out',
        sentAt: new Date(),
      };
      setSession(prev => {
        const next = { ...prev, messages: [...prev.messages, reply] };
        updateChat(next);
        return next;
      });
    }, 1500);
  };

  const catIcon = CATEGORY_ICONS[session.experience.category] ?? 'sparkles';

  return (
    <KeyboardAvoidingView style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>

      {/* Countdown header */}
      <View style={s.countdownHeader}>
        <CountdownPill label={formatCountdown(remaining)} urgent={urgent} />
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 4 }]}>
          {urgent ? "Time's running low — make the call." : '30-minute window to plan your date.'}
        </Text>
      </View>

      {/* Plan card */}
      <View style={s.planCard}>
        <Ionicons name={catIcon} size={20} color={T42.gold} style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={[Fonts.subheadline, { color: T42.textPrimary }]} numberOfLines={1}>
            {session.experience.title}
          </Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary }]}>
            {session.proposedTime.toLocaleDateString()} · {session.proposedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <PartnerBadge provider={session.experience.provider} />
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {session.messages.map(msg => (
          <View key={msg.id} style={{ flexDirection: 'row', justifyContent: msg.isFromCurrentUser ? 'flex-end' : 'flex-start' }}>
            {msg.isFromCurrentUser ? (
              <LinearGradient colors={[T42.gold, T42.goldDeep]} style={s.bubbleSent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={[Fonts.body, { color: T42.onGold }]}>{msg.text}</Text>
              </LinearGradient>
            ) : (
              <View style={s.bubbleReceived}>
                <Text style={[Fonts.body, { color: T42.textPrimary }]}>{msg.text}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Date planning prompt at ~25 min mark */}
        {datePlanPromptShown && session.state === 'countdown' && (
          <View style={s.datePlanPrompt}>
            <View style={s.datePlanHeader}>
              <Ionicons name="calendar" size={20} color={T42.gold} />
              <Text style={[Fonts.headline, { color: T42.gold, marginLeft: 8 }]}>Time to plan your date!</Text>
            </View>
            <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 6 }]}>
              Your chat window is closing soon. Lock in your plans now!
            </Text>
            <TouchableOpacity style={s.datePlanBtn} activeOpacity={0.8}
              onPress={() => nav.navigate('ReviewConfirm', { session })}>
              <Ionicons name="checkmark-circle" size={18} color={T42.onGold} />
              <Text style={[Fonts.headline, { color: T42.onGold, marginLeft: 6 }]}>Review & Confirm Date</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      {session.state === 'countdown' && (
        <View style={s.footer}>
          <GoldButton label="Review & Confirm Date"
            onPress={() => nav.navigate('ReviewConfirm', { session })} />
          <View style={s.inputRow}>
            <TextInput value={draft} onChangeText={setDraft}
              placeholder="Say something charming..."
              placeholderTextColor={T42.textSecondary + '80'}
              multiline style={s.input} />
            <TouchableOpacity onPress={send} disabled={!draft.trim()}>
              <LinearGradient colors={[T42.gold, T42.goldDeep]} style={s.sendBtn}>
                <Ionicons name="arrow-up" size={20} color={T42.onGold} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {session.state === 'dateConfirmed' && (
        <View style={[s.banner, { backgroundColor: T42.success + '1F' }]}>
          <Ionicons name="checkmark-circle" size={22} color={T42.success} />
          <Text style={[Fonts.subheadline, { color: T42.success, marginLeft: 8 }]}>
            Date confirmed — see it in Bookings.
          </Text>
        </View>
      )}

      {session.state === 'expired' && (
        <View style={[s.banner, { backgroundColor: T42.surface }]}>
          <Ionicons name="timer-outline" size={22} color={T42.textSecondary} />
          <Text style={[Fonts.subheadline, { color: T42.textSecondary, marginLeft: 8 }]}>The 30 minutes have passed.</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  countdownHeader: { alignItems: 'center', paddingVertical: 12, backgroundColor: T42.surface + 'B3' },
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: T42.surfaceRaised,
  },
  bubbleSent: { maxWidth: '75%' as any, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleReceived: {
    maxWidth: '75%' as any, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, backgroundColor: T42.surfaceRaised,
  },
  datePlanPrompt: {
    padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: T42.gold + '60',
    backgroundColor: T42.gold + '0F', marginTop: 8,
  },
  datePlanHeader: { flexDirection: 'row', alignItems: 'center' },
  datePlanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, paddingVertical: 12, borderRadius: 50,
    backgroundColor: T42.gold,
  },
  footer: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1, backgroundColor: T42.surfaceRaised, color: T42.textPrimary,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, maxHeight: 100, fontSize: 15,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  banner: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
});
