# Pulse — Design Brief

> For Claude Design. Read this before generating anything. The brief describes what the product should **feel** like — the functional structure is fixed, the aesthetic is yours to define. Make something distinctive.

---

## The product in one sentence

Pulse shows a question. You answer it. AI turns it into a LinkedIn post. That's the whole product.

---

## Who it's for

Adam. 15 years as a UX and product designer. Running a job search. Trying to build a presence on LinkedIn that sounds like a person — not like everyone else's ChatGPT output.

He's a designer. He will notice if this looks generic. He has strong opinions and a good eye. The product has to be good enough that he's proud to have his name on it.

---

## The moment that matters

The core experience is this: you open the app, a question appears, and for a few seconds you actually think about it.

*"AI tools can now generate a finished UI in an afternoon. Does that make UX designers more valuable or less?"*

That moment of reading the question and forming an opinion — that is what the design must protect. Everything else is infrastructure. The question is the hero. It needs space, weight, and presence. Nothing should compete with it.

---

## Brand personality

This is not a SaaS dashboard. It is not a productivity tool. It is closer to a well-designed notebook you actually want to open.

| What it is | What it is not |
|------------|----------------|
| Calm and intentional | Busy or feature-forward |
| Warm — made by a human, for a human | Clinical, cold, tech-startup-generic |
| A little editorial — has opinions | Neutral, Swiss, invisible |
| Unhurried | Urgent, gamified, streak-counting |
| Confident | Loud |
| Personal — feels like it belongs to someone | Enterprise, scalable, "for teams" |

The closest physical analogy: a high-quality notebook with a distinctive cover that you'd leave on your desk rather than hide in a drawer. Not precious — just well made.

---

## What this should NOT look like

These are hard constraints. If the output resembles any of the following, start again:

- **Claude.ai** — dark backgrounds, indigo/purple accents, chat bubble layouts
- **Notion** — pure white, system-feeling, no visual personality, endless blank space
- **Generic "AI startup"** — gradient buttons, dark mode, glowing cards, neon accents
- **Corporate dashboard** — sidebar navigation, stat cards, data density, modal-heavy
- **A blog or CMS** — heavy editorial typography, drop caps, longform-focused
- **Every other "calm productivity" app** — off-white background, Inter font, rounded cards, terracotta accent. This combination is now the generic. Avoid it.

---

## What this could look like (open to interpretation)

These are directions, not prescriptions. Pick one and commit to it — or find something better.

**Direction A — Editorial weight**
Think a well-designed quarterly magazine. Strong typographic hierarchy, a distinctive colour (something unexpected — not warm beige, not corporate blue), the question displayed with the confidence of a headline. The kind of thing you frame, not just read.

**Direction B — The focused workspace**
Not a minimal app — a *specific* workspace. Has texture, warmth, a sense of place. Like a well-lit desk rather than a blank wall. Thinks carefully about what deserves emphasis and what should recede. Distinctive in the details.

**Direction C — Something unexpected**
If you see a direction that better fits the personality brief than either of the above — take it. The goal is non-generic, confident, personal. The path to get there is open.

---

## Non-negotiables

These are functional requirements, not aesthetic ones. They cannot be changed.

**Theme:** Light dominant. The background is light. Dark mode is not in scope.

**Accessibility:** WCAG AA contrast minimum throughout. All interactive elements minimum 44×44px touch target.

**One LinkedIn button:** The "Post to LinkedIn" button must use LinkedIn's brand blue (`#0A66C2`). This is a brand/legal requirement — it cannot be changed or blended.

**No glass morphism:** It doesn't work on light backgrounds.

**Mobile-first:** All screens must work beautifully at 390px. Don't design desktop and shrink it. Design both.

---

## Screens

Five screens. All at desktop (1440px) and mobile (390px iPhone 14).

---

### Screen 1: Home — Answer step

The primary screen. One question, one answer field, two buttons. That's it.

**Structure (fixed):**
- Navigation header: product wordmark left; History text link and user avatar/initial right. The avatar is a button — clicking it opens a small dropdown showing the user's name, email, an "Account" link, and "Sign out". Sign out must be one click from anywhere in the app.
- Topic label above the question (e.g. "AI × DESIGN") — small, categorical
- Question card — the hero. Centred. Given real presence.
- Navigation indicators — user can move between 2–3 questions for this week. Small dots or equivalent, with prev/next controls.
- Answer textarea — large, inviting, for typing a raw answer
- **Post format selector** — sits between the textarea and the action buttons. Two options: "Question-led" and "Free-speaking". Should feel like a lightweight toggle, not a big UI element — it's a preference, not a core action.
- Two buttons: "Polish with AI" (secondary action) and "Generate post →" (primary CTA)

**The question must feel important.** It is not a form field label. It is not a card in a list. It is the reason the screen exists.

---

### Screen 2: Home — Preview step

Same page, state after "Generate post" is clicked. The question disappears; the generated post appears instead.

**Structure (fixed):**
- Navigation header (same)
- "← Back" link and "Post preview" label
- Generated post in an editable text area — user can revise before posting
- Two buttons: "↺ Regenerate" (secondary) and "Post to LinkedIn →" (LinkedIn blue, primary)

---

### Screen 3: History

A log of past questions and posts.

**Structure (fixed):**
- Navigation header
- List of past questions, newest first
- Each item: topic, question (truncated), date, status badge (New / Draft / Ready / Posted)
- Expandable — open to see the full answer and generated post
- "Answer this question →" link for unanswered items
- Status badges must be visually distinct for each state — not just different colours of the same pill

---

### Screen 4: Account

Three settings sections. Quiet page — no drama.

**Structure (fixed):**
- Navigation header (avatar dropdown shows Account as active)
- Profile section: avatar initial, name, email
- Connected Accounts: LinkedIn with connect / disconnect state clearly indicated
- Topic Areas: a set of **toggleable topic chips** — AI × Design, UX Craft, Process, Product thinking, Career. All on by default. At least one must remain selected. Brief explanation: "Questions are generated from news in these areas". Chips should look selectable — not decorative.
- **Sign out** — a clear, standalone button (not a small text link buried at the bottom). This is important: users must be able to find it without hunting.

---

### Screen 5: Auth

Entry point. No nav — nowhere to go if you're not logged in.

**Structure (fixed):**
- Wordmark centred, no nav links
- SSO options: Google, GitHub
- Divider
- Email + password fields with labels
- Sign in / Sign up toggle
- Error state (inline, near the relevant field)

---

## The wordmark

The product is called **Pulse**. It has a pulse/waveform symbol mark — a small ECG-style line — as a prefix to the wordmark. Both the symbol and the wordmark should read as a single lockup.

The wordmark treatment is part of what makes this non-generic. Think carefully about how it sits in the header and on the auth screen. It should look like it was designed, not typed.

---

## Deliverables

1. **Token sheet** — colour palette with usage labels, type scale, spacing scale, radius decisions
2. **Component sheet** — button variants (primary, secondary, disabled), input states (default, focused, error), card, status badge (all 4 states), nav header, topic chip
3. **5 screens** — each at 1440px desktop and 390px mobile

Screens: Home (answer step), Home (preview step), History, Account, Auth.

---

## Final note

The test is this: if you showed this to someone who didn't know what it was, would it look like every other app they've seen, or would it look like someone actually made a visual decision? Aim for the second.
