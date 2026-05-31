# UI Contract: Fintracker — Personal Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-05-31

This document defines the UI surface contract — the elements, states, and behaviours the implementation MUST deliver. It is technology-agnostic at the interaction level and serves as the acceptance baseline for each user story.

---

## Components

### 1. Expense Form

**Purpose**: Allows the user to log a new expense (US1).

| Element         | Type       | Attributes / Constraints                                    |
|-----------------|------------|-------------------------------------------------------------|
| Name input      | text field | Required; placeholder "Expense name"; max 100 chars         |
| Amount input    | number field | Required; min > 0; step 0.01; placeholder "0.00"          |
| Category select | dropdown   | Options: Food, Transport, Entertainment, Health, Other; default: Food |
| Submit button   | button     | Label: "Add Expense"; disabled while form is invalid        |

**States**:
- **Default**: All fields empty/default, button enabled.
- **Invalid field**: Inline error message appears directly beneath the offending field. Button remains enabled (validation fires on submit attempt, not on blur).
- **Submitting**: Submit button shows "Adding…" and is disabled momentarily.
- **Success**: Form clears to defaults; success toast "Expense added" shown for 3 seconds.
- **Storage error**: Error banner shown above form: "Unable to save — storage unavailable". Form values retained so user doesn't lose input.

---

### 2. Expense List

**Purpose**: Displays all logged expenses sorted by most recent first (US2).

| Element         | Behaviour                                                              |
|-----------------|------------------------------------------------------------------------|
| List container  | Renders one row per expense; sorted by `timestamp` descending          |
| Expense row     | Shows: name, formatted amount (`$XX.XX`), category badge, delete button |
| Empty state     | When no expenses exist: "No expenses yet. Add your first one above."   |
| Delete button   | Touch target ≥ 44×44px; label: "Delete" (or trash icon with aria-label) |

**States**:
- **Populated**: All expenses rendered, sorted newest-first.
- **Empty**: Empty-state message shown; no list rows rendered.
- **Post-delete (undo window)**: Deleted row disappears immediately; undo toast visible (see Toast component).

---

### 3. Category Summary

**Purpose**: Shows total spend per category (US3).

| Element           | Behaviour                                                            |
|-------------------|----------------------------------------------------------------------|
| Summary container | Renders one row per category that has ≥ 1 expense                   |
| Category row      | Shows: category name, formatted total (`$XX.XX`)                     |
| Empty state       | When no expenses exist: summary section hidden or shows "No data yet" |

**Behaviour**:
- Updates immediately (synchronously) on every add or delete action.
- Categories with zero expenses are hidden (clarification Q4).
- Totals are re-derived from the in-memory array on every render — never cached separately.

---

### 4. Toast Notification

**Purpose**: Provides immediate user feedback for add, delete, and undo actions (Principle IV).

| Trigger           | Message                    | Duration  | Action button |
|-------------------|----------------------------|-----------|---------------|
| Expense added     | "Expense added"            | 3 seconds | None          |
| Expense deleted   | "Expense deleted — Undo"   | 5 seconds | "Undo" button |
| Storage error     | "Unable to save — storage unavailable" | Persistent until dismissed | "Dismiss" button |

**Behaviour**:
- Only one toast visible at a time; a new toast replaces the current one.
- Toasts are accessible (role="status" or role="alert" as appropriate).
- Clicking "Undo" restores the deleted expense to its original position and clears the toast.
- After the undo window closes (5s), the deletion is written to localStorage.

---

## Accessibility Requirements

- All interactive elements reachable by keyboard (Tab / Shift+Tab).
- Form labels explicitly associated with inputs via `for`/`id` attributes.
- Delete buttons have a visible text label or `aria-label` identifying the expense being deleted.
- Toast messages use `role="status"` (polite) for success and `role="alert"` (assertive) for errors.
- Colour is not the sole indicator of state (e.g., error messages use text, not just red colour).

---

## Responsive Breakpoints

| Viewport      | Layout                                                        |
|---------------|---------------------------------------------------------------|
| < 600px       | Single column; form stacked; list full-width                  |
| ≥ 600px       | Content centred with `max-width: 640px`; same single-column layout |

No horizontal scrolling at any width ≥ 375px.
