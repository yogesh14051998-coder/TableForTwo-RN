import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
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

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Matches: { active: 'heart', inactive: 'heart-outline' },
  Experience: { active: 'compass', inactive: 'compass-outline' },
  Messages: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: T42.background },
        headerTintColor: T42.textPrimary,
        tabBarStyle: {
          backgroundColor: T42.surface,
          borderTopColor: T42.stroke,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: T42.gold,
        tabBarInactiveTintColor: T42.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return <Ionicons name={focused ? icons.active : icons.inactive} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ExperienceHubScreen}
        options={{ headerTitle: 'Table for 2' }} />
      <Tab.Screen name="Matches" component={ExperienceSelectionScreen}
        options={{ headerTitle: 'Find Matches' }} />
      <Tab.Screen name="Experience" component={BookingsScreen}
        options={{ headerTitle: 'Bookings' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ headerTitle: 'My Profile' }} />
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
        options={{ title: 'Choose Experience' }} />
      <Stack.Screen name="CuratedMatch" component={CuratedMatchScreen}
        options={{ title: 'Your Matches' }} />
      <Stack.Screen name="Chat" component={ChatScreen}
        options={({ route }) => ({ title: route.params.session.candidate.firstName })} />
      <Stack.Screen name="ReviewConfirm" component={ReviewConfirmScreen}
        options={{ title: 'Confirm Date' }} />
      <Stack.Screen name="LiveDateSafety" component={LiveDateSafetyScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen}
        options={{ title: 'Feedback', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
