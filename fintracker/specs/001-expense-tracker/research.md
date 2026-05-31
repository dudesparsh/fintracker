# Research: Fintracker — Personal Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-05-31

## Decision Log

### 1. Data Persistence — localStorage with JSON serialization

**Decision**: Store the full expenses array as a JSON string under a single localStorage key (`fintracker_expenses`).

**Rationale**: `JSON.stringify` / `JSON.parse` is browser-native, zero-dependency, and universally understood. A single key avoids key-collision issues and makes read/write atomic from the app's perspective.

**Alternatives considered**:
- Multiple keys (one per expense): Harder to enumerate, no ordering guarantee, more error-prone deletion.
- IndexedDB: Async API, more complexity, overkill for a single-user list of < 1000 items.
- sessionStorage: Does not persist across page refreshes — ruled out by FR-010.

---

### 2. Unique Expense Identity

**Decision**: Assign each expense a unique ID using `Date.now()` combined with a random suffix (`Date.now() + '-' + Math.random().toString(36).slice(2, 7)`).

**Rationale**: No external UUID library needed. Collision probability is negligible for single-user local use. The ID is used only for deletion targeting — it never needs to be globally unique.

**Alternatives considered**:
- Sequential integer counter stored in localStorage: Extra state to manage, breaks if storage is cleared partially.
- crypto.randomUUID(): Available in all modern browsers but more than needed here.

---

### 3. Undo Delete — In-Memory Toast Pattern

**Decision**: On delete, remove the expense from the in-memory array and re-render immediately. Store the deleted expense in a module-level `lastDeleted` variable. Show a toast with an "Undo" button that re-inserts the expense and clears `lastDeleted`. A `setTimeout` (5000ms) writes the deletion to localStorage and clears the toast if undo is not triggered.

**Rationale**: The undo window is purely in-memory — no localStorage write happens until the 5-second window closes. This means undo is a zero-cost re-render with no localStorage reads. Simple and readable (constitution Principle V).

**Alternatives considered**:
- Write to localStorage immediately, undo reads back: Adds async complexity, extra read/write cycles.
- Custom event system: Unnecessary indirection for a single-page app.

---

### 4. localStorage Failure Handling

**Decision**: Wrap all `localStorage.setItem` calls in a `try/catch`. On `QuotaExceededError` or any other storage error, display a visible error banner ("Unable to save — storage unavailable") and do not update the in-memory state, leaving the UI unchanged.

**Rationale**: `QuotaExceededError` is the only realistic failure mode in modern browsers. Catching it specifically and falling back gracefully satisfies FR-012 without any extra library.

**Alternatives considered**:
- Check `navigator.storage.estimate()` before each write: Async, adds complexity, not guaranteed cross-browser.
- Silent fail: Explicitly ruled out by clarification Q1.

---

### 5. Mobile-First CSS Layout

**Decision**: Use CSS Flexbox for layout. A single-column stacked layout on mobile (375px+) with a slightly wider content container on larger screens using `max-width` + `margin: auto`. All spacing in `rem`, font sizes responsive via `clamp()` where appropriate.

**Rationale**: Flexbox is universally supported in evergreen browsers, requires no library, and is the simplest tool for stacked single-column layouts. CSS Grid would also work but is unnecessary for a linear layout.

**Alternatives considered**:
- CSS Grid: More powerful but over-engineered for a single-column app.
- Fixed-pixel layout: Violates constitution Principle III.
- A CSS framework (Bootstrap, Tailwind): Violates constitution Principle II.

---

### 6. File Structure — Adjacent JS/CSS Files

**Decision**: Use three adjacent files: `index.html`, `css/styles.css`, `js/app.js`. HTML links to both via standard `<link>` and `<script>` tags.

**Rationale**: Embedding all CSS and JS in a single `index.html` would make the file unwieldy and harder for a junior developer to navigate (constitution Principle V). Splitting into three files keeps each concern separately readable while still requiring zero build tooling.

**Alternatives considered**:
- Everything in one index.html: Simpler to open but harder to read at scale.
- Multiple JS modules with ES module imports: Cleaner architecture but adds cognitive overhead and requires a local server to avoid CORS issues with `file://` protocol.

---

### 7. Amount Display — Intl.NumberFormat

**Decision**: Use `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` to format all displayed amounts.

**Rationale**: Browser-native, zero-dependency, handles decimal rounding correctly (e.g., `$12.50` not `$12.5`), and is readable by a junior developer. Satisfies the clarified requirement for `$` prefix display.

**Alternatives considered**:
- Manual string formatting (e.g., `'$' + amount.toFixed(2)`): Works but `Intl` is more correct for edge cases (very large numbers, locale).
- A number formatting library: Violates constitution Principle II.
