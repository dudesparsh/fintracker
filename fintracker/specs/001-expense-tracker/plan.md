# Implementation Plan: Fintracker — Personal Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-05-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-expense-tracker/spec.md`

## Summary

Build a single-page browser expense tracker using vanilla HTML, CSS, and JavaScript with no dependencies or build tooling. Users log expenses (name, amount, category), view them sorted newest-first, see per-category totals, and delete with a 5-second undo window. All data persists in `localStorage`. The deliverable is three files: `index.html`, `css/styles.css`, `js/app.js`.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES6+ (no transpilation)

**Primary Dependencies**: None — browser-native APIs only (`localStorage`, `Intl.NumberFormat`, `Date.now()`)

**Storage**: `localStorage` — single key `fintracker_expenses`, value is `JSON.stringify(Expense[])`

**Testing**: Manual browser testing against acceptance scenarios in spec.md; no automated test framework

**Target Platform**: Evergreen browsers — Chrome, Firefox, Safari, Edge (latest 2 major versions each); mobile-first at 375px

**Project Type**: Single-page browser application (no server, no build step)

**Performance Goals**: Summary updates synchronously on every add/delete (< 100ms perceived); page load instant (no network requests)

**Constraints**: Offline-capable; single-user; no server; 375px mobile viewport minimum; touch targets ≥ 44×44px; no IE11

**Scale/Scope**: Single user; localStorage ~5MB upper bound; no concurrency

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Single index.html + adjacent css/js files; no framework, no build tool |
| II. Zero Unnecessary Dependencies | ✅ PASS | No external libraries; localStorage, Intl, Date are all browser-native |
| III. Mobile-Friendly UI | ✅ PASS | Mobile-first CSS, relative units (rem/%), max-width container, 44px touch targets required |
| IV. Clear User Feedback | ✅ PASS | Inline validation errors, success toast on add, undo toast on delete, storage error banner |
| V. Readable Code | ✅ PASS | Named constants at top of app.js, functions ≤ 30 lines, comments on non-obvious logic |

**Verdict**: All gates pass. No complexity justification required.

*Post-Phase 1 re-check: All principles confirmed — single-file structure, no libraries introduced, UI contract enforces mobile layout and feedback requirements.*

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-contract.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
index.html          ← entry point; links to css/styles.css and js/app.js
css/
└── styles.css      ← all styling; mobile-first, CSS custom properties for theming
js/
└── app.js          ← all application logic; module pattern; no imports/exports needed
```

**Structure Decision**: Single-project web app with adjacent CSS and JS files. No `src/` layer, no `tests/` directory (no automated test framework). Keeps the project flat and navigable for a junior developer (constitution Principle V). The `index.html` is at repo root so opening the file directly in a browser works without any path configuration.

## Implementation Approach by User Story

### US1 — Log an Expense (P1)

- Render a `<form>` with three fields: text input (name), number input (amount), select (category).
- On submit: validate → if invalid show inline errors and return; if valid create Expense object, prepend to in-memory array, persist to localStorage, re-render list and summary, show success toast, reset form.
- localStorage write wrapped in try/catch; on error show error banner and do not update state.

### US2 — View All Expenses (P2)

- On page load: read `fintracker_expenses` from localStorage, parse JSON (default to `[]` on missing/invalid).
- Render list by mapping the in-memory array (already sorted newest-first by `timestamp` desc).
- Empty state: single paragraph "No expenses yet. Add your first one above."

### US3 — Category Summary (P3)

- Derive summary by reducing in-memory array: group by `category`, sum `amount`.
- Filter to categories with count > 0.
- Re-render on every add/delete.

### US4 — Delete with Undo (P4)

- Each expense row has a delete button with `data-id` attribute.
- On click: remove from in-memory array, re-render list and summary immediately, store deleted expense in `lastDeleted`, show "Expense deleted — Undo" toast, start 5-second `setTimeout`.
- On undo click (within window): restore `lastDeleted` to array at original index, re-render, cancel timeout, clear toast.
- On timeout: write updated array to localStorage, clear `lastDeleted`.
