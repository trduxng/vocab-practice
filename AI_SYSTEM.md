# VocaBoost — AI Agent Reference Guide

This repository is a full-stack English vocabulary learning platform with learner, creator, and admin workflows. The project is built as a Next.js frontend, an Express backend, and a SQL Server database.

## 1. Project Summary

- **Product:** VocaBoost / Vocab Practice
- **Main goal:** support vocabulary learning, spaced repetition, mini-tests, progress tracking, content authoring, and admin/content review workflows.
- **Core users:** Learners, Content Creators, Admins.
- **Primary architecture:**
  - Frontend: Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4
  - Backend: Express 5 + Node.js + JavaScript
  - Data layer: SQL Server (MSSQL)
  - Dev tooling: Docker, docker-compose

## 2. Runtime & Environment

- Frontend dev server: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Database: `localhost:1433`
- Frontend environment variable: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Backend `.env` should include DB, JWT, and auth settings.

## 3. Repository Layout

```text
backend/                Express API server
frontend/               Next.js web app
Database/               SQL schema, seed, and migration files
docker-compose.yml      Local services orchestration
README.md               Project README
AI_SYSTEM.md            This document (AI agent onboarding reference)
```

### Important folders and files

| Path                                       | Purpose                                                               |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `backend/src/index.js`                     | Express entry point; mounts routes, middleware, logger, health checks |
| `backend/src/config/db.js`                 | MSSQL connection pool and driver exports                              |
| `backend/src/middlewares/auth.js`          | JWT verification, permission checks, ownership checks                 |
| `backend/src/middlewares/validate.js`      | Zod-based request validation                                          |
| `backend/src/services/`                    | Business logic, SQL, transactions, SRS, XP, notifications             |
| `backend/src/controllers/`                 | Thin HTTP handlers                                                    |
| `backend/src/routes/`                      | API route registration                                                |
| `frontend/src/app/`                        | App Router pages and role-based routes                                |
| `frontend/src/components/`                 | Reusable UI, shared, admin, and user widgets                          |
| `frontend/src/services/`                   | Typed API layer for frontend                                          |
| `frontend/src/lib/api-client.ts`           | Axios singleton with auth token interceptors                          |
| `frontend/src/app/context/AuthContext.tsx` | Auth state and permissions                                            |
| `frontend/src/modules/`                    | Shared types, permissions, hooks                                      |
| `Database/latest-full-db.sql`              | Master schema source of truth for fresh installs                      |
| `Database/migration_*.sql`                 | Incremental migration files for existing databases                    |

## 4. High-Level Architecture

### Frontend

The frontend is a Next.js 16 App Router application. It uses React 19, Tailwind CSS 4, Base UI primitives, and typed service modules.

Main frontend responsibilities:

- login/register and JWT-based authentication
- learner dashboard, study tracks, flashcards, mini-tests, notebook, goals, notifications
- admin dashboards, content management, analytics, reports, audit logs
- creator workflows for drafting, reviewing, and submitting content

### Backend

The backend is Express 5 with SQL Server. It uses static service classes, parameterized SQL, transactions, and JWT authentication.

Main backend responsibilities:

- user auth and role permission resolution
- learning operations, SRS updates, XP/level updates, exercise attempts
- content workflow (draft → review → publish / archive)
- analytics and dashboard data aggregation
- admin and creator management endpoints

### Database

The database runs on SQL Server. The schema is maintained in `Database/latest-full-db.sql`, and every new schema change must be mirrored in a new migration file.

Key tables:

- `Users`
- `Roles`, `Permissions`, `RolePermissions`
- `Words`, `Questions`, `Topics`, `TopicCategories`, `WordTopics`
- `ExerciseAttempts`, `UserWordProgress`, `UserVocabularyNotebook`
- `MiniTests`, `MiniTestItems`
- `Notifications`, `ContentReports`, `ContentReviewLogs`, `AdminAuditLogs`

## 5. Important Product Flows

### Learner flow

1. Login obtains JWT and permissions.
2. Learner dashboard loads stats, due flashcards, goal progress, and heatmap activity.
3. Practice uses SRS and updates `UserWordProgress` and XP.
4. Mini-tests submit answers in batch and update totals.
5. Notebook, notifications, and daily goals are all persisted and shown in the UI.

### Creator flow

1. Creator creates content in `Draft` status.
2. Creator submits content for review.
3. Admin/Reviewer approves or rejects.
4. Published content is visible to learners.

### Admin flow

1. Admin manages users, content, topics, words, questions, mini-tests, reports, notifications.
2. Admin reviews pending content and updates statuses.
3. Admin analytics and audit logs are exported from backend aggregation routes.

## 6. Core Technical Behaviors

### SRS and learning state

- `UserWordProgress` stores mastery, ease factor, repetition count, memory status, and next review date.
- The learner practice flow updates mastery and review scheduling.
- Submission paths award XP on correct answers.

### XP and levels

- Correct answers award `10 XP`.
- Level is derived from total XP: `floor(totalXP / 100) + 1`.
- Streaks are calculated from consecutive days of exercise activity, not hardcoded.

### Status workflow

- Content uses a workflow similar to:
  - `Draft -> PendingReview -> Published`
  - `Rejected -> Draft`
  - any status -> `Archived`
- Review history is logged in `ContentReviewLogs`.

## 7. Frontend Quick Reference

### Route structure

The frontend uses App Router structure under `frontend/src/app/`.

Key routes:

- `/login`, `/register`
- `/user/*` for learner features
- `/admin/*` for admin features
- `/creator/*` for creator features

### Key frontend files

- `frontend/src/lib/api-client.ts` — shared Axios instance with auth token handling
- `frontend/src/app/context/AuthContext.tsx` — auth context with user, token, permissions, login/logout
- `frontend/src/services/user.service.ts` — learner API methods
- `frontend/src/services/admin.service.ts` — admin API methods
- `frontend/src/services/creator.service.ts` — creator API methods
- `frontend/src/services/categories.service.ts` — category/topic APIs
- `frontend/src/components/user/CalendarHeatmap.tsx` — GitHub-style activity heatmap
- `frontend/src/components/shared/Topbar.tsx` — top nav and notification bell
- `frontend/src/components/shared/Sidebar.tsx` — role-aware navigation
- `frontend/src/components/ui/tooltip.tsx` — Base UI Tooltip wrapper

### Frontend conventions

- Use `@/` alias imports.
- Use Base UI primitives from `@base-ui/react`.
- Do **not** use Radix-specific patterns such as `asChild`.
- Tailwind CSS 4 uses CSS-based configuration; do not assume `tailwind.config.js` exists.
- Shared types live in `frontend/src/modules/`.
- API calls must go through typed service modules, not raw fetch calls.

## 8. Backend Quick Reference

### Key backend files

- `backend/src/index.js` — server bootstrap, middleware, health checks, graceful shutdown
- `backend/src/config/db.js` — MSSQL connection pool, driver setup, pool singleton
- `backend/src/middlewares/auth.js` — JWT auth, permission guards, ownership checks
- `backend/src/middlewares/validate.js` — schema validation middleware
- backend route folders under `backend/src/routes/`
- backend controller folders under `backend/src/controllers/`
- backend service folders under `backend/src/services/`

### Backend conventions

- Services are static classes.
- Every service method is async.
- Use parameterized SQL queries.
- Use transactions for multi-step writes.
- Use pagination with `OFFSET ... FETCH NEXT ... ROWS ONLY` patterns.
- Controllers should be thin wrappers around service calls.
- User identity comes from JWT (`req.user.id`) rather than trusting request payloads.

## 9. API Areas That Matter Most

### Learner APIs

These endpoints drive dashboard, practice, progress, and daily goal features.

- `GET /api/user/stats` → learner stats, XP, level, streak
- `GET /api/user/flashcards` → due cards / SRS queue
- `POST /api/user/submit-answer` → submit practice response
- `GET /api/user/activity/heatmap` → yearly study activity data
- `GET /api/user/goals/daily-goal` and `PUT /api/user/goals/daily-goal` → daily goals
- `GET /api/user/review/smart-queue` → smart queue prioritized by urgency
- `GET /api/user/review/session-summary` → current session analytics
- `GET /api/user/review/mistakes` → frequently missed words
- `GET /api/user/notifications` / `PUT /api/user/notifications/:id/read` → notifications

### Content / admin APIs

- `GET /api/admin/*` routes for dashboards, content, analytics, users, reports
- `GET /api/creator/*` routes for creator content management
- `GET /api/admin/content-review/pending` and approval endpoints for review workflow

## 10. Data and Schema Rules

- `Database/latest-full-db.sql` is the master schema.
- New tables, columns, and constraints must be added there.
- Every schema change must also have a matching incremental migration under `Database/`.
- Legacy SQL files in `Database/` are not the source of truth.
- SQL Server uses PascalCase column naming conventions.

## 11. Common Pitfalls and How to Avoid Them

- Do not assume the frontend uses Radix UI; it uses Base UI.
- Do not ignore local-date handling in heatmaps or activity charts.
- Do not hardcode roles or permissions; use the auth/permission system.
- Do not edit legacy SQL files as if they are the active schema.
- Do not skip updating `latest-full-db.sql` when adding persistent schema changes.
- Do not place raw API logic in pages; use service modules.
- Do not mutate state directly in React.

## 12. Expected Change Workflow

When modifying the project, follow this order:

1. Check whether the change affects schema, backend API, frontend UI, or all three.
2. Update `Database/latest-full-db.sql` and add migrations if schema changes are needed.
3. Update backend route/controller/service logic.
4. Update frontend service layer and UI components.
5. Update this document if architecture or conventions change.
6. Validate with relevant checks such as lint/type validation where applicable.

## 13. Developer Notes for AI Agents

Use this document as the first reference. The most important files to read before making changes are:

- `AI_SYSTEM.md` (this file)
- `frontend/CLAUDE.md`
- `backend/plan.md`
- `README.md`
- `Database/latest-full-db.sql`
- relevant route/service/component files in the area being changed

The fastest way to understand a feature is to follow this chain:

- **Frontend:** page/component → service → API
- **Backend:** route → controller → service → SQL

If you are changing anything in learner activity, daily goals, SRS, XP, notifications, or workflow statuses, read the specific service and the connected dashboard component first.

## 14. Run Locally

```bash
# Start infrastructure and app services
cd /home/razer_admin/workspace/ON_CLASS_PROJECTS/vocab-practice
docker-compose up

# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 15. Summary

This repository is a classroom-style vocabulary platform with role-based workflows, SRS study logic, XP-based gamification, content review, and analytics. The most important engineering conventions are:

- Next.js frontend with App Router and typed API services
- Express backend with static services and SQL Server
- `latest-full-db.sql` as schema source of truth
- Base UI instead of Radix UI
- permission-aware frontend/backend patterns
- heatmaps, progress, daily goals, SRS, and review workflows as core user features
