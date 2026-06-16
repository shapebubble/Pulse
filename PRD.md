# Pulse — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-06-16  
**Owner:** Adam  
**Status:** Active — Phase 1 build

---

## 1. Overview

Pulse is a personal content engine for LinkedIn. It asks the user a thought-provoking question rooted in current news, takes their raw answer, and turns it into a polished LinkedIn post — in their voice, not AI-voice.

The target user is Adam: a senior UX designer with 15+ years of experience, positioning himself as AI-fluent in a job search. The tool is personal-first, may expand to other users later.

---

## 2. Problem

Building a consistent LinkedIn presence is time-consuming. Generic AI content is immediately recognisable and undermines credibility. The challenge is producing authentic, opinionated, well-written content at a sustainable cadence — without it taking an hour per post.

Pulse solves this by:
- Generating questions from real current news so content is always timely
- Making the user do the thinking (the answer), not the polishing (the writing)
- Learning the user's voice over time so posts get more personal with each iteration

---

## 3. Users

**Phase 1:** Adam only  
**Phase 2:** Adam + Subchecked team  
**Phase 3:** Open to other users (productise if Phase 1/2 prove traction)

---

## 4. Core loop

```
News sources (hidden)
    ↓
Claude generates 2–3 questions per week from current design/AI headlines
    ↓
User sees question on home screen
    ↓
User types raw answer (how they'd say it out loud)
    ↓
Optional: "Polish with AI" — Claude Haiku cleans grammar, preserves voice
    ↓
"Generate post" — Claude Sonnet writes LinkedIn-formatted post from the answer
    ↓
User reviews, edits, posts directly to LinkedIn
    ↓
Post performance feeds back into next question selection (Phase 2)
```

---

## 5. Screens

### 5.1 Home (`/`)
The primary screen. One question at a time, full focus.

**Must have:**
- Single question displayed prominently — the hero of the screen
- Topic label above the question (e.g. "AI × Design")
- Left/right navigation between this week's questions (2–3 max)
- Status dots indicating answered/draft/posted state per question
- Large textarea for the user's answer
- "Polish with AI" button — refines the raw answer in-place
- **Post format selector** — "Question-led" or "Free-speaking" — above the generate button (default: Question-led)
- "Generate post" button — produces LinkedIn copy and moves to preview
- Preview state (within same screen): editable post, Regenerate + Post to LinkedIn buttons
- Autosave drafts silently (no user action required)

**Must not have:**
- Any news content visible to the user
- Sidebar, dashboard, analytics on this screen
- Multiple questions shown simultaneously

---

### 5.2 History (`/history`)
A log of all past questions and their status.

**Must have:**
- Chronological list, newest first
- Each item shows: topic, question (truncated), date, status badge
- Expandable — click to see full answer and generated post
- "Answer this" link for unanswered items (returns to home)

---

### 5.3 Account (`/admin`)
Settings and connected accounts.

**Must have:**
- Basic profile (name, email, avatar initial)
- LinkedIn connect/disconnect — OAuth flow
- Connected state clearly indicated (green dot + "Connected")
- **Topic areas** — toggleable chips, all selected by default, at least one required
- **Sign out** — accessible from nav header (avatar dropdown) on every authenticated page, and as a standalone button on this screen

---

### 5.4 Auth (`/auth`)
Entry point for unauthenticated users.

**Must have:**
- Email + password
- Google SSO
- GitHub SSO
- Toggle between sign in and sign up
- Inline error messages

---

## 6. Feature requirements

### Question generation (Phase 1 — manual seeding, Phase 2 — automated)
- Questions must reference real current events in design/AI
- 2–3 new questions per week
- No question repeated, no two users in the same topic area get the same question (Phase 2)
- Topics: AI × Design, UX Craft, Process, Product thinking, Career

### Polish with AI
- Uses Claude Haiku (speed + cost)
- Fixes grammar, tightens sentences, removes filler
- Does NOT change substance, reorder ideas, or add new information
- Returns polished text into the same textarea — user sees the diff in their mind, not a diff UI

### Generate post
- Uses Claude Sonnet (quality)
- Inputs: answer + question + topic + **format** + style profile (Phase 2)
- **Format: Question-led** — post opens by framing the question as context; reader sees what was asked before seeing the answer
- **Format: Free-speaking** — post sounds conversational and mid-thought; question is embedded or absent; reader feels like they're overhearing a genuine reflection
- Output: 200–280 word LinkedIn post
- Voice rules: direct, opinionated, occasional wit. No corporate buzzwords.
- Banned phrases: "excited to share", "game-changer", "leverage", "synergy", "in today's fast-paced world"
- Ends with a comment-provoking question or observation

### LinkedIn posting
- Direct via LinkedIn UGC Posts API
- Requires prior OAuth connection (guided from Account screen)
- Post is editable before sending
- On success: question status updates to "published"

### Style learning (Phase 2)
- After each answer, extract voice characteristics
- Milestones: 1 answer (cleanup), 5 (rhythm), 10 (vocabulary), 20 (full profile)
- Profile visible to user, editable

---

## 7. Non-functional requirements

| Requirement | Target |
|-------------|--------|
| Polish response time | < 3s |
| Generate response time | < 8s |
| Mobile usable | Yes — web responsive, 375px min width |
| Auth | Supabase — email + Google + GitHub |
| Hosting | Vercel — `pulse.thatsadam.dk` (CNAME → Vercel, separate from WordPress) |
| Data persistence | Supabase (PostgreSQL) |
| API costs per post | ~$0.05 (Haiku polish + Sonnet generate) |

---

## 8. Out of scope (Phase 1)

- Image generation
- Video content
- YouTube integration
- Multi-user teams
- Automated news fetching (manual question seeding for now)
- Post performance tracking / LinkedIn metrics
- Mobile native app

---

## 9. Success metrics (Phase 1)

- Posting 1–2x per week consistently for 4 weeks
- Posts feel authentic (not AI-generic) — subjective, Adam's judgement
- Time from open to posted: < 10 minutes
- No dropped posts due to app errors

---

## 10. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind CSS v4 + custom design system (tokens.css + components.css) |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic — claude-haiku-4-5 (polish), claude-sonnet-4-6 (generate) |
| LinkedIn | UGC Posts API v2 + OAuth 2.0 |
| Hosting | Vercel |
| Background | Three.js — neural network particle system |

---

## 11. Design requirements (summary — full brief in DESIGN_BRIEF.md)

- **Feel:** Personal and editorial — made by a human, for a human. Closer to a well-designed notebook than a SaaS dashboard.
- **Theme:** Light dominant. Not dark. Not generic off-white.
- **Palette:** Open to interpretation — warm, not clinical. Not terracotta + cream (that's now the generic). Make a real visual decision.
- **Type:** Readable, with hierarchy. The question is the hero and must look like one.
- **Motion:** Subtle — the 3D background moves slowly, UI transitions understated
- **Accessibility:** WCAG AA minimum throughout
- **Key constraint:** Must not look like Claude.ai, Notion, or generic AI-startup UI. See DESIGN_BRIEF.md for full anti-pattern list.
