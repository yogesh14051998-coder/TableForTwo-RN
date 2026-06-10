import {
  ExperienceCategory, Experience, ExperienceRequest,
  CuratedMatchBatch, DateBooking, UserProfile, AddOn,
  TrustedContact, ConsentSettings, DECISION_WINDOW_MS,
} from '../models/types';
import { experiences, matchCandidates, kaitoOmakase } from '../data/sampleData';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const uuid = () => Math.random().toString(36).slice(2, 10);

// MARK: - Match Service

export async function fetchCuratedBatch(
  request: ExperienceRequest,
  _user: UserProfile,
): Promise<CuratedMatchBatch> {
  await delay(600);
  const pool = experiences.filter(e => e.category === request.category);
  const experience = pool[0] ?? kaitoOmakase;
  const candidates = [...matchCandidates]
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 3);
  return { request, experience, candidates };
}

export function getRecommendations(_user: UserProfile): Experience[] {
  return experiences;
}

// MARK: - Booking Service

export async function confirmBooking(draft: DateBooking): Promise<DateBooking> {
  await delay(800);
  return {
    ...draft,
    status: 'confirmed',
    confirmationCode: `T42-${uuid().toUpperCase().slice(0, 5)}`,
  };
}

// MARK: - Safety Service

export function startLocationShare(contact: TrustedContact) {
  console.log(`Sharing live location with ${contact.name}`);
}

export function stopLocationShare() {
  console.log('Location share ended');
}

export function sendCheckInReminder() {
  console.log('Check-in window lapsed');
}

export function triggerSOS(booking?: DateBooking) {
  const venue = booking ? ` at ${booking.experience.venueName}` : '';
  console.log(`SOS triggered${venue}`);
}

// MARK: - Analytics

export function trackEvent(
  event: string,
  consent: ConsentSettings,
  props: Record<string, string> = {},
) {
  if (!consent.shareAnonymizedUsage) return;
  console.log(`analytics: ${event}`, props);
}
