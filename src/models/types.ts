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

export type IncomeRange =
  | 'Prefer not to say' | '$50k–$100k' | '$100k–$200k'
  | '$200k–$500k' | '$500k+';
export const ALL_INCOME_RANGES: IncomeRange[] = [
  'Prefer not to say', '$50k–$100k', '$100k–$200k', '$200k–$500k', '$500k+',
];

export type JobType = '9 to 5' | 'Shift work' | 'Freelance' | 'Business owner' | 'Travels frequently' | 'Remote';
export const ALL_JOB_TYPES: JobType[] = [
  '9 to 5', 'Shift work', 'Freelance', 'Business owner', 'Travels frequently', 'Remote',
];

export type DressStyle = 'Casual' | 'Smart casual' | 'Business' | 'Formal' | 'Streetwear';
export const ALL_DRESS_STYLES: DressStyle[] = ['Casual', 'Smart casual', 'Business', 'Formal', 'Streetwear'];

export type BackgroundCheckStatus = 'pending' | 'clear' | 'not_started';

export interface TrustedContact {
  name: string;
  phoneNumber: string;
}

export interface LookingFor {
  gender: Gender[];
  ageRange: [number, number];
  minIncome: IncomeRange;
  jobTypes: JobType[];
  maxDistance: number; // miles
}

export interface UserProfile {
  id: string;
  firstName: string;
  age: number;
  gender: Gender;
  zipcode: string;
  city: string;
  profession: string;
  jobType: JobType;
  income: IncomeRange;
  dressStyle: DressStyle;
  bio: string;
  photos: string[]; // URIs
  interests: InterestTag[];
  lookingFor: LookingFor;
  backgroundCheck: BackgroundCheckStatus;
  trustedContact?: TrustedContact;
}

export const BACKGROUND_CHECK_FEE = 50;

// MARK: - Experiences & Venues

export type PartnerProvider =
  | 'OpenTable' | 'inKind' | 'Airbnb Experiences'
  | 'Groupon' | 'Lyft' | '1-800-Flowers' | 'Table for 2';

export const PARTNER_COMMISSION = 0.10; // 10%

export type ExperienceCategory = 'Dinner' | 'Activity' | 'Drinks' | 'Custom';
export const ALL_CATEGORIES: ExperienceCategory[] = ['Dinner', 'Activity', 'Drinks', 'Custom'];

export const CATEGORY_META: Record<ExperienceCategory, { icon: string; tagline: string }> = {
  'Dinner':   { icon: '🍽️', tagline: 'Restaurants & dining experiences' },
  'Activity': { icon: '🎯', tagline: 'Golf, jet skiing, escape rooms & more' },
  'Drinks':   { icon: '🍷', tagline: 'Wine bars, cocktail lounges & tastings' },
  'Custom':   { icon: '✨', tagline: 'Design your own perfect evening' },
};

export interface Experience {
  id: string;
  category: ExperienceCategory;
  title: string;
  venueName: string;
  venueDetail: string;
  address: string;
  zipcode: string;
  summary: string;
  estimatedCost: number;
  provider: PartnerProvider;
}

// MARK: - Matching

export interface MatchCandidate {
  id: string;
  firstName: string;
  age: number;
  profession: string;
  jobType: JobType;
  income: IncomeRange;
  dressStyle: DressStyle;
  bio: string;
  photos: string[];
  sharedInterests: InterestTag[];
  compatibilityScore: number;
  distanceMiles: number;
}

export interface CuratedMatchBatch {
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

export const DECISION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

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

// MARK: - Booking, deposits & add-ons

export const DATE_DEPOSIT = 50; // $50 per person

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

export type BookingStatus = 'awaitingDeposit' | 'depositPaid' | 'confirmed' | 'live' | 'completed' | 'cancelled';

export type PaymentSplit = 'full' | 'split' | 'pending';

export interface DateBooking {
  id: string;
  experience: Experience;
  companion: MatchCandidate;
  scheduledFor: Date;
  selectedAddOns: AddOn[];
  status: BookingStatus;
  confirmationCode?: string;
  yourDeposit: boolean;
  theirDeposit: boolean;
  venueRevealed: boolean;
  paymentSplit: PaymentSplit;
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
  Diamond: { price: 59.99, perks: ['Unlimited curated batches', 'Concierge planning', 'VIP access', 'Member events'] },
};

export interface ConsentSettings {
  shareAnonymizedUsage: boolean;
  personalizedRecommendations: boolean;
}
