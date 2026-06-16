# Pulse — Sitemap

> Every route, every API endpoint, and the auth rules for each.

---

## Page routes

```
/                          Home — Question + Answer
│
├── /history               History — all past questions & posts
├── /admin                 Account — profile, connected accounts, topics
└── /auth                  Auth — sign in / sign up

```

### Route details

| Route | Page | Auth required | Description |
|-------|------|:-------------:|-------------|
| `/` | Home | Yes | Today's question. Answer → Polish → Generate → Preview → Post |
| `/history` | History | Yes | Accordion list of all questions. Status badges. Expand to see answer + post |
| `/admin` | Account | Yes | Profile, LinkedIn connect/disconnect, topic areas, sign out |
| `/auth` | Auth | No | Email + password, Google SSO, GitHub SSO |

---

## API routes

### Content generation

| Method | Route | Auth | Input | Output | Called by |
|--------|-------|:----:|-------|--------|-----------|
| POST | `/api/polish` | Yes | `{ answer, question }` | `{ polished }` | Home — Polish with AI |
| POST | `/api/generate` | Yes | `{ answer, question, topic }` | `{ post }` | Home — Generate post |

### LinkedIn

| Method | Route | Auth | Input | Output | Called by |
|--------|-------|:----:|-------|--------|-----------|
| GET | `/api/linkedin/auth` | Yes | — | Redirect to LinkedIn OAuth | Admin — Connect |
| GET | `/api/linkedin/callback` | No* | `code`, `state` | Sets token, redirect `/admin` — or `/admin?error=...` on cancel/failure | LinkedIn OAuth flow |
| POST | `/api/linkedin/post` | Yes | `{ text }` | `{ ok }` | Home preview — Post to LinkedIn |
| POST | `/api/linkedin/disconnect` | Yes | — | `{ ok }` | Admin — Disconnect |

*Callback receives OAuth code from LinkedIn — no session required yet, but validates state param.

### Auth (Supabase)

| Method | Route | Auth | Input | Output | Called by |
|--------|-------|:----:|-------|--------|-----------|
| POST | `/api/auth/login` | No | `{ email, password }` | Session cookie | Auth page |
| POST | `/api/auth/signup` | No | `{ email, password }` | Session cookie | Auth page |
| GET | `/api/auth/sso/google` | No | — | Redirect to Google OAuth | Auth page |
| GET | `/api/auth/sso/github` | No | — | Redirect to GitHub OAuth | Auth page |
| GET | `/api/auth/callback` | No | Supabase params | Session cookie, redirect `/` | Supabase SSO callback |
| POST | `/api/auth/logout` | Yes | — | Clear session | Admin — Sign out |

---

## Database schema (Supabase — to be created)

```
users
  id            uuid (PK)
  email         text
  display_name  text            — shown on Account screen
  created_at    timestamp

questions
  id            uuid (PK)
  user_id       uuid (FK → users)
  text          text
  topic         text
  source_news   text[]          — headlines that inspired it (hidden from user)
  status        enum(new, draft, done, published, skipped)
  created_at    timestamp

answers
  id            uuid (PK)
  question_id   uuid (FK → questions)
  user_id       uuid (FK → users)
  raw           text            — as typed
  polished      text            — after Polish with AI
  updated_at    timestamp

posts
  id            uuid (PK)
  question_id   uuid (FK → questions)
  user_id       uuid (FK → users)
  text          text
  linkedin_id   text            — returned by LinkedIn UGC API after posting (null until published)
  created_at    timestamp       — when the post was generated
  posted_at     timestamp       — when it was published to LinkedIn (null until published)

style_profile
  id            uuid (PK)
  user_id       uuid (FK → users, unique)
  voice_notes   text            — Claude-generated profile of user's writing style
  answer_count  int             — how many answers have been used to learn
  updated_at    timestamp

connected_accounts
  id            uuid (PK)
  user_id       uuid (FK → users)
  provider      text            — 'linkedin'
  access_token  text            — encrypted
  expires_at    timestamp
  author_urn    text            — LinkedIn person URN
```

---

## Future routes (Phase 2+)

| Route | Purpose |
|-------|---------|
| `/api/questions/generate` | Cron: fetch news, generate this week's questions via Claude |
| `/api/linkedin/metrics` | Pull engagement data (impressions, comments) for posted content |
| `/api/style-profile` | Read/update Claude's model of the user's voice |
| `/profile` | User-visible style profile — what Claude has learned about your voice |
