# NYXAND Interactive Upgrade

## Goal

Raise the public portfolio to the same level of visual presence and interaction as the reference portfolio, without copying its visual language or weakening NYXAND's editorial, cream-and-black identity.

The result should help a recruiter understand Andreh's profile quickly while rewarding exploration with lightweight interactive modules.

## Constraints

- Keep the existing static-site architecture and current hosting assumptions.
- Preserve the current content: real experience, education, projects, achievements, CV and contact links.
- Do not present NEXUS as finished; it remains a clearly labelled work in progress without a fake demo or repository.
- Do not invent a portrait. The layout will support a personal image, but the asset must be supplied by the user before it is displayed publicly.
- No real shell execution from the browser terminal.
- Keep the page usable on mobile and with `prefers-reduced-motion` enabled.
- Keep third-party requests optional and non-blocking.

## Experience design

### 1. Hero identity layer

The current hero keeps its NYXAND wordmark and code-monitor motif, but gains a stronger visual hierarchy:

- higher contrast between the warm paper background, black typography and restrained accent color;
- a framed portrait slot designed as a technical identity card;
- a short entrance sequence that reveals the wordmark, role and code panel in one coordinated timeline;
- no image fallback that pretends to be the user's face when the portrait asset is absent.

The hero remains scannable: name, current focus, projects and CV stay visible without requiring interaction.

### 2. NYXAND live status

Add a compact status module after the project/WIP area. It will expose:

- visitor local time;
- elapsed time on the page;
- latest public GitHub activity for `AndrehhX`, when the public API responds;
- a clear fallback state when the request fails or is rate-limited.

The API call is read-only, made client-side, bounded by a short timeout and never required for the rest of the page to render. No token is used.

### 3. NYXAND terminal

Add an accessible terminal-style panel with a small command interpreter. Supported commands:

- `help`
- `about`
- `projects`
- `stack`
- `status`
- `contact`
- `clear`

Commands only read local portfolio data or scroll to existing sections. Unknown commands return a short helpful message. Input remains keyboard accessible and the module is hidden or collapsed on narrow screens if it harms readability.

### 4. NYXAND laboratory

Add a small HTML/CSS playground using a textarea editor and an isolated `iframe` preview. It will include a few NYXAND-styled starter snippets and an explicit run action.

- The preview uses `sandbox` without script execution.
- The editor is local-only and does not send content anywhere.
- A reset action restores the starter snippet.
- Reduced-motion mode keeps the editor functional but removes decorative transitions.

### 5. Project proof

Improve the existing project cards without changing their factual scope:

- preserve direct repository links;
- add a compact “what it proves” line for the technical or design lesson of each project;
- use hover/focus states to reveal detail without hiding the project title or link;
- keep NEXUS outside the finished-project grid.

## Technical structure

- `index.html`: hero identity slot, live-status section, terminal section, laboratory section and project-proof copy.
- `css/style.css`: component styles, responsive layout, focus states, reduced-motion overrides and terminal/lab visuals using existing tokens.
- `js/main.js`: modular initializers for hero motion, live status, terminal and laboratory; each initializer must no-op when its markup is absent.
- `assets/` or an explicitly documented image path: reserved for the user-supplied portrait only.
- `tests/portfolio-content.test.mjs`: static assertions for the new sections, safe terminal commands, sandboxed lab iframe, fallback text and NEXUS boundaries.

No framework or dependency is required. The GitHub status request uses `fetch` with `AbortController` and a timeout.

## Error handling and accessibility

- All interactive controls have visible focus styles and accessible labels.
- Terminal output uses an `aria-live` region without stealing focus after every command.
- Live status displays `Offline / no recent activity` when GitHub cannot be reached.
- Laboratory preview errors stay inside the preview frame and never break the parent page.
- `prefers-reduced-motion` disables loader/hero choreography, card tilt, cursor effects and decorative module transitions.
- The site remains usable if JavaScript fails: navigation, content, links and the existing sections still render.

## Verification

1. Run the repository's static content test.
2. Parse the HTML and verify all new IDs and external links.
3. Open the site locally and verify:
   - hero settled state;
   - terminal commands and unknown-command response;
   - lab run/reset and iframe isolation;
   - GitHub success and fallback states;
   - mobile layout;
   - reduced-motion layout and absence of animated cursor/tilt.
4. Inspect the browser console for errors.
5. Capture a final desktop and mobile screenshot before reporting completion.

## Commit sequence

- `docs: define interactive nyxand upgrade`
- `feat: strengthen nyxand hero identity`
- `feat: add nyxand live status`
- `feat: add nyxand terminal and lab`
- `test: cover interactive portfolio modules`
- `chore: verify nyxand interactive upgrade`
