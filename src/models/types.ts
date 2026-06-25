// MARK: - Identity

export type Gender =
  | 'Man' | 'Woman' | 'Non-Binary'
  | 'Transgender Man' | 'Transgender Woman'
  | 'Genderqueer' | 'Prefer not to say';

export const ALL_GENDERS: Gender[] = [
  'Man', 'Woman', 'Non-Binary',
  'Transgender Man', 'Transgender Woman',
  'Genderqueer', 'Prefer not to say',
];

export const SHORT_GENDERS: Gender[] = ['Man', 'Woman', 'Non-Binary', 'Genderqueer', 'Prefer not to say'];

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
  | 'Prefer not to say' | 'Under $50k' | '$50k–$100k' | '$100k–$200k'
  | '$200k–$500k' | '$500k+';
export const ALL_INCOME_RANGES: IncomeRange[] = [
  'Prefer not to say', 'Under $50k', '$50k–$100k', '$100k–$200k', '$200k–$500k', '$500k+',
];

export type JobType = '9 to 5' | 'Shift work' | 'Freelance' | 'Business owner' | 'Travels frequently' | 'Remote';
export const ALL_JOB_TYPES: JobType[] = [
  '9 to 5', 'Shift work', 'Freelance', 'Business owner', 'Travels frequently', 'Remote',
];

export type DressStyle = 'Casual' | 'Smart casual' | 'Business' | 'Formal' | 'Streetwear';
export const ALL_DRESS_STYLES: DressStyle[] = ['Casual', 'Smart casual', 'Business', 'Formal', 'Streetwear'];

export type HeightRange =
  | 'Under 5\'0"' | '5\'0"–5\'3"' | '5\'4"–5\'6"'
  | '5\'7"–5\'9"' | '5\'10"–6\'0"' | '6\'1"–6\'3"' | 'Over 6\'3"' | 'Prefer not to say';
export const ALL_HEIGHTS: HeightRange[] = [
  'Under 5\'0"', '5\'0"–5\'3"', '5\'4"–5\'6"',
  '5\'7"–5\'9"', '5\'10"–6\'0"', '6\'1"–6\'3"', 'Over 6\'3"', 'Prefer not to say',
];

export type BackgroundCheckStatus = 'pending' | 'clear' | 'not_started';

export interface TrustedContact {
  name: string;
  phoneNumber: string;
}

export interface LookingFor {
  gender: Gender[];
  ageRange: [number, number];  // 18–100
  minIncome: IncomeRange;
  jobTypes: JobType[];
  maxDistance: number; // miles
  minHeight?: HeightRange;
  maxHeight?: HeightRange;
}

export interface UserProfile {
  id: string;
  firstName: string;
  age: number;  // 18–100
  gender: Gender;
  height: HeightRange;
  zipcode: string;
  city: string;
  profession: string;
  jobType: JobType;
  income: IncomeRange;
  dressStyle: DressStyle;
  bio: string;
  photos: string[];
  interests: InterestTag[];
  lookingFor: LookingFor;
  backgroundCheck: BackgroundCheckStatus;
  backgroundCheckNotes?: string; // visible to matches
  trustedContact?: TrustedContact;
}

export const BACKGROUND_CHECK_FEE = 50;

// MARK: - Date Intent

export type DateIntentType = 'Dinner' | 'Activity' | 'Drinks' | 'Open to anything';
export const ALL_INTENT_TYPES: DateIntentType[] = ['Dinner', 'Activity', 'Drinks', 'Open to anything'];

export interface DateIntent {
  id: string;
  zipcode: string;
  city?: string;
  scheduledFor: Date;
  intentType: DateIntentType;
  notes?: string;
  status: 'open' | 'matched' | 'confirmed' | 'expired';
}

// MARK: - Experiences & Venues

export type PartnerProvider =
  | 'OpenTable' | 'inKind' | 'Airbnb Experiences'
  | 'Groupon' | 'Lyft' | 'Uber' | '1-800-Flowers' | 'Table for 2';

export const PARTNER_COMMISSION = 0.10; // 10% kept by T42

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
  height: HeightRange;
  profession: string;
  jobType: JobType;
  income: IncomeRange;
  dressStyle: DressStyle;
  bio: string;
  photos: string[];
  sharedInterests: InterestTag[];
  compatibilityScore: number;
  distanceMiles: number;
  backgroundCheck: BackgroundCheckStatus;
  backgroundCheckNotes?: string;
}

export interface CuratedMatchBatch {
  intent: DateIntent;
  experience: Experience;
  candidates: MatchCandidate[];
}

// MARK: - Commitment (replaces Chat)

export const DATE_COMMITMENT_HOLD = 50; // $50 hold per person

export type CommitmentState = 'pending' | 'bothConfirmed' | 'expired' | 'cancelled';

export interface DateCommitment {
  id: string;
  candidate: MatchCandidate;
  experience: Experience;
  intent: DateIntent;
  proposedTime: Date;
  createdAt: Date;
  expiresAt: Date;  // 24-hour window to accept
  state: CommitmentState;
  yourHold: boolean;
  theirHold: boolean;
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
  partnerCost: number;   // what T42 pays partner
  t42Margin: number;     // price - partnerCost (10%)
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
  totalBill?: number;     // set during live date
  t42Revenue?: number;    // 10% of totalBill
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

// MARK: - Monetization (simplified)

export type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Diamond';
export const PAID_TIERS: SubscriptionTier[] = ['Silver', 'Gold', 'Diamond'];

export const TIER_INFO: Record<SubscriptionTier, { price: number; perks: string[]; matchesPerBatch: number }> = {
  Free:    { price: 0,     perks: ['Browse experiences', '1 curated batch per week'], matchesPerBatch: 1 },
  Silver:  { price: 29.99, perks: ['3 curated matches per batch', 'Standard reservations', 'Priority matching'], matchesPerBatch: 3 },
  Gold:    { price: 49.99, perks: ['5 curated matches per batch', 'Priority matching', '1 free add-on monthly', 'Premium venues'], matchesPerBatch: 5 },
  Diamond: { price: 99.99, perks: ['Unlimited matches', 'Concierge planning', 'VIP access', 'Priority support', 'Member events'], matchesPerBatch: 10 },
};

export interface ConsentSettings {
  shareAnonymizedUsage: boolean;
  personalizedRecommendations: boolean;
}
