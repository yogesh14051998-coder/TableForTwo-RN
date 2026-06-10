// MARK: - Identity

export type Gender = 'Man' | 'Woman' | 'Non-Binary';
export const ALL_GENDERS: Gender[] = ['Man', 'Woman', 'Non-Binary'];

export type InterestTag =
  | 'Fine Dining' | 'Adventure' | 'Live Music' | 'Wellness'
  | 'Art & Culture' | 'Wine Bars' | 'Outdoors' | 'Mixology'
  | 'Theatre' | 'Travel';

export const ALL_INTERESTS: InterestTag[] = [
  'Fine Dining', 'Adventure', 'Live Music', 'Wellness',
  'Art & Culture', 'Wine Bars', 'Outdoors', 'Mixology',
  'Theatre', 'Travel',
];
export const INTEREST_LIMIT = 5;

export interface TrustedContact {
  name: string;
  phoneNumber: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  age: number;
  gender: Gender;
  interestedIn: Gender[];
  preferredAgeRange: [number, number];
  city: string;
  profession: string;
  bio: string;
  interests: InterestTag[];
  trustedContact?: TrustedContact;
}

// MARK: - Experiences

export type ExperienceCategory = 'Fine Dining' | 'Adventure' | 'Luxury' | 'Custom';
export const ALL_CATEGORIES: ExperienceCategory[] = ['Fine Dining', 'Adventure', 'Luxury', 'Custom'];

export const CATEGORY_META: Record<ExperienceCategory, { icon: string; tagline: string }> = {
  'Fine Dining': { icon: '🍽️', tagline: "Chef's tastings, omakase & wine pairings" },
  'Adventure':   { icon: '🏔️', tagline: 'Balloon rides, hikes & hidden coves' },
  'Luxury':      { icon: '👑', tagline: 'Private chefs, yachts & box seats' },
  'Custom':      { icon: '✨', tagline: 'Design your own perfect evening' },
};

export type PackageTier = 'Entry' | 'Core' | 'Premium Luxury';

export const TIER_RANGE: Record<PackageTier, string> = {
  'Entry': '$200+',
  'Core': '$400 – $800',
  'Premium Luxury': '$1,000+',
};

export function tierForBudget(ceiling: number): PackageTier {
  if (ceiling < 400) return 'Entry';
  if (ceiling < 1000) return 'Core';
  return 'Premium Luxury';
}

export type PartnerProvider =
  | 'OpenTable' | 'inKind' | 'Airbnb Experiences'
  | 'Groupon' | 'Lyft' | '1-800-Flowers' | 'Table for 2';

export interface Experience {
  id: string;
  category: ExperienceCategory;
  title: string;
  venueName: string;
  venueDetail: string;
  address: string;
  summary: string;
  packageTier: PackageTier;
  estimatedCost: number;
  provider: PartnerProvider;
}

export interface ExperienceRequest {
  category: ExperienceCategory;
  budgetRange: [number, number];
  dateTime: Date;
}

// MARK: - Matching

export interface MatchCandidate {
  id: string;
  firstName: string;
  age: number;
  profession: string;
  bio: string;
  sharedInterests: InterestTag[];
  compatibilityScore: number;
}

export interface CuratedMatchBatch {
  request: ExperienceRequest;
  experience: Experience;
  candidates: MatchCandidate[];
}

// MARK: - Chat

export interface ChatMessage {
  id: string;
  isFromCurrentUser: boolean;
  text: string;
  sentAt: Date;
}

export type ChatState = 'countdown' | 'dateConfirmed' | 'expired';

export const DECISION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface MatchChatSession {
  id: string;
  candidate: MatchCandidate;
  experience: Experience;
  proposedTime: Date;
  startedAt: Date;
  expiresAt: Date;
  messages: ChatMessage[];
  state: ChatState;
}

// MARK: - Booking & add-ons

export type AddOnKind = 'Gifting' | 'Transportation' | 'Memories';

export const ADDON_ICONS: Record<AddOnKind, string> = {
  Gifting: '🎁',
  Transportation: '🚗',
  Memories: '📸',
};

export interface AddOn {
  id: string;
  kind: AddOnKind;
  title: string;
  detail: string;
  price: number;
  provider: PartnerProvider;
}

export type BookingStatus = 'draft' | 'pendingPayment' | 'confirmed' | 'live' | 'completed' | 'cancelled';

export interface DateBooking {
  id: string;
  experience: Experience;
  companion: MatchCandidate;
  scheduledFor: Date;
  selectedAddOns: AddOn[];
  status: BookingStatus;
  confirmationCode?: string;
}

// MARK: - Feedback

export type YesNoMaybe = 'Yes' | 'No' | 'Maybe';
export const ALL_YES_NO_MAYBE: YesNoMaybe[] = ['Yes', 'No', 'Maybe'];

export type VibeTag =
  | 'Great conversation' | 'Chemistry' | 'Made me laugh'
  | 'Thoughtful' | 'Ran late' | 'Low effort';
export const ALL_VIBES: VibeTag[] = [
  'Great conversation', 'Chemistry', 'Made me laugh',
  'Thoughtful', 'Ran late', 'Low effort',
];

export interface PostDateFeedback {
  bookingId: string;
  dateRating: number;
  experienceRating: number;
  vibes: VibeTag[];
  wouldSeeAgain?: YesNoMaybe;
}

// MARK: - Monetization

export type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Diamond';
export const PAID_TIERS: SubscriptionTier[] = ['Silver', 'Gold', 'Diamond'];

export const TIER_INFO: Record<SubscriptionTier, { price: number; perks: string[] }> = {
  Free:    { price: 0,     perks: ['Browse experiences', '1 curated batch per week'] },
  Silver:  { price: 14.99, perks: ['3 curated batches per week', 'Standard reservations'] },
  Gold:    { price: 29.99, perks: ['Daily curated batches', 'Priority reservations', '1 free add-on monthly'] },
  Diamond: { price: 59.99, perks: ['Unlimited curated batches', 'Concierge planning', 'Premium Luxury access', 'Member events'] },
};

export interface ConsentSettings {
  shareAnonymizedUsage: boolean;
  personalizedRecommendations: boolean;
}
