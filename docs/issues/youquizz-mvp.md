# YouQuizz MVP — Issue Breakdown

Parent PRD: `/tmp/youquizz-mvp-prd.md`
Style spec: `/tmp/quiz-platform-style-guides-handoff.md`

Tracer-bullet vertical slices. Each slice cuts end-to-end through every layer it touches and is independently demoable. Triage label for all: `ready-for-agent`.

---

## 1. Adopt YouQuizz production landing page from Cartridge Shelf direction

**Type:** HITL
**Status:** ✅ Done — commit `7803303` on `main`
**Blocked by:** None
**User stories covered:** 1–7, 71

### What to build
Replace the prototype scaffold landing page with the real YouQuizz landing using the Cartridge Shelf (Variant B) direction. Brand the product, hide auth controls per MVP decision, and wire the start affordance to the route the guest entry screen will own.

### Acceptance criteria
- [x] YouQuizz branding (logo tile, wordmark, version chip)
- [x] Cartridge Shelf visual language (palette, sun, checker floor, tilted carts, plank, tactile CTA)
- [x] `PRESS START` button visible and styled
- [x] Enter key advances to the guest entry route
- [x] Auth controls hidden in production MVP
- [x] Prototype switcher / variant URLs do not ship as production UX
- [x] Project uses pnpm (`.npmrc` `node-linker=hoisted`, `pnpm-lock.yaml` committed)

---

## 2. Guest entry screen and route into quiz selector

**Type:** AFK
**Blocked by:** 1
**User stories covered:** 4–7

### What to build
Build the MVP guest-only entry step that the landing page routes to. The screen confirms the user is starting as a guest, advances them into the quiz selector on Enter or click, and reserves layout space for future auth without showing disabled login/signup buttons in production.

### Acceptance criteria
- [ ] Dedicated route exists for the entry step
- [ ] User can continue as guest via primary action
- [ ] Enter key continues as guest
- [ ] “Player accounts coming soon” copy (or equivalent) is visible
- [ ] No disabled login/signup controls render in production MVP
- [ ] Route into the quiz selector is wired (selector itself comes in slice 4)
- [ ] Visual language matches the style spec

---

## 3. MongoDB quiz repository with validated quiz pak loading

**Type:** AFK
**Blocked by:** None
**User stories covered:** 8–12, 56–63, 69

### What to build
Server-side MongoDB integration plus a validated quiz repository module. Provides two operations: list valid published quiz paks and fetch one by slug. Invalid documents are excluded from listings and surface as a styled corrupted-pak error when accessed directly. No quiz content is hardcoded in app code.

### Acceptance criteria
- [ ] MongoDB connection configured for server-only use
- [ ] Repository exposes “list published valid quiz paks” and “get quiz pak by slug”
- [ ] Validation enforces: slug, title, description, category, tags array, difficulty ∈ {easy, medium, hard}, passingScore range with default 70 if missing, exactly 20 questions, multiple-choice type, prompt, ≥2 choices, unique choice IDs per question, correctChoiceId resolves to a real choice
- [ ] Invalid quiz docs are excluded from list operations
- [ ] Direct fetch of an invalid or missing slug yields a typed “pak corrupted / not found” outcome
- [ ] Validation errors are logged server-side
- [ ] Repository and validation are deep modules (small interface, behavior-tested)

---

## 4. Database-backed quiz selector as cartridge shelf / library

**Type:** AFK
**Blocked by:** 1, 3
**User stories covered:** 8–12, 56–59

### What to build
Render the quiz selector page using real MongoDB data via the repository. Each available quiz pak is shown as a cartridge-style object exposing title, category, difficulty, and question count. Selecting a pak routes into the run start flow.

### Acceptance criteria
- [ ] Selector lists only valid published quiz paks
- [ ] Each pak shows title, category, difficulty, question count (20)
- [ ] UI uses the cartridge / object-like style from the spec, not generic SaaS cards
- [ ] Selecting a pak navigates to the quiz run for that slug
- [ ] Empty state and error state both styled in YouQuizz language
- [ ] No hardcoded quiz content; all data comes from the repository

---

## 5. Start a stable guest quiz run from a selected quiz pak

**Type:** AFK
**Blocked by:** 3, 4
**User stories covered:** 13–15, 21–29, 65–67

### What to build
The first playable quiz-run slice. Server loads the quiz by slug; client initializes a stable guest run using a deep run-initialization module that shuffles questions and choices once at start. Render one question at a time with a flashcard-style card and forward-only navigation; require an answer before advancing.

### Acceptance criteria
- [ ] Server fetches the quiz by slug via the repository
- [ ] Run state initializes once with shuffled question order and shuffled choice order per question
- [ ] Original quiz data is not mutated by initialization
- [ ] Shuffled order remains stable for the duration of the run (no re-shuffle on re-render)
- [ ] One question is shown at a time
- [ ] Navigation is forward-only (no back)
- [ ] Advancing requires a selected answer
- [ ] Quiz header shows title, description, category, difficulty, passing score, progress placeholder
- [ ] Questions and choices render dynamically from data — no question-specific UI

---

## 6. Difficulty-scaled whole-run timer with timeout auto-submit

**Type:** AFK
**Blocked by:** 5
**User stories covered:** 16–20, 34–35, 65

### What to build
Add the timer rules and active countdown behavior. A deep timer-rules module derives total run seconds from difficulty and exactly 20 questions. The runner displays the countdown in the run header. On expiration, the run auto-submits; unanswered questions count as incorrect.

### Acceptance criteria
- [ ] Timer total is derived once at run start from difficulty: easy = 1200s, medium = 600s, hard = 300s
- [ ] Timer is whole-run, not per-question
- [ ] Timer end time is persisted in run state so it doesn’t drift on re-render
- [ ] Countdown is visible in the quiz run header
- [ ] On timeout the run auto-submits via the same submit path as manual submit
- [ ] Unanswered future questions are recorded as incorrect on timeout
- [ ] Timer behavior survives a refresh within the session (works with slice 8)

---

## 7. Lock answers and calculate run score without instant feedback

**Type:** AFK
**Blocked by:** 5
**User stories covered:** 30–33, 43–47, 64

### What to build
Behind-the-scenes scoring. Each advance locks the chosen answer with its correctness internally; no correctness is shown during the run. On submit, a deep scoring module produces score percent, correct/incorrect counts, pass status against the passing score, and a per-question review payload.

### Acceptance criteria
- [ ] Advancing locks `{ questionId, selectedChoiceId, correctChoiceId, isCorrect }` for that question
- [ ] No correctness UI is shown during the run
- [ ] Final answer is included in the score on submit
- [ ] Scoring module is pure and tested independently
- [ ] Result includes percent score, correct count, incorrect count, total questions
- [ ] Passing score defaults to 70 if missing
- [ ] Result status maps to `RUN CLEARED` / `TRY AGAIN`
- [ ] Review payload includes prompt, selected answer label, correct answer label, status, optional explanation

---

## 8. Persist active guest run and result in sessionStorage

**Type:** AFK
**Blocked by:** 5, 7
**User stories covered:** 39–42, 67

### What to build
Temporary guest persistence behind a small storage module. Active run state (shuffled order, current index, locked answers, timer end, suspicious activity events) and final result state are stored in `sessionStorage` keyed by quiz slug. Refresh resumes the run; closing the session clears it. Guest results are never written to MongoDB.

### Acceptance criteria
- [ ] Active run survives refresh in the same session
- [ ] Result survives refresh on the results route in the same session
- [ ] Closing the browser session clears guest-only state
- [ ] No guest data is written to MongoDB
- [ ] Storage module has a small typed interface and is tested with jsdom
- [ ] Corrupt/incompatible stored state is discarded safely

---

## 9. Dedicated results screen with full answer review

**Type:** AFK
**Blocked by:** 7, 8
**User stories covered:** 41–52

### What to build
A dedicated results route that hydrates from the stored result and renders the YouQuizz-styled run breakdown. Header shows run status, score, passing score, correct/incorrect counts, and elapsed time. Body shows a full per-question review.

### Acceptance criteria
- [ ] Dedicated results route exists
- [ ] Hydrates from sessionStorage result; if absent, shows a styled “no result” state
- [ ] Status displays as `RUN CLEARED` or `TRY AGAIN`
- [ ] Shows score percent, passing score, correct count, incorrect count, elapsed time
- [ ] Full per-question review: prompt, your answer, correct answer, correctness status
- [ ] Shows explanation when present in quiz data
- [ ] Visual treatment matches the style spec (game-style breakdown, not dashboard)
- [ ] Provides a path back to the quiz selector

---

## 10. MVP anti-cheat suspicious behavior flagging and score invalidation

**Type:** AFK
**Blocked by:** 5, 8
**User stories covered:** 36–38, 68

### What to build
Detect suspicious behavior during an active quiz run, record each event on run state, and show a flag modal every time suspicious behavior occurs. The user is allowed up to 5 suspicious behavior events. If they exceed that limit, the run may continue, but the final score is marked invalidated and is not eligible for any future saved-score or leaderboard use.

Suspicious behavior signals for MVP:

- Tab switch / document hidden (`visibilitychange`)
- Window loses focus (`blur`)
- Copy during a run (`copy`)
- Paste during a run (`paste`)
- State integrity/tamper signal if persisted run state changes unexpectedly after refresh
- Timer mismatch signal if `timerEndsAt` or elapsed timing becomes inconsistent
- Impossible-speed signal for obviously unrealistic answer pacing

### Acceptance criteria
- [ ] Suspicious behavior is observed only while a run is active
- [ ] Each suspicious event is recorded as `{ type, occurredAt, warningNumber, limit }` in run state
- [ ] Supported event types include `tab_switch`, `window_blur`, `copy`, `paste`, `state_tamper`, `timer_mismatch`, and `impossible_speed`
- [ ] A flag modal appears every time a suspicious event is incurred
- [ ] The modal shows the current warning count out of 5
- [ ] Events 1–5 warn the user but do not invalidate the score
- [ ] Event 6 and beyond mark the run/result as score-invalidated
- [ ] Score-invalidated runs may still finish, but results clearly show that the score was invalidated by suspicious activity
- [ ] Suspicious activity events and `isScoreInvalidated` are present on run state and result state
- [ ] Logic is encapsulated behind a small interface so future server-side attempts/leaderboards can reuse the same event model

---

## 11. Vitest coverage for quiz engine deep modules

**Type:** AFK
**Blocked by:** 3, 5, 6, 7, 8, 10
**User stories covered:** 63–68, 72

### What to build
Set up Vitest and add tests for the deep modules. Tests must assert external behavior, not implementation details.

### Acceptance criteria
- [ ] Vitest configured with `pnpm test` script and a jsdom-capable environment for storage tests
- [ ] Validation tests cover: valid doc, missing fields, invalid difficulty, invalid passingScore, ≠20 questions, malformed questions, duplicate choice IDs, unresolved correctChoiceId
- [ ] Timer rules tested for easy/medium/hard at 20 questions
- [ ] Run initialization tested for completeness, stability, and non-mutation
- [ ] Scoring tested for all-correct, all-incorrect, mixed, timeout-with-missing-answers, default passing score
- [ ] Storage module tested for round-trip, corruption recovery, and key isolation
- [ ] Anti-cheat tested via simulated visibility changes, blur/copy/paste events, suspicious-event counting, modal triggering, and score invalidation after exceeding 5 events
- [ ] No tests reach into private internals; only public interfaces

---

## 12. Production readiness pass for MVP

**Type:** HITL
**Blocked by:** 1–11
**User stories covered:** All MVP stories

### What to build
Final integrated review. Walk the full guest flow on a clean browser session and verify behavior, content sourcing, and styling against the PRD and style spec. Confirm Vercel deployability.

### Acceptance criteria
- [ ] Full guest flow works end-to-end: landing → guest entry → selector → run → results
- [ ] No prototype-only routes or controls reachable in production
- [ ] No quiz content is hardcoded in app source
- [ ] Invalid quiz documents fail closed in selector and direct access
- [ ] Timer and anti-cheat behave correctly under refresh, tab-switch, blur, copy/paste, and suspicious-event limit scenarios
- [ ] Responsive layouts hold on mobile and desktop
- [ ] Style matches `/tmp/quiz-platform-style-guides-handoff.md`
- [ ] `pnpm build` and `pnpm lint` clean
- [ ] App deploys cleanly on Vercel with required environment variables documented

---

## Dependency graph

```txt
1 Landing  ─┐
            ├─► 2 Guest entry ─┐
            │                  │
3 Mongo + validation ─────────►├─► 4 Selector ─► 5 Quiz run ─┬─► 6 Timer
                               │                              ├─► 7 Scoring ─► 8 Session storage ─► 9 Results
                               │                              └─► 10 Anti-cheat
                                                              │
                                                              └─► 11 Vitest deep-module tests
                                                                              │
                                                                              ▼
                                                                          12 Production readiness
```
