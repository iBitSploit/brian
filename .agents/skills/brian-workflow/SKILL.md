---
name: brian-workflow
description: "Use when working on the Brian network topology platform, especially its React frontend, Flask backend, topology visualization, device inventory, NetBox integration, scan ingestion, distributed agents, icons, or project documentation."
---

# Brian Project Workflow

## Purpose

Use this workflow when implementing or reviewing Brian, an open-source network and infrastructure topology platform. Keep changes aligned with `HUMAN/PRD.md`, `HUMAN/NetBox.md`, and `HUMAN/SRS.md`.

## Project Shape

- `frontend/`: React, TypeScript, and Vite MVP frontend.
- `backend/`: Python Flask API, application factory, blueprints, services, integrations, and tests.
- `HUMAN/`: Product requirements, SRS, and standalone visual prototype.
- Supporting services: PostgreSQL persistence, Redis where needed, and distributed scanning agents.

## Product Priorities

1. Make network relationships and operational state easy to understand.
2. Preserve a low-noise topology canvas with progressive disclosure.
3. Support device CRUD, connections, search, filters, saved views, imports, integrations, agents, icons, exports, and theme preferences.
4. Keep mock data clearly separated from future API-backed data.
5. Preserve source provenance, timestamps, and operational status.
6. Do not communicate state through color alone.

## Implementation Rules

- Read the nearest relevant source file and requirement section before editing.
- State one local hypothesis about the behavior and one focused validation check before the first substantive edit.
- Make the smallest change that satisfies the requirement.
- Preserve existing user changes; never reset or reformat unrelated files.
- Prefer existing components, CSS variables, helpers, and patterns over new abstractions.
- Use semantic HTML, accessible labels, keyboard-friendly controls, and icon tooltips for unfamiliar actions.
- Use Lucide icons when an icon exists in the frontend dependency set.
- Use Flask application factories and blueprints to keep API areas independently testable.
- Keep Flask route handlers small; place business logic in services and external calls in integration clients.
- Validate request payloads at the API boundary and return consistent JSON errors with documented status codes.
- Manage Python dependencies in a committed backend dependency file and keep secrets in environment configuration.
- Use Flask's test client for endpoint tests and isolated tests for parsers, services, and conflict resolution.
- Keep API calls behind a service boundary when adding backend integration; do not scatter fetch logic through views.
- Treat NetBox synchronization as read-only unless requirements explicitly change.
- Scope agent tokens and never expose tokens in UI output or logs.
- Validate uploaded scan files, custom icons, SVG content, and file paths at the server boundary when backend work exists.
- Avoid adding authentication, multi-tenancy, traffic analysis, or other out-of-scope features without an explicit requirement.

## Frontend Conventions

- Use React function components and TypeScript types for domain objects.
- Keep view navigation explicit and predictable.
- Keep mock records in a clearly named data/service area.
- Use controlled state for user-editable settings and filters.
- Persist theme preferences with the existing local storage convention.
- Prefer CSS variables for theme colors and use the established Brian palette.
- Keep topology controls visually secondary to the graph.
- Use stable dimensions for toolbars, tables, icon buttons, and topology panels.
- Preserve desktop usability at the SRS minimum viewport and test narrower layouts when changing shared CSS.

## Validation

For frontend changes, run the narrowest available checks first:

```bash
cd frontend
npm run build
```

For backend changes, once `backend/` exists:

```bash
cd backend
python -m pytest
```

Run focused Flask tests first, then the complete backend suite. If the backend is not yet present, document that the command is pending rather than inventing a passing result.

For documentation-only changes, use a targeted file/format check. For broader changes, add focused tests before widening validation. Also inspect `git diff --check` for edited files.

When a build fails:

1. Read the first relevant diagnostic.
2. Fix that local issue without broad refactoring.
3. Rerun the same command.
4. Report remaining unrelated failures separately.

## Definition Of Done

A task is complete when:

- The requested behavior or document exists in the correct project area.
- Existing conventions and user changes are preserved.
- Relevant accessibility and empty/error states are represented.
- A focused validation command passes, or an unavailable check is explicitly reported.
- The final response names the changed files and validation result concisely.
