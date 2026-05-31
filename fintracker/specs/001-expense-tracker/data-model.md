# Data Model: Fintracker — Personal Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-05-31

## Entities

### Expense

The only persisted entity. Stored as an array of Expense objects in localStorage under the key `fintracker_expenses`.

| Field      | Type    | Constraints                                              |
|------------|---------|----------------------------------------------------------|
| `id`       | string  | Non-empty; unique; generated at creation time            |
| `name`     | string  | Non-empty, non-whitespace; max 100 characters            |
| `amount`   | number  | Positive decimal; > 0; max 2 decimal places stored       |
| `category` | string  | One of: `Food`, `Transport`, `Entertainment`, `Health`, `Other` |
| `timestamp`| number  | Unix ms timestamp (`Date.now()`) set at creation; immutable |

**Example JSON record**:
```json
{
  "id": "1748691234567-x3k9f",
  "name": "Lunch",
  "amount": 12.50,
  "category": "Food",
  "timestamp": 1748691234567
}
```

### Category Summary (derived — not stored)

Computed at render time by reducing the expenses array. Never written to localStorage.

| Field          | Type   | Derivation                                      |
|----------------|--------|-------------------------------------------------|
| `category`     | string | One of the 5 valid category values              |
| `total`        | number | Sum of `amount` for all expenses in this category |
| `count`        | number | Number of expenses in this category             |

Only categories with `count > 0` are rendered (clarification Q4).

---

## Storage Schema

**localStorage key**: `fintracker_expenses`
**Value type**: JSON string — serialised array of Expense objects
**Empty state**: `"[]"` or key absent (treated identically on read)

```
localStorage
└── "fintracker_expenses"  →  JSON.stringify(Expense[])
```

---

## Validation Rules

| Field      | Rule                                                                 | Error Message                          |
|------------|----------------------------------------------------------------------|----------------------------------------|
| `name`     | Must not be empty or whitespace-only                                 | "Please enter an expense name"         |
| `amount`   | Must be a number; must be > 0                                        | "Please enter a valid amount"          |
| `category` | Must be one of the 5 enum values; always has a valid default         | N/A (dropdown enforces valid values)   |

---

## State Transitions

```
[Empty list]
    │  add expense (valid form submit)
    ▼
[List with expenses]
    │  delete expense → undo window open (5s, in-memory only)
    ▼
[Pending deletion]        ──── undo ────▶  [List with expenses]
    │  5s timeout (write to localStorage)
    ▼
[List with expenses (deleted item gone)]
```

---

## Lifecycle Notes

- Expenses are **immutable after creation** — no edit operation exists in v1.
- The `timestamp` field drives sort order (most recent = highest timestamp = shown first).
- Deletion is **soft in-memory** for 5 seconds, then **hard-committed** to localStorage.
- On page load, the full array is read once from localStorage and held in memory; all subsequent reads use the in-memory array until a write is triggered.
