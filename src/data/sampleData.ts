import {
  UserProfile, Experience, MatchCandidate, AddOn,
  DateBooking, MatchChatSession, ChatMessage,
  DECISION_WINDOW_MS,
} from '../models/types';

const uuid = () => Math.random().toString(36).slice(2, 10);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

export const currentUser: UserProfile = {
  id: uuid(),
  firstName: 'Jordan',
  age: 31,
  gender: 'Man',
  interestedIn: ['Woman'],
  preferredAgeRange: [26, 35],
  city: 'Los Angeles, CA',
  profession: 'Product Designer',
  bio: 'Believer in great food and better company.',
  interests: ['Fine Dining', 'Live Music', 'Art & Culture'],
  trustedContact: { name: 'Sam Rivera', phoneNumber: '+1 (310) 555-0192' },
};

export const kaitoOmakase: Experience = {
  id: uuid(),
  category: 'Fine Dining',
  title: 'Omakase & Cocktail Pairing',
  venueName: 'Kaito Downtown',
  venueDetail: 'Sushi & Cocktail Bar',
  address: '643 S Olive St, Los Angeles, CA',
  summary: "A 12-course chef's counter omakase with paired Japanese cocktails.",
  packageTier: 'Core',
  estimatedCost: 420,
  provider: 'OpenTable',
};

export const experiences: Experience[] = [
  kaitoOmakase,
  {
    id: uuid(), category: 'Fine Dining',
    title: "Chef's Tasting on the Terrace", venueName: 'Lumiere',
    venueDetail: 'Modern French', address: '8500 Sunset Blvd, West Hollywood, CA',
    summary: 'Seven courses under string lights with a dedicated sommelier.',
    packageTier: 'Premium Luxury', estimatedCost: 1150, provider: 'inKind',
  },
  {
    id: uuid(), category: 'Adventure',
    title: 'Sunrise Hot-Air Balloon & Brunch', venueName: 'Temecula Valley',
    venueDetail: 'Wine Country Flight', address: 'Temecula, CA',
    summary: 'A private basket over the vineyards, landing at a champagne brunch.',
    packageTier: 'Core', estimatedCost: 540, provider: 'Airbnb Experiences',
  },
  {
    id: uuid(), category: 'Luxury',
    title: 'Private Marina Sunset Sail', venueName: 'Marina del Rey',
    venueDetail: 'Crewed 40-ft Sloop', address: 'Marina del Rey, CA',
    summary: 'Two hours on the water with a captain, charcuterie, and a playlist you control.',
    packageTier: 'Premium Luxury', estimatedCost: 1300, provider: 'Groupon',
  },
  {
    id: uuid(), category: 'Custom',
    title: 'Gallery Crawl & Listening Bar', venueName: 'Arts District',
    venueDetail: 'Self-Designed Evening', address: 'Arts District, Los Angeles, CA',
    summary: 'Three galleries, one natural-wine bar, and a vinyl listening room finale.',
    packageTier: 'Entry', estimatedCost: 240, provider: 'Table for 2',
  },
];

export const matchCandidates: MatchCandidate[] = [
  {
    id: uuid(), firstName: 'Alyssa', age: 29, profession: 'Art Director',
    bio: "Loves wine bars and chef's tasting menus.",
    sharedInterests: ['Fine Dining', 'Wine Bars', 'Art & Culture'],
    compatibilityScore: 0.93,
  },
  {
    id: uuid(), firstName: 'Maya', age: 28, profession: 'Architect',
    bio: 'Gallery hopper with a soft spot for omakase.',
    sharedInterests: ['Art & Culture', 'Fine Dining'],
    compatibilityScore: 0.88,
  },
  {
    id: uuid(), firstName: 'Elena', age: 32, profession: 'Sommelier',
    bio: 'Will absolutely judge the wine list — kindly.',
    sharedInterests: ['Wine Bars', 'Travel'],
    compatibilityScore: 0.86,
  },
];

export const addOns: AddOn[] = [
  {
    id: uuid(), kind: 'Gifting',
    title: 'Hand-Tied Seasonal Bouquet',
    detail: 'Delivered to the table before you arrive',
    price: 65, provider: '1-800-Flowers',
  },
  {
    id: uuid(), kind: 'Transportation',
    title: 'Lyft Black, Both Ways',
    detail: 'Door-to-door for you and your date',
    price: 48, provider: 'Lyft',
  },
  {
    id: uuid(), kind: 'Memories',
    title: 'Golden-Hour Photographer',
    detail: '30 discreet minutes, 15 edited shots',
    price: 120, provider: 'Table for 2',
  },
];

export const upcomingBooking: DateBooking = {
  id: uuid(),
  experience: kaitoOmakase,
  companion: matchCandidates[0],
  scheduledFor: daysFromNow(2),
  selectedAddOns: [addOns[0]],
  status: 'confirmed',
  confirmationCode: 'T42-8H3KQ',
};

export const pastBookings: DateBooking[] = [
  {
    id: uuid(),
    experience: experiences[4],
    companion: matchCandidates[1],
    scheduledFor: daysFromNow(-9),
    selectedAddOns: [],
    status: 'completed',
    confirmationCode: 'T42-2KX0P',
  },
];

export function makeChatSession(): MatchChatSession {
  const now = new Date();
  return {
    id: uuid(),
    candidate: matchCandidates[0],
    experience: kaitoOmakase,
    proposedTime: daysFromNow(2),
    startedAt: now,
    expiresAt: new Date(now.getTime() + DECISION_WINDOW_MS),
    messages: [
      { id: uuid(), isFromCurrentUser: false, text: "Okay, Kaito's omakase has been on my list forever", sentAt: now },
      { id: uuid(), isFromCurrentUser: true, text: "Then it's settled — counter seats, Friday at 8?", sentAt: now },
    ],
    state: 'countdown',
  };
}
