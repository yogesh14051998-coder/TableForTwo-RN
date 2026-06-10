import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { T42, Fonts } from '../../theme/theme';
import { Card, MatchAvatar, CountdownPill } from '../../components/SharedComponents';
import { useApp } from '../../context/AppContext';
import type { MainStackParams } from '../../navigation/RootNavigator';
import type { MatchChatSession } from '../../models/types';

type Nav = NativeStackNavigationProp<MainStackParams>;

export default function MessagesScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useApp();

  const sessions: MatchChatSession[] = [
    ...(state.activeChatSession ? [state.activeChatSession] : []),
    ...state.archivedChats,
  ];

  if (sessions.length === 0) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 52 }}>💬</Text>
        <Text style={[Fonts.displaySmall, { color: T42.textPrimary, marginTop: 12 }]}>
          No conversations yet
        </Text>
        <Text style={[Fonts.subheadline, { color: T42.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 8 }]}>
          Pick an experience to meet someone at the table — chats live here once you invite a match.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {sessions.map(session => (
        <TouchableOpacity key={session.id}
          onPress={() => nav.navigate('Chat', { session })} activeOpacity={0.7}>
          <ChatRow session={session} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function ChatRow({ session }: { session: MatchChatSession }) {
  const remaining = Math.max(0, session.expiresAt.getTime() - Date.now());
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MatchAvatar name={session.candidate.firstName} size={54} />
        <View style={{ flex: 1 }}>
          <Text style={[Fonts.headline, { color: T42.textPrimary }]}>
            {session.candidate.firstName}, {session.candidate.age}
          </Text>
          <Text style={[Fonts.caption, { color: T42.textSecondary }]} numberOfLines={1}>
            {session.messages.length > 0
              ? session.messages[session.messages.length - 1].text
              : 'Say hello — the clock is ticking.'}
          </Text>
        </View>
        {session.state === 'countdown' && (
          <CountdownPill label={label} urgent={remaining < 10 * 60 * 1000} />
        )}
        {session.state === 'dateConfirmed' && <Text style={{ fontSize: 22 }}>✅</Text>}
        {session.state === 'expired' && <Text style={{ fontSize: 22, opacity: 0.5 }}>⏳</Text>}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T42.background },
  content: { padding: 20, gap: 12 },
});
