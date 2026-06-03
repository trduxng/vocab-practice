# Commit Overview: Learner Experience, Gamification, Learning Path, and Vocabulary Data

## Suggested Commit

```text
feat: redesign learner flow and add gamification learning path
```

## Summary

This commit upgrades the learner experience from a collection of separate pages into a connected TOEIC vocabulary learning flow:

```text
Dashboard
  -> Choose a vocabulary topic
  -> Preview topic words and progress
  -> Start a new-word flashcard session
  -> Practice due words
  -> Take mini tests
  -> Track XP, achievements, and progress analytics
```

The change also adds curated TOEIC vocabulary seed data, gamification persistence, an ordered TOEIC roadmap, vocabulary notebook improvements, and optional AI-assisted vocabulary authoring for admins.

## Learner UX Changes

### Dashboard

- Replaced the old dashboard with a learning home page.
- Added a hero card with streak, daily goal, XP, level, and level progress.
- Added today's activities: new words, due reviews, practice sessions, and mini tests.
- Added weekly activity, recent achievements, and learning-path previews.
- Added loading skeletons and empty/error states.

### Topic-Based Learning Flow

- `/user/learn` is now a topic catalog grouped by TOEIC 300, 500, 700, and 900.
- `/user/learn/[topicId]` shows topic progress and vocabulary cards.
- Topic detail supports filters for all, new, due-review, and mastered words.
- Learners can inspect meanings, examples, translations, pronunciation, and save words to the notebook.
- `Học từ mới` opens `/user/learn/session?topicId=...&mode=new`.
- `Luyện tập chủ đề` opens a focused topic practice session.

### Flashcard Session

- Moved flashcard execution to `/user/learn/session`.
- Added front/back card layout, smooth flip animation, pronunciation, examples, translations, and memory tips.
- Added `Again`, `Hard`, `Good`, and `Easy` grading.
- Added session progress, XP feedback, keyboard shortcuts, and mobile swipe gestures.
- Added notebook save action while studying.
- New-word sessions only load words that have not been learned yet.
- Words without a generated question still work through the existing `wordId` submission fallback.

### Practice and Notebook

- Fixed the practice loading deadlock.
- Added auto-start support for smart mode and topic-specific practice URLs.
- Added notebook word picker and topic vocabulary preview.
- Fixed notebook re-add behavior so an existing personal note is not erased.

### Progress and Achievements

- Redesigned the progress page with a 365-day activity heatmap.
- Added XP trend, vocabulary growth, topic mastery, and retention statistics.
- Added achievements page, badge cards, unlock modal, XP animation, and daily-login celebration.

## Backend Changes

### Gamification

XP rewards:

| Activity | XP |
| --- | ---: |
| Learn a word | 5 |
| Complete practice | 10 |
| Complete mini test | 20 |
| Daily login | 5 |

Added:

- Persisted XP ledger with duplicate-award protection.
- Level calculation and progress to next level.
- Persisted achievements and seen/unseen state.
- Daily login award.
- Practice and mini-test completion awards.

### Learning Path

Added:

- TOEIC 300, TOEIC 500, TOEIC 700, and TOEIC 900 roadmap levels.
- Topic-to-level mapping.
- Lesson, practice, and mini-test activity states.
- Current lesson and next lesson calculation.
- Available topic behavior: any published topic containing vocabulary can be opened for study; advanced activities remain gated by learner progress.

### Learner APIs

Key additions and extensions:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/user/learning-path` | Load TOEIC roadmap |
| `GET` | `/api/user/topics/:topicId/words` | Preview vocabulary and notebook state |
| `GET` | `/api/user/flashcards?topicId=...&mode=new` | Load only new flashcards for a topic |
| `GET` | `/api/user/gamification/profile` | Load XP, level, and achievements |
| `POST` | `/api/user/gamification/practice-complete` | Award practice completion XP |
| `PUT` | `/api/user/gamification/achievements/seen` | Mark achievement notifications as seen |
| `GET` | `/api/user/progress/analytics` | Load progress dashboard analytics |
| `POST` | `/api/user/notebook` | Add a word to the learner notebook |

Existing review, notebook, notification, goal, and mini-test endpoints were integrated into the redesigned UI.

### Admin AI Suggestions

- Added `/api/ai/word-suggestions`.
- Admin vocabulary authoring can request Vietnamese meaning, phonetic, part of speech, and TOEIC examples.
- Uses OpenAI Responses API with dictionary and Google Translate lookups as supporting sources.
- Required server environment variable:

```env
OPENAI_API_KEY=...
```

Optional:

```env
OPENAI_MODEL=gpt-5.4-mini
GOOGLE_TRANSLATE_API_KEY=...
```

## Database Changes

### Migrations

Run these on an existing database:

```text
Database/migration_gamification.sql
Database/migration_learning_path.sql
```

`migration_gamification.sql` adds XP, achievement, and daily-login persistence.

`migration_learning_path.sql` adds TOEIC roadmap levels and topic mapping.

### Vocabulary Seed

For a database that has not received the vocabulary bootstrap:

```text
1. Run Database/seed_vocabulary_learning_720.sql
2. Run Database/repair_seed_vocabulary_learning_curated.sql
```

The repair script replaces legacy generated phrases with 600 curated TOEIC vocabulary items across 12 topics. It also rebuilds examples, MCQ options, mini-test items, and optional learner demo data.

Do not rerun the legacy bootstrap after curated vocabulary has been installed.

Recommended UTF-8 command:

```powershell
sqlcmd -S . -E -b -f 65001 -i Database\repair_seed_vocabulary_learning_curated.sql
```

## Main Files

### Backend

```text
backend/src/services/user.service.js
backend/src/services/gamification.service.js
backend/src/services/learning-path.service.js
backend/src/services/ai.service.js
backend/src/controllers/user.controller.js
backend/src/controllers/gamification.controller.js
backend/src/controllers/learning-path.controller.js
backend/src/controllers/ai.controller.js
backend/src/routes/user.routes.js
backend/src/routes/ai.routes.js
backend/src/index.js
```

### Frontend Pages

```text
frontend/src/app/user/dashboard/page.tsx
frontend/src/app/user/learn/page.tsx
frontend/src/app/user/learn/[topicId]/page.tsx
frontend/src/app/user/learn/session/page.tsx
frontend/src/app/user/practice/page.tsx
frontend/src/app/user/courses/page.tsx
frontend/src/app/user/progress/page.tsx
frontend/src/app/user/achievements/page.tsx
frontend/src/app/user/notebook/page.tsx
frontend/src/app/admin/words/page.tsx
```

### Frontend Components

```text
frontend/src/components/user/dashboard/
frontend/src/components/user/learn/
frontend/src/components/user/gamification/
frontend/src/components/user/learning-path/
frontend/src/components/user/notebook/
frontend/src/components/user/progress/
```

## Verification Performed

- Frontend production build passed:

```powershell
cd frontend
npm run build
```

- ESLint passed for the updated learner-flow files.
- Backend syntax checks passed for the updated learner services.
- SQL Server service integration check passed against the local database:

```text
Published learning topics: 14
Sample lesson route: /user/learn/1
Sample topic preview words: 3
Sample new flashcards: 3
Questionless flashcards handled by wordId fallback: 1
All returned mode=new flashcards were unlearned: true
```

## Pre-Commit Checklist

- [ ] Review environment-specific generated file changes such as `frontend/next-env.d.ts`.
- [ ] Confirm `OPENAI_API_KEY` is configured only in local/deployment secrets and is not committed.
- [ ] Run both SQL migrations on the target database before deploying the backend.
- [ ] Run curated vocabulary seed scripts only when demo vocabulary data is required.
- [ ] Stage the intended files and review `git diff --cached --stat`.
- [ ] Commit with the suggested message or split database seed data into a separate commit if preferred.

