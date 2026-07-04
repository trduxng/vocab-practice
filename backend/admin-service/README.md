# Admin Service

Standalone Express service for admin workflows.

## Runtime

- Default port: `3003`
- Direct API base: `http://localhost:3003/api/admin`
- Direct content review base: `http://localhost:3003/api/admin/content-review`
- Gateway API base through the main backend: `http://localhost:3001/api/admin`
- Database: shared SQL Server database with the main backend
- Cross-service report calls: HTTP to `REPORT_SERVICE_URL` using `INTERNAL_SERVICE_TOKEN`

## Setup

Copy `.env.example` to `.env` and set:

- `JWT_SECRET` to the same value used by the auth service
- `INTERNAL_SERVICE_TOKEN` to the same value used by the main backend
- `REPORT_SERVICE_URL` to the main backend URL, usually `http://localhost:3001`

In local development, the frontend can keep using `NEXT_PUBLIC_API_URL=http://localhost:3001/api` because the main backend proxies `/api/admin/*` to this service.

From `backend/`, run:

```bash
npm run dev
```

That starts:

- main backend on `3001`
- admin service on `3003`
- gateway proxy from `3001/api/admin/*` to `3003/api/admin/*`

## Scripts

```bash
npm install
npm run dev
npm start
npm test
```

The main backend must be running for admin report management because reports are accessed over HTTP through `/internal/reports`.

## Admin Module Layout

- `src/modules/admin/admin.routes.ts`: endpoint wiring and permission middleware
- `src/modules/admin/controllers/*`: request/response handlers split by domain
- `src/modules/admin/services/*`: admin use cases split by domain
- `src/modules/admin/shared/admin.shared.ts`: shared helpers for pagination, audit logs, import parsing, and content status validation
- `src/modules/admin/admin.controller.ts` and `src/modules/admin/admin.service.ts`: compatibility facades for older imports
