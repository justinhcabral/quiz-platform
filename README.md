# YouQuizz Documentation

## Overview

YouQuizz is a guest-only quiz application built with Next.js, React, TypeScript, MongoDB, Zod, Tailwind CSS, and Vitest. The interface uses a Game Boy cartridge-inspired visual language: each quiz is presented as a self-contained quiz PAK, similar to loading a cartridge into a handheld console.

The main experience is:

1. The player opens the landing page and sees available quiz PAKs on a cartridge shelf.
2. The player chooses a PAK or presses start to browse the quiz library.
3. The player continues as a guest.
4. The app loads the selected quiz run.
5. The player answers one multiple-choice question at a time.
6. The app locks each answer, advances forward only, and prevents backtracking.
7. At the end of the run, the app computes a score and shows a review screen.

The project includes local JSON quiz source files in `quizzes/`. The current runtime application does **not** read those JSON files directly in the browser. Instead, `scripts/seed-quizzes.ts` adapts the local JSON files into YouQuizz's internal Quiz Pak format, validates them, and seeds them into MongoDB. The app then reads published, valid quiz paks from MongoDB.

## Core Features

- Game Boy PAK-inspired landing page and quiz library.
- Guest-only quiz flow; no account is required.
- Dynamic quiz list loaded from MongoDB.
- Local JSON quiz source files stored in `quizzes/`.
- Seed script that adapts source trivia JSON into internal quiz pak documents.
- Zod validation for quiz pak structure.
- Multiple-choice quiz runner.
- Forward-only question navigation.
- Required answer selection before advancing.
- Difficulty-based whole-run timer.
- Score computation and result review.
- Session-only result and active-run persistence through `sessionStorage`.
- Lightweight anti-cheat / quiz integrity signals.
- Browser Back navigation invalidates the active run.
- Vitest coverage for core quiz logic.

## User Flow

1. **Landing page**: `/`
   - Shows the YouQuizz cartridge shelf.
   - Displays published quiz PAKs loaded from MongoDB.
   - Clicking a cartridge routes to `/play?pak=<slug>`.
   - Pressing start routes to `/play`.

2. **Guest entry page**: `/play`
   - Confirms the player is using guest mode.
   - If a `pak` query parameter exists, continuing routes to `/quizzes/<slug>`.
   - Without a selected PAK, continuing routes to `/quizzes`.

3. **Quiz library**: `/quizzes`
   - Lists all published, valid quiz PAKs.
   - Each PAK card links to `/quizzes/<slug>`.
   - If no valid paks are available, the page shows `NO PAKS LOADED`.

4. **Quiz run**: `/quizzes/[slug]`
   - Loads one quiz pak by slug.
   - Initializes a shuffled question order and shuffled choice order.
   - Shows one question at a time.
   - Locks answers and advances forward only.
   - Submits automatically when the player completes the final question or when the timer reaches zero.

5. **Results screen**: `/quizzes/[slug]/results`
   - Reads the guest result from `sessionStorage`.
   - Displays score, pass/fail status, elapsed time, flag count, and answer review.
   - Shows each selected answer and the correct answer.

## Quiz Content System

### Source Dataset

The quiz source data comes from the public GitHub repository:

- `el-cms/Open-trivia-database`
- <https://github.com/el-cms/Open-trivia-database>

That dataset organizes trivia questions as JSON files by category and language. The source repository may contain folders such as `en/`, `todo/`, `staging/`, and `need_review/`. Validated questions are stored in language root folders such as `en/`; unfinished or unvalidated questions may appear in review-oriented folders.

YouQuizz uses imported/adapted source files from this dataset. Because public trivia datasets can contain duplicates, inconsistent formatting, missing sources, or unreviewed questions, new quiz content should be reviewed before publishing.

### JSON File Location

Local source quiz files are stored in:

```txt
quizzes/
├── entertainment.json
├── geography.json
├── science_and_nature.json
└── toys_and_games.json
```

These files are treated as source/import material. The current application runtime reads quiz paks from MongoDB through `src/lib/quiz-repository.ts`.

### JSON Data Shape

The source JSON files contain arrays of raw trivia question objects. A typical source object includes fields like:

```json
{
  "category_id": "GEOGRAPHY",
  "lang": "en",
  "tags": ["GEOGRAPHY"],
  "question": "Abuja is the capital of ______?",
  "answer": 0,
  "answers": ["Nigeria"],
  "source": ""
}
```

Important source fields:

- `category_id`: Source category identifier.
- `lang`: Language code.
- `tags`: Source tags.
- `question`: Question text or fill-in-the-blank prompt.
- `answer`: Index of the correct answer inside `answers`.
- `answers`: Candidate answer list from the source dataset.
- `source`: Source attribution field from the dataset. Some local rows may have an empty string.

### Import / Adaptation Process

The import logic lives in:

```txt
scripts/seed-quizzes.ts
```

The seed script performs these steps:

1. Loads environment variables from `.env.local`.
2. Reads configured files from `quizzes/*.json`.
3. Uses local metadata in `PAK_META` to define each pak's:
   - `slug`
   - `title`
   - `description`
   - `category`
   - `tags`
   - `difficulty`
   - `passingScore`
4. Cleans whitespace in question and answer text.
5. Normalizes answer capitalization.
6. Filters unusable rows, including rows with invalid prompt or answer lengths.
7. Deduplicates questions by prompt.
8. Selects 20 questions per pak.
9. Generates multiple-choice choices by combining the correct answer with deterministic distractors sampled from other answers in the same category file.
10. Shuffles choices deterministically.
11. Converts each row into the internal `QuizQuestion` shape.
12. Validates the full pak with `quizPakSeedSchema`.
13. Upserts the valid pak into MongoDB.

The internal quiz pak shape is defined in `src/types/quiz.ts` and validated in `src/lib/quiz-schema.ts`:

```ts
interface QuizPak {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  passingScore: number;
  isPublished: boolean;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}
```

Each question uses this shape:

```ts
interface QuizQuestion {
  id: string;
  type: "multiple-choice";
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation?: string;
}
```

Validation rules include:

- `slug` must be kebab-case.
- `difficulty` must be `easy`, `medium`, or `hard`.
- `passingScore` must be an integer from `0` to `100`; default is `70` if omitted.
- Each quiz pak must contain exactly 20 questions.
- Question IDs must be unique within a pak.
- Each question must have 2 to 6 choices.
- Choice IDs must be unique within a question.
- `correctChoiceId` must match one of the question's choice IDs.
- Tags must be lowercase kebab-case.

## Dynamic Question Rendering

Dynamic rendering is split between server-side data loading and client-side quiz play.

- `src/app/quizzes/page.tsx` calls `listPublishedValidQuizPaks()` to display the library.
- `src/app/quizzes/[slug]/page.tsx` calls `getQuizPakBySlug(slug)` to load one quiz pak.
- `src/components/quiz/QuizRunner.tsx` renders and manages the active quiz run.

When a quiz starts, `initializeQuizRun()` in `src/lib/quiz-run.ts` creates an `InitializedQuizRun` object:

```ts
{
  runId,
  quizSlug,
  startedAt,
  timerEndsAt,
  shuffledQuestions
}
```

The function shuffles:

- the order of questions; and
- the order of choices inside each question.

`QuizRunner` then renders the current question by using:

- `currentIndex` to find the current slot in `run.shuffledQuestions`;
- `getQuestionById()` to retrieve the full question; and
- `getChoiceById()` to display choices in the shuffled order.

## Answer Selection and Navigation

The quiz runner keeps the currently selected answer in `selectedChoiceId`.

The player must select an answer before the `LOCK ANSWER` button becomes usable. When the player locks an answer:

1. `lockAndAdvance()` verifies that an answer is selected.
2. `lockAnswer()` records the selected choice and whether it is correct.
3. The locked answer is appended to `lockedAnswers`.
4. `selectedChoiceId` is cleared.
5. If the current question is not the last question, `currentIndex` increments.
6. If the current question is the last question, `submitRun()` scores the quiz.

Navigation is intentionally forward-only:

- The UI does not provide a previous-question button.
- Answers lock when the player advances.
- Browser Back navigation during an active run is treated as a cancellation/invalidation event.

Active run state is saved in `sessionStorage` through `src/lib/quiz-storage.ts`, using keys such as:

```txt
youquizz:active-run:<slug>
youquizz:result:<slug>
youquizz:start-intent:<slug>
```

## Score Computation

Scoring logic lives in:

```txt
src/lib/quiz-scoring.ts
```

Correct answers are identified by `correctChoiceId` on each `QuizQuestion`. When an answer is locked, the app compares:

```ts
selectedChoiceId === question.correctChoiceId
```

`scoreQuizRun()` computes:

- `totalQuestions`
- `correctCount`
- `incorrectCount`
- `scorePercent`
- `status`
- `elapsedSeconds`
- `review`
- suspicious activity summary
- whether the score was invalidated

The score percentage is rounded:

```ts
scorePercent = Math.round((correctCount / totalQuestions) * 100)
```

The result status is:

- `RUN CLEARED` when `scorePercent >= passingScore`
- `TRY AGAIN` otherwise

The results screen displays:

- quiz status;
- score percentage;
- passing score;
- correct count;
- missed count;
- elapsed time;
- suspicious activity flag count;
- invalidation message if applicable;
- per-question review with selected and correct answers.

## Anti-Cheat Implementation

YouQuizz implements a lightweight client-side quiz integrity mechanism. It is designed to discourage obvious behavior during a guest quiz run, not to provide strong security.

The suspicious activity model is defined in:

```txt
src/lib/anti-cheat.ts
```

Tracked activity types are:

- `tab_switch`
- `window_blur`
- `copy`
- `paste`
- `state_tamper`
- `timer_mismatch`
- `impossible_speed`
- `navigation_back`

The active browser event listeners are registered in `QuizRunner.tsx`. The current implementation listens for:

- `visibilitychange` for tab switching;
- `blur` for leaving the quiz window;
- `copy`;
- `paste`;
- `popstate` for browser Back navigation;
- `beforeunload` for browser leave/reload prompts.

The runner also flags `impossible_speed` if answers are locked less than 300 milliseconds apart.

When suspicious behavior is detected:

1. `recordSuspiciousActivity()` creates a `SuspiciousActivityEvent`.
2. The event is saved with the active run in `sessionStorage`.
3. A modal warns the player.
4. Events 1 through 5 are warnings.
5. Event 6 and above invalidate the score.
6. `navigation_back` invalidates immediately.

Browser Back behavior is stricter than regular warnings:

- The app pushes a same-page history guard while a quiz is active.
- If the player presses Back, the app records `navigation_back`.
- The quiz result is saved as invalidated.
- The active run is cleared.
- The route is replaced with the results page.
- A restored quiz page checks for a prior `navigation_back` invalidation and redirects back to results.

Limitations:

- This is client-side only and can be bypassed by a determined user.
- `sessionStorage` can be cleared or modified by the user.
- Browser events are not a reliable proof of cheating.
- The app does not use server-side score verification in the current MVP.
- The mechanism should be described as lightweight integrity checking, not secure anti-cheat.

## Developer Setup

### Prerequisites

Install:

- Node.js compatible with the project dependencies.
- `pnpm`.
- MongoDB access for seeded quiz paks.

The project uses a hoisted pnpm install mode via `.npmrc`:

```txt
node-linker=hoisted
```

### Installation

1. Clone the repository.
2. Install dependencies:

```bash
pnpm install
```

3. Create `.env.local` with MongoDB settings:

```env
MONGODB_URI=mongodb+srv://USER:PASS@HOST/youquizz?retryWrites=true&w=majority
MONGODB_DB=youquizz
```

`MONGODB_DB` is optional if the database name is included in the URI path, but setting it explicitly avoids ambiguity.

### Running Locally

Start the development server:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

Useful commands:

```bash
pnpm build
pnpm lint
pnpm test
```

### Adding New Quiz Files

To add a new quiz source file:

1. Add a JSON file to `quizzes/`.
2. Keep the source object shape consistent with the Open Trivia Database import format:

```json
{
  "category_id": "CATEGORY",
  "lang": "en",
  "tags": ["CATEGORY"],
  "question": "Question text",
  "answer": 0,
  "answers": ["Correct answer"],
  "source": ""
}
```

3. Add a matching metadata entry to `PAK_META` in `scripts/seed-quizzes.ts`.
4. Ensure the file has at least 20 usable, deduplicated questions.
5. Run validation before writing to MongoDB.
6. Seed the database after validation passes.

### Validating Quiz Files

The seed script supports dry-run validation:

```bash
pnpm seed:quizzes -- --dry-run
```

This reads local source files, builds internal quiz paks, and validates them without writing to MongoDB.

To seed validated paks into MongoDB:

```bash
pnpm seed:quizzes
```

The app only displays paks that are:

- present in the MongoDB `quizzes` collection;
- marked with `isPublished: true`; and
- valid according to `quizPakSeedSchema`.

## Project Structure

```txt
.
├── quizzes/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── models/
│   └── types/
├── docs/
├── package.json
├── next.config.ts
├── tsconfig.json
└── vitest.config.ts
```

Important files and folders:

- `quizzes/`
  - Local source trivia JSON files imported from/adapted from `el-cms/Open-trivia-database`.

- `scripts/seed-quizzes.ts`
  - Local seed/import script.
  - Converts raw source JSON into internal quiz paks.
  - Validates paks.
  - Upserts paks into MongoDB.

- `src/app/page.tsx`
  - Server component for the landing page.
  - Loads published valid paks and passes shelf data to `LandingPage`.

- `src/components/landing/LandingPage.tsx`
  - Client component for the cartridge shelf UI.
  - Renders PAK cards and routes selected paks through `/play?pak=<slug>`.

- `src/app/play/page.tsx`
  - Guest entry screen.
  - Routes to the selected quiz or the quiz library.
  - Marks intentional quiz-start intent for restarting invalidated paks.

- `src/app/quizzes/page.tsx`
  - Quiz library route.
  - Displays published, valid quiz paks.

- `src/app/quizzes/[slug]/page.tsx`
  - Dynamic quiz route.
  - Loads one quiz pak by slug.
  - Renders `QuizRunner` when the pak is valid.

- `src/app/quizzes/[slug]/results/page.tsx`
  - Results route wrapper.
  - Renders `QuizResults` for the selected slug.

- `src/components/quiz/QuizRunner.tsx`
  - Client-side quiz runner.
  - Manages current question, selected answer, locked answers, timer, storage, and suspicious activity events.

- `src/components/quiz/QuizResults.tsx`
  - Client-side results screen.
  - Reads session-only results and displays score review.

- `src/lib/quiz-repository.ts`
  - MongoDB repository for listing and loading published quiz paks.
  - Validates documents before returning them to the app.
  - Skips DB access during production build.

- `src/lib/quiz-schema.ts`
  - Zod validation schema for quiz paks.

- `src/lib/quiz-run.ts`
  - Run initialization, question shuffling, choice shuffling, timer duration helpers, and lookup helpers.

- `src/lib/quiz-scoring.ts`
  - Locked answer representation and final score computation.

- `src/lib/quiz-storage.ts`
  - `sessionStorage` helpers for active runs, results, and quiz start intent.

- `src/lib/anti-cheat.ts`
  - Suspicious activity event model and score invalidation rules.

- `src/lib/db.ts`
  - Native MongoDB driver singleton.
  - Uses normal MongoDB driver DNS behavior in production.
  - Includes local development DNS retry support.

- `src/lib/mongoose.ts`
  - Mongoose connection helper used mainly around the seed/model boundary.

- `src/models/Quiz.ts`
  - Mongoose quiz schema and collection constant.
  - Collection name: `quizzes`.

- `src/types/quiz.ts`
  - Canonical TypeScript quiz types.

- `src/lib/__tests__/`
  - Vitest tests for quiz schema, run initialization, scoring, storage, and anti-cheat behavior.

- `src/app/api/debug/quiz-db/route.ts`
  - Diagnostic route currently present in the project.
  - It reports safe MongoDB connectivity and quiz collection information without exposing secrets.
  - This is useful for deployment debugging but should be removed or protected before a public production release.

## Limitations and Assumptions

- The current runtime app reads quiz paks from MongoDB, not directly from `quizzes/*.json`.
- Local JSON files are source/import files used by `scripts/seed-quizzes.ts`.
- Quiz paks must contain exactly 20 questions.
- The current seed script generates distractors from other answers in the same category file. This may create plausible but imperfect multiple-choice options.
- Imported public trivia data may contain duplicates, formatting issues, outdated facts, missing attribution, or incorrect answers.
- Guest results are stored in `sessionStorage`, so they are browser-session scoped and not durable.
- Scores are computed client-side.
- Anti-cheat behavior is lightweight and client-side only.
- There is no user authentication in the MVP.
- There is no persistent leaderboard.
- MongoDB must be configured correctly in the deployment environment.
- Vercel deployments need access to the MongoDB Atlas network. For dynamic Vercel egress, Atlas network allowlisting may require broad access such as `0.0.0.0/0` unless a more controlled networking setup is used.
- The diagnostic API route should not be treated as an end-user feature.

## Future Improvements

Practical next steps include:

- Add a formal admin quiz uploader.
- Add a protected API route for importing or publishing new quiz paks.
- Add stronger source-data validation and reporting for imported JSON files.
- Preserve and display source attribution per question when available.
- Add category and difficulty filters in the quiz library.
- Add timer mode options, such as relaxed, normal, and speedrun.
- Add backend-backed scoring to make results more trustworthy.
- Add persistent player accounts.
- Add persistent leaderboards.
- Add server-side result submission and validation.
- Improve anti-cheat with server-side timing checks and signed run state.
- Add a quiz preview mode for reviewing imported paks before publishing.
- Add tests for the seed/import script.
- Remove or protect the debug database route before production release.

## Credits and Attribution

Quiz source data is based on the public `el-cms/Open-trivia-database` GitHub repository:

<https://github.com/el-cms/Open-trivia-database>

Recommended attribution in project materials:

> Trivia question data adapted from `el-cms/Open-trivia-database`: https://github.com/el-cms/Open-trivia-database

When adding or modifying quiz content:

- Check the original repository license and attribution requirements.
- Preserve source information where available.
- Avoid using unvalidated folders such as `todo/`, `staging/`, or `need_review/` unless the questions are manually reviewed.
- Review questions for accuracy, formatting, and appropriateness before publishing them as YouQuizz PAKs.
