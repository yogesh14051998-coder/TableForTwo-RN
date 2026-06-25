# Table for Two — Backend Architecture

**Version:** 1.0  
**Stack:** Node.js 22 + TypeScript · PostgreSQL 16 · Redis 7 · BullMQ · Socket.IO · Stripe · Checkr  
**Pattern:** Service-oriented monolith → microservice-ready via domain boundaries

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│         React Native (Expo)  ·  Web (Expo Web / Vercel)        │
└──────────────────────┬──────────────────────┬───────────────────┘
                       │ HTTPS REST            │ WSS (Socket.IO)
┌──────────────────────▼──────────────────────▼───────────────────┐
│                        API GATEWAY                               │
│           Nginx · Rate limiting · JWT auth middleware            │
└───┬─────────────┬─────────────┬─────────────┬───────────────────┘
    │             │             │             │
┌───▼───┐  ┌─────▼──┐  ┌──────▼──┐  ┌──────▼──────┐
│ Auth  │  │ Match  │  │ Finance │  │  LiveDate   │
│Service│  │Service │  │Service  │  │  Service    │
└───┬───┘  └─────┬──┘  └──────┬──┘  └──────┬──────┘
    │             │             │             │
┌───▼─────────────▼─────────────▼─────────────▼──────┐
│                   PostgreSQL 16                      │
│           (Primary read/write + replica)             │
└─────────────────────────────────────────────────────┘
    │             │             │             │
┌───▼───┐  ┌─────▼──┐  ┌──────▼──┐  ┌──────▼──────┐
│ Redis │  │BullMQ  │  │ Stripe  │  │  Vendor     │
│ Geo / │  │Workers │  │ Payment │  │  Aggregator │
│ Cache │  │        │  │ Gateway │  │  Layer      │
└───────┘  └────────┘  └─────────┘  └─────────────┘
                                            │
                         ┌──────────────────┼──────────────────┐
                    ┌────▼────┐       ┌─────▼─────┐     ┌─────▼────┐
                    │  Lyft/  │       │ OpenTable │     │1-800-Flw │
                    │  Uber   │       │  API      │     │ Groupon  │
                    └─────────┘       └───────────┘     └──────────┘
```

---

## 2. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 22 (LTS) | Native async, large ecosystem |
| Framework | Fastify 5 | 35% faster than Express, schema validation built-in |
| Language | TypeScript 5.5 | End-to-end type safety |
| Primary DB | PostgreSQL 16 | ACID transactions, JSONB, PostGIS for geo |
| Cache / Pub-Sub | Redis 7 | BullMQ queues, geo commands, session store |
| Queue | BullMQ | Reliable job processing with retries |
| ORM | Drizzle ORM | Type-safe, near-raw SQL performance |
| Auth | JWT (RS256) + Refresh tokens | Stateless, mobile-friendly |
| Payments | Stripe | Auth-capture flow for hold mechanic |
| Background Check | Checkr API | Async webhook delivery |
| Push Notifications | Expo Push + FCM/APNs | Cross-platform |
| WebSocket | Socket.IO | Rooms, reconnection, binary geo payloads |
| File Storage | AWS S3 + CloudFront | Profile photos |
| Monitoring | Sentry + Datadog | Error tracking + APM |

---

## 3. Database Schema

### 3.1 PostgreSQL — Core Tables

```sql
-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";       -- geo queries
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- fuzzy search

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE gender_type AS ENUM (
  'man','woman','non_binary','transgender_man',
  'transgender_woman','genderqueer','prefer_not_to_say'
);

CREATE TYPE height_range AS ENUM (
  'under_5_0','5_0_to_5_3','5_4_to_5_6',
  '5_7_to_5_9','5_10_to_6_0','6_1_to_6_3',
  'over_6_3','prefer_not_to_say'
);

CREATE TYPE income_range AS ENUM (
  'prefer_not_to_say','under_50k','50k_100k',
  '100k_200k','200k_500k','over_500k'
);

CREATE TYPE job_type AS ENUM (
  'nine_to_five','shift_work','freelance',
  'business_owner','travels_frequently','remote'
);

CREATE TYPE bg_check_status AS ENUM ('not_started','pending','clear','flagged');
CREATE TYPE date_intent_type AS ENUM ('dinner','activity','drinks','open');
CREATE TYPE broadcast_status AS ENUM ('open','matched','confirmed','expired');
CREATE TYPE match_status AS ENUM ('pending_acceptance','accepted','declined','expired');
CREATE TYPE commitment_status AS ENUM (
  'pending_holds','initiator_held','both_held',
  'initiator_forfeited','matched_forfeited',
  'settled_full','settled_split','cancelled','refunded'
);
CREATE TYPE vendor_type AS ENUM ('ride','restaurant','flowers','activity','concierge');
CREATE TYPE transaction_status AS ENUM ('pending','authorized','captured','refunded','failed');
CREATE TYPE payment_split AS ENUM ('full','split','pending');
CREATE TYPE subscription_tier AS ENUM ('free','silver','gold','diamond');

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                   TEXT UNIQUE NOT NULL,
  phone                   TEXT UNIQUE,
  password_hash           TEXT NOT NULL,

  -- Identity
  first_name              TEXT NOT NULL,
  age                     SMALLINT NOT NULL CHECK (age BETWEEN 18 AND 120),
  gender                  gender_type NOT NULL,
  height                  height_range NOT NULL DEFAULT 'prefer_not_to_say',
  income                  income_range NOT NULL DEFAULT 'prefer_not_to_say',
  job_type                job_type NOT NULL DEFAULT 'nine_to_five',
  profession              TEXT,
  dress_style             TEXT,
  bio                     TEXT,
  interests               TEXT[]   DEFAULT '{}',
  photos                  TEXT[]   DEFAULT '{}',  -- S3 keys

  -- Location
  zipcode                 TEXT NOT NULL,
  city                    TEXT,
  geo_point               GEOGRAPHY(Point, 4326),  -- PostGIS

  -- Background check
  bg_check_status         bg_check_status NOT NULL DEFAULT 'not_started',
  bg_check_notes          TEXT,
  bg_check_completed_at   TIMESTAMPTZ,
  checkr_candidate_id     TEXT,

  -- Payments
  stripe_customer_id      TEXT UNIQUE,
  stripe_default_pm_id    TEXT,  -- default payment method
  joining_fee_paid        BOOLEAN NOT NULL DEFAULT false,
  joining_fee_charge_id   TEXT,

  -- Subscription
  subscription_tier       subscription_tier NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,

  -- Safety
  trusted_contact_name    TEXT,
  trusted_contact_phone   TEXT,

  -- Meta
  is_active               BOOLEAN NOT NULL DEFAULT true,
  last_seen_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_zipcode ON users(zipcode);
CREATE INDEX idx_users_geo     ON users USING GIST(geo_point);
CREATE INDEX idx_users_email   ON users(email);

-- ─────────────────────────────────────────────
-- USER PREFERENCES (Looking For)
-- ─────────────────────────────────────────────
CREATE TABLE user_preferences (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender_preferences  gender_type[]   NOT NULL DEFAULT '{}',
  min_age             SMALLINT NOT NULL DEFAULT 18 CHECK (min_age >= 18),
  max_age             SMALLINT NOT NULL DEFAULT 100 CHECK (max_age <= 120),
  min_height          height_range,
  max_height          height_range,
  min_income          income_range,
  preferred_job_types job_type[]     DEFAULT '{}',
  max_distance_miles  SMALLINT NOT NULL DEFAULT 25,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────
-- DATE BROADCASTS
-- ─────────────────────────────────────────────
CREATE TABLE date_broadcasts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zipcode        TEXT NOT NULL,
  geo_point      GEOGRAPHY(Point, 4326),
  scheduled_for  TIMESTAMPTZ NOT NULL,
  intent_type    date_intent_type NOT NULL DEFAULT 'dinner',
  notes          TEXT,
  status         broadcast_status NOT NULL DEFAULT 'open',
  expires_at     TIMESTAMPTZ NOT NULL,  -- auto-expire unmatched broadcasts
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_broadcasts_status     ON date_broadcasts(status);
CREATE INDEX idx_broadcasts_scheduled  ON date_broadcasts(scheduled_for);
CREATE INDEX idx_broadcasts_geo        ON date_broadcasts USING GIST(geo_point);

-- ─────────────────────────────────────────────
-- EXPERIENCES / VENUES
-- ─────────────────────────────────────────────
CREATE TABLE vendor_partners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  vendor_type     vendor_type NOT NULL,
  api_base_url    TEXT,
  api_key_ref     TEXT,  -- pointer to secrets manager key
  commission_rate NUMERIC(4,3) NOT NULL DEFAULT 0.100,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE experiences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID REFERENCES vendor_partners(id),
  category        date_intent_type NOT NULL,
  title           TEXT NOT NULL,
  venue_name      TEXT NOT NULL,
  venue_detail    TEXT,
  address         TEXT,
  zipcode         TEXT NOT NULL,
  geo_point       GEOGRAPHY(Point, 4326),
  summary         TEXT,
  estimated_cost  INTEGER NOT NULL,  -- cents
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiences_zipcode ON experiences(zipcode);
CREATE INDEX idx_experiences_geo     ON experiences USING GIST(geo_point);

-- ─────────────────────────────────────────────
-- MATCHES
-- ─────────────────────────────────────────────
CREATE TABLE matches (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id          UUID NOT NULL REFERENCES date_broadcasts(id),
  initiator_user_id     UUID NOT NULL REFERENCES users(id),
  matched_user_id       UUID NOT NULL REFERENCES users(id),
  experience_id         UUID REFERENCES experiences(id),
  compatibility_score   NUMERIC(4,3) NOT NULL,
  status                match_status NOT NULL DEFAULT 'pending_acceptance',
  matched_user_notified BOOLEAN NOT NULL DEFAULT false,
  expires_at            TIMESTAMPTZ NOT NULL,  -- 24-hour acceptance window
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(broadcast_id, matched_user_id)
);

CREATE INDEX idx_matches_initiator ON matches(initiator_user_id);
CREATE INDEX idx_matches_matched   ON matches(matched_user_id);
CREATE INDEX idx_matches_status    ON matches(status);

-- ─────────────────────────────────────────────
-- DATE COMMITMENTS (replaces "chat sessions")
-- ─────────────────────────────────────────────
CREATE TABLE date_commitments (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id                   UUID NOT NULL UNIQUE REFERENCES matches(id),
  scheduled_for              TIMESTAMPTZ NOT NULL,

  -- Stripe holds
  hold_amount_cents          INTEGER NOT NULL DEFAULT 5000,  -- $50.00
  initiator_payment_intent   TEXT,   -- Stripe PaymentIntent ID
  matched_payment_intent     TEXT,   -- Stripe PaymentIntent ID
  initiator_hold_placed_at   TIMESTAMPTZ,
  matched_hold_placed_at     TIMESTAMPTZ,

  -- State machine
  status                     commitment_status NOT NULL DEFAULT 'pending_holds',

  -- Venue reveal (hidden until both_held)
  venue_revealed             BOOLEAN NOT NULL DEFAULT false,

  -- Live date tracking
  date_started_at            TIMESTAMPTZ,
  payment_prompt_sent_at     TIMESTAMPTZ,
  payment_split              payment_split NOT NULL DEFAULT 'pending',

  -- Bill settlement
  total_bill_cents           INTEGER,
  t42_revenue_cents          INTEGER,   -- 10%
  settlement_charge_id       TEXT,

  -- Bail tracking
  initiator_forfeited_at     TIMESTAMPTZ,
  matched_forfeited_at       TIMESTAMPTZ,
  forfeit_charge_id          TEXT,

  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ADD-ONS / VENDOR ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE add_ons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID NOT NULL REFERENCES vendor_partners(id),
  kind            TEXT NOT NULL,   -- 'Gifting' | 'Transportation' | 'Memories'
  title           TEXT NOT NULL,
  detail          TEXT,
  list_price_cents INTEGER NOT NULL,
  partner_cost_cents INTEGER NOT NULL,  -- what T42 pays vendor
  is_active       BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE vendor_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commitment_id         UUID NOT NULL REFERENCES date_commitments(id),
  add_on_id             UUID NOT NULL REFERENCES add_ons(id),
  vendor_id             UUID NOT NULL REFERENCES vendor_partners(id),
  ordered_by_user_id    UUID NOT NULL REFERENCES users(id),

  -- Money
  gross_cents           INTEGER NOT NULL,
  commission_cents      INTEGER NOT NULL,   -- 10%
  net_to_vendor_cents   INTEGER NOT NULL,   -- 90%

  -- Stripe
  stripe_charge_id      TEXT,
  vendor_reference_id   TEXT,  -- Lyft ride ID, OpenTable res ID, etc.

  status                transaction_status NOT NULL DEFAULT 'pending',
  dispatch_payload      JSONB,    -- raw API request sent to vendor
  vendor_response       JSONB,    -- raw API response from vendor

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at            TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- LIVE DATE GEO TRACKING
-- ─────────────────────────────────────────────
CREATE TABLE live_date_locations (
  id              BIGSERIAL PRIMARY KEY,
  commitment_id   UUID NOT NULL REFERENCES date_commitments(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  geo_point       GEOGRAPHY(Point, 4326) NOT NULL,
  accuracy_meters REAL,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_live_locations_commitment ON live_date_locations(commitment_id, recorded_at DESC);

-- ─────────────────────────────────────────────
-- PUSH NOTIFICATION LOG
-- ─────────────────────────────────────────────
CREATE TABLE push_notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id),
  type          TEXT NOT NULL,
  payload       JSONB NOT NULL,
  expo_ticket   JSONB,
  status        TEXT NOT NULL DEFAULT 'pending',
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- POST-DATE FEEDBACK
-- ─────────────────────────────────────────────
CREATE TABLE post_date_feedback (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commitment_id       UUID NOT NULL REFERENCES date_commitments(id),
  reviewer_user_id    UUID NOT NULL REFERENCES users(id),
  date_rating         SMALLINT CHECK (date_rating BETWEEN 1 AND 5),
  experience_rating   SMALLINT CHECK (experience_rating BETWEEN 1 AND 5),
  would_see_again     TEXT,
  vibe_tags           TEXT[]  DEFAULT '{}',
  review_text         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(commitment_id, reviewer_user_id)
);
```

---

## 4. Matching Algorithm

### 4.1 Compatibility Scoring Function

```typescript
// services/match/MatchEngine.ts

interface MatchScore {
  userId: string;
  score: number;   // 0.0 – 1.0
  breakdown: Record<string, number>;
}

const WEIGHTS = {
  gender:       1.00,   // hard filter — must match
  age:          0.20,
  height:       0.15,
  income:       0.20,
  distance:     0.25,
  interests:    0.10,
  jobType:      0.10,
};

export async function findCandidates(
  broadcast: DateBroadcast,
  initiator: UserWithPreferences,
  db: Database,
  maxResults = 3,
): Promise<MatchScore[]> {

  // 1. Hard filters via SQL — fast elimination
  const candidates = await db.query(`
    SELECT
      u.id, u.age, u.gender, u.height, u.income, u.job_type,
      u.interests, u.bg_check_status, u.bg_check_notes,
      up.gender_preferences, up.min_age, up.max_age,
      up.min_income, up.max_distance_miles,
      ST_Distance(
        u.geo_point::geography,
        $1::geography
      ) / 1609.34 AS distance_miles
    FROM users u
    JOIN user_preferences up ON up.user_id = u.id
    WHERE
      -- Bidirectional gender match
      u.gender = ANY($2::gender_type[])
      AND $3::gender_type = ANY(up.gender_preferences)
      -- Bidirectional age match
      AND u.age BETWEEN $4 AND $5
      AND $6 BETWEEN up.min_age AND up.max_age
      -- Distance filter (±20% tolerance per spec)
      AND ST_DWithin(
        u.geo_point::geography,
        $1::geography,
        ($7 * 1.2) * 1609.34
      )
      -- Must have clear background check
      AND u.bg_check_status = 'clear'
      -- Must have payment method on file
      AND u.stripe_default_pm_id IS NOT NULL
      -- Exclude self
      AND u.id != $8
      -- Not already matched on this broadcast
      AND u.id NOT IN (
        SELECT matched_user_id FROM matches
        WHERE broadcast_id = $9
      )
      AND u.is_active = true
  `, [
    broadcast.geoPoint,
    initiator.preferences.genderPreferences,
    initiator.gender,
    initiator.preferences.minAge, initiator.preferences.maxAge,
    initiator.age,
    initiator.preferences.maxDistanceMiles,
    initiator.id,
    broadcast.id,
  ]);

  // 2. Soft scoring — rank remaining candidates
  const scored: MatchScore[] = candidates.map(c => {
    const breakdown: Record<string, number> = {};

    // Height preference (if set)
    const heightMatch = !initiator.preferences.minHeight
      || heightRankOf(c.height) >= heightRankOf(initiator.preferences.minHeight);
    breakdown.height = heightMatch ? WEIGHTS.height : 0;

    // Income preference
    const incomeMatch = !initiator.preferences.minIncome
      || incomeRankOf(c.income) >= incomeRankOf(initiator.preferences.minIncome);
    breakdown.income = incomeMatch ? WEIGHTS.income : 0;

    // Distance score (closer = better, normalized 0→1)
    const distScore = Math.max(0, 1 - (c.distanceMiles / initiator.preferences.maxDistanceMiles));
    breakdown.distance = distScore * WEIGHTS.distance;

    // Age proximity (initiator's preferred midpoint)
    const midAge = (initiator.preferences.minAge + initiator.preferences.maxAge) / 2;
    const ageDelta = Math.abs(c.age - midAge) / ((initiator.preferences.maxAge - initiator.preferences.minAge) / 2);
    breakdown.age = (1 - Math.min(ageDelta, 1)) * WEIGHTS.age;

    // Shared interests
    const sharedInterests = c.interests.filter(i => initiator.interests.includes(i));
    breakdown.interests = (sharedInterests.length / Math.max(initiator.interests.length, 1)) * WEIGHTS.interests;

    // Job type preference
    const jobMatch = initiator.preferences.preferredJobTypes.length === 0
      || initiator.preferences.preferredJobTypes.includes(c.jobType);
    breakdown.jobType = jobMatch ? WEIGHTS.jobType : 0;

    const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return { userId: c.id, score, breakdown };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

// Ordinal lookup helpers
const HEIGHT_RANK: Record<string, number> = {
  'under_5_0': 1, '5_0_to_5_3': 2, '5_4_to_5_6': 3,
  '5_7_to_5_9': 4, '5_10_to_6_0': 5, '6_1_to_6_3': 6,
  'over_6_3': 7, 'prefer_not_to_say': 0,
};
const INCOME_RANK: Record<string, number> = {
  'prefer_not_to_say': 0, 'under_50k': 1, '50k_100k': 2,
  '100k_200k': 3, '200k_500k': 4, 'over_500k': 5,
};
const heightRankOf = (h: string) => HEIGHT_RANK[h] ?? 0;
const incomeRankOf = (i: string) => INCOME_RANK[i] ?? 0;
```

---

## 5. API Endpoints

### 5.1 Auth & Onboarding

```typescript
// routes/auth.ts  (Fastify)

// POST /auth/register
// Registers user, creates Stripe customer, triggers joining fee
fastify.post('/auth/register', {
  schema: {
    body: Type.Object({
      email: Type.String({ format: 'email' }),
      phone: Type.String(),
      password: Type.String({ minLength: 8 }),
      firstName: Type.String(),
      age: Type.Integer({ minimum: 18, maximum: 120 }),
      gender: Type.Enum(GenderType),
      zipcode: Type.String({ pattern: '^\\d{5}$' }),
    })
  }
}, async (req, reply) => {
  const { email, phone, password, firstName, age, gender, zipcode } = req.body;

  const [lat, lng] = await geocodeZip(zipcode);

  const passwordHash = await argon2.hash(password);

  const user = await db.transaction(async (tx) => {
    const [u] = await tx.insert(users).values({
      email, phone, passwordHash, firstName, age, gender, zipcode,
      geoPoint: `POINT(${lng} ${lat})`,
    }).returning();

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      phone,
      name: firstName,
      metadata: { t42UserId: u.id },
    });

    await tx.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, u.id));

    // Insert default preferences
    await tx.insert(userPreferences).values({ userId: u.id });

    return u;
  });

  const tokens = generateTokenPair(user.id);
  return reply.code(201).send({ user: sanitize(user), ...tokens });
});


// POST /auth/joining-fee
// Creates Stripe PaymentIntent for $50 joining fee, returns client_secret
fastify.post('/auth/joining-fee', { onRequest: [authenticate] }, async (req, reply) => {
  const user = req.user;
  if (user.joiningFeePaid) return reply.code(409).send({ error: 'Already paid' });

  const intent = await stripe.paymentIntents.create({
    amount: 5000,          // $50.00 in cents
    currency: 'usd',
    customer: user.stripeCustomerId,
    description: 'Table for 2 — joining fee',
    metadata: { t42UserId: user.id, type: 'joining_fee' },
  });

  return reply.send({ clientSecret: intent.client_secret });
});


// POST /auth/joining-fee/confirm  (called by Stripe webhook after payment)
fastify.post('/auth/joining-fee/confirm', async (req, reply) => {
  const sig = req.headers['stripe-signature'] as string;
  const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  if (event.type !== 'payment_intent.succeeded') return reply.send({ received: true });
  const pi = event.data.object as Stripe.PaymentIntent;
  if (pi.metadata.type !== 'joining_fee') return reply.send({ received: true });

  const userId = pi.metadata.t42UserId;
  await db.update(users)
    .set({ joiningFeePaid: true, joiningFeeChargeId: pi.latest_charge as string })
    .where(eq(users.id, userId));

  // Trigger background check
  await bgCheckQueue.add('initiate', { userId }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

  return reply.send({ received: true });
});


// POST /bg-check/webhook  (Checkr callback)
fastify.post('/bg-check/webhook', async (req, reply) => {
  const { type, data } = req.body;
  const { candidate_id, status, object: reportData } = data;

  const user = await db.select().from(users)
    .where(eq(users.checkrCandidateId, candidate_id)).limit(1);
  if (!user[0]) return reply.code(404).send();

  const bgStatus = status === 'clear' ? 'clear'
    : status === 'consider' ? 'flagged' : 'flagged';

  const notes = buildBgCheckSummary(reportData);  // human-readable, no raw records

  await db.update(users).set({
    bgCheckStatus: bgStatus,
    bgCheckNotes: notes,
    bgCheckCompletedAt: new Date(),
  }).where(eq(users.id, user[0].id));

  await pushNotificationService.send(user[0].id, {
    type: 'bg_check_complete',
    title: 'Background check complete',
    body: bgStatus === 'clear'
      ? "You're verified. Start planning your first date!"
      : 'Your background check requires review. Contact support.',
  });

  return reply.send({ received: true });
});
```

### 5.2 Date Broadcasts

```typescript
// routes/broadcasts.ts

// POST /broadcasts
// User posts "I'm going to ZIP XXXXX on [date] at [time]"
fastify.post('/broadcasts', { onRequest: [authenticate, requireBgClear, requirePaymentMethod] }, async (req, reply) => {
  const { zipcode, scheduledFor, intentType, notes } = req.body;
  const user = req.user;

  if (!user.joiningFeePaid) return reply.code(403).send({ error: 'Joining fee required' });

  const [lat, lng] = await geocodeZip(zipcode);
  const expiresAt = new Date(scheduledFor);
  expiresAt.setHours(expiresAt.getHours() - 1);  // expire 1h before the date

  const [broadcast] = await db.insert(dateBroadcasts).values({
    userId: user.id,
    zipcode,
    geoPoint: `POINT(${lng} ${lat})`,
    scheduledFor: new Date(scheduledFor),
    intentType,
    notes,
    expiresAt,
  }).returning();

  // Immediately kick off async matchmaking
  await matchQueue.add('find_candidates', {
    broadcastId: broadcast.id,
    initiatorId: user.id,
  }, { priority: 1 });

  return reply.code(201).send({ broadcast });
});


// GET /broadcasts/mine
fastify.get('/broadcasts/mine', { onRequest: [authenticate] }, async (req, reply) => {
  const rows = await db.select().from(dateBroadcasts)
    .where(eq(dateBroadcasts.userId, req.user.id))
    .orderBy(desc(dateBroadcasts.createdAt))
    .limit(10);
  return reply.send({ broadcasts: rows });
});
```

### 5.3 Matchmaking Worker

```typescript
// workers/MatchWorker.ts  (BullMQ)

matchQueue.process('find_candidates', async (job) => {
  const { broadcastId, initiatorId } = job.data;

  const [broadcast] = await db.select().from(dateBroadcasts)
    .where(eq(dateBroadcasts.id, broadcastId)).limit(1);
  const [initiator] = await db.select({
    ...users, preferences: userPreferences,
  }).from(users)
    .leftJoin(userPreferences, eq(userPreferences.userId, users.id))
    .where(eq(users.id, initiatorId)).limit(1);

  const scoredCandidates = await findCandidates(broadcast, initiator, db);
  if (scoredCandidates.length === 0) {
    // No matches found — notify user
    await pushNotificationService.send(initiatorId, {
      type: 'no_matches',
      title: 'No matches yet',
      body: "We'll notify you if someone matching your criteria posts for the same area.",
    });
    return;
  }

  // Pick best experience for the intent type
  const experience = await selectBestExperience(broadcast.intentType, broadcast.zipcode);

  // Create match records + notify initiator
  const created = await db.transaction(async (tx) => {
    const matchRows = await tx.insert(matches).values(
      scoredCandidates.map(c => ({
        broadcastId,
        initiatorUserId: initiatorId,
        matchedUserId: c.userId,
        experienceId: experience.id,
        compatibilityScore: c.score,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),  // 24h window
      }))
    ).returning();

    await tx.update(dateBroadcasts)
      .set({ status: 'matched' })
      .where(eq(dateBroadcasts.id, broadcastId));

    return matchRows;
  });

  // Notify initiator that matches are ready
  await pushNotificationService.send(initiatorId, {
    type: 'matches_ready',
    title: `${scoredCandidates.length} match${scoredCandidates.length > 1 ? 'es' : ''} found`,
    body: 'Your date candidates are ready. Select one to commit.',
    data: { broadcastId },
  });
});
```

### 5.4 Commitment & Stripe Hold System

```typescript
// routes/commitments.ts

// POST /commitments
// Initiator selects a match — triggers $50 hold on their card immediately
fastify.post('/commitments', { onRequest: [authenticate, requirePaymentMethod] }, async (req, reply) => {
  const { matchId } = req.body;
  const user = req.user;

  const [match] = await db.select().from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.initiatorUserId, user.id)))
    .limit(1);
  if (!match) return reply.code(404).send({ error: 'Match not found' });
  if (match.status !== 'pending_acceptance') return reply.code(409).send({ error: 'Match no longer available' });

  // Place $50 hold on initiator card (auth, do NOT capture yet)
  const initiatorHold = await stripe.paymentIntents.create({
    amount: 5000,
    currency: 'usd',
    customer: user.stripeCustomerId,
    payment_method: user.stripeDefaultPmId,
    capture_method: 'manual',           // ← hold, not charge
    confirm: true,
    description: 'Table for 2 — date commitment hold',
    metadata: { t42UserId: user.id, matchId, role: 'initiator' },
    off_session: true,
  });

  const [commitment] = await db.insert(dateCommitments).values({
    matchId,
    scheduledFor: match.broadcast.scheduledFor,
    initiatorPaymentIntent: initiatorHold.id,
    initiatorHoldPlacedAt: new Date(),
    status: 'initiator_held',
  }).returning();

  await db.update(matches)
    .set({ status: 'accepted' })
    .where(eq(matches.id, matchId));

  // Notify matched user — they have 24h to confirm their $50 hold
  await holdExpiryQueue.add('check_matched_hold', {
    commitmentId: commitment.id,
    matchedUserId: match.matchedUserId,
  }, { delay: 24 * 60 * 60 * 1000 });

  await pushNotificationService.send(match.matchedUserId, {
    type: 'date_proposed',
    title: "You've been selected for a date!",
    body: `${user.firstName} wants to meet you. Confirm your $50 hold to lock it in.`,
    data: { commitmentId: commitment.id },
  });

  return reply.code(201).send({ commitment, clientSecret: initiatorHold.client_secret });
});


// POST /commitments/:id/confirm
// Matched user confirms their $50 hold → venue revealed
fastify.post('/commitments/:id/confirm', { onRequest: [authenticate, requirePaymentMethod] }, async (req, reply) => {
  const { id } = req.params;
  const user = req.user;

  const [commitment] = await db.select().from(dateCommitments)
    .where(eq(dateCommitments.id, id)).limit(1);
  if (!commitment) return reply.code(404).send();
  if (commitment.status !== 'initiator_held') return reply.code(409).send({ error: 'Cannot confirm at this stage' });

  // Place $50 hold on matched user's card
  const matchedHold = await stripe.paymentIntents.create({
    amount: 5000,
    currency: 'usd',
    customer: user.stripeCustomerId,
    payment_method: user.stripeDefaultPmId,
    capture_method: 'manual',
    confirm: true,
    description: 'Table for 2 — date commitment hold',
    metadata: { t42UserId: user.id, commitmentId: id, role: 'matched' },
    off_session: true,
  });

  await db.update(dateCommitments)
    .set({
      matchedPaymentIntent: matchedHold.id,
      matchedHoldPlacedAt: new Date(),
      status: 'both_held',
      venueRevealed: true,
      updatedAt: new Date(),
    })
    .where(eq(dateCommitments.id, id));

  // Schedule 3/4-mark payment prompt
  await settlementQueue.add('payment_prompt', {
    commitmentId: id,
  }, { delay: calculateThreeQuarterMark(commitment.scheduledFor) });

  // Notify both users — venue revealed
  const [match] = await db.select().from(matches).where(eq(matches.id, commitment.matchId)).limit(1);
  await Promise.all([
    pushNotificationService.send(match.initiatorUserId, {
      type: 'date_confirmed',
      title: "It's a date!",
      body: 'Your venue has been revealed. Check your upcoming dates.',
      data: { commitmentId: id },
    }),
    pushNotificationService.send(match.matchedUserId, {
      type: 'date_confirmed',
      title: "It's a date!",
      body: 'Your venue has been revealed. Check your upcoming dates.',
      data: { commitmentId: id },
    }),
  ]);

  return reply.send({ status: 'both_held', venueRevealed: true });
});


// POST /commitments/:id/bail
// Either party bails — forfeit $50 hold
fastify.post('/commitments/:id/bail', { onRequest: [authenticate] }, async (req, reply) => {
  const { id } = req.params;
  const user = req.user;

  const commitment = await getCommitmentWithMatch(id, db);
  if (!commitment) return reply.code(404).send();

  const isInitiator = commitment.match.initiatorUserId === user.id;
  const isMatched   = commitment.match.matchedUserId   === user.id;
  if (!isInitiator && !isMatched) return reply.code(403).send();

  const baielerPiId = isInitiator
    ? commitment.initiatorPaymentIntent
    : commitment.matchedPaymentIntent;

  // Capture (charge) the bail-er's hold
  const charge = await stripe.paymentIntents.capture(baielerPiId!);

  // Release (cancel) the innocent party's hold
  const innocentPiId = isInitiator
    ? commitment.matchedPaymentIntent
    : commitment.initiatorPaymentIntent;
  if (innocentPiId) await stripe.paymentIntents.cancel(innocentPiId);

  const newStatus = isInitiator ? 'initiator_forfeited' : 'matched_forfeited';

  await db.update(dateCommitments).set({
    status: newStatus,
    forfeitChargeId: charge.latest_charge as string,
    [isInitiator ? 'initiatorForfeitedAt' : 'matchedForfeitedAt']: new Date(),
    updatedAt: new Date(),
  }).where(eq(dateCommitments.id, id));

  // Notify innocent party
  const innocentId = isInitiator ? commitment.match.matchedUserId : commitment.match.initiatorUserId;
  await pushNotificationService.send(innocentId, {
    type: 'date_cancelled',
    title: 'Your date was cancelled',
    body: `Your $50 hold has been released. The other party forfeited theirs.`,
  });

  return reply.send({ status: newStatus });
});
```

### 5.5 Vendor Aggregator

```typescript
// services/vendors/VendorAggregator.ts

interface VendorOrderRequest {
  commitmentId: string;
  addOnId: string;
  orderedByUserId: string;
  deliveryDetails?: Record<string, unknown>;
}

export async function placeVendorOrder(req: VendorOrderRequest): Promise<VendorOrder> {
  const [addOn] = await db.select({
    ...addOns, vendor: vendorPartners
  }).from(addOns)
    .leftJoin(vendorPartners, eq(vendorPartners.id, addOns.vendorId))
    .where(eq(addOns.id, req.addOnId)).limit(1);

  const grossCents    = addOn.listPriceCents;
  const commCents     = Math.round(grossCents * addOn.vendor.commissionRate);   // 10%
  const netCents      = grossCents - commCents;                                  // 90% to vendor

  // 1. Charge the user through Stripe (T42 collects full amount)
  const user = await getUserById(req.orderedByUserId);
  const charge = await stripe.paymentIntents.create({
    amount: grossCents,
    currency: 'usd',
    customer: user.stripeCustomerId,
    payment_method: user.stripeDefaultPmId,
    capture_method: 'automatic',
    confirm: true,
    off_session: true,
    description: `T42 add-on: ${addOn.title}`,
    metadata: { commitmentId: req.commitmentId, addOnId: req.addOnId },
  });

  // 2. Dispatch to vendor API
  const vendorResponse = await dispatchToVendor(addOn.vendor, addOn, req.deliveryDetails);

  // 3. Record the ledger entry
  const [order] = await db.insert(vendorOrders).values({
    commitmentId: req.commitmentId,
    addOnId: req.addOnId,
    vendorId: addOn.vendorId,
    orderedByUserId: req.orderedByUserId,
    grossCents,
    commissionCents: commCents,
    netToVendorCents: netCents,
    stripeChargeId: charge.latest_charge as string,
    vendorReferenceId: vendorResponse.referenceId,
    status: 'authorized',
    dispatchPayload: { ...req.deliveryDetails },
    vendorResponse,
  }).returning();

  // 4. Schedule vendor payout (T42 retains commission, routes 90% to vendor)
  await payoutQueue.add('vendor_payout', {
    orderId: order.id,
    vendorId: addOn.vendorId,
    netCents,
  }, { delay: 60_000 });  // 60s delay for refund window

  return order;
}

// Vendor-specific dispatch adapters
async function dispatchToVendor(vendor: VendorPartner, addOn: AddOn, details?: Record<string, unknown>) {
  switch (vendor.vendorType) {
    case 'ride':
      return await LyftAdapter.requestRide({
        pickupAddress: details?.pickupAddress as string,
        dropoffAddress: details?.dropoffAddress as string,
        scheduledAt: details?.scheduledAt as string,
        rideType: 'LYFT_XL',
      });

    case 'restaurant':
      return await OpenTableAdapter.createReservation({
        venueId: details?.openTableVenueId as string,
        partySize: 2,
        dateTime: details?.scheduledFor as string,
        specialRequests: details?.specialRequests as string,
      });

    case 'flowers':
      return await FlowersAdapter.placeOrder({
        recipientName: details?.recipientName as string,
        deliveryAddress: details?.deliveryAddress as string,
        deliveryTime: details?.deliveryTime as string,
        productSku: addOn.vendorReferenceId ?? 'SEASONAL_BOUQUET',
        driverPickup: true,  // driver picks up flowers en route
      });

    case 'activity':
      return await GrouponAdapter.bookActivity({
        dealId: details?.grouponDealId as string,
        scheduledFor: details?.scheduledFor as string,
        quantity: 2,
      });

    default:
      throw new Error(`No adapter for vendor type: ${vendor.vendorType}`);
  }
}


// routes/logistics.ts
// POST /commitments/:id/add-ons
fastify.post('/commitments/:id/add-ons', { onRequest: [authenticate] }, async (req, reply) => {
  const { addOnId, deliveryDetails } = req.body;

  const order = await placeVendorOrder({
    commitmentId: req.params.id,
    addOnId,
    orderedByUserId: req.user.id,
    deliveryDetails,
  });

  return reply.code(201).send({ order });
});
```

### 5.6 Safety & Live Date Geo-Tracking

```typescript
// socket/LiveDateGateway.ts  (Socket.IO)

io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  const userId = socket.data.userId;

  // Client joins a date room
  socket.on('join_date', async ({ commitmentId }) => {
    const commitment = await getCommitmentForUser(commitmentId, userId, db);
    if (!commitment) return socket.emit('error', 'Unauthorized');

    socket.join(`date:${commitmentId}`);

    await db.update(dateCommitments)
      .set({ dateStartedAt: new Date() })
      .where(eq(dateCommitments.id, commitmentId));

    socket.emit('date_started', { commitmentId });
  });

  // Receive location pings (client sends every 30s)
  socket.on('location_update', async ({ commitmentId, lat, lng, accuracy }) => {
    // Persist to DB (partitioned table, retention policy 48h)
    await db.insert(liveDateLocations).values({
      commitmentId,
      userId,
      geoPoint: `POINT(${lng} ${lat})`,
      accuracyMeters: accuracy,
    });

    // Cache latest position in Redis (TTL: 60s)
    await redis.setex(
      `live:${commitmentId}:${userId}`,
      60,
      JSON.stringify({ lat, lng, ts: Date.now() })
    );

    // Broadcast to trusted contact room (read-only observers)
    io.to(`safety:${commitmentId}:${userId}`).emit('location_ping', { lat, lng, ts: Date.now() });
  });

  // SOS trigger
  socket.on('sos', async ({ commitmentId }) => {
    const commitment = await getCommitmentWithDetails(commitmentId, db);

    // Immediately notify trusted contact via push + SMS
    const user = await getUserWithTrustedContact(userId);
    if (user.trustedContactPhone) {
      await smsService.send(user.trustedContactPhone,
        `URGENT: ${user.firstName} has triggered an SOS during their date at ${commitment.experience.address}. Please check in.`
      );
    }

    io.to(`safety:${commitmentId}:${userId}`).emit('sos_triggered', {
      userId, commitmentId, address: commitment.experience.address,
    });

    socket.emit('sos_acknowledged');
  });

  socket.on('disconnect', () => {
    // Presence handled by Redis TTL expiry
  });
});
```

---

## 6. State Machine — DateCommitment

```
                  ┌─────────────────────────────────────────────┐
                  │           COMMITMENT STATUS                  │
                  └─────────────────────────────────────────────┘

 POST /commitments
        │
        ▼
  [pending_holds]
   Initiator's $50 hold placed ──────────────────┐
        │                                         │ 24h timeout
        ▼                                         ▼
  [initiator_held]                         [cancelled]
   Matched user receives push              (initiator hold released)
        │
        │ Matched user confirms
        ▼
  [both_held]  ◄──── Venue revealed to both users
        │
   ┌────┴─────┐
   │          │
   │ Either   │  3/4 through scheduled reservation
   │ party    │           │
   │ bails    │           ▼
   │          │   [payment_prompt sent]
   ▼          │     ┌─────┴──────┐
[initiator_   │     │            │
 forfeited]   │  "Full"       "Split"
   or         │     │            │
[matched_     │     ▼            ▼
 forfeited]   │  [settled_   [settled_
              │   full]       split]
              │
        Bail-er charged $50 (captured)
        Innocent party $50 released (cancelled)
```

---

## 7. Cron Jobs & Scheduled Workers

```typescript
// workers/ScheduledJobs.ts  (BullMQ scheduled jobs)

// ── JOB 1: Expire stale broadcasts (every 15 min) ──
broadcastCleaner.add('expire_broadcasts', {}, {
  repeat: { cron: '*/15 * * * *' },
});

broadcastCleaner.process('expire_broadcasts', async () => {
  await db.update(dateBroadcasts)
    .set({ status: 'expired' })
    .where(and(
      eq(dateBroadcasts.status, 'open'),
      lt(dateBroadcasts.expiresAt, new Date())
    ));
});


// ── JOB 2: Expire unconfirmed match holds (every 5 min) ──
holdMonitor.process('check_matched_hold', async (job) => {
  const { commitmentId, matchedUserId } = job.data;
  const [c] = await db.select().from(dateCommitments)
    .where(eq(dateCommitments.id, commitmentId)).limit(1);
  if (c.status !== 'initiator_held') return;  // already resolved

  // 24h elapsed, matched user never confirmed → cancel initiator hold
  if (c.initiatorPaymentIntent) {
    await stripe.paymentIntents.cancel(c.initiatorPaymentIntent);
  }
  await db.update(dateCommitments)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(dateCommitments.id, commitmentId));

  // Notify both parties
  const match = await getMatchForCommitment(commitmentId, db);
  await pushNotificationService.send(match.initiatorUserId, {
    type: 'commitment_expired',
    title: 'Your match did not confirm in time',
    body: 'Your $50 hold has been released. Try a different match.',
  });
});


// ── JOB 3: 3/4-Mark Payment Prompt ──
settlementQueue.process('payment_prompt', async (job) => {
  const { commitmentId } = job.data;
  const [c] = await db.select().from(dateCommitments)
    .where(eq(dateCommitments.id, commitmentId)).limit(1);
  if (c.status !== 'both_held') return;  // date not active

  const match = await getMatchForCommitment(commitmentId, db);

  // Send ONE notification — per spec: phone must not become focal point
  await pushNotificationService.send(match.initiatorUserId, {
    type: 'payment_prompt',
    title: 'How would you like to settle?',
    body: 'Cover the full bill, or split it 50/50?',
    data: {
      commitmentId,
      actions: [
        { id: 'full',  title: 'I\'ll cover the full bill' },
        { id: 'split', title: 'Split 50/50' },
      ],
    },
  });

  await db.update(dateCommitments)
    .set({ paymentPromptSentAt: new Date() })
    .where(eq(dateCommitments.id, commitmentId));

  // If no response in 30 minutes → default to split (per spec)
  await settlementQueue.add('default_split', { commitmentId },
    { delay: 30 * 60 * 1000 }
  );
});


settlementQueue.process('default_split', async (job) => {
  const { commitmentId } = job.data;
  const [c] = await db.select().from(dateCommitments)
    .where(eq(dateCommitments.id, commitmentId)).limit(1);
  if (c.paymentSplit !== 'pending') return;  // already responded

  await settleDate(commitmentId, 'split', db, stripe);
});


// routes/settlement.ts
// POST /commitments/:id/settle
fastify.post('/commitments/:id/settle', { onRequest: [authenticate] }, async (req, reply) => {
  const { choice } = req.body;  // 'full' | 'split'
  if (!['full', 'split'].includes(choice)) return reply.code(400).send();

  await settleDate(req.params.id, choice as PaymentSplit, db, stripe);
  return reply.send({ settled: true, choice });
});


// Shared settle function
async function settleDate(commitmentId: string, choice: 'full' | 'split', db: DB, stripe: Stripe) {
  const [c] = await db.select().from(dateCommitments)
    .where(eq(dateCommitments.id, commitmentId)).limit(1);
  if (c.paymentSplit !== 'pending') return;

  const match = await getMatchForCommitment(commitmentId, db);

  if (choice === 'full') {
    // Initiator covers full bill → capture their $50 hold, release matched user's
    await stripe.paymentIntents.capture(c.initiatorPaymentIntent!);
    if (c.matchedPaymentIntent) await stripe.paymentIntents.cancel(c.matchedPaymentIntent);
  } else {
    // Split → capture both $50 holds
    await Promise.all([
      stripe.paymentIntents.capture(c.initiatorPaymentIntent!),
      c.matchedPaymentIntent ? stripe.paymentIntents.capture(c.matchedPaymentIntent) : Promise.resolve(),
    ]);

    // Dispatch fallback Lyft rides for both users (per spec: split = date didn't work out)
    await Promise.all([
      LyftAdapter.requestRide({ pickupAddress: c.experience.address, dropoffUserId: match.initiatorUserId }),
      LyftAdapter.requestRide({ pickupAddress: c.experience.address, dropoffUserId: match.matchedUserId }),
    ]);
  }

  await db.update(dateCommitments).set({
    paymentSplit: choice,
    status: choice === 'full' ? 'settled_full' : 'settled_split',
    updatedAt: new Date(),
  }).where(eq(dateCommitments.id, commitmentId));

  // Trigger feedback flow
  await Promise.all([
    pushNotificationService.send(match.initiatorUserId, { type: 'request_feedback', data: { commitmentId } }),
    pushNotificationService.send(match.matchedUserId,   { type: 'request_feedback', data: { commitmentId } }),
  ]);
}


// Helper — calculates ms until 3/4 of reservation duration from now
function calculateThreeQuarterMark(scheduledFor: Date, reservationDurationMs = 90 * 60 * 1000): number {
  const dateStart = scheduledFor.getTime();
  const promptAt  = dateStart + reservationDurationMs * 0.75;
  return Math.max(0, promptAt - Date.now());
}
```

---

## 8. Monetization Ledger Summary

```
User pays T42:       $200 restaurant bill
                       |
          T42 keeps 10% = $20  (t42_revenue_cents)
                       |
          T42 pays vendor 90% = $180 (net_to_vendor_cents)
                       |
          Vendor payout via Stripe Transfer → vendor's connected account
```

```typescript
// workers/PayoutWorker.ts
payoutQueue.process('vendor_payout', async (job) => {
  const { orderId, vendorId, netCents } = job.data;

  const [vendor] = await db.select().from(vendorPartners)
    .where(eq(vendorPartners.id, vendorId)).limit(1);

  // Stripe Connect transfer to vendor's account
  const transfer = await stripe.transfers.create({
    amount: netCents,
    currency: 'usd',
    destination: vendor.stripeConnectedAccountId,
    metadata: { orderId },
  });

  await db.update(vendorOrders)
    .set({ status: 'settled', settledAt: new Date() })
    .where(eq(vendorOrders.id, orderId));
});
```

---

## 9. Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://...
REDIS_URL=redis://...

# Auth
JWT_PRIVATE_KEY=<RS256 PEM>
JWT_PUBLIC_KEY=<RS256 PEM>
REFRESH_TOKEN_SECRET=<secret>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_ACCOUNT=acct_...

# Background check
CHECKR_API_KEY=...
CHECKR_WEBHOOK_SECRET=...

# Vendors
LYFT_CLIENT_ID=...
LYFT_CLIENT_SECRET=...
OPENTABLE_API_KEY=...
FLOWERS_API_KEY=...
GROUPON_API_KEY=...

# Push
EXPO_ACCESS_TOKEN=...

# Geo
GOOGLE_MAPS_API_KEY=...   # for zip→lat/lng geocoding

# AWS
AWS_S3_BUCKET=t42-media-prod
AWS_REGION=us-east-1
```

---

## 10. Security Checklist

| Area | Implementation |
|---|---|
| Auth | RS256 JWT · 15-min access token · 30-day refresh with rotation |
| API rate limiting | Nginx: 100 req/min per IP · 20 req/min per user on match endpoints |
| PII storage | Stripe handles all card data — T42 stores zero raw card numbers |
| Webhook verification | HMAC-SHA256 signature on all Stripe + Checkr webhooks |
| Geo data retention | `live_date_locations` purged after 48h via pg cron |
| Background check data | Notes summarized — raw criminal records never stored |
| SQL injection | Drizzle parameterized queries only — no raw string interpolation |
| Payment hold | `capture_method: 'manual'` — funds held but never moved without explicit capture |
| Vendor API keys | Stored in AWS Secrets Manager — never in env vars in production |
| LGBTQ+ data | Sexual orientation treated as sensitive PII — encrypted at rest (pgcrypto) |
