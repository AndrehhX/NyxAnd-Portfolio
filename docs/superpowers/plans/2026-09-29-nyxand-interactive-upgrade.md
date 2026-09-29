# NYXAND Interactive Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stronger NYXAND hero and three lightweight interactive modules—live status, safe terminal and isolated HTML/CSS lab—while preserving the portfolio's editorial identity and factual project boundaries.

**Architecture:** Keep the static HTML/CSS/vanilla JavaScript structure. Add semantic sections in `index.html`, focused component styles in the existing stylesheet, and small initializer functions in `js/main.js`; each module must fail independently and remain usable without JavaScript where possible.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Fetch API with `AbortController`, GitHub public API, sandboxed iframe, Node.js assertion script.

**Spec:** `docs/superpowers/specs/2026-09-29-nyxand-interactive-upgrade-design.md`

## Global Constraints

- Keep the existing static-site architecture and current hosting assumptions.
- Do not present NEXUS as finished; it remains a clearly labelled work in progress without a fake demo or repository.
- Do not invent a portrait; display only a supplied personal asset, otherwise show a non-photographic identity state.
- No real shell execution from the browser terminal.
- Keep the page usable on mobile and with `prefers-reduced-motion` enabled.
- Keep third-party requests optional and non-blocking.
- Do not add a framework or dependency.

## Review Focus

- Missing portrait asset: hero must keep its composition without pretending a generated image is Andreh.
- GitHub API timeout/rate limit: status must show a clear offline fallback and never block page rendering.
- Unknown or hostile terminal input: output must be plain text and never execute code.
- HTML/CSS lab content: preview must be sandboxed without script execution and must not affect the parent page.
- Narrow viewport/reduced motion: controls and content remain usable without decorative motion.

### Task 1: Strengthen the NYXAND hero

**Files:**
- Modify: `index.html` hero markup and project-card proof copy
- Modify: `css/style.css` hero identity-card, contrast and focus styles
- Modify: `js/main.js` hero entrance initializer and reduced-motion behavior
- Test: `tests/portfolio-content.test.mjs`

**Interfaces:**
- Consumes: existing `#hero`, `.hero-content`, loader state and `prefers-reduced-motion` flag.
- Produces: a `.hero-identity-card` with a non-photographic fallback label, optional image hook `#profilePortrait`, and stable hero classes for later visual checks.

- [ ] **Step 1: Extend the static content test** to require the identity card, optional portrait hook, readable fallback copy and project “what it proves” labels.
- [ ] **Step 2: Run `node tests/portfolio-content.test.mjs`** and confirm the new assertions fail before implementation.
- [ ] **Step 3: Add the identity card markup** beside the existing monitor, keeping the name, role, CTAs and monitor available in the first viewport.
- [ ] **Step 4: Add the NYXAND contrast treatment and identity-card styles** using existing color tokens; keep the missing-image state typographic/graphic rather than photographic.
- [ ] **Step 5: Replace scattered hero timing with `initHeroMotion(prefersReducedMotion)`** so the entrance sequence has one timing owner and no delayed callback can flash hidden content.
- [ ] **Step 6: Run the static test and inspect the desktop/mobile hero** for settled layout, focus visibility and missing-image behavior.
- [ ] **Step 7: Commit** with `git add index.html css/style.css js/main.js tests/portfolio-content.test.mjs && git commit -m "feat: strengthen nyxand hero identity"`.

### Task 2: Add NYXAND live status

**Files:**
- Modify: `index.html` after the work-in-progress section
- Modify: `css/style.css` live-status layout and state styles
- Modify: `js/main.js` `initLiveStatus()` and timer cleanup
- Test: `tests/portfolio-content.test.mjs`

**Interfaces:**
- Consumes: public username `AndrehhX`, `performance.now()`, `Intl.DateTimeFormat` and the page's existing section navigation.
- Produces: `#live-status` with `#localTime`, `#pageTime`, `#githubActivity`, and visible `data-state` values `loading`, `ready`, or `offline`.

- [ ] **Step 1: Add failing static assertions** for the status IDs, fallback copy, public GitHub endpoint reference and no token requirement.
- [ ] **Step 2: Run the static test** and confirm the status assertions fail.
- [ ] **Step 3: Add semantic status markup** with three readable metrics, a loading state and an offline message that does not depend on the API.
- [ ] **Step 4: Implement `initLiveStatus()`** with a one-minute local clock, elapsed-page timer, `fetch` timeout via `AbortController`, and a single public GitHub events request.
- [ ] **Step 5: Render GitHub activity as escaped text** with a safe fallback for empty activity, network failure and non-OK responses.
- [ ] **Step 6: Add responsive and reduced-motion styles** and verify the module does not push the first-view CTAs below the intended reading order.
- [ ] **Step 7: Run the static test and browser-check success/offline states** using a normal load and a temporarily blocked request.
- [ ] **Step 8: Commit** with `git add index.html css/style.css js/main.js tests/portfolio-content.test.mjs && git commit -m "feat: add nyxand live status"`.

### Task 3: Add the NYXAND terminal

**Files:**
- Modify: `index.html` with terminal section and `aria-live` output
- Modify: `css/style.css` terminal panel and responsive states
- Modify: `js/main.js` `initTerminal()` command map and navigation behavior
- Test: `tests/portfolio-content.test.mjs`

**Interfaces:**
- Consumes: local portfolio copy and section IDs `about`, `projects`, `experience`, `contact`, and `live-status`.
- Produces: `#nyxand-terminal`, `#terminalInput`, `#terminalOutput`, and command handlers for `help`, `about`, `projects`, `stack`, `status`, `contact`, and `clear`.

- [ ] **Step 1: Add failing assertions** for every supported command, the `aria-live` output and the absence of shell APIs.
- [ ] **Step 2: Run the static test** and confirm the terminal assertions fail.
- [ ] **Step 3: Add the terminal markup** with a short welcome message, keyboard instructions and a labeled input.
- [ ] **Step 4: Implement the command map** as local functions; render only text nodes, scroll to known sections for navigation commands, and return a bounded unknown-command response.
- [ ] **Step 5: Add `clear` and Enter-key handling** without stealing focus or adding unbounded output.
- [ ] **Step 6: Style the terminal as a NYXAND instrument** rather than a copied hacker console; verify keyboard focus and mobile overflow.
- [ ] **Step 7: Run the static test and manually exercise every command plus an unknown command.**
- [ ] **Step 8: Commit** with `git add index.html css/style.css js/main.js tests/portfolio-content.test.mjs && git commit -m "feat: add nyxand terminal"`.

### Task 4: Add the NYXAND laboratory

**Files:**
- Modify: `index.html` with lab editor, starter tabs, preview iframe and reset/run controls
- Modify: `css/style.css` lab layout, editor states and preview frame
- Modify: `js/main.js` `initLaboratory()` and starter snippets
- Test: `tests/portfolio-content.test.mjs`

**Interfaces:**
- Consumes: local starter snippets and the editor's current value.
- Produces: `#nyxand-lab`, `#labEditor`, `#labPreview`, `#labRun`, `#labReset`, and `data-starter` tab buttons.

- [ ] **Step 1: Add failing assertions** for the sandboxed iframe, run/reset controls, starter snippets and the absence of `allow-scripts`.
- [ ] **Step 2: Run the static test** and confirm the lab assertions fail.
- [ ] **Step 3: Add the lab markup** with a default NYXAND card snippet and explicit run/reset buttons.
- [ ] **Step 4: Implement `initLaboratory()`** using `iframe.srcdoc`, a starter map, reset behavior and tab selection; do not evaluate or execute parent-page code.
- [ ] **Step 5: Add the lab styles** with a responsive stacked layout and a clear preview boundary.
- [ ] **Step 6: Verify run, reset, starter switching, malformed HTML/CSS and reduced-motion behavior.**
- [ ] **Step 7: Commit** with `git add index.html css/style.css js/main.js tests/portfolio-content.test.mjs && git commit -m "feat: add nyxand laboratory"`.

### Task 5: Integrate, verify and finish

**Files:**
- Modify: `tests/portfolio-content.test.mjs` only if integration assertions need consolidation
- Modify: `README.md` only if the new public modules need a brief maintenance note

**Interfaces:**
- Consumes: all module interfaces from Tasks 1–4.
- Produces: a browser-verified, responsive portfolio with no console errors in the normal path.

- [ ] **Step 1: Run `node tests/portfolio-content.test.mjs`** and fix any integration failure.
- [ ] **Step 2: Serve the repository locally** and verify settled desktop and mobile states, navigation, hero, status, terminal and lab.
- [ ] **Step 3: Verify reduced-motion mode** and confirm the content remains visible and controls remain usable.
- [ ] **Step 4: Inspect browser console output** and remove any warning/error introduced by the modules.
- [ ] **Step 5: Capture final desktop and mobile screenshots** for review.
- [ ] **Step 6: Commit the verification-only changes** with `git add . && git commit -m "chore: verify nyxand interactive upgrade"`.

