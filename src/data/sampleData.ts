import {
  UserProfile, Experience, MatchCandidate, AddOn,
  DateBooking, DateIntent, DateCommitment,
  DATE_COMMITMENT_HOLD,
} from '../models/types';

const COMMITMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

const uuid = () => Math.random().toString(36).slice(2, 10);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

export const currentUser: UserProfile = {
  id: uuid(),
  firstName: 'Jordan',
  age: 31,
  gender: 'Man',
  height: '5\'10"–6\'0"',
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
    ageRange: [26, 38],
    minIncome: '$50k–$100k',
    jobTypes: ['9 to 5', 'Freelance', 'Business owner'],
    maxDistance: 25,
    minHeight: '5\'4"–5\'6"',
    maxHeight: '5\'10"–6\'0"',
  },
  backgroundCheck: 'clear',
  backgroundCheckNotes: 'Verified — no criminal record. Check completed via Checkr, June 2026.',
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
    id: uuid(), firstName: 'Alyssa', age: 29,
    height: '5\'7"–5\'9"',
    profession: 'Art Director',
    jobType: '9 to 5', income: '$100k–$200k', dressStyle: 'Smart casual',
    bio: "Loves wine bars and chef's tasting menus.",
    photos: [],
    sharedInterests: ['Fine Dining', 'Wine Bars', 'Art & Culture'],
    compatibilityScore: 0.93, distanceMiles: 8,
    backgroundCheck: 'clear',
    backgroundCheckNotes: 'Verified — no criminal record. Check completed via Checkr, May 2026.',
  },
  {
    id: uuid(), firstName: 'Maya', age: 28,
    height: '5\'4"–5\'6"',
    profession: 'Architect',
    jobType: '9 to 5', income: '$100k–$200k', dressStyle: 'Business',
    bio: 'Gallery hopper with a soft spot for omakase.',
    photos: [],
    sharedInterests: ['Art & Culture', 'Fine Dining'],
    compatibilityScore: 0.88, distanceMiles: 14,
    backgroundCheck: 'clear',
    backgroundCheckNotes: 'Verified — no criminal record. Check completed via Checkr, April 2026.',
  },
  {
    id: uuid(), firstName: 'Elena', age: 32,
    height: '5\'4"–5\'6"',
    profession: 'Sommelier',
    jobType: 'Freelance', income: '$50k–$100k', dressStyle: 'Casual',
    bio: 'Will absolutely judge the wine list — kindly.',
    photos: [],
    sharedInterests: ['Wine Bars', 'Travel'],
    compatibilityScore: 0.86, distanceMiles: 22,
    backgroundCheck: 'clear',
    backgroundCheckNotes: 'Verified — no criminal record. Check completed via Checkr, March 2026.',
  },
];

export const addOns: AddOn[] = [
  {
    id: uuid(), kind: 'Gifting',
    title: 'Hand-Tied Seasonal Bouquet',
    detail: 'Lyft driver picks up flowers en route to your date',
    price: 65, provider: '1-800-Flowers',
    partnerCost: 58.50, t42Margin: 6.50,
  },
  {
    id: uuid(), kind: 'Transportation',
    title: 'Lyft Ride to the Venue',
    detail: "Door-to-door pickup — we handle the booking & billing",
    price: 35, provider: 'Lyft',
    partnerCost: 31.50, t42Margin: 3.50,
  },
  {
    id: uuid(), kind: 'Memories',
    title: 'Golden-Hour Photographer',
    detail: '30 discreet minutes, 15 edited shots delivered in 48h',
    price: 120, provider: 'Table for 2',
    partnerCost: 108, t42Margin: 12,
  },
];

export const sampleDateIntent: DateIntent = {
  id: uuid(),
  zipcode: '33301',
  city: 'Fort Lauderdale, FL',
  scheduledFor: daysFromNow(3),
  intentType: 'Dinner',
  status: 'open',
};

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
    totalBill: 280,
    t42Revenue: 28,
  },
];

export function makeDateCommitment(candidate: MatchCandidate, experience: Experience, intent: DateIntent): DateCommitment {
  const now = new Date();
  return {
    id: uuid(),
    candidate,
    experience,
    intent,
    proposedTime: intent.scheduledFor,
    createdAt: now,
    expiresAt: new Date(now.getTime() + COMMITMENT_WINDOW_MS),
    state: 'pending',
    yourHold: false,
    theirHold: false,
  };
}

