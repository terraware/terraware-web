# Coding Agent Instructions

## Build and Development Commands

- Build: `yarn build`
- Run: `yarn start` (or `yarn start:dev` to skip the increased Node heap size)
- Format code: `yarn format`
- Run all unit tests: `yarn test:ci` (`yarn test` runs in watch mode and never exits)
- Run one test file: `yarn test:ci <path>`
- TypeScript check: `yarn ts`
- Run linter: `yarn lint:dev` (disables a few `react-hooks` and `react/jsx-no-bind` rules that are noisy during local
  development; CI runs the stricter `yarn lint`)

## Tech Stack

- Core: React, TypeScript
- State and data: Redux Toolkit, RTK Query
- Routing: React Router
- UI: MUI
- Build: Rsbuild
- Key libraries: Axios, Luxon, Slate, Chart.js, Mapbox, Turf.js, PlayCanvas, Mux
- Testing: Rstest, Playwright
- Development: Storybook

See `package.json` for the latest list of dependencies and versions.

## Preferred Patterns

- Use Redux Toolkit for application state and RTK Query for API requests
- Prefer using existing components from `@terraware/web-components`
- Use MUI components for UI only when no suitable `@terraware/web-components` option exists
- Prefer existing utilities and helpers instead of introducing new ones
- Use the `component-test-agent` for tests that render a component, and the `playwright-test-agent`
  for end-to-end specs and tests of non-rendering code

## Do Not Introduce

- New state management, routing, or styling libraries
- Large dependencies when an existing solution already exists

## Where to Place New Code

- New React components should live near the feature that uses them
- Shared components should go in existing shared component directories
- Shared utilities should go in existing utility/helper directories
- Prefer modifying existing files rather than introducing new abstractions unless necessary
- Avoid creating new top-level directories unless necessary

## Code Style Guidelines

- Follow the conventions defined in `.prettierrc`
- Avoid comments that restate what the code already expresses
- Prefer `const`-assigned arrow functions over function declarations
- Prefer imperative present tense in commit titles and in the parts of commit bodies that say what is changing.
-

## Workflow

Check whether the current repo is using Jujutsu (jj) rather than plain git; if so, prefer jj commands for examining history and checkpointing your work.

- Install dependencies using `yarn` instead of `npm`
- After completing changes:
  - Run `yarn format`
  - Run `yarn ts`
  - Run `yarn lint:dev`
- Tests do not need to be rerun after formatting

## Internationalization

- Add new strings to `src/strings/csv/en.csv` at the bottom of the file
- Before adding a string, check whether an existing one already has the same text
- Name strings after their text, not the feature using them, so they can be reused (e.g. `{0} days` should be `X_DAYS`,
  not `<feature-name>_DAYS`). Use feature-specific names only for text that is specific to that feature, such as
  `SPECIES_DENSITY_WARNING_MESSAGE`.
- After adding new strings:
  - Run `yarn alphabetize-strings`
  - Run `yarn translate`

## Analytics (Mixpanel)

### Keeping events up to date

Product dashboards in Mixpanel depend on these events, and a missing event looks like users stopped doing something
rather than like a bug.

- The event catalog is `MIXPANEL_EVENTS` in `src/mixpanelEvents.ts`. Track events with `useTrackEvent`, and give every
  new event a property shape in `MixpanelEventPropertyMap`
- Before deleting, replacing or redesigning a screen, modal or flow, search it for `trackEvent`,
  `useTrackModalAbandonment` and `MIXPANEL_EVENTS`. Carry the same events, with the same names and properties, over to
  whatever replaces it. This includes removing a feature flag that switches users from an old flow to a new one.
- When a new screen or modal lets users complete an action that already has an event elsewhere (e.g. a second place to
  create a withdrawal), fire the same event from it, with a property saying which UI it came from, rather than
  inventing a new event name
- Modals that save something should use `useTrackModalAbandonment` and call its `markSubmitted()` on a successful save
- Keep event names and property names stable. Renaming either breaks every report built on it; add a new property
  instead of changing the meaning of an existing one.
- If an event can no longer fire, say so in a comment next to it in `MIXPANEL_EVENTS` rather than silently leaving it
- Call out added, changed or removed events in the PR description so whoever maintains the dashboards can update them

### Product areas

- Every Mixpanel event is tagged with a `product_area` derived from the first segment of the page's URL path, using
  `AREA_BY_FIRST_SEGMENT` in `src/utils/productArea.ts`
- When adding a route to `APP_PATHS` in `src/constants.ts` whose first path segment isn't already in
  `AREA_BY_FIRST_SEGMENT`, add it there, plus a case in `src/utils/productArea.test.ts`. Otherwise events on that page are
  reported as `Other`.
- Map it to an existing `ProductArea` when one fits. Add a new area only for a genuinely new part of the product, since
  renaming or splitting areas breaks historical comparisons in Mixpanel reports.

## Pull Requests

PR descriptions should focus on why the change was needed and what changed at a high level. Don't talk about choices that were considered and ruled out, and don't go into detail about the actual implementation; people can read the code diff to see low-level details.

We use stacked pull requests for changes of significant size. Stacks should be organized such that merging the first part of the stack still leaves the code base in a working, deployable state. That is, no PR in a stack can leave the system nonfunctional.

A stack of PRs should represent a clear, logical sequence of internally-consistent incremental steps that add up to the desired goal. It is expected for later PRs in a stack to depend on earlier ones. It's also fine for a PR to include small amounts of temporary code that gets rewritten or removed by later PRs, if that helps the earlier PRs stay coherent.

When possible, keep each PR in a stack under 350 lines of changes, but only if you can meet the "each PR is a complete change that leaves the code base in a working state" goal. 350 lines is a maximum, not a minimum; it's fine to split a change into smaller chunks than that.

If the repo is using jj, you can use jj commands to manage the stack of revisions, including splitting, combining, and reordering revisions.

Unless specifically requested by a human, once a PR has been created and a human has started reviewing it, don't amend, squash, or otherwise rewrite its existing commits. Add new commits on top instead, so reviewers can see exactly what changed in response to their comments.

Only push or submit PRs if the user specifically requests it or if you are running as an automated job specifically intended to create pull requests; otherwise the user will create the PRs manually.
