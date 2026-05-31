<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: MAJOR — initial population of all principles and governance from blank template.

Modified principles: N/A (first-time authoring)

Added sections:
  - I.  Simplicity First
  - II. Zero Unnecessary Dependencies
  - III. Mobile-Friendly UI
  - IV. Clear User Feedback
  - V.  Readable Code (Junior-Accessible)
  - Technology Constraints
  - Development Standards
  - Governance

Removed sections: N/A

Templates reviewed:
  ✅ .specify/templates/plan-template.md   — Constitution Check gate present; aligned.
  ✅ .specify/templates/spec-template.md   — Scope/requirements structure compatible.
  ✅ .specify/templates/tasks-template.md  — Task categorisation compatible; no new mandatory types required.

Follow-up TODOs: None — all placeholders resolved.
-->

# fintracker Constitution

## Core Principles

### I. Simplicity First

The default technology choice for any UI layer is vanilla HTML, CSS, and JavaScript.
Frameworks (React, Vue, etc.) MUST NOT be introduced unless there is a concrete, documented
reason why plain HTML/CSS/JS is insufficient for the feature at hand.
Server-side or build-tool complexity (webpack, Vite, bundlers) MUST NOT be added without
explicit justification. A single `index.html` with embedded or adjacent `.js` / `.css` files
is the preferred deliverable for browser-based features.

### II. Zero Unnecessary Dependencies

Every external library or package introduced MUST satisfy the following test before it may
be added:

1. The capability cannot be replicated with a reasonable amount of idiomatic vanilla code.
2. The dependency is actively maintained and has a clear, permissive licence.
3. Its inclusion is documented in a comment or spec section stating *why* it was needed.

Utility libraries (lodash, date-fns) are presumed unnecessary until proven otherwise.
Browser-native APIs (Fetch, localStorage, Intl, CSS Grid) MUST be preferred over polyfills
or wrapper libraries.

### III. Mobile-Friendly UI

All user interfaces delivered by this project MUST be fully usable on a 375 px wide
(iPhone SE-class) viewport without horizontal scrolling.
Layout MUST use relative units (%, rem, vw/vh) rather than fixed pixel widths.
Touch targets MUST be at least 44 × 44 px.
The mobile layout is validated first; desktop is an enhancement, not the primary target.

### IV. Clear User Feedback (NON-NEGOTIABLE)

Every user action that modifies state (add, edit, delete, save) MUST produce a visible,
immediate acknowledgement — inline confirmation text, a brief toast/banner, or a UI state
change (item appears/disappears). Silent success is forbidden.
Error states MUST be communicated in plain language proximate to the element that failed.
Loading or async states MUST be indicated with at least a disabled button or spinner;
the UI MUST NOT appear frozen.

### V. Readable Code (Junior-Accessible)

Code MUST be understandable by a developer with 6 months of web experience.
Complex logic blocks (>10 lines of non-trivial code) MUST include a short comment
explaining *why*, not just *what*.
Functions MUST be small (aim for ≤30 lines) and named descriptively — abbreviations that
are not universally understood (e.g., `calc`, `proc`) MUST be avoided.
Magic numbers and strings MUST be extracted into named constants at the top of the file.

## Technology Constraints

- **Rendering**: Browser-native; no server required for MVP features.
- **Persistence**: `localStorage` for client-side data; no external database for the core
  tracker feature.
- **Styling**: CSS custom properties for theming; no preprocessors (Sass/Less) unless the
  project grows beyond a single stylesheet.
- **Compatibility**: Target evergreen browsers (Chrome, Firefox, Safari, Edge — latest two
  major versions). No IE11 support required.
- **No authentication**: The app is single-user and local; login/auth is explicitly out of
  scope for v1.

## Development Standards

- **Code review gate**: Every PR or change set MUST be checked against all five Core
  Principles before merging.
- **Spec-driven**: Features start as a spec entry (`/speckit-specify`) before any code is
  written. Ad-hoc implementation without a spec is not permitted.
- **Incremental delivery**: Each user story MUST be independently testable and demonstrable
  before the next one begins (see `tasks-template.md` checkpoint pattern).
- **No dead code**: Unused functions, variables, or commented-out code blocks MUST be
  removed before a task is marked complete.
- **Commit discipline**: Each commit MUST represent a coherent, passing state; broken
  commits to the main branch are not permitted.

## Governance

This Constitution supersedes all other practices, guidelines, and verbal agreements on the
fintracker project. Any deviation requires an amendment, not an exception.

**Amendment procedure**:
1. Open a PR that modifies this file with the proposed change.
2. State the motivation and any affected downstream templates in the PR description.
3. Increment the version number per the semantic versioning rules below.
4. Update all affected template files in the same PR.

**Versioning policy**:
- MAJOR: A principle is removed, redefined in a backward-incompatible way, or a new
  mandatory constraint is added that invalidates prior specs/plans.
- MINOR: A new principle or section is added, or material guidance is expanded.
- PATCH: Wording clarifications, typo fixes, non-semantic refinements.

**Compliance review**: Every `/speckit-plan` and `/speckit-implement` run MUST include a
Constitution Check section confirming that the plan does not violate any principle.
Violations flagged during review MUST be resolved before implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-05-31 | **Last Amended**: 2026-05-31
