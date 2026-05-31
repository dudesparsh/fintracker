// ============================================================
// CONSTANTS — all magic values named here (constitution Principle V)
// ============================================================
const STORAGE_KEY = 'fintracker_expenses';
const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Other'];
const TOAST_SUCCESS_DURATION = 3000; // ms
const UNDO_DURATION = 5000;          // ms — matches spec clarification Q2

// ============================================================
// STATE — module-level variables (undo needs these across calls)
// ============================================================
let expenses = [];
let lastDeleted = null; // { expense: Expense, index: number }
let undoTimer = null;   // setTimeout handle for deferred localStorage write
let toastTimer = null;  // setTimeout handle for auto-hiding toast

// ============================================================
// STORAGE HELPERS
// ============================================================
function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupted data — start fresh
    return [];
  }
}

function saveExpenses(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    hideStorageError();
    return true;
  } catch {
    // QuotaExceededError or storage unavailable — surface to user (FR-012)
    showStorageError();
    return false;
  }
}

// ============================================================
// UTILITIES
// ============================================================
function generateId() {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Prevent XSS when interpolating user-entered values into innerHTML
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================
// VALIDATION
// ============================================================
function validateForm(name, amount) {
  const errors = {};
  if (!name || name.trim() === '') {
    errors.name = 'Please enter an expense name';
  }
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    errors.amount = 'Please enter a valid amount';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// ============================================================
// EXPENSE OPERATIONS
// ============================================================
function addExpense(name, amount, category) {
  const expense = {
    id: generateId(),
    name: name.trim(),
    // Store as rounded float to avoid floating-point accumulation in summaries
    amount: parseFloat(parseFloat(amount).toFixed(2)),
    category,
    timestamp: Date.now()
  };

  expenses.unshift(expense); // newest first in array
  const saved = saveExpenses(expenses);

  if (!saved) {
    // Rollback in-memory state so UI stays consistent with storage
    expenses.shift();
    return null;
  }
  return expense;
}

function deleteExpense(id) {
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return;

  // Store for potential undo before removing
  lastDeleted = { expense: expenses[index], index };
  expenses.splice(index, 1);
  renderAll();

  // Cancel any previous undo timer that hasn't fired yet
  if (undoTimer) clearTimeout(undoTimer);

  showToast('Expense deleted — Undo', 'Undo', undoDelete, UNDO_DURATION);

  // Defer the localStorage write — if undo fires first, we skip this write
  undoTimer = setTimeout(() => {
    saveExpenses(expenses);
    lastDeleted = null;
    undoTimer = null;
  }, UNDO_DURATION);
}

function undoDelete() {
  if (!lastDeleted) return;

  // Re-insert at original position so order is preserved
  expenses.splice(lastDeleted.index, 0, lastDeleted.expense);

  if (undoTimer) {
    clearTimeout(undoTimer);
    undoTimer = null;
  }
  lastDeleted = null;

  renderAll();
  hideToast();
}

// ============================================================
// RENDERING
// ============================================================

// Single entry point — always call this after any state change
function renderAll() {
  renderExpenseList(expenses);
  renderCategorySummary(expenses);
}

function renderExpenseList(list) {
  const ul = document.getElementById('expense-list');
  const emptyState = document.getElementById('empty-state');

  if (list.length === 0) {
    ul.innerHTML = '';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  // Sort newest-first by timestamp (independent of insertion order)
  const sorted = [...list].sort((a, b) => b.timestamp - a.timestamp);

  ul.innerHTML = sorted.map(expense => `
    <li class="expense-row">
      <span class="expense-name">${escapeHtml(expense.name)}</span>
      <span class="expense-amount">${formatCurrency(expense.amount)}</span>
      <span class="category-badge category-${expense.category.toLowerCase()}">${expense.category}</span>
      <button
        class="delete-btn"
        data-id="${expense.id}"
        aria-label="Delete ${escapeHtml(expense.name)}"
      >Delete</button>
    </li>
  `).join('');
}

function deriveCategorySummary(list) {
  const totals = {};
  list.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  // Only include categories with spend > 0; sort by total descending
  return Object.entries(totals)
    .filter(([, total]) => total > 0)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function renderCategorySummary(list) {
  const ul = document.getElementById('category-summary');
  const emptyMsg = document.getElementById('summary-empty');
  const summary = deriveCategorySummary(list);

  if (summary.length === 0) {
    ul.innerHTML = '';
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;
  ul.innerHTML = summary.map(({ category, total }) => `
    <li class="summary-row">
      <span class="summary-category">${category}</span>
      <span class="summary-total">${formatCurrency(total)}</span>
    </li>
  `).join('');
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, actionLabel, actionCallback, duration) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  const actionBtn = document.getElementById('toast-action');

  msgEl.textContent = message;

  if (actionLabel && actionCallback) {
    actionBtn.textContent = actionLabel;
    actionBtn.hidden = false;
    actionBtn.onclick = actionCallback;
  } else {
    actionBtn.hidden = true;
    actionBtn.onclick = null;
  }

  toast.hidden = false;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, duration);
}

function hideToast() {
  const toast = document.getElementById('toast');
  toast.hidden = true;
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

// ============================================================
// STORAGE ERROR BANNER
// ============================================================
function showStorageError() {
  document.getElementById('storage-error').hidden = false;
}

function hideStorageError() {
  document.getElementById('storage-error').hidden = true;
}

// ============================================================
// FORM HANDLING
// ============================================================
function showInlineErrors(errors) {
  document.getElementById('name-error').textContent = errors.name || '';
  document.getElementById('amount-error').textContent = errors.amount || '';
}

function clearInlineErrors() {
  document.getElementById('name-error').textContent = '';
  document.getElementById('amount-error').textContent = '';
}

function handleFormSubmit(event) {
  event.preventDefault();
  clearInlineErrors();

  const name = document.getElementById('expense-name').value;
  const amount = document.getElementById('expense-amount').value;
  const category = document.getElementById('expense-category').value;

  const { valid, errors } = validateForm(name, amount);

  if (!valid) {
    showInlineErrors(errors);
    return;
  }

  const added = addExpense(name, amount, category);
  if (!added) {
    // Storage failure — banner already shown by saveExpenses
    return;
  }

  renderAll();
  showToast('Expense added', null, null, TOAST_SUCCESS_DURATION);
  event.target.reset();
}

// ============================================================
// INIT — wire everything up after DOM is ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  expenses = loadExpenses();
  renderAll();

  document.getElementById('expense-form').addEventListener('submit', handleFormSubmit);

  // Event delegation — one listener handles all delete buttons (avoids re-binding on every render)
  document.getElementById('expense-list').addEventListener('click', event => {
    const btn = event.target.closest('.delete-btn');
    if (btn) deleteExpense(btn.dataset.id);
  });

  document.getElementById('storage-error-dismiss').addEventListener('click', hideStorageError);
});
