# Coding Agent Instructions

## Build and Development Commands

- Build: `yarn build`
- Run: `yarn run`
- Format code: `yarn format`
- Run all unit tests: `yarn test`
- TypeScript check: `yarn ts`
- Run linter:

```shell
yarn lint \
  --rule 'react/jsx-no-bind: 0' \
  --rule 'react-hooks/immutability: 0' \
  --rule 'react-hooks/refs: 0' \
  --rule 'react-hooks/set-state-in-effect: 0' \
  --rule 'react-hooks/static-components: 0'
```

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
- Use MUI components for UI when possible
- Prefer existing utilities and helpers instead of introducing new ones

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

## Workflow

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
