import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import {
  UserProfile, DateBooking, SubscriptionTier,
  ConsentSettings, MatchCandidate, Experience,
  DateIntent, DateCommitment,
  type PaymentSplit,
} from '../models/types';
import {
  currentUser as defaultUser,
  makeDateCommitment,
} from '../data/sampleData';
import { trackEvent } from '../services/services';

// ── State ──

interface AppState {
  currentUser: UserProfile;
  hasCompletedOnboarding: boolean;
  dateIntents: DateIntent[];
  activeCommitment: DateCommitment | null;
  liveDate: DateBooking | null;
  upcomingBookings: DateBooking[];
  pastBookings: DateBooking[];
  subscription: SubscriptionTier;
  consent: ConsentSettings;
}

const initialState: AppState = {
  currentUser: defaultUser,
  hasCompletedOnboarding: false,
  dateIntents: [],
  activeCommitment: null,
  liveDate: null,
  upcomingBookings: [],
  pastBookings: [],
  subscription: 'Free',
  consent: { shareAnonymizedUsage: false, personalizedRecommendations: false },
};

// ── Actions ──

type Action =
  | { type: 'COMPLETE_ONBOARDING'; user: UserProfile }
  | { type: 'POST_DATE_INTENT'; intent: DateIntent }
  | { type: 'CREATE_COMMITMENT'; commitment: DateCommitment }
  | { type: 'PLACE_YOUR_HOLD' }
  | { type: 'PLACE_THEIR_HOLD' }
  | { type: 'SETTLE_COMMITMENT' }
  | { type: 'CONFIRM_BOOKING'; booking: DateBooking }
  | { type: 'PAY_DEPOSIT'; bookingId: string }
  | { type: 'SET_PAYMENT_SPLIT'; bookingId: string; split: PaymentSplit }
  | { type: 'START_LIVE_DATE'; booking: DateBooking }
  | { type: 'COMPLETE_LIVE_DATE' }
  | { type: 'SET_SUBSCRIPTION'; tier: SubscriptionTier }
  | { type: 'SET_CONSENT'; consent: ConsentSettings };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      return { ...state, currentUser: action.user, hasCompletedOnboarding: true };

    case 'POST_DATE_INTENT':
      return { ...state, dateIntents: [action.intent, ...state.dateIntents] };

    case 'CREATE_COMMITMENT':
      return { ...state, activeCommitment: action.commitment };

    case 'PLACE_YOUR_HOLD':
      if (!state.activeCommitment) return state;
      return { ...state, activeCommitment: { ...state.activeCommitment, yourHold: true } };

    case 'PLACE_THEIR_HOLD':
      if (!state.activeCommitment) return state;
      return {
        ...state,
        activeCommitment: {
          ...state.activeCommitment,
          theirHold: true,
          state: 'bothConfirmed',
        },
      };

    case 'SETTLE_COMMITMENT':
      return { ...state, activeCommitment: null };

    case 'CONFIRM_BOOKING':
      return {
        ...state,
        upcomingBookings: [action.booking, ...state.upcomingBookings],
      };

    case 'PAY_DEPOSIT':
      return {
        ...state,
        upcomingBookings: state.upcomingBookings.map(b =>
          b.id === action.bookingId
            ? { ...b, yourDeposit: true, theirDeposit: true, venueRevealed: true, status: 'confirmed' as const }
            : b
        ),
      };

    case 'SET_PAYMENT_SPLIT':
      return {
        ...state,
        liveDate: state.liveDate?.id === action.bookingId
          ? { ...state.liveDate, paymentSplit: action.split }
          : state.liveDate,
        upcomingBookings: state.upcomingBookings.map(b =>
          b.id === action.bookingId ? { ...b, paymentSplit: action.split } : b
        ),
      };

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
  postDateIntent: (intent: DateIntent) => void;
  createCommitment: (candidate: MatchCandidate, experience: Experience, intent: DateIntent) => DateCommitment;
  placeYourHold: () => void;
  placeTheirHold: () => void;
  settleCommitment: () => void;
  confirmBooking: (booking: DateBooking) => void;
  payDeposit: (bookingId: string) => void;
  setPaymentSplit: (bookingId: string, split: PaymentSplit) => void;
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

  const postDateIntent = useCallback((intent: DateIntent) => {
    dispatch({ type: 'POST_DATE_INTENT', intent });
    trackEvent('date_intent_posted', state.consent);
  }, [state.consent]);

  const createCommitment = useCallback((
    candidate: MatchCandidate,
    experience: Experience,
    intent: DateIntent,
  ): DateCommitment => {
    const commitment = makeDateCommitment(candidate, experience, intent);
    dispatch({ type: 'CREATE_COMMITMENT', commitment });
    trackEvent('commitment_created', state.consent);
    return commitment;
  }, [state.consent]);

  const placeYourHold = useCallback(() => {
    dispatch({ type: 'PLACE_YOUR_HOLD' });
    trackEvent('hold_placed_you', state.consent);
  }, [state.consent]);

  const placeTheirHold = useCallback(() => {
    dispatch({ type: 'PLACE_THEIR_HOLD' });
  }, []);

  const settleCommitment = useCallback(() => {
    dispatch({ type: 'SETTLE_COMMITMENT' });
  }, []);

  const confirmBookingAction = useCallback((booking: DateBooking) => {
    dispatch({ type: 'CONFIRM_BOOKING', booking });
    trackEvent('date_confirmed', state.consent);
  }, [state.consent]);

  const payDeposit = useCallback((bookingId: string) => {
    dispatch({ type: 'PAY_DEPOSIT', bookingId });
    trackEvent('deposit_paid', state.consent);
  }, [state.consent]);

  const setPaymentSplit = useCallback((bookingId: string, split: PaymentSplit) => {
    dispatch({ type: 'SET_PAYMENT_SPLIT', bookingId, split });
  }, []);

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
      postDateIntent,
      createCommitment,
      placeYourHold,
      placeTheirHold,
      settleCommitment,
      confirmBooking: confirmBookingAction,
      payDeposit,
      setPaymentSplit,
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
