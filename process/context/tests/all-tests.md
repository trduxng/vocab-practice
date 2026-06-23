# VocaBoost - All Tests

Last updated: 2026-06-22

Attach this file first when the task involves testing, verification, or test debugging.

This is the fast operator guide for the testing surface:

- which runner to use
- what command to start with
- how to quickly debug common failures
- which deeper file to read next

Do not load the whole `process/context/tests/` folder by default. Start here, then drill down.

---

## How This File Works

This is the `all-tests.md` entrypoint for the `tests/` context group. It follows the `all-*.md` routing convention:

1. Agents read `all-context.md` first and get routed here for testing tasks
2. This file gives quick decision rules and commands
3. For deeper details, agents follow the routing table below to specific docs

As the project grows, add deeper docs to this group (e.g., `e2e-tests.md`, `debugging-and-pitfalls.md`) and add routing entries below. This file stays the fast-start entrypoint.

---

## What This Covers

- test runner selection
- quick commands by package
- fast debugging procedures
- current testing gaps worth remembering

## Read This When

Use this file when you need to:

- run tests after implementation
- decide between test runners
- debug failing tests

## Quick Routing


<!-- Start with an empty table. Add rows as deeper docs are created during the project lifecycle. -->

<!-- Example of what a filled-in routing table looks like (from a mature project): -->

<!--
| If you need... | Read next |
|---|---|
| commands and scripts by package | `scripts-and-commands.md` |
| architecture, mocks, auth model, and runner split | `architecture-and-patterns.md` |
| Playwright setup, auth flow, and current specs | `e2e-tests.md` |
| failing-test triage and runtime debugging | `debugging-and-pitfalls.md` |
| known gaps and future test-system fixes | `known-issues.md` |
-->

(No deeper test docs yet. Add routing entries here as they are created.)

### Current Test Setup

Currently, there are no automated testing frameworks (like Jest, Vitest, or Playwright) installed in either the `frontend` or `backend` projects. All testing is currently manual via scripts or Postman.

## Default Verification Order

Unless the task clearly needs a different path:

1. run the narrowest existing automated test
2. use unit/integration tests before browser tests
3. use end-to-end tests only when the real UI is the thing being verified

## Commands

| Package | Runner | Command |
|---|---|---|
| backend | N/A | `node test-db.js` (manual db check script) |
| backend | N/A | `node test-phase5.js` (manual script) |
| frontend | eslint | `npm run lint` |

## Debugging Quick Reference

- **No Automated Tests:** The project currently relies on manual scripts (e.g. `test-db.js`) and API testing via Postman (`postman_collection.json` is present in `backend`).
- **Database state:** Relies on local SQL Server instance.

## Known Gaps

- **No Automated Tests:** The project currently has zero automated unit, integration, or E2E tests.
