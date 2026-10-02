# Coding Agent Instructions

## Build and Development Commands

- Build: `yarn build`
- Run: `yarn start` (or `yarn start:dev` to skip the increased Node heap size)
- Format code: `yarn format`
- Run all unit tests: `yarn test`
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
- After adding new strings:
  - Run `yarn alphabetize-strings`
  - Run `yarn translate`

## Pull Requests

PR descriptions should focus on why the change was needed and what changed at a high level. Don't talk about choices that were considered and ruled out, and don't go into detail about the actual implementation; people can read the code diff to see low-level details.

We use stacked pull requests for changes of significant size. Stacks should be organized such that merging the first part of the stack still leaves the code base in a working, deployable state. That is, no PR in a stack can leave the system nonfunctional.

A stack of PRs should represent a clear, logical sequence of internally-consistent incremental steps that add up to the desired goal. It is expected for later PRs in a stack to depend on earlier ones. It's also fine for a PR to include small amounts of temporary code that gets rewritten or removed by later PRs, if that helps the earlier PRs stay coherent.

When possible, keep each PR in a stack under 350 lines of changes, but only if you can meet the "each PR is a complete change that leaves the code base in a working state" goal. 350 lines is a maximum, not a minimum; it's fine to split a change into smaller chunks than that.

If the repo is using jj, you can use jj commands to manage the stack of revisions, including splitting, combining, and reordering revisions.

Don't push or submit the pull requests yourself; that'll be done manually.
