import {
  UserProfile, Experience, MatchCandidate, AddOn,
  DateBooking, MatchChatSession,
  DECISION_WINDOW_MS,
} from '../models/types';

const uuid = () => Math.random().toString(36).slice(2, 10);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

export const currentUser: UserProfile = {
  id: uuid(),
  firstName: 'Jordan',
  age: 31,
  gender: 'Man',
  zipcode: '33311',
  city: 'Fort Lauderdale, FL',
  profession: 'Product Designer',
  jobType: '9 to 5',
  income: '$100k–$200k',
  dressStyle: 'Smart casual',
  bio: 'Believer in great food and better company.',
  photos: [],
  interests: ['Fine Dining', 'Live Music', 'Art & Culture'],
  lookingFor: {
    gender: ['Woman'],
    ageRange: [26, 35],
    minIncome: '$50k–$100k',
    jobTypes: ['9 to 5', 'Freelance', 'Business owner'],
    maxDistance: 25,
  },
  backgroundCheck: 'clear',
  trustedContact: { name: 'Sam Rivera', phoneNumber: '+1 (954) 555-0192' },
};

export const kaitoOmakase: Experience = {
  id: uuid(),
  category: 'Dinner',
  title: 'Omakase & Cocktail Pairing',
  venueName: 'Kaito Downtown',
  venueDetail: 'Sushi & Cocktail Bar',
  address: '643 Las Olas Blvd, Fort Lauderdale, FL',
  zipcode: '33301',
  summary: "A 12-course chef's counter omakase with paired Japanese cocktails.",
  estimatedCost: 420,
  provider: 'OpenTable',
};

export const experiences: Experience[] = [
  kaitoOmakase,
  {
    id: uuid(), category: 'Dinner',
    title: "Chef's Tasting on the Terrace", venueName: 'Lumiere',
    venueDetail: 'Modern French', address: '200 S Andrews Ave, Fort Lauderdale, FL',
    zipcode: '33301',
    summary: 'Seven courses under string lights with a dedicated sommelier.',
    estimatedCost: 350, provider: 'inKind',
  },
  {
    id: uuid(), category: 'Activity',
    title: 'Jet Skiing & Beach Picnic', venueName: 'Ft Lauderdale Beach',
    venueDetail: 'Water Sports', address: 'A1A, Fort Lauderdale Beach, FL',
    zipcode: '33304',
    summary: '1-hour guided jet ski tour followed by a catered beach picnic.',
    estimatedCost: 280, provider: 'Groupon',
  },
  {
    id: uuid(), category: 'Activity',
    title: 'Golf & Sunset Drinks', venueName: 'Jacaranda Golf Club',
    venueDetail: '18-hole course', address: '9200 W Broward Blvd, Plantation, FL',
    zipcode: '33324',
    summary: 'Nine holes followed by craft cocktails at the clubhouse.',
    estimatedCost: 190, provider: 'Groupon',
  },
  {
    id: uuid(), category: 'Drinks',
    title: 'Wine Tasting & Live Jazz', venueName: 'The Cellar',
    venueDetail: 'Underground wine bar', address: '110 SW 3rd Ave, Fort Lauderdale, FL',
    zipcode: '33312',
    summary: 'Flight of five wines with live jazz trio in an intimate setting.',
    estimatedCost: 140, provider: 'Table for 2',
  },
];

export const matchCandidates: MatchCandidate[] = [
  {
    id: uuid(), firstName: 'Alyssa', age: 29, profession: 'Art Director',
    jobType: '9 to 5', income: '$100k–$200k', dressStyle: 'Smart casual',
    bio: "Loves wine bars and chef's tasting menus.",
    photos: [],
    sharedInterests: ['Fine Dining', 'Wine Bars', 'Art & Culture'],
    compatibilityScore: 0.93, distanceMiles: 8,
  },
  {
    id: uuid(), firstName: 'Maya', age: 28, profession: 'Architect',
    jobType: '9 to 5', income: '$100k–$200k', dressStyle: 'Business',
    bio: 'Gallery hopper with a soft spot for omakase.',
    photos: [],
    sharedInterests: ['Art & Culture', 'Fine Dining'],
    compatibilityScore: 0.88, distanceMiles: 14,
  },
  {
    id: uuid(), firstName: 'Elena', age: 32, profession: 'Sommelier',
    jobType: 'Freelance', income: '$50k–$100k', dressStyle: 'Casual',
    bio: 'Will absolutely judge the wine list — kindly.',
    photos: [],
    sharedInterests: ['Wine Bars', 'Travel'],
    compatibilityScore: 0.86, distanceMiles: 22,
  },
];

export const addOns: AddOn[] = [
  {
    id: uuid(), kind: 'Gifting',
    title: 'Hand-Tied Seasonal Bouquet',
    detail: 'Lyft driver picks up flowers en route to your date',
    price: 65, provider: '1-800-Flowers',
  },
  {
    id: uuid(), kind: 'Transportation',
    title: 'Lyft Ride to the Venue',
    detail: "We'll pick up your date and bring them to you",
    price: 35, provider: 'Lyft',
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
  yourDeposit: true,
  theirDeposit: true,
  venueRevealed: true,
  paymentSplit: 'pending',
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
    yourDeposit: true,
    theirDeposit: true,
    venueRevealed: true,
    paymentSplit: 'full',
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
      { id: uuid(), isFromCurrentUser: false, text: "Hey! I see we both love omakase — are you free this week?", sentAt: now },
      { id: uuid(), isFromCurrentUser: true, text: "Friday evening works perfectly for me!", sentAt: now },
    ],
    state: 'countdown',
  };
}
