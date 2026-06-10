import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import {
  UserProfile, MatchChatSession, DateBooking, SubscriptionTier,
  ConsentSettings, MatchCandidate, CuratedMatchBatch,
  DECISION_WINDOW_MS,
} from '../models/types';
import { currentUser as defaultUser, upcomingBooking, pastBookings as defaultPast } from '../data/sampleData';
import { trackEvent } from '../services/services';

// ── State ──

interface AppState {
  currentUser: UserProfile;
  hasCompletedOnboarding: boolean;
  activeChatSession: MatchChatSession | null;
  liveDate: DateBooking | null;
  upcomingBookings: DateBooking[];
  pastBookings: DateBooking[];
  archivedChats: MatchChatSession[];
  subscription: SubscriptionTier;
  consent: ConsentSettings;
}

const initialState: AppState = {
  currentUser: defaultUser,
  hasCompletedOnboarding: false,
  activeChatSession: null,
  liveDate: null,
  upcomingBookings: [upcomingBooking],
  pastBookings: defaultPast,
  archivedChats: [],
  subscription: 'Free',
  consent: { shareAnonymizedUsage: false, personalizedRecommendations: false },
};

// ── Actions ──

type Action =
  | { type: 'COMPLETE_ONBOARDING'; user: UserProfile }
  | { type: 'START_CHAT'; session: MatchChatSession }
  | { type: 'UPDATE_CHAT'; session: MatchChatSession }
  | { type: 'CONFIRM_BOOKING'; booking: DateBooking }
  | { type: 'START_LIVE_DATE'; booking: DateBooking }
  | { type: 'COMPLETE_LIVE_DATE' }
  | { type: 'SET_SUBSCRIPTION'; tier: SubscriptionTier }
  | { type: 'SET_CONSENT'; consent: ConsentSettings };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      return { ...state, currentUser: action.user, hasCompletedOnboarding: true };

    case 'START_CHAT': {
      const archived = state.activeChatSession
        ? [state.activeChatSession, ...state.archivedChats]
        : state.archivedChats;
      return { ...state, activeChatSession: action.session, archivedChats: archived };
    }

    case 'UPDATE_CHAT':
      return { ...state, activeChatSession: action.session };

    case 'CONFIRM_BOOKING': {
      const session = state.activeChatSession
        ? { ...state.activeChatSession, state: 'dateConfirmed' as const }
        : null;
      return {
        ...state,
        activeChatSession: session,
        upcomingBookings: [action.booking, ...state.upcomingBookings],
      };
    }

    case 'START_LIVE_DATE':
      return { ...state, liveDate: { ...action.booking, status: 'live' } };

    case 'COMPLETE_LIVE_DATE': {
      if (!state.liveDate) return state;
      const done = { ...state.liveDate, status: 'completed' as const };
      return {
        ...state,
        liveDate: null,
        upcomingBookings: state.upcomingBookings.filter(b => b.id !== done.id),
        pastBookings: [done, ...state.pastBookings],
      };
    }

    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.tier };

    case 'SET_CONSENT':
      return { ...state, consent: action.consent };

    default:
      return state;
  }
}

// ── Context ──

interface AppContextValue {
  state: AppState;
  completeOnboarding: (user: UserProfile) => void;
  startChat: (candidate: MatchCandidate, batch: CuratedMatchBatch) => MatchChatSession;
  updateChat: (session: MatchChatSession) => void;
  confirmBooking: (booking: DateBooking) => void;
  startLiveDate: (booking: DateBooking) => void;
  completeLiveDate: () => void;
  setSubscription: (tier: SubscriptionTier) => void;
  setConsent: (consent: ConsentSettings) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const completeOnboarding = useCallback((user: UserProfile) => {
    dispatch({ type: 'COMPLETE_ONBOARDING', user });
    trackEvent('onboarding_completed', state.consent);
  }, [state.consent]);

  const startChat = useCallback((candidate: MatchCandidate, batch: CuratedMatchBatch): MatchChatSession => {
    const now = new Date();
    const session: MatchChatSession = {
      id: Math.random().toString(36).slice(2),
      candidate,
      experience: batch.experience,
      proposedTime: batch.request.dateTime,
      startedAt: now,
      expiresAt: new Date(now.getTime() + DECISION_WINDOW_MS),
      messages: [],
      state: 'countdown',
    };
    dispatch({ type: 'START_CHAT', session });
    trackEvent('match_invited', state.consent);
    return session;
  }, [state.consent]);

  const updateChat = useCallback((session: MatchChatSession) => {
    dispatch({ type: 'UPDATE_CHAT', session });
  }, []);

  const confirmBookingAction = useCallback((booking: DateBooking) => {
    dispatch({ type: 'CONFIRM_BOOKING', booking });
    trackEvent('date_confirmed', state.consent);
  }, [state.consent]);

  const startLiveDateAction = useCallback((booking: DateBooking) => {
    dispatch({ type: 'START_LIVE_DATE', booking });
    trackEvent('live_date_started', state.consent);
  }, [state.consent]);

  const completeLiveDate = useCallback(() => {
    dispatch({ type: 'COMPLETE_LIVE_DATE' });
  }, []);

  const setSubscription = useCallback((tier: SubscriptionTier) => {
    dispatch({ type: 'SET_SUBSCRIPTION', tier });
  }, []);

  const setConsent = useCallback((consent: ConsentSettings) => {
    dispatch({ type: 'SET_CONSENT', consent });
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      completeOnboarding,
      startChat,
      updateChat,
      confirmBooking: confirmBookingAction,
      startLiveDate: startLiveDateAction,
      completeLiveDate,
      setSubscription,
      setConsent,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
