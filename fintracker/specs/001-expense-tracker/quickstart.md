# Quickstart: Fintracker

**No build step. No server. No install.**

## Run the app

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
   - Double-click the file in Finder/Explorer, or drag it into a browser tab.
   - Alternatively, from the terminal: `open index.html` (macOS) / `start index.html` (Windows)

2. The app loads immediately. Your data is saved locally in the browser's localStorage — it persists across page refreshes and browser restarts on the same device.

## File structure

```
fintracker/
├── index.html      ← Open this
├── css/
│   └── styles.css  ← All styling
└── js/
    └── app.js      ← All application logic
```

## Using the app

| Action | How |
|--------|-----|
| Log an expense | Fill in the name, amount, and category form at the top → click "Add Expense" |
| View expenses | The list below the form shows all expenses, newest first |
| See category totals | The summary section shows total spend per category |
| Delete an expense | Click "Delete" on any row → click "Undo" within 5 seconds to reverse |

## Clearing all data

Open the browser's developer console (F12) and run:
```js
localStorage.removeItem('fintracker_expenses');
location.reload();
```

## Validation

| What you type | What happens |
|---------------|--------------|
| Empty name | "Please enter an expense name" shown inline |
| Zero or negative amount | "Please enter a valid amount" shown inline |
| Storage full | "Unable to save — storage unavailable" banner shown |
