# Feature Specification: Fintracker — Personal Expense Tracker

**Feature Branch**: `001-expense-tracker`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Build Fintracker, a personal expense tracker that runs entirely in the browser. Users can log expenses with a name, amount, and category (Food, Transport, Entertainment, Health, Other). Users can view all their logged expenses in a list sorted by most recent. Users can see a summary showing total spend per category. Users can delete any expense. Data should persist across page refreshes. There is no login — single user app."

## User Scenarios & Testing

### User Story 1 — Log an Expense (Priority: P1)

A user wants to record a new expense by providing a name (e.g., "Lunch"), an amount (e.g., 12.50), and a category from a fixed list (Food, Transport, Entertainment, Health, Other). After submitting, the expense is immediately visible in the expense list.

**Why this priority**: This is the core action the entire app exists to support. Without it, nothing else has value.

**Independent Test**: Open the app, fill in the expense form with a name, amount, and category, submit — the new expense appears at the top of the list. Delivers a usable single-entry tracker on its own.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user fills in a valid name, amount, and category and submits, **Then** the expense appears at the top of the expense list with the correct values displayed.
2. **Given** the user submits the form, **When** the submission succeeds, **Then** the form is cleared and a visible confirmation is shown.
3. **Given** the user leaves the name or amount blank, **When** they attempt to submit, **Then** an inline error message appears and the form is not submitted.
4. **Given** the user enters a non-numeric or negative amount, **When** they attempt to submit, **Then** an inline error message appears and the form is not submitted.

---

### User Story 2 — View All Expenses (Priority: P2)

A user wants to see a list of all expenses they have logged, sorted with the most recently added entry at the top, so they can review their spending history.

**Why this priority**: Reviewing logged data is the second most critical function — the app has no value if you can't see what you entered.

**Independent Test**: Log two or more expenses, reload the page — all expenses appear in reverse-entry order with name, amount, and category visible for each.

**Acceptance Scenarios**:

1. **Given** expenses have been logged, **When** the user views the expense list, **Then** all expenses are shown sorted by most recent first.
2. **Given** no expenses have been logged, **When** the user views the expense list, **Then** an empty-state message is shown (e.g., "No expenses yet").
3. **Given** expenses were logged in a prior session, **When** the user reopens the app, **Then** all previously logged expenses are still visible (data persisted across refresh).

---

### User Story 3 — View Spending Summary by Category (Priority: P3)

A user wants to see the total amount spent in each category so they can understand where their money is going.

**Why this priority**: This provides insight and is a key differentiator from a plain list, but the app is still functional without it.

**Independent Test**: Log expenses across multiple categories — the summary panel shows the correct total for each category that has at least one expense.

**Acceptance Scenarios**:

1. **Given** expenses exist in multiple categories, **When** the user views the summary, **Then** each category with expenses shows its correct total spend.
2. **Given** a category has no expenses, **When** the user views the summary, **Then** that category is hidden — only categories with at least one expense are shown.
3. **Given** an expense is deleted, **When** the summary is viewed, **Then** the affected category total updates immediately.

---

### User Story 4 — Delete an Expense (Priority: P4)

A user wants to remove an expense they logged by mistake or no longer want to track.

**Why this priority**: Correction capability rounds out the core CRUD loop; lower priority since you can still use the app without it, but it is essential for data accuracy.

**Independent Test**: Log an expense, delete it — it disappears from the list and the category summary updates.

**Acceptance Scenarios**:

1. **Given** an expense exists in the list, **When** the user clicks delete on that expense, **Then** the expense is removed from the list immediately.
2. **Given** an expense is deleted, **When** the user refreshes the page, **Then** the deleted expense does not reappear (deletion is persisted).
3. **Given** the user clicks delete on an expense, **When** the deletion completes, **Then** the expense is removed immediately and a brief "Expense deleted — Undo" toast is shown, allowing the user to undo within 5 seconds.

---

### Edge Cases

- What happens when the amount field receives a very large number (e.g., 999,999,999)?
- How does the list behave when a large number of expenses are logged (100+)?
- What if the user enters only whitespace in the name field?
- If localStorage is unavailable or full: the system MUST show a visible error message (e.g., "Unable to save — storage unavailable") and prevent the expense from being added to the list.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow users to log an expense with a name, a positive numeric amount, and a category chosen from: Food, Transport, Entertainment, Health, Other.
- **FR-002**: The system MUST validate that the expense name is non-empty (not blank) before saving.
- **FR-003**: The system MUST validate that the expense amount is a positive number before saving.
- **FR-004**: The system MUST display a visible confirmation to the user after a successful expense submission.
- **FR-005**: The system MUST display inline error messages adjacent to invalid fields when form submission fails validation.
- **FR-006**: The system MUST display all logged expenses in a list, sorted by most recently added first.
- **FR-007**: The system MUST display an empty-state message when no expenses have been logged.
- **FR-008**: The system MUST show a spending summary displaying the total amount per category.
- **FR-009**: The system MUST allow users to delete any expense from the list.
- **FR-010**: The system MUST persist all expense data across page refreshes without requiring a login or server.
- **FR-011**: The system MUST update the spending summary immediately when an expense is added or deleted.
- **FR-012**: The system MUST display a visible error message and prevent saving if the browser's local storage is unavailable or full.

### Key Entities

- **Expense**: Represents a single spending record. Key attributes: name (text), amount (positive decimal), category (enum: Food | Transport | Entertainment | Health | Other), timestamp (when added).
- **Category Summary**: An aggregated view — not stored directly, derived by summing expenses per category.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can log a new expense in under 30 seconds from opening the app.
- **SC-002**: All logged expenses remain visible and accurate after a page refresh, with zero data loss.
- **SC-003**: The spending summary reflects the correct category totals within 1 second of any add or delete action.
- **SC-004**: A user can delete an expense and see the list and summary update without a page reload.
- **SC-005**: 100% of form submissions with missing or invalid data are rejected with a visible, specific error message before any data is written.

## Clarifications

### Session 2026-05-31

- Q: What should happen when localStorage is unavailable or full? → A: Show a visible error message (e.g., "Unable to save — storage unavailable") and prevent the expense from being added.
- Q: What is the delete UX — confirmation dialog or undo? → A: Delete immediately and show a brief "Expense deleted — Undo" toast, undo available for ~5 seconds.
- Q: How should amounts be displayed — plain number or currency symbol? → A: Always display with a `$` prefix (e.g., `$12.50`), fixed — no user configuration.
- Q: Should the category summary show zero-spend categories? → A: Hide them — only show categories with at least one expense.

## Assumptions

- Single-user only — no concept of accounts, authentication, or shared data.
- All data is stored locally in the browser; no network connectivity is required.
- The category list (Food, Transport, Entertainment, Health, Other) is fixed and not user-configurable for v1.
- Amounts are entered as plain numbers (no currency symbol required in input); all amounts are displayed with a `$` prefix (e.g., `$12.50`) — fixed, no user configuration.
- Currency is assumed to be a single, consistent unit — multi-currency support is out of scope for v1.
- The app targets a single browser session per device; no cross-device sync is in scope.
- Delete actions are undoable within a 5-second window via a toast notification; no undo is available after the window closes.
- Expense entries are not editable after creation — delete and re-add is the correction workflow for v1.
