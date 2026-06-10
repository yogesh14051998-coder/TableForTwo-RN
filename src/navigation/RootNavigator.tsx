import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { T42 } from '../theme/theme';
import { useApp } from '../context/AppContext';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import ExperienceHubScreen from '../screens/home/ExperienceHubScreen';
import ExperienceSelectionScreen from '../screens/experience/ExperienceSelectionScreen';
import CuratedMatchScreen from '../screens/matches/CuratedMatchScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ReviewConfirmScreen from '../screens/booking/ReviewConfirmScreen';
import LiveDateSafetyScreen from '../screens/safety/LiveDateSafetyScreen';
import FeedbackScreen from '../screens/feedback/FeedbackScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import type { CuratedMatchBatch, MatchChatSession, DateBooking } from '../models/types';

// ── Param lists ──

export type MainStackParams = {
  HomeTabs: undefined;
  ExperienceSelection: { preselect?: string } | undefined;
  CuratedMatch: { batch: CuratedMatchBatch };
  Chat: { session: MatchChatSession };
  ReviewConfirm: { session: MatchChatSession };
  LiveDateSafety: { booking: DateBooking };
  Feedback: { booking: DateBooking };
};

const Stack = createNativeStackNavigator<MainStackParams>();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: T42.background },
  headerTintColor: T42.textPrimary,
  headerTitleStyle: { fontFamily: 'serif', fontWeight: '600' as const },
  contentStyle: { backgroundColor: T42.background },
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Experiences: '✨', Messages: '💬', Bookings: '📅', 'Table for 2+': '👑',
  };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[label] ?? '•'}</Text>;
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: T42.background },
        headerTintColor: T42.textPrimary,
        tabBarStyle: { backgroundColor: T42.surface, borderTopColor: T42.stroke },
        tabBarActiveTintColor: T42.gold,
        tabBarInactiveTintColor: T42.textSecondary,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Experiences" component={ExperienceHubScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Table for 2+" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { state } = useApp();

  if (!state.hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ExperienceSelection" component={ExperienceSelectionScreen}
        options={{ title: 'Choose the Experience' }} />
      <Stack.Screen name="CuratedMatch" component={CuratedMatchScreen}
        options={{ title: 'Curated Matches' }} />
      <Stack.Screen name="Chat" component={ChatScreen}
        options={({ route }) => ({ title: route.params.session.candidate.firstName })} />
      <Stack.Screen name="ReviewConfirm" component={ReviewConfirmScreen}
        options={{ title: 'Review & Confirm' }} />
      <Stack.Screen name="LiveDateSafety" component={LiveDateSafetyScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen}
        options={{ title: 'How was it?', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
