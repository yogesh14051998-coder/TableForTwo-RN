import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ChatScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { updateChat } = useApp();

  const [session, setSession] = useState<MatchChatSession>(route.params.session);
  const [draft, setDraft] = useState('');
  const [remaining, setRemaining] = useState(session.expiresAt.getTime() - Date.now());
  const scrollRef = useRef<ScrollView>(null);

  const urgent = remaining < 60 * 60 * 1000; // last hour

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

  const meta = CATEGORY_META[session.experience.category];

  return (
    <KeyboardAvoidingView style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>

      {/* Countdown header */}
      <View style={s.countdownHeader}>
        <CountdownPill label={formatCountdown(remaining)} urgent={urgent} />
        <Text style={[Fonts.caption, { color: T42.textSecondary, marginTop: 4 }]}>
          {urgent ? "Time's running low — make the call." : '24-hour window to lock in your plans.'}
        </Text>
      </View>

      {/* Plan card */}
      <View style={s.planCard}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>{meta.icon}</Text>
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
      </ScrollView>

      {/* Footer */}
      {session.state === 'countdown' && (
        <View style={s.footer}>
          <GoldButton icon="✅" label="Review & Confirm Date"
            onPress={() => nav.navigate('ReviewConfirm', { session })} />
          <View style={s.inputRow}>
            <TextInput value={draft} onChangeText={setDraft}
              placeholder="Say something charming..."
              placeholderTextColor={T42.textSecondary + '80'}
              multiline style={s.input} />
            <TouchableOpacity onPress={send} disabled={!draft.trim()}>
              <LinearGradient colors={[T42.gold, T42.goldDeep]} style={s.sendBtn}>
                <Text style={{ color: T42.onGold, fontSize: 18, fontWeight: '700' }}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {session.state === 'dateConfirmed' && (
        <View style={[s.banner, { backgroundColor: T42.success + '1F' }]}>
          <Text style={[Fonts.subheadline, { color: T42.success }]}>
            ✅ Date confirmed — see it in Bookings.
          </Text>
        </View>
      )}

      {session.state === 'expired' && (
        <View style={[s.banner, { backgroundColor: T42.surface }]}>
          <Text style={[Fonts.subheadline, { color: T42.textSecondary }]}>⏳ The 24 hours have passed.</Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary, textAlign: 'center', marginTop: 4 }]}>
            No hard feelings — pick a new experience and we'll curate a fresh table.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  countdownHeader: { alignItems: 'center', paddingVertical: 12, backgroundColor: T42.surface + 'B3' },
  planCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: T42.surfaceRaised,
  },
  bubbleSent: { maxWidth: '75%' as any, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleReceived: {
    maxWidth: '75%' as any, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, backgroundColor: T42.surfaceRaised,
  },
  footer: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1, backgroundColor: T42.surfaceRaised, color: T42.textPrimary,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, maxHeight: 100, fontSize: 15,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  banner: { paddingVertical: 16, alignItems: 'center' },
});
