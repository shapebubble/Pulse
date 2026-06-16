# Pulse — Page Logic & Connection Map

> The authoritative reference for how every page, flow, and state connects. Build against this. If the code and this doc disagree, this doc is wrong — update it.

---

## The core loop

```
NEWS SOURCES                 (hidden from user)
    │
    ▼
Claude generates questions   /api/questions/generate  [Phase 2 cron]
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  / (Home) — ANSWER STEP                              │
│                                                      │
│  ← Q 1/3 →    ← navigate this week's questions      │
│                                                      │
│  [Answer textarea]  ← autosaves every 800ms          │
│                                                      │
│  [Polish ✦]   → POST /api/polish → Claude Haiku      │
│                  ↓ polished text replaces textarea   │
│                                                      │
│  [Generate →] → POST /api/generate → Claude Sonnet   │
└──────────────────────────────────────────────────────┘
         │ on success: post text returned
         ▼
┌──────────────────────────────────────────────────────┐
│  / (Home) — PREVIEW STEP  (same URL, different state)│
│                                                      │
│  [← Back]     ← returns to Answer step              │
│                                                      │
│  [Editable post textarea]                            │
│                                                      │
│  [↺ Regen]    → POST /api/generate again             │
│                  ↓ replaces post textarea content    │
│                                                      │
│  [Post to LinkedIn →]  → POST /api/linkedin/post     │
└──────────────────────────────────────────────────────┘
         │ on success
         ▼
┌──────────────────────────────────────────────────────┐
│  / (Home) — PUBLISHED STATE  (transient, ~4 seconds) │
│                                                      │
│  "Posted to LinkedIn ✓"  ← confirmation              │
│                                                      │
│  [Back to questions]  ← returns to Answer step,      │
│                          next unanswered question     │
└──────────────────────────────────────────────────────┘
```

---

## Page connection map

```
                    ┌──────────┐
         ┌──────────│  /auth   │◄────── unauthenticated users redirected here
         │          └──────────┘
         │ on login           ▲
         ▼                    │ sign out (nav avatar dropdown OR Account screen)
    ┌─────────┐          ┌──────────┐
    │    /    │◄─────────│  /admin  │◄── LinkedIn OAuth callback redirects here
    │  Home   │          │ Account  │
    └────┬────┘          └──────────┘
         │ "History" nav link  ▲ "Account" / avatar nav link (from all authenticated pages)
         ▼                     │
    ┌──────────┐               │
    │ /history │───────────────┘
    │ History  │
    └──────────┘
         │ "Answer this →" link (unanswered items)
         ▼
    ┌─────────┐
    │    /    │  (question pre-selected via ?q=<id> — Phase 2)
    │  Home   │
    └─────────┘
```

---

## Navigation header (all authenticated pages)

The nav header is persistent across `/`, `/history`, and `/admin`.

```
[Pulse wordmark]          [History]  [Avatar initial ▾]
                                              │
                                    ┌─────────────────────┐
                                    │ Adam                │
                                    │ shapebubble@...     │
                                    │ ─────────────────── │
                                    │ Account settings →  │
                                    │ Sign out            │
                                    └─────────────────────┘
```

- Avatar initial is the first letter of the user's display name
- Dropdown opens on click, closes on click outside or Escape
- "Account settings" navigates to `/admin`
- "Sign out" fires Supabase Auth signOut() → redirect to `/auth`
- "Sign out" also available as a standalone button on `/admin` for discoverability

---

## News feed → topic areas → question generation pipeline

This is the complete chain from raw news to the question the user sees on screen. The user never sees the news — only the question.

```
STEP 1 — News fetch  (Phase 1: manual seed / Phase 2: automated cron)
─────────────────────────────────────────────────────────────────────
Phase 1: Admin manually inserts questions into the `questions` table (seeded directly in DB or via a private admin route /api/questions/seed).
Phase 2 (automated):

GET /api/questions/generate  [Vercel cron — twice weekly]
  │
  ├── Fetch recent news headlines from:
  │     NewsAPI   → design, AI, UX, product categories
  │     Hacker News API → top stories, filtered by topic keywords
  │     Reddit API (optional) → r/userexperience, r/artificial
  │     RSS feeds (optional) → UX Collective, NNG, TechCrunch AI
  │
  └── Produce: a news briefing (list of headlines + summaries, last 48–72 hours)
        Stored in memory for this request only — never saved, never shown to user


STEP 2 — Topic filtering
────────────────────────
For each user with active questions due this week:
  │
  └── Read `user_topics` table → which topics this user has selected
        e.g. { ai_design: true, ux_craft: true, process: false, product: true, career: false }
        If no row exists: treat all 5 as selected (default)
  │
  └── Filter news briefing to headlines matching the user's selected topics
        Topic → keyword mapping:
          AI × Design   → "AI", "artificial intelligence", "machine learning", "design tools", "Figma AI", "generative"
          UX Craft       → "user research", "usability", "UX", "information architecture", "accessibility"
          Process        → "design process", "workflow", "agile", "sprint", "design ops"
          Product thinking → "product strategy", "roadmap", "prioritisation", "product design", "metrics"
          Career         → "hiring", "design jobs", "portfolio", "skills", "salary", "layoffs"


STEP 3 — Question generation
─────────────────────────────
POST /api/questions/generate → Claude Sonnet

System prompt tells Claude:
  - You are generating thought-provoking questions for a UX designer's LinkedIn presence
  - Questions must be grounded in the supplied news — each question should be traceable to a real headline
  - Questions should invite an opinion, not just describe an event
  - Banned: generic questions not tied to news (e.g. "What do you think about AI in design?")
  - Required: 2–3 questions per user per week

Input to Claude:
  {
    user_topics: string[],           ← user's selected topic labels
    news_briefing: string,           ← filtered headlines for this user
    past_questions: string[],        ← titles of last 10 questions asked (avoid repetition)
  }

Output from Claude:
  {
    questions: [
      { topic: "AI × Design", question: "Figma just shipped AI-generated layouts. Does that change the job, or just the tools?", source_headline: "Figma launches AI layout generation — TechCrunch, 2026-06-14" },
      ...
    ]
  }


STEP 4 — Deduplication + storage
──────────────────────────────────
  ├── Check each generated question against recent question history (past 30 days)
  │     If a near-duplicate found (semantic similarity check — Phase 2): discard and regenerate
  │
  └── Insert approved questions into `questions` table:
        { user_id, topic, question_text, source_headline, week_of, status: 'new' }


STEP 5 — User sees the question
────────────────────────────────
  /  (Home) loads
  └── reads questions WHERE user_id = current AND week_of = current_week
        → displays the most recent unanswered question
        → dot navigation shows all this week's questions
```

### Topic area → question relationship

- Topics are a **filter on the news feed**, not a category the question is filed under
- A question about AI being used in a design tool is tagged `AI × Design` by Claude at generation time
- If the user has `AI × Design` deselected, that question would not be generated for them
- The topic label shown above the question on the Home screen comes from the `questions.topic` field set at generation time
- Changing topic selection on Account takes effect from the **next generation cycle** (next cron run), not immediately

---

## Auth gate

- **`/`, `/history`, `/admin`** — require an active Supabase session. Unauthenticated → redirect `/auth`.
- **`/auth`** — only for unauthenticated users. Authenticated → redirect `/`.
- **`/api/*` (except `/api/auth/*`)** — require valid session cookie. Returns 401 if missing.
- **`/api/linkedin/callback`** — no Supabase session required (receives code from LinkedIn before session is confirmed). Validates OAuth `state` param to prevent CSRF.

Implementation: Next.js middleware at `src/middleware.ts` checks session on every request.

---

## Home screen — step state machine

The Home screen has three internal steps. These are React state, not URL routes.

```
ANSWER STEP (default)
  ├── User types → autosave → status: draft
  ├── Polish → /api/polish → textarea updated → stays on Answer step
  ├── Format selector → "Question-led" (default) | "Free-speaking"
  │     Selection persists for this session; stored with the generated post
  ├── Generate → /api/generate (with format param) →
  │     success: → PREVIEW STEP
  │     failure: → stays on Answer step, error inline
  └── Navigate prev/next → Answer step for different question

PREVIEW STEP
  ├── Edit post textarea → local edit only (no autosave)
  ├── Back → ANSWER STEP (answer restored, post discarded, status: draft)
  ├── Regenerate → /api/generate →
  │     success: → PREVIEW STEP (post replaced)
  │     failure: → stays on Preview step, previous post restored, error inline
  └── Post to LinkedIn → /api/linkedin/post →
        not connected: → inline message + link to /admin (stays on Preview step)
        token expired: → inline message + link to /admin (stays on Preview step)
        posting: → loading state on button
        success: → PUBLISHED STATE
        failure: → stays on Preview step, error inline, button re-enables

PUBLISHED STATE (transient)
  └── Auto-transitions or user clicks "Back to questions" → ANSWER STEP
        (next unanswered question selected if available)
```

---

## LinkedIn connect/disconnect flow

### Connect (initiating from /admin)

```
User clicks "Connect LinkedIn" on /admin
    │
    ▼
GET /api/linkedin/auth
  → generates random state param → stores in session cookie
  → 302 redirect to LinkedIn OAuth consent screen:
      https://www.linkedin.com/oauth/v2/authorization
        ?client_id=LINKEDIN_CLIENT_ID
        &redirect_uri=https://pulse.thatsadam.dk/api/linkedin/callback
        &scope=openid profile w_member_social
        &state=<random>
    │
    ├── User cancels on LinkedIn → redirected to /api/linkedin/callback?error=user_cancelled
    │     → redirect /admin with ?error=linkedin_cancelled
    │     → Account page shows brief inline message "LinkedIn connection cancelled"
    │
    └── User approves on LinkedIn → redirected to /api/linkedin/callback?code=...&state=...
          → validate state matches session (CSRF check — reject if mismatch)
          → POST https://www.linkedin.com/oauth/v2/accessToken → access_token, expires_in
          → GET https://api.linkedin.com/v2/me → LinkedIn person URN (sub field)
          → store in connected_accounts: { user_id, provider: 'linkedin', access_token, expires_at, author_urn }
          → redirect /admin
          → Account page shows LinkedIn as "Connected" with expiry info
```

### Disconnect

```
User clicks "Disconnect" on /admin
    │
    ▼
Confirmation prompt: "Remove Pulse's access to LinkedIn?"
    ├── Cancel → no change
    └── Confirm → POST /api/linkedin/disconnect
          → delete connected_accounts row for this user + provider
          → Account page: LinkedIn shows "Not connected"
          → Any in-progress post on Home screen: "Post to LinkedIn" button
            updates to show "Connect LinkedIn first" on next render
```

### Token expiry handling

LinkedIn access tokens expire (~60 days). If the token has expired when the user tries to post:

```
POST /api/linkedin/post
  → fetch connected_accounts → check expires_at
  ├── expires_at < now → return 401 { error: 'token_expired' }
  │     → Frontend shows: "Your LinkedIn connection has expired. Reconnect in Account."
  │     → Link to /admin
  │     → Post content preserved in textarea — user can reconnect and retry
  │
  └── token valid → proceed with LinkedIn UGC API call
```

Note: proactive token refresh (using LinkedIn refresh tokens) is a Phase 2 improvement. Phase 1 requires manual reconnect.

---

## Data flow per page

### `/` (Home)

**Reads on load:**
- `questions` — this week's questions for this user, ordered by `created_at ASC`
- `answers` — saved drafts for each question (restores textarea on revisit)
- `connected_accounts` — whether LinkedIn is connected (affects Post button state)

**Writes during session:**
- `answers.raw` — autosave every 800ms while typing
- `answers.polished` — on Polish click (replaces raw in DB)
- `questions.status` → `draft` (first keystroke) → `done` (generate) → `published` (LinkedIn post)
- `posts` — new row when post is generated (`question_id`, `user_id`, `text`)
- `posts.linkedin_id` — populated after successful LinkedIn post

**External calls:**
- `POST /api/polish` → Claude Haiku
- `POST /api/generate` → Claude Sonnet
- `POST /api/linkedin/post` → LinkedIn UGC API

---

### `/history`

**Reads on load:**
- `questions` + `answers` + `posts` joined — all rows for this user, `created_at DESC`

**Writes:**
- Nothing — read-only

**Navigation out:**
- "Answer this question →" → `/` (Phase 2: `?q=<id>` to pre-select the question)

---

### `/admin`

**Reads on load:**
- `users` — display name, email
- `connected_accounts` — LinkedIn status + `expires_at`
- `user_topics` — which topic areas this user has selected (defaults to all 5 if no row exists)

**Writes:**
- `connected_accounts` — deleted on disconnect
- `user_topics` — updated on topic chip toggle (immediate save, no button)

**External calls:**
- `GET /api/linkedin/auth` → initiates LinkedIn OAuth (redirect)
- `POST /api/linkedin/disconnect` → deletes token

---

### `/auth`

**Reads:** Nothing (public page)

**Writes:**
- `users` — new row on signup (Supabase Auth handles)
- Session cookie — set by Supabase on login

**External calls:**
- Supabase Auth SDK — email/password and SSO
- Google OAuth (via Supabase)
- GitHub OAuth (via Supabase)

---

## API dependency chain

```
/api/polish
  └─ requires: ANTHROPIC_API_KEY
  └─ model: claude-haiku-4-5
  └─ input: { answer: string, question: string }
  └─ output: { polished: string }

/api/generate
  └─ requires: ANTHROPIC_API_KEY
  └─ model: claude-sonnet-4-6
  └─ input: { answer: string, question: string, topic: string, format: 'question-led' | 'free-speaking' }
  └─ format behaviour:
       question-led:  post opens by framing the question as context for the reader,
                      then presents the answer. Reader sees what was asked.
       free-speaking: post sounds mid-thought and conversational. Question is embedded
                      or dropped. Reader feels like they're overhearing a reflection.
  └─ output: { post: string }
  └─ stores: posts.format = format value
  └─ Phase 2: also consumes style_profile from DB

/api/linkedin/auth
  └─ requires: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
  └─ generates state param → stores in session
  └─ output: 302 redirect to LinkedIn consent screen

/api/linkedin/callback
  └─ requires: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
  └─ validates state param (CSRF)
  └─ exchanges code for access_token
  └─ fetches author URN from LinkedIn /v2/me
  └─ stores token + URN in connected_accounts
  └─ output: 302 redirect to /admin

/api/linkedin/post
  └─ requires: active session (user_id)
  └─ reads: connected_accounts (access_token, author_urn, expires_at)
  └─ guards: not connected → 403. token expired → 401. 
  └─ calls: POST https://api.linkedin.com/v2/ugcPosts
  └─ on success: returns { ok: true, linkedinId: string }
  └─ updates: posts.linkedin_id, questions.status → 'published'

/api/linkedin/disconnect
  └─ requires: active session
  └─ deletes: connected_accounts row for user + 'linkedin' provider
  └─ output: { ok: true }

/api/questions/generate  [Phase 2]
  └─ requires: ANTHROPIC_API_KEY, NEWSAPI_KEY
  └─ inputs: news headlines + user topics + past question history
  └─ outputs: 2–3 new questions inserted into questions table
  └─ triggered: Vercel cron, twice weekly
```

---

## Question navigation state machine

```
questions array for current week (ordered newest first)
    ├── index 0: most recent question    ← default on page load
    ├── index 1: previous
    └── index 2: oldest this week

Status transitions (per question):
  new      → (first keystroke in textarea) → draft
  draft    → (Generate clicked + success)  → done
  done     → (Post to LinkedIn + success)  → published
  new      → (Next arrow, no answer typed) → skipped
  skipped  → (dot clicked / navigated back to) → new

Dot appearance by status:
  new       = accent colour, medium opacity
  draft     = amber, full opacity
  done      = green, full opacity
  published = green, filled solid
  skipped   = muted, low opacity
```

---

## Preview step — what persists and what doesn't

| When user does | Answer textarea | Generated post | Question status |
|----------------|----------------|----------------|-----------------|
| Clicks "← Back" from Preview | Restored from last autosave | Discarded | Reverts to "draft" |
| Regenerates from Preview | Unchanged | Replaced | Stays "done" |
| Edits post in Preview | Unchanged | Edited version | Stays "done" |
| Posts to LinkedIn successfully | Unchanged | Preserved | "published" |
| Navigates to History mid-preview | Unchanged (autosaved) | Lost | Stays "done" |

---

## Cross-page LinkedIn connection dependency

The LinkedIn connection state (from `connected_accounts`) affects two pages:

| Page | Behaviour when not connected |
|------|------------------------------|
| `/` Home — Preview step | "Post to LinkedIn" button shows "Connect LinkedIn first" with link to /admin |
| `/admin` | "Connect" button shown; status shows "Not connected" |

There is no global state sync in Phase 1. Each page reads `connected_accounts` on load. If the user connects LinkedIn in one tab and then switches to a Home tab with Preview open, they'll need to refresh to see the updated button state.

---

## Error handling conventions

| Scenario | Behaviour |
|----------|-----------|
| Network failure on any API call | Button re-enables, inline error "Something went wrong — try again", user retains their content |
| API returns 4xx (bad request) | Inline error near the triggering action |
| API returns 401 (session expired) | Redirect to `/auth` |
| Claude API error (polish/generate) | Inline: "Generation failed — try again" |
| LinkedIn not connected | Inline: "Connect LinkedIn in Account settings" + link |
| LinkedIn token expired | Inline: "Your LinkedIn connection has expired — reconnect in Account" + link |
| LinkedIn API error (post fails) | Inline: "Failed to post — try again", post content preserved in textarea |
| OAuth state mismatch (CSRF) | Redirect /admin with error: "Connection failed — please try again" |
| Autosave failure | Silent — retry on next keystroke. Never block the user. |
