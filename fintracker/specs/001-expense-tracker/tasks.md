---
description: "Task list for Fintracker — Personal Expense Tracker"
---

# Tasks: Fintracker — Personal Expense Tracker

**Input**: Design documents from `specs/001-expense-tracker/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ui-contract.md ✅

**Tests**: No automated tests — manual browser validation against acceptance scenarios in spec.md.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- File paths are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Create the three project files. Nothing compiles or runs until this is done.

- [x] T001 Create project file structure: `index.html` at repo root, `css/styles.css`, `js/app.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: HTML skeleton, CSS base, and JS foundation that every user story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Write HTML5 skeleton in `index.html` — doctype, `<meta name="viewport">`, `<link>` to `css/styles.css`, `<script>` to `js/app.js`, and empty section placeholders: `#form-section`, `#list-section`, `#summary-section`, `#toast-container`
- [x] T003 [P] Write base CSS in `css/styles.css` — CSS custom properties (colours, spacing), box-sizing reset, `body` and `.container` styles, mobile-first single-column layout, `max-width: 640px` centred container
- [x] T004 [P] Write JS foundation in `js/app.js` — `STORAGE_KEY` constant (`'fintracker_expenses'`), `CATEGORIES` array constant, `loadExpenses()` (parse from localStorage, default `[]`), `saveExpenses(expenses)` (JSON.stringify with try/catch for QuotaExceededError), `generateId()` (Date.now + random suffix), `formatCurrency(amount)` (Intl.NumberFormat USD)

**Checkpoint**: Foundation ready — open `index.html` in browser, blank page with no console errors.

---

## Phase 3: User Story 1 — Log an Expense (Priority: P1) 🎯 MVP

**Goal**: User can fill a form and add an expense that appears in the page.

**Independent Test**: Fill name "Lunch", amount "12.50", category "Food" → submit → row appears with "$12.50" and "Food" badge. Reload page — row still present.

### Implementation for User Story 1

- [x] T005 [US1] Add expense form HTML to `#form-section` in `index.html` — `<label>`+`<input type="text">` for name, `<label>`+`<input type="number" min="0.01" step="0.01">` for amount, `<label>`+`<select>` for category (options: Food, Transport, Entertainment, Health, Other), `<button type="submit">Add Expense</button>`, and `<span class="error">` placeholders beneath name and amount fields
- [x] T006 [P] [US1] Add form CSS to `css/styles.css` — form layout (stacked fields), input/select/button sizing (min 44px height), `.error` text style (red, small), button active/hover states
- [x] T007 [P] [US1] Implement `validateForm(name, amount)` in `js/app.js` — returns object `{ valid: boolean, errors: { name?, amount? } }`; rejects empty/whitespace name and non-positive or non-numeric amount
- [x] T008 [US1] Implement `addExpense(name, amount, category)` in `js/app.js` — creates Expense object `{ id, name, amount: parseFloat(amount), category, timestamp: Date.now() }`, prepends to in-memory array, calls `saveExpenses()`; returns the new expense or null on storage error
- [x] T009 [US1] Implement `handleFormSubmit(event)` in `js/app.js` — calls `validateForm`, shows inline errors on failure (populate `.error` spans, return); on success calls `addExpense`, triggers `renderAll()`, shows "Expense added" toast for 3 seconds, resets form
- [x] T010 [US1] Attach `submit` event listener to the form in `js/app.js`; implement `showInlineErrors(errors)` and `clearInlineErrors()` helpers; call `renderAll()` on page load

**Checkpoint**: US1 independently functional — add an expense, see it in the page, reload and confirm it persists.

---

## Phase 4: User Story 2 — View All Expenses (Priority: P2)

**Goal**: All logged expenses shown in a list, sorted newest-first, with an empty state.

**Independent Test**: Add two expenses → list shows both with correct name/amount/category, newest on top. Reload — order preserved. Delete all via localStorage clear → empty state message shown.

### Implementation for User Story 2

- [x] T011 [US2] Add expense list HTML to `#list-section` in `index.html` — `<ul id="expense-list">` and `<p id="empty-state">No expenses yet. Add your first one above.</p>`
- [x] T012 [P] [US2] Add expense list CSS to `css/styles.css` — list reset (no bullets), `.expense-row` layout (name, amount, category, delete button in a row), `.category-badge` pill style, `#empty-state` muted text style
- [x] T013 [US2] Implement `renderExpenseList(expenses)` in `js/app.js` — sorts by `timestamp` descending, maps to `<li>` rows showing name, `formatCurrency(amount)`, category badge, and delete button with `data-id` attribute; shows `#empty-state` when array is empty, hides it otherwise
- [x] T014 [US2] Add `renderExpenseList` call inside `renderAll()` in `js/app.js`

**Checkpoint**: US1 + US2 both independently functional — add expenses, see list, reload, verify sort order and empty state.

---

## Phase 5: User Story 3 — Category Summary (Priority: P3)

**Goal**: Total spend per category shown, updating live on add/delete.

**Independent Test**: Add $10 Food + $20 Food + $15 Transport → summary shows Food $30.00, Transport $15.00. Delete the $15 Transport entry → Transport disappears from summary.

### Implementation for User Story 3

- [x] T015 [US3] Add summary section HTML to `#summary-section` in `index.html` — `<h2>Spending by Category</h2>`, `<ul id="category-summary">`, `<p id="summary-empty">No data yet.</p>`
- [x] T016 [P] [US3] Add summary CSS to `css/styles.css` — `.summary-row` layout (category name left, total right), consistent row spacing matching expense list
- [x] T017 [US3] Implement `deriveCategorySummary(expenses)` in `js/app.js` — reduces expenses array to `{ [category]: total }` map; filters out categories with total `<= 0`
- [x] T018 [US3] Implement `renderCategorySummary(expenses)` in `js/app.js` — calls `deriveCategorySummary`, renders one `<li>` per category with name and `formatCurrency(total)`; shows `#summary-empty` when no data
- [x] T019 [US3] Add `renderCategorySummary` call inside `renderAll()` in `js/app.js`

**Checkpoint**: US1 + US2 + US3 all independently functional — add/delete expenses, verify summary updates immediately.

---

## Phase 6: User Story 4 — Delete with Undo (Priority: P4)

**Goal**: Clicking delete removes expense immediately with a 5-second undo toast.

**Independent Test**: Add an expense → click Delete → row disappears, "Expense deleted — Undo" toast appears → click Undo within 5s → row reappears. Add expense again → delete → wait 5s without undoing → reload → expense is gone.

### Implementation for User Story 4

- [x] T020 [US4] Add toast HTML to `#toast-container` in `index.html` — `<div id="toast" role="status" aria-live="polite">` with `<span id="toast-message">` and `<button id="toast-action">` (hidden by default)
- [x] T021 [P] [US4] Add toast CSS to `css/styles.css` — fixed position bottom-centre, hidden by default (opacity 0 / display none), visible state class, action button inline style
- [x] T022 [US4] Implement `showToast(message, actionLabel, actionCallback, duration)` in `js/app.js` — sets message text, shows/hides action button, auto-hides after `duration` ms; `hideToast()` counterpart
- [x] T023 [US4] Implement `deleteExpense(id)` in `js/app.js` — finds expense by id, removes from in-memory array, stores in `lastDeleted` variable along with original index, calls `renderAll()`, calls `showToast('Expense deleted — Undo', 'Undo', undoDelete, 5000)`, sets `setTimeout` for 5000ms to call `saveExpenses()` and clear `lastDeleted`
- [x] T024 [US4] Implement `undoDelete()` in `js/app.js` — re-inserts `lastDeleted.expense` at `lastDeleted.index` in the in-memory array, clears the pending `setTimeout`, calls `renderAll()`, calls `hideToast()`
- [x] T025 [US4] Wire delete button click handler inside `renderExpenseList()` in `js/app.js` — use event delegation on `#expense-list`, read `data-id` from clicked delete button, call `deleteExpense(id)`

**Checkpoint**: All four user stories independently functional — full CRUD with undo verified manually.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, storage error handling, responsive validation, and constitution sign-off.

- [x] T026 [P] Add accessibility attributes in `index.html` and `js/app.js` — `<label for="">` associations on all inputs, `aria-label` on delete buttons (e.g., "Delete Lunch"), `role="alert"` on storage error banner, `role="status"` on success toast
- [x] T027 [P] Add storage error banner HTML (`<div id="storage-error" role="alert" hidden>`) and CSS to `index.html` and `css/styles.css`; wire it to the `catch` block in `saveExpenses()` in `js/app.js` — show banner on error, hide on next successful save
- [x] T028 Verify mobile layout at 375px viewport in browser DevTools — confirm no horizontal scroll, all touch targets ≥ 44px, readable font sizes; fix any issues in `css/styles.css`
- [x] T029 Validate all acceptance scenarios from `specs/001-expense-tracker/spec.md` against the running app opened via `index.html` — check every Given/When/Then for US1–US4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — first deliverable, no story dependencies
- **US2 (Phase 4)**: Depends on Phase 2 — independent of US1 but benefits from `renderAll()` scaffold
- **US3 (Phase 5)**: Depends on Phase 2 — independent of US1/US2 but shares `renderAll()`
- **US4 (Phase 6)**: Depends on US2 (needs expense rows to delete) and Phase 2
- **Polish (Phase 7)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies
- **US2 (P2)**: No story dependencies (shares `renderAll()` with US1 but is independently buildable)
- **US3 (P3)**: No story dependencies
- **US4 (P4)**: Requires expense rows rendered by US2 — implement after US2 checkpoint

### Within Each User Story

- HTML task first (establishes element IDs needed by JS)
- CSS task can run in parallel with HTML task (different file)
- JS logic tasks can start in parallel once JS foundation (T004) is complete
- Event wiring task always last within a story

---

## Parallel Opportunities

### Foundational Phase

```
T002 (HTML skeleton)
T003 (CSS base)    ← run in parallel
T004 (JS base)     ← run in parallel
```

### Within Each User Story (example — US1)

```
T005 (form HTML)
T006 (form CSS)    ← run in parallel with T005
T007 (validateForm) ← run in parallel with T005 (only needs T004)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open `index.html`, add an expense, reload — does it persist?
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → blank page, no errors
2. US1 → log and persist expenses *(MVP)*
3. US2 → view sorted list with empty state
4. US3 → live category summary
5. US4 → delete with undo
6. Polish → accessibility and storage error handling

---

## Notes

- `[P]` tasks write to different files (HTML vs CSS vs JS) — safe to do in parallel
- `renderAll()` is the single re-render function — centralise calls there to avoid duplication
- `lastDeleted` and the undo `setTimeout` ID should be module-level variables at top of `js/app.js`
- Every magic string (storage key, category names, toast duration) MUST be a named constant — constitution Principle V
- Verify each user story checkpoint before advancing to the next phase
