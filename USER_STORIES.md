# Pulse — User Stories

> Acceptance criteria define when a story is done. All stories are for Phase 1 (single user: Adam) unless marked Phase 2.

---

## Home — Question & Answer

### US-001 View today's question
**As** a user  
**I want** to see a thought-provoking question when I open the app  
**So that** I know what to write about this week

**Acceptance criteria:**
- [ ] Home screen loads with the most recent unanswered question displayed prominently
- [ ] Topic label appears above the question (e.g. "AI × DESIGN")
- [ ] If all questions for the week are answered/skipped, the most recent question is still shown
- [ ] Question text is legible and given visual prominence — it is the centrepiece of the screen

---

### US-002 Navigate between questions
**As** a user  
**I want** to move between this week's questions  
**So that** I can choose which one to answer

**Acceptance criteria:**
- [ ] Prev / next arrows navigate between 2–3 questions for the current week
- [ ] Status dots reflect each question's state (new / draft / done / published / skipped)
- [ ] Active question dot is visually distinct from others
- [ ] Clicking a dot navigates directly to that question
- [ ] Navigating away from a question with a draft answer autosaves before switching

---

### US-003 Write and autosave an answer
**As** a user  
**I want** to type my answer and have it save automatically  
**So that** I never lose what I wrote

**Acceptance criteria:**
- [ ] Textarea is large and accessible, with a descriptive placeholder
- [ ] Answer autosaves 800ms after the user stops typing — no manual save required
- [ ] Question status changes from "new" → "draft" on first keystroke
- [ ] Returning to the same question restores the saved draft
- [ ] No visible "saving..." indicator needed — autosave is silent

---

### US-004 Polish answer with AI
**As** a user  
**I want** to clean up my grammar and phrasing without changing my meaning  
**So that** my answer reads well before I generate a post from it

**Acceptance criteria:**
- [ ] "Polish with AI" button sends the current answer to `/api/polish`
- [ ] While processing: button shows a loading state, textarea is non-editable
- [ ] On success: polished text replaces the raw answer text in the textarea
- [ ] The polished answer is saved as the new draft
- [ ] On failure: error message appears inline near the button, textarea restores its previous state, user can retry
- [ ] Polish does NOT change the meaning, reorder ideas, or add new content

---

### US-005 Generate a LinkedIn post
**As** a user  
**I want** to turn my answer into a formatted LinkedIn post  
**So that** I can post it without writing it from scratch

**Acceptance criteria:**
- [ ] "Generate post →" button requires a non-empty answer — disabled or shows inline error if textarea is empty
- [ ] While processing: button shows a loading state
- [ ] On success: screen transitions to the Preview step (see US-006)
- [ ] Generated post is 200–280 words, direct and opinionated in tone
- [ ] Post does not contain banned phrases: "excited to share", "game-changer", "leverage", "synergy", "in today's fast-paced world"
- [ ] Post ends with a question or observation to prompt comments
- [ ] Question status changes to "done"
- [ ] On failure: error message "Generation failed — try again" appears inline, user remains on Answer step

---

## Home — Preview & Publish

### US-006 Preview the generated post
**As** a user  
**I want** to read and edit the generated post before publishing  
**So that** I can make sure it sounds like me

**Acceptance criteria:**
- [ ] Screen transitions to Preview step — question and answer area replaced by the post
- [ ] Post is displayed in an editable textarea — user can make direct edits
- [ ] "← Back" link returns to the Answer step (answer is preserved)
- [ ] "Post preview" label makes clear what state the user is in
- [ ] Character count or word count is visible (LinkedIn cap awareness)
- [ ] Post remains editable until the user chooses to post or go back

---

### US-007 Post to LinkedIn
**As** a user  
**I want** to publish the post directly to LinkedIn from the preview  
**So that** I don't have to copy/paste

**Acceptance criteria:**
- [ ] "Post to LinkedIn →" button uses LinkedIn brand blue (`#0A66C2`)
- [ ] If LinkedIn is not connected: button is disabled or replaced with "Connect LinkedIn first" link to `/admin`
- [ ] If LinkedIn is connected: clicking posts the current textarea content via `/api/linkedin/post`
- [ ] While posting: button shows a loading state
- [ ] On success:
  - [ ] Confirmation message appears: "Posted to LinkedIn ✓"
  - [ ] Question status changes to "published"
  - [ ] Post is saved with the LinkedIn post ID
  - [ ] User can navigate away — the success state persists briefly (3–5 seconds) then offers "Back to questions"
- [ ] On failure (API error): inline error message, button re-enables, user can retry
- [ ] On failure (token expired): message "LinkedIn connection expired — reconnect in Account" with link to `/admin`

---

### US-008 Regenerate the post
**As** a user  
**I want** to generate a new version of the post without going back  
**So that** I can try again if the first attempt didn't land right

**Acceptance criteria:**
- [ ] "↺ Regenerate" button re-calls `/api/generate` with the same answer and question
- [ ] While processing: loading state, textarea non-editable
- [ ] On success: textarea content is replaced with the new post
- [ ] On failure: error inline, previous post restored, user can retry
- [ ] Any edits the user made to the previous post are discarded on regenerate (user is warned if they have unsaved edits, or this is documented clearly in the UI)

---

### US-009 Return to answer from preview
**As** a user  
**I want** to go back to my answer and revise it before regenerating  
**So that** I can improve the source material rather than just the output

**Acceptance criteria:**
- [ ] "← Back" link on Preview step returns to the Answer step
- [ ] The answer textarea is restored with the last saved draft
- [ ] The generated post is discarded (user must regenerate after editing)
- [ ] Question status reverts to "draft"

---

## LinkedIn — Connect & Disconnect

### US-010 Connect LinkedIn account
**As** a user  
**I want** to connect my LinkedIn account to Pulse  
**So that** I can post directly without copy-pasting

**Acceptance criteria:**
- [ ] Account screen shows LinkedIn connection status (connected / not connected)
- [ ] "Connect" button initiates the OAuth flow via `/api/linkedin/auth`
- [ ] User is redirected to LinkedIn's consent screen
- [ ] After approving, user is redirected back to `/admin`
- [ ] Account screen now shows LinkedIn as "Connected" with a clear visual indicator
- [ ] If the user cancels the OAuth flow: they return to `/admin` with no change, no error shown
- [ ] If OAuth fails (LinkedIn error): inline error message on Account screen

---

### US-011 Disconnect LinkedIn account
**As** a user  
**I want** to disconnect my LinkedIn account  
**So that** I can revoke Pulse's access at any time

**Acceptance criteria:**
- [ ] "Disconnect" option is visible when LinkedIn is connected
- [ ] Clicking disconnect shows a confirmation prompt ("This will remove Pulse's access to your LinkedIn account. Are you sure?")
- [ ] On confirm: token is deleted, status reverts to "Not connected"
- [ ] On cancel: no change
- [ ] After disconnect: "Post to LinkedIn" button on Preview step shows "Connect LinkedIn first" message

---

### US-012 Attempt to post when LinkedIn not connected
**As** a user  
**I want** a clear message when LinkedIn isn't connected and I try to post  
**So that** I know what to do next

**Acceptance criteria:**
- [ ] If not connected: "Post to LinkedIn →" button is visually disabled or replaced with an informational state
- [ ] A clear inline message directs the user to Account to connect: "Connect LinkedIn in Account settings"
- [ ] The message includes a direct link to `/admin`
- [ ] The generated post is not lost — user can still copy it manually

---

## History

### US-013 View all past questions
**As** a user  
**I want** to see a list of all past questions and their status  
**So that** I can track what I've done and find previous posts

**Acceptance criteria:**
- [ ] History page lists all questions, newest first
- [ ] Each item shows: topic, question (truncated at ~100 chars), date, status badge
- [ ] Status badges are visually distinct for: New / Draft / Ready / Posted
- [ ] Page is accessible — list items are navigable by keyboard

---

### US-014 Expand a history item
**As** a user  
**I want** to expand a history item to read my answer and the generated post  
**So that** I can review or reference previous content

**Acceptance criteria:**
- [ ] Clicking an item expands it to reveal: full question, answer, generated post
- [ ] Clicking again collapses it
- [ ] Only one item expanded at a time (or multiple — decide at build time, document here)
- [ ] Expanded state shows sections clearly labelled: "Your answer" / "Generated post"
- [ ] If no post was generated: "Generated post" section is not shown

---

### US-015 Answer an unanswered question from History
**As** a user  
**I want** to click through to answer a question I skipped earlier  
**So that** I can come back to questions when I have more time

**Acceptance criteria:**
- [ ] Questions with status "New" or "Skipped" show an "Answer this question →" link when expanded
- [ ] Clicking the link navigates to `/` with that question selected
- [ ] If the question is still in the current week's rotation, it appears in the dot navigation on Home

---

## Account

### US-016 View profile
**As** a user  
**I want** to see my profile information  
**So that** I can confirm the right account is active

**Acceptance criteria:**
- [ ] Account screen shows: avatar (initial), display name, email address
- [ ] Data is pulled from the active session — no editable fields in Phase 1

---

### US-017 View and select topic areas
**As** a user  
**I want** to choose which topic areas generate my questions  
**So that** I receive questions relevant to how I want to position myself

**Acceptance criteria:**
- [ ] Topic areas displayed as toggleable chips on the Account screen: AI × Design, UX Craft, Process, Product thinking, Career
- [ ] All topics selected by default for new accounts
- [ ] User can toggle any chip on or off
- [ ] At least one topic must remain selected — deselecting the last one shows an inline note: "You need at least one topic"
- [ ] Selection saves automatically on toggle (no save button required)
- [ ] Brief explanation below the chips: "Questions are generated from news in these areas — changes take effect from the next set of questions"
- [ ] Selected state is visually distinct from deselected (not just colour — shape, fill, or icon difference too)

---

## Auth

### US-018 Sign in with email and password
**As** a user  
**I want** to sign in with my email and password  
**So that** I can access my account

**Acceptance criteria:**
- [ ] Email and password fields with visible labels (not just placeholder text)
- [ ] Inline error if credentials are wrong: "Incorrect email or password"
- [ ] Inline error if email format is invalid (client-side)
- [ ] Password field has show/hide toggle
- [ ] On success: redirect to `/`
- [ ] "Forgot password?" link present (Phase 2 implementation, link visible in Phase 1)

---

### US-019 Sign in with Google or GitHub
**As** a user  
**I want** to sign in with my Google or GitHub account  
**So that** I don't have to manage a separate password

**Acceptance criteria:**
- [ ] "Continue with Google" and "Continue with GitHub" buttons present
- [ ] Each initiates the Supabase SSO flow
- [ ] On success: redirect to `/`
- [ ] On failure (user cancels or SSO error): return to `/auth` with a brief inline message

---

### US-020 Sign up
**As** a new user  
**I want** to create an account  
**So that** I can start using Pulse

**Acceptance criteria:**
- [ ] Toggle between "Sign in" and "Sign up" visible on auth screen
- [ ] Sign up requires: email, password (with basic strength indicator)
- [ ] Duplicate email shows inline error: "An account with this email already exists — sign in instead"
- [ ] On success: redirect to `/` (Phase 1: account is pre-seeded with default topics and sample questions)

---

### US-021 Sign out
**As** a user  
**I want** to sign out of Pulse from anywhere in the app  
**So that** I can secure my account without having to hunt for the option

**Acceptance criteria:**
- [ ] Sign out is accessible from the navigation header on every authenticated page — via the user avatar/initial in the top-right corner
- [ ] Clicking the avatar opens a small dropdown or panel showing: display name, email, "Account settings" link, and "Sign out" button
- [ ] "Sign out" is also present as a clear button on the Account screen itself
- [ ] Clicking "Sign out" (either location) signs out via Supabase Auth and redirects to `/auth`
- [ ] Session cookie is cleared
- [ ] No confirmation prompt required (low-stakes action)

---

### US-022 Choose post format
**As** a user  
**I want** to choose between a question-led post and a free-speaking post before generating  
**So that** the output matches the tone I want — either engaging with an idea or speaking naturally from experience

**Background:** The question-led format is more approachable — you're responding to something, not broadcasting. The free-speaking format is warmer and more personal but requires more confidence. Both are valid and the right choice depends on the question and mood.

**Acceptance criteria:**
- [ ] A format selector is shown on the Answer step, between the answer textarea and the action buttons
- [ ] Two options: **"Question-led"** and **"Free-speaking"**
  - Question-led: post opens by framing the question as context, then presents the answer — the question is visible to the reader
  - Free-speaking: post sounds like natural conversation, mid-thought — "I've been thinking about X" or "Something I keep coming back to…". The question may be embedded or absent
- [ ] Default format is "Question-led" for new sessions
- [ ] Selected format persists per session (not per question — one choice per generate action)
- [ ] Selected format is passed to `/api/generate` as a `format` parameter
- [ ] The generate API uses a different system prompt per format (same answer, different framing)
- [ ] Format selector does not affect the Polish step — Polish is format-agnostic
- [ ] The format selected is stored alongside the generated post in the `posts` table for reference

---

### US-023 Topic area selection on first use
**As** a new user  
**I want** my topic preferences set to sensible defaults when I first sign up  
**So that** I see relevant questions immediately without having to configure anything first

**Acceptance criteria:**
- [ ] On account creation, all five topic areas are selected by default: AI × Design, UX Craft, Process, Product thinking, Career
- [ ] User sees questions from all topics on first use without needing to visit Account
- [ ] Account screen makes it clear that topic areas can be changed (e.g. a short label: "Edit your topic areas")
- [ ] No mandatory onboarding step — the user is not blocked from the home screen to configure topics
- [ ] If a user deselects all but one topic, questions narrow to that topic from the next generation cycle

---

### US-024 Switch between posting personas
**As** a user  
**I want** to switch between my personal voice and my Subchecked company voice within the same account  
**So that** I can use one tool to manage content for both without logging in and out

**Background:** Adam uses Pulse for his personal LinkedIn brand (job search, UX designer voice) and for Subchecked's company LinkedIn (compliance, contracting, B2B tone). These are distinct voices, distinct topic areas, and distinct post histories. They should be kept completely separate within one account.

**Acceptance criteria:**
- [ ] A "persona" or "project" switcher is visible in the nav — distinct from the History and Account links
- [ ] Two personas available: **Personal** (Adam's individual LinkedIn) and **Subchecked** (company LinkedIn)
- [ ] Switching personas changes: active topic areas, question history, generated posts, connected LinkedIn account
- [ ] Each persona has its own LinkedIn OAuth connection (personal account vs. company page)
- [ ] The active persona is clearly indicated in the UI at all times — user must never be uncertain which voice they're posting from
- [ ] Switching does not require a page reload — React state update is sufficient
- [ ] Questions and posts from one persona are never visible in the other's history

---

## Status index

| ID | Story | Status |
|----|-------|--------|
| US-001 | View today's question | Not started |
| US-002 | Navigate between questions | Not started |
| US-003 | Write and autosave answer | Not started |
| US-004 | Polish with AI | Not started |
| US-005 | Generate post | Not started |
| US-006 | Preview generated post | Not started |
| US-007 | Post to LinkedIn | Not started |
| US-008 | Regenerate post | Not started |
| US-009 | Back to answer from preview | Not started |
| US-010 | Connect LinkedIn | Not started |
| US-011 | Disconnect LinkedIn | Not started |
| US-012 | Post when not connected | Not started |
| US-013 | View history | Not started |
| US-014 | Expand history item | Not started |
| US-015 | Answer from history | Not started |
| US-016 | View profile | Not started |
| US-017 | View topic areas | Not started |
| US-018 | Sign in email/password | Not started |
| US-019 | Sign in SSO | Not started |
| US-020 | Sign up | Not started |
| US-021 | Sign out (nav + Account) | Not started |
| US-022 | Choose post format | Not started |
| US-023 | Topic areas default + first use | Not started |
| US-024 | Persona/project switcher (Personal vs Subchecked) | Not started |
