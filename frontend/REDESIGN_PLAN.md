# Pantry Frankenstein Frontend Redesign Plan

## Status

Planning only. No application code or behavior is being changed until this plan is reviewed.

## Reference direction

Use the [Folio data intelligence landing template](https://21st.dev/@ruixen.ui/templates/folio-open-source-data-intelligence-landing-template) as the visual reference:

- calm, premium data-product presentation
- strong type hierarchy and generous spacing
- dashboard surfaces that make information scannable
- restrained accent color used for actions and status
- modular feature blocks instead of a collection of glowing cards
- intentional light and dark surface relationships

The reference is a direction for layout, hierarchy, and polish. Pantry Frankenstein will retain its own product identity and food inventory workflows.

## Current problems to address

- The interface relies on dark backgrounds, neon green/purple gradients, glow shadows, and glass effects at the same time.
- Nearly every section is a rounded bordered panel, so primary and secondary content have the same visual weight.
- The laboratory/frankenstein language is repeated in navigation, headings, buttons, loading states, and helper text, which makes the product feel like a theme rather than a focused tool.
- Typography is mostly small bold labels and dense body copy, with limited distinction between page title, section title, metadata, and status.
- Pantry, generation, history, and authentication pages do not yet feel like parts of one coherent product system.
- Several visible strings contain mojibake characters such as `â€¦`, `â†’`, and broken emoji sequences.
- Mobile navigation and dense control rows need a clearer responsive priority.

## Design system direction

### Color

- Establish a warm neutral canvas with a deep ink text color in light mode.
- Keep a dark mode, but use layered charcoal surfaces with muted borders instead of black plus glow effects.
- Use one primary accent, a fresh green, for primary actions and positive inventory state.
- Use amber for expiring items and red for expired/error states.
- Use violet sparingly for generated recipe output and secondary emphasis.
- Remove gradient buttons, colored text shadows, and decorative ambient blobs unless they communicate state.

### Typography

- Add a display face or a more distinctive heading treatment for page titles while keeping a readable sans-serif for controls and data.
- Use sentence case for most labels.
- Define a small set of type roles: page title, section title, body, metadata, eyebrow, and numeric metric.
- Replace excessive uppercase tracking and monospace labels with plain language where they do not convey technical data.

### Surfaces and spacing

- Use a consistent centered content rail with a clear maximum width.
- Use flat sections and subtle dividers for primary page structure.
- Reserve cards for grouped content, editable modules, result summaries, and empty states.
- Establish consistent radii, border opacity, control heights, and vertical rhythm.
- Keep motion limited to useful feedback: loading, success, list entry, and expandable content.

### Iconography and copy

- Keep lucide icons, but use them as quiet wayfinding and status cues.
- Remove decorative icon containers where the icon does not add meaning.
- Replace theatrical copy with direct product language. Examples: “Recipe generator”, “Add ingredient”, “Saved recipes”, and “Mark as cooked”.
- Normalize punctuation and encoding across all visible strings.

## Page-by-page plan

### 1. Shared application shell

Files: `src/components/Navbar.tsx`, `src/pages/*`, `src/index.css`, `tailwind.config.js`

- Rebuild the header as a compact product bar with a simple wordmark, primary navigation, user menu, and a clear theme control if theme support is added.
- Make the active route obvious through text weight, underline, or a subtle filled state rather than a bright glowing pill.
- Add a responsive menu treatment with fewer competing controls on small screens.
- Introduce shared layout and page header classes so all protected pages align to the same grid.
- Consolidate colors, shadows, radii, and typography into design tokens in Tailwind and CSS.

### 2. Pantry dashboard

Files: `src/pages/PantryPage.tsx`, `src/components/PantryStatsBar.tsx`, `src/components/ExpiringAlert.tsx`, `src/components/AddItemForm.tsx`, `src/components/PantryList.tsx`

- Reframe the page as an inventory overview: title and primary “Add ingredient” action at the top, followed by a compact metric strip.
- Make the expiring-items alert a prominent but calm callout with a direct action to generate a recipe.
- Turn the add form into a focused expandable or clearly separated entry module. Keep ingredient search, quantity, unit, expiry, validation, and success feedback.
- Redesign the pantry list as a data table on wide screens and stacked rows on mobile. Keep search, filter, sort, edit, and delete behavior.
- Give expiry status a consistent badge and left-edge/status marker so users can scan urgency without reading every cell.
- Add a considered empty state that explains the first action and links to recipe generation only when useful.

### 3. Recipe generator

Files: `src/pages/GeneratePage.tsx`, `src/components/ChaosSlider.tsx`, `src/components/RecipeCard.tsx`

- Rename the page and supporting copy around “Generate a recipe” and “Use ingredients expiring soon”. Keep the existing chaos mechanic as a friendly creativity setting.
- Present generation controls as a clear two-column configuration area: expiry horizon and creativity level, with one primary action.
- Replace the visually noisy multi-color slider states with a single accent scale and a concise description that updates with the selected level.
- Give the generated recipe a stronger result hierarchy: recipe title, time, ingredients, steps, and “Mark as cooked”.
- Make completed instructions visibly readable and preserve the pantry deduction explanation as supporting text.
- Add polished loading, error, and no-pantry states that use the same layout language as the dashboard.

### 4. Recipe history

Files: `src/pages/HistoryPage.tsx`, `src/components/RecipeCard.tsx`

- Present saved recipes as a clean list with title, date or metadata, ingredient count, and creativity level.
- Keep the accordion interaction, but make the collapsed row easier to scan and the expanded recipe visually continuous with generated results.
- Improve the empty state with one primary action to create a recipe.

### 5. Authentication

Files: `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`

- Use the same typography, canvas, controls, and accent treatment as the protected app.
- Reduce decorative background effects and keep the form as the visual focus.
- Add a compact brand/product statement and a small supporting preview or data motif only if it improves balance.
- Preserve all validation, loading, error, login, registration, and redirect behavior.

## Implementation sequence after approval

1. Establish tokens, font loading, base surfaces, focus states, and responsive layout utilities.
2. Rebuild the shared application shell and navigation.
3. Refactor the pantry dashboard and its list/form modules.
4. Refactor generator, recipe result, and history presentation while preserving data behavior.
5. Refactor login and registration.
6. Remove obsolete glow, glass, gradient, and theme-specific utility classes.
7. Sweep all user-facing copy for encoding errors, inconsistent capitalization, and leftover theatrical language.
8. Run the existing frontend build and lint commands, then inspect the main routes at desktop and mobile widths.

## Constraints

- Frontend-only changes. Do not edit backend files, Docker configuration, or API contracts.
- Preserve existing routes: `/login`, `/register`, `/pantry`, `/generate`, and `/history`.
- Preserve React Query keys, Zustand auth behavior, API calls, and pantry mutation behavior.
- Do not introduce a component library or dependency unless the current dependencies cannot support the approved design.
- Reuse the existing lucide icon dependency and existing frontend assets where practical.

## Acceptance criteria

- The UI reads as one coherent product across authenticated and unauthenticated pages.
- The primary action on each page is obvious within a few seconds.
- Pantry status can be scanned quickly by urgency, quantity, and name.
- Generator controls, loading state, result, and cooking action have a clear sequence.
- Layout remains usable at narrow mobile widths without horizontal overflow.
- Focus, hover, disabled, loading, error, empty, and success states are visually intentional.
- The build and lint commands pass without changing backend behavior.
